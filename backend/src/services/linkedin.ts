import axios from "axios";
import { listOrganizations, updateOrganizationToken } from "../db/queries.js";
import { upsertPosts } from "../db/queries.js";

interface LinkedInMediaContent {
  contentEntities?: Array<{
    entityLocation?: string;
    thumbnails?: Array<{ resolvedUrl?: string }>;
  }>;
  mediaCategory?: string;
}

interface LinkedInUgcPost {
  id: string;
  author: string;
  created: { time: number };
  specificContent?: {
    "com.linkedin.ugc.ShareContent"?: {
      shareCommentary?: { text?: string };
      media?: LinkedInMediaContent[];
    };
  };
  socialDetail?: {
    totalShareStatistics?: {
      likeCount?: number;
      commentCount?: number;
      shareCount?: number;
    };
  };
}

function parsePost(post: LinkedInUgcPost, organizationName: string) {
  const shareContent = post.specificContent?.["com.linkedin.ugc.ShareContent"];
  const stats = post.socialDetail?.totalShareStatistics;

  let mediaUrl: string | undefined;
  let mediaType: string | undefined;

  if (shareContent?.media && shareContent.media.length > 0) {
    const media = shareContent.media[0];
    mediaType = media.mediaCategory ?? undefined;
    if (media.contentEntities && media.contentEntities.length > 0) {
      mediaUrl =
        media.contentEntities[0].entityLocation ??
        media.contentEntities[0].thumbnails?.[0]?.resolvedUrl ??
        undefined;
    }
  }

  return {
    linkedin_post_id: post.id,
    content: shareContent?.shareCommentary?.text ?? undefined,
    media_url: mediaUrl,
    media_type: mediaType,
    author_name: organizationName,
    author_avatar: undefined,
    published_at: new Date(post.created.time).toISOString(),
    likes_count: stats?.likeCount ?? 0,
    comments_count: stats?.commentCount ?? 0,
    shares_count: stats?.shareCount ?? 0,
    raw_data: JSON.stringify(post),
  };
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  const redirectUri =
    process.env.LINKEDIN_REDIRECT_URI ||
    "http://localhost:3001/api/auth/linkedin/callback";

  const response = await axios.post(
    "https://www.linkedin.com/oauth/v2/accessToken",
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return {
    access_token: response.data.access_token,
    expires_in: response.data.expires_in,
  };
}

export function isTokenExpired(tokenExpiresAt: string | null): boolean {
  if (!tokenExpiresAt) return false; // If no expiry set, assume valid
  return new Date(tokenExpiresAt) <= new Date();
}

export async function fetchOrganizationProfile(
  accessToken: string,
  orgId: string
): Promise<{ name: string; logoUrl: string | null }> {
  try {
    const response = await axios.get(
      `https://api.linkedin.com/v2/organizations/${orgId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    const data = response.data;
    const name =
      data.localizedName || data.name?.localized?.en_US || `Organization ${orgId}`;
    const logoUrl =
      data.logoV2?.["original~"]?.elements?.[0]?.identifiers?.[0]?.identifier ?? null;

    return { name, logoUrl };
  } catch (error) {
    console.error(`Failed to fetch profile for org ${orgId}:`, error);
    return { name: `Organization ${orgId}`, logoUrl: null };
  }
}

export async function fetchOrganizationPosts(
  accessToken: string,
  orgId: string
): Promise<ReturnType<typeof parsePost>[]> {
  const url = `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:organization:${orgId})&sortBy=LAST_MODIFIED&count=20`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    const elements: LinkedInUgcPost[] = response.data.elements ?? [];
    console.log(`Fetched ${elements.length} posts for organization ${orgId}`);

    return elements.map((post) => parsePost(post, orgId));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `LinkedIn API error for org ${orgId}: ${error.response?.status} ${error.response?.statusText}`,
        error.response?.data
      );
    } else {
      console.error(`Error fetching posts for org ${orgId}:`, error);
    }
    return [];
  }
}

export async function refreshAllPosts(): Promise<void> {
  const organizations = listOrganizations();

  if (organizations.length === 0) {
    console.log("No organizations configured, skipping refresh");
    return;
  }

  console.log(`Refreshing posts for ${organizations.length} organization(s)...`);

  for (const org of organizations) {
    try {
      if (isTokenExpired(org.token_expires_at)) {
        console.warn(
          `Token expired for ${org.name} — skipping. Please re-authenticate via the admin UI.`
        );
        continue;
      }
      const posts = await fetchOrganizationPosts(org.access_token, org.linkedin_id);
      if (posts.length > 0) {
        upsertPosts(org.id, posts);
        console.log(`Upserted ${posts.length} posts for ${org.name}`);
      }
    } catch (error) {
      console.error(`Failed to refresh posts for ${org.name}:`, error);
    }
  }

  console.log("Post refresh complete");
}
