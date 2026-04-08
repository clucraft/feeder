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
      `https://www.linkedin.com/voyager/api/organization/companies?decorationId=com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-38&q=universalName&universalName=${encodeURIComponent(slug)}`,
      {
        headers: {
          Cookie: `li_at=${liAt}; JSESSIONID="${csrfToken}"`,
          "Csrf-Token": csrfToken,
          "User-Agent": USER_AGENT,
          Accept: "application/vnd.linkedin.normalized+json+2.1",
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
 */
export async function scrapeVoyager(
  slug: string,
  liAt: string,
  jsessionId: string,
  count = 20
): Promise<ScrapedPost[]> {
  const csrfToken = jsessionId.replace(/"/g, "");

  // First resolve the company's numeric ID
  const companyId = await resolveCompanyId(slug, liAt, jsessionId);
  if (!companyId) {
    console.warn(`Could not resolve numeric ID for "${slug}", trying slug directly`);
  }

  const identifier = companyId || slug;

  // Fetch the feed updates for this company
  const res = await axios.get(
    `https://www.linkedin.com/voyager/api/feed/updates?companyUniversalName=${encodeURIComponent(slug)}&count=${count}&q=companyRelevanceFeed&moduleKey=member-share&numComments=0&numLikes=0`,
    {
      headers: {
        Cookie: `li_at=${liAt}; JSESSIONID="${csrfToken}"`,
        "Csrf-Token": csrfToken,
        "User-Agent": USER_AGENT,
        Accept: "application/vnd.linkedin.normalized+json+2.1",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      timeout: 15000,
    }
  );

  const posts: ScrapedPost[] = [];
  const included: any[] = res.data?.included || [];
  const elements: any[] = res.data?.data?.["*elements"] || res.data?.elements || [];

  // Build a lookup map for included entities (posts, images, etc.)
  const entityMap = new Map<string, any>();
  for (const item of included) {
    if (item.entityUrn || item["$id"]) {
      entityMap.set(item.entityUrn || item["$id"], item);
    }
  }

  // Extract posts from included items
  for (const item of included) {
    const type = item["$type"] || "";

    // Look for share/post types
    if (
      !type.includes("Update") &&
      !type.includes("Share") &&
      !type.includes("Activity")
    ) {
      continue;
    }

    // Skip if no meaningful content
    const commentary =
      item.commentary?.text?.text ||
      item.commentary?.text ||
      item.commentary ||
      item.specificContent?.["com.linkedin.voyager.feed.render.UpdateV2"]?.commentary?.text?.text ||
      "";

    if (typeof commentary !== "string") continue;

    // Extract post URN as ID
    const postUrn = item.entityUrn || item.urn || item["$id"] || "";
    if (!postUrn) continue;

    // Extract media
    let mediaUrl: string | undefined;
    let mediaType: string | undefined;

    // Check for image content
    if (item.content?.["com.linkedin.voyager.feed.render.ImageComponent"]) {
      const images = item.content["com.linkedin.voyager.feed.render.ImageComponent"].images;
      if (images?.[0]?.attributes?.[0]?.vectorImage?.rootUrl) {
        const vi = images[0].attributes[0].vectorImage;
        const artifact = vi.artifacts?.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))?.[0];
        mediaUrl = artifact ? `${vi.rootUrl}${artifact.fileIdentifyingUrlPathSegment}` : vi.rootUrl;
        mediaType = "image";
      }
    }

    // Check for article content
    if (!mediaUrl && item.content?.["com.linkedin.voyager.feed.render.ArticleComponent"]) {
      const article = item.content["com.linkedin.voyager.feed.render.ArticleComponent"];
      mediaUrl = article.largeImage?.attributes?.[0]?.vectorImage?.rootUrl;
      mediaType = "article";
    }

    // Extract engagement stats
    const socialDetail = item.socialDetail || {};
    const likesCount = socialDetail.totalSocialActivityCounts?.numLikes ?? 0;
    const commentsCount = socialDetail.totalSocialActivityCounts?.numComments ?? 0;
    const sharesCount = socialDetail.totalSocialActivityCounts?.numShares ?? 0;

    // Extract author info
    let authorName = slug;
    let authorAvatar: string | undefined;
    const actorUrn = item.actor?.urn || item.actorUrn || "";
    const actorEntity = entityMap.get(actorUrn);
    if (actorEntity) {
      authorName = actorEntity.name?.text || actorEntity.localizedName || slug;
      const logo = actorEntity.logo?.["com.linkedin.common.VectorImage"];
      if (logo?.rootUrl && logo?.artifacts?.length) {
        const artifact = logo.artifacts.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0];
        authorAvatar = `${logo.rootUrl}${artifact.fileIdentifyingUrlPathSegment}`;
      }
    }
    // Also try actor.name and actor.image directly
    if (item.actor?.name?.text) authorName = item.actor.name.text;
    if (item.actor?.image?.attributes?.[0]?.miniProfile?.picture?.["com.linkedin.common.VectorImage"]) {
      const pic = item.actor.image.attributes[0].miniProfile.picture["com.linkedin.common.VectorImage"];
      if (pic.rootUrl && pic.artifacts?.length) {
        const artifact = pic.artifacts.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0];
        authorAvatar = `${pic.rootUrl}${artifact.fileIdentifyingUrlPathSegment}`;
      }
    }

    // Extract timestamp
    const createdAt = item.createdTime || item.actor?.subDescription?.accessibilityText;
    let publishedAt: string | undefined;
    if (typeof createdAt === "number") {
      publishedAt = new Date(createdAt).toISOString();
    }

    // Build post URL
    const activityId = postUrn.match(/activity:(\d+)/)?.[1];
    const postUrl = activityId
      ? `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}`
      : `https://www.linkedin.com/company/${slug}/`;

    posts.push({
      linkedin_post_id: postUrn,
      content: commentary || undefined,
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
