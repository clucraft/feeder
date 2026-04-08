import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedPost {
  linkedin_post_id: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  author_name?: string;
  author_avatar?: string;
  published_at?: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  linkedin_url?: string;
  raw_data?: string;
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * Extract the company slug from a LinkedIn URL.
 * e.g. "https://www.linkedin.com/company/acme-corp/posts/" → "acme-corp"
 */
export function extractCompanySlug(linkedinUrl: string): string | null {
  try {
    const url = new URL(linkedinUrl);
    const match = url.pathname.match(/\/company\/([^/]+)/);
    return match ? match[1] : null;
  } catch {
    // Try regex on raw string
    const match = linkedinUrl.match(/\/company\/([^/]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Resolve a company slug to its numeric ID using Voyager API.
 */
async function resolveCompanyId(
  slug: string,
  liAt: string,
  jsessionId: string
): Promise<string | null> {
  try {
    const csrfToken = jsessionId.replace(/"/g, "");
    const res = await axios.get(
      `https://www.linkedin.com/voyager/api/organization/companies?decorationId=com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-12&q=universalName&universalName=${encodeURIComponent(slug)}`,
      {
        headers: {
          Cookie: `li_at=${liAt}; JSESSIONID="${csrfToken}"`,
          "csrf-token": csrfToken,
          "User-Agent": USER_AGENT,
          Accept: "application/vnd.linkedin.normalized+json+2.1",
          "x-li-lang": "en_US",
          "x-restli-protocol-version": "2.0.0",
        },
        timeout: 15000,
      }
    );

    // Extract numeric ID from the response
    const elements = res.data?.included || res.data?.elements || [];
    for (const element of elements) {
      if (element.entityUrn?.includes("company:") || element["$type"]?.includes("Company")) {
        const urnMatch = (element.entityUrn || "").match(/company:(\d+)/);
        if (urnMatch) return urnMatch[1];
      }
    }

    // Try direct data path
    const data = res.data?.data || res.data;
    if (data?.entityUrn) {
      const urnMatch = data.entityUrn.match(/company:(\d+)/);
      if (urnMatch) return urnMatch[1];
    }

    return null;
  } catch (error) {
    console.error(`Failed to resolve company ID for slug "${slug}":`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Scrape posts using LinkedIn's Voyager API (requires li_at cookie).
 * Tries multiple endpoint patterns since LinkedIn changes them periodically.
 */
export async function scrapeVoyager(
  slug: string,
  liAt: string,
  jsessionId: string,
  count = 20
): Promise<ScrapedPost[]> {
  const csrfToken = jsessionId.replace(/"/g, "");
  const headers = {
    Cookie: `li_at=${liAt}; JSESSIONID="${csrfToken}"`,
    "csrf-token": csrfToken,
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.linkedin.normalized+json+2.1",
    "x-restli-protocol-version": "2.0.0",
    "x-li-lang": "en_US",
  };

  // Resolve numeric company ID first
  const companyId = await resolveCompanyId(slug, liAt, jsessionId);
  console.log(`Resolved "${slug}" to company ID: ${companyId || "FAILED"}`);

  // Try multiple Voyager endpoints
  const endpoints = [
    // Company feed by universal name
    `https://www.linkedin.com/voyager/api/feed/updates?companyUniversalName=${encodeURIComponent(slug)}&count=${count}&q=companyFeedByUniversalName&moduleKey=member-share&numComments=0&numLikes=0`,
    // Company feed by numeric ID
    ...(companyId ? [
      `https://www.linkedin.com/voyager/api/feed/updates?companyId=${companyId}&count=${count}&q=companyFeedByUniversalName&moduleKey=member-share&numComments=0&numLikes=0`,
    ] : []),
    // Organization updates endpoint
    ...(companyId ? [
      `https://www.linkedin.com/voyager/api/organization/updates?companyIdOrUniversalName=${companyId}&count=${count}&moduleKey=ORGANIZATION_MEMBER_FEED_DESKTOP&q=companyFeedByUniversalName`,
    ] : []),
  ];

  let responseData: any = null;

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying Voyager endpoint: ${endpoint.substring(0, 120)}...`);
      const res = await axios.get(endpoint, { headers, timeout: 15000 });
      responseData = res.data;

      // Log response shape for debugging
      const dataKeys = Object.keys(responseData || {});
      const includedCount = responseData?.included?.length || 0;
      const elementsCount = responseData?.data?.["*elements"]?.length || responseData?.elements?.length || 0;
      console.log(`Voyager response keys: [${dataKeys.join(", ")}], included: ${includedCount}, elements: ${elementsCount}`);

      if (includedCount > 0 || elementsCount > 0) break; // Got data
    } catch (error: any) {
      console.warn(`Voyager endpoint failed (${error.response?.status || error.message}): ${endpoint.substring(0, 80)}...`);
    }
  }

  if (!responseData) {
    console.error("All Voyager endpoints failed");
    return [];
  }

  const posts: ScrapedPost[] = [];
  const included: any[] = responseData?.included || [];

  // Build a lookup map for included entities
  const entityMap = new Map<string, any>();
  for (const item of included) {
    if (item.entityUrn || item["$id"]) {
      entityMap.set(item.entityUrn || item["$id"], item);
    }
  }

  // Log all $type values to understand the response structure
  const types = new Set<string>();
  for (const item of included) {
    if (item["$type"]) types.add(item["$type"]);
  }
  console.log(`Voyager included $types: [${[...types].join(", ")}]`);

  // Extract posts from included items — match broadly on type
  for (const item of included) {
    const type = item["$type"] || "";

    // Match any feed update or share type
    const isPost =
      type.includes("Update") ||
      type.includes("Share") ||
      type.includes("Activity") ||
      type.includes("Post");

    if (!isPost) continue;

    // Extract content text from various possible paths
    const commentary =
      item.commentary?.text?.text ||
      item.commentary?.text ||
      (typeof item.commentary === "string" ? item.commentary : null) ||
      item.specificContent?.["com.linkedin.voyager.feed.render.UpdateV2"]?.commentary?.text?.text ||
      item.header?.text?.text ||
      null;

    // Extract post URN as ID
    const postUrn = item.entityUrn || item.urn || item["$id"] || "";
    if (!postUrn) continue;

    // Skip items that don't look like real posts (no content and no media)
    const hasContent = commentary && typeof commentary === "string" && commentary.length > 0;
    const hasMedia = item.content || item.image || item.video;
    if (!hasContent && !hasMedia) continue;

    // Extract media
    let mediaUrl: string | undefined;
    let mediaType: string | undefined;

    // Check various image content paths
    const imageComponent =
      item.content?.["com.linkedin.voyager.feed.render.ImageComponent"] ||
      item.content?.imageComponent;
    if (imageComponent?.images?.[0]) {
      const imgAttrs = imageComponent.images[0].attributes?.[0];
      const vi = imgAttrs?.vectorImage || imgAttrs?.imageUrl;
      if (typeof vi === "string") {
        mediaUrl = vi;
        mediaType = "image";
      } else if (vi?.rootUrl) {
        const artifact = vi.artifacts?.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))?.[0];
        mediaUrl = artifact ? `${vi.rootUrl}${artifact.fileIdentifyingUrlPathSegment}` : vi.rootUrl;
        mediaType = "image";
      }
    }

    // Check for article content
    const articleComponent =
      item.content?.["com.linkedin.voyager.feed.render.ArticleComponent"] ||
      item.content?.articleComponent;
    if (!mediaUrl && articleComponent) {
      const largeImg = articleComponent.largeImage?.attributes?.[0]?.vectorImage;
      if (largeImg?.rootUrl) {
        const artifact = largeImg.artifacts?.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))?.[0];
        mediaUrl = artifact ? `${largeImg.rootUrl}${artifact.fileIdentifyingUrlPathSegment}` : largeImg.rootUrl;
      }
      mediaType = "article";
    }

    // Extract engagement stats from various paths
    const socialCounts =
      item.socialDetail?.totalSocialActivityCounts ||
      item.socialCounts ||
      {};
    const likesCount = socialCounts.numLikes ?? socialCounts.likeCount ?? 0;
    const commentsCount = socialCounts.numComments ?? socialCounts.commentCount ?? 0;
    const sharesCount = socialCounts.numShares ?? socialCounts.shareCount ?? 0;

    // Extract author info
    let authorName = slug;
    let authorAvatar: string | undefined;

    // Try actor info
    if (item.actor?.name?.text) {
      authorName = item.actor.name.text;
    }
    if (item.actor?.image?.attributes?.[0]) {
      const imgAttr = item.actor.image.attributes[0];
      const pic = imgAttr.miniProfile?.picture?.["com.linkedin.common.VectorImage"] ||
        imgAttr.vectorImage;
      if (pic?.rootUrl && pic?.artifacts?.length) {
        const artifact = pic.artifacts.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0];
        authorAvatar = `${pic.rootUrl}${artifact.fileIdentifyingUrlPathSegment}`;
      }
    }

    // Try entity map for actor details
    const actorUrn = item.actor?.urn || item.actorUrn || "";
    if (actorUrn && entityMap.has(actorUrn)) {
      const actorEntity = entityMap.get(actorUrn)!;
      if (!item.actor?.name?.text) {
        authorName = actorEntity.name?.text || actorEntity.localizedName || slug;
      }
    }

    // Extract timestamp
    const createdAt = item.createdTime || item.publishedAt;
    let publishedAt: string | undefined;
    if (typeof createdAt === "number") {
      publishedAt = new Date(createdAt).toISOString();
    }

    // Build post URL
    const activityId = postUrn.match(/activity:(\d+)/)?.[1] || postUrn.match(/ugcPost:(\d+)/)?.[1];
    const postUrl = activityId
      ? `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}`
      : `https://www.linkedin.com/company/${slug}/`;

    posts.push({
      linkedin_post_id: postUrn,
      content: (hasContent ? commentary : undefined) as string | undefined,
      media_url: mediaUrl,
      media_type: mediaType,
      author_name: authorName,
      author_avatar: authorAvatar,
      published_at: publishedAt,
      likes_count: likesCount,
      comments_count: commentsCount,
      shares_count: sharesCount,
      linkedin_url: postUrl,
      raw_data: JSON.stringify(item),
    });
  }

  return posts;
}

/**
 * Fallback: scrape LinkedIn company page HTML for post data.
 * Works without authentication but yields limited data.
 */
export async function scrapeHTML(slug: string): Promise<ScrapedPost[]> {
  try {
    const res = await axios.get(
      `https://www.linkedin.com/company/${encodeURIComponent(slug)}/posts/`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 15000,
        maxRedirects: 3,
      }
    );

    const $ = cheerio.load(res.data);
    const posts: ScrapedPost[] = [];

    // Try to extract JSON-LD data
    $('script[type="application/ld+json"]').each((_i, el) => {
      try {
        const data = JSON.parse($(el).html() || "");
        if (data["@type"] === "Article" || data["@type"] === "SocialMediaPosting") {
          posts.push({
            linkedin_post_id: data.url || `html-${Date.now()}-${_i}`,
            content: data.articleBody || data.description || data.headline,
            author_name: data.author?.name || slug,
            published_at: data.datePublished,
            linkedin_url: data.url,
          });
        }
      } catch {
        // Skip invalid JSON
      }
    });

    // Try to find embedded data in <code> elements (LinkedIn's SSR data pattern)
    $("code").each((_i, el) => {
      try {
        const text = $(el).html() || "";
        // LinkedIn sometimes embeds JSON in comment-wrapped code elements
        const cleaned = text.replace(/^<!--/, "").replace(/-->$/, "").trim();
        if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) return;
        const data = JSON.parse(cleaned);
        if (data.included && Array.isArray(data.included)) {
          for (const item of data.included) {
            if (item.commentary?.text) {
              posts.push({
                linkedin_post_id: item.entityUrn || item.urn || `code-${Date.now()}-${_i}`,
                content: item.commentary.text,
                author_name: slug,
                published_at: item.createdTime
                  ? new Date(item.createdTime).toISOString()
                  : undefined,
                linkedin_url: `https://www.linkedin.com/company/${slug}/`,
              });
            }
          }
        }
      } catch {
        // Skip
      }
    });

    return posts;
  } catch (error) {
    console.error(`HTML scrape failed for "${slug}":`, error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Main entry point: scrape posts for a company, trying Voyager first then HTML fallback.
 */
export async function scrapeCompanyPosts(
  slug: string,
  count = 20
): Promise<ScrapedPost[]> {
  const liAt = process.env.LINKEDIN_LI_AT;
  const jsessionId = process.env.LINKEDIN_JSESSIONID;

  // Try Voyager API if credentials are available
  if (liAt && jsessionId) {
    try {
      const posts = await scrapeVoyager(slug, liAt, jsessionId, count);
      if (posts.length > 0) {
        console.log(`Voyager: scraped ${posts.length} posts for "${slug}"`);
        return posts;
      }
      console.warn(`Voyager returned 0 posts for "${slug}", trying HTML fallback`);
    } catch (error) {
      console.error(
        `Voyager scrape failed for "${slug}":`,
        error instanceof Error ? error.message : error
      );
    }
  } else {
    console.warn("LINKEDIN_LI_AT or LINKEDIN_JSESSIONID not set, using HTML fallback only");
  }

  // Fallback to HTML scraping
  const posts = await scrapeHTML(slug);
  if (posts.length > 0) {
    console.log(`HTML fallback: scraped ${posts.length} posts for "${slug}"`);
  } else {
    console.warn(`No posts scraped for "${slug}" (both methods failed)`);
  }
  return posts;
}
