import axios from "axios";
import * as cheerio from "cheerio";
import { cacheImage } from "./media-cache.js";

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

  // Build a lookup map for included entities by entityUrn
  const entityMap = new Map<string, any>();
  for (const item of included) {
    if (item.entityUrn) entityMap.set(item.entityUrn, item);
    if (item["$id"] && item["$id"] !== item.entityUrn) entityMap.set(item["$id"], item);
  }

  // Use the ordered elements list to maintain feed order
  const orderedElements: string[] = responseData?.data?.["*elements"] || [];

  // Process UpdateV2 items only (they contain the actual post data)
  const updateV2Items = included.filter(
    (i: any) => i["$type"] === "com.linkedin.voyager.feed.render.UpdateV2"
  );

  // Sort UpdateV2 items by the order in elements list
  const orderedV2 = orderedElements.length > 0
    ? orderedElements
        .map((urn) => {
          const activityId = urn.match(/activity:(\d+)/)?.[1];
          return updateV2Items.find((v2: any) =>
            activityId && (v2.entityUrn || v2["$id"] || "").includes(activityId)
          );
        })
        .filter(Boolean)
    : updateV2Items;

  for (const item of orderedV2) {
    if (!item) continue;

    // Extract content text
    const commentary =
      item.commentary?.text?.text ||
      item.commentary?.text ||
      (typeof item.commentary === "string" ? item.commentary : null) ||
      null;

    const postUrn = item.entityUrn || item["$id"] || "";
    if (!postUrn) continue;

    const activityId = postUrn.match(/activity:(\d+)/)?.[1];
    if (!activityId) continue;

    // Extract media based on content.$type
    let mediaUrl: string | undefined;
    let mediaType: string | undefined;
    const contentType = item.content?.["$type"] || "";

    if (contentType.includes("ImageComponent") && item.content?.images?.[0]) {
      // Image post
      const vi = item.content.images[0].attributes?.[0]?.vectorImage;
      if (vi?.rootUrl && vi?.artifacts?.length) {
        const artifact = vi.artifacts.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0];
        mediaUrl = `${vi.rootUrl}${artifact.fileIdentifyingUrlPathSegment}`;
      }
      mediaType = "image";
    } else if (contentType.includes("ArticleComponent") && item.content?.largeImage) {
      // Article post
      const vi = item.content.largeImage.attributes?.[0]?.vectorImage;
      if (vi?.rootUrl && vi?.artifacts?.length) {
        const artifact = vi.artifacts.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0];
        mediaUrl = `${vi.rootUrl}${artifact.fileIdentifyingUrlPathSegment}`;
      }
      mediaType = "article";
    } else if (contentType.includes("VideoComponent")) {
      // Video post — no direct thumbnail URL available from this response
      mediaType = "video";
    } else if (contentType.includes("DocumentComponent") || item.content?.document) {
      // Document/carousel post
      mediaType = "document";
    }

    // Skip items with no content and no media
    const hasContent = commentary && typeof commentary === "string" && commentary.length > 0;
    if (!hasContent && !mediaType) continue;

    // Look up social activity counts via: UpdateV2.*socialDetail → SocialDetail.*totalSocialActivityCounts → SocialActivityCounts
    let likesCount = 0;
    let commentsCount = 0;
    let sharesCount = 0;

    const socialDetailUrn = item["*socialDetail"];
    if (socialDetailUrn) {
      const sd = entityMap.get(socialDetailUrn);
      if (sd) {
        const countsUrn = sd["*totalSocialActivityCounts"];
        const sc = countsUrn ? entityMap.get(countsUrn) : null;
        if (sc) {
          likesCount = sc.numLikes ?? 0;
          commentsCount = sc.numComments ?? 0;
          sharesCount = sc.numShares ?? 0;
        }
      }
    }

    // Extract author info from actor
    let authorName = slug;
    let authorAvatar: string | undefined;

    if (item.actor?.name?.text) {
      authorName = item.actor.name.text;
    }
    // Resolve avatar: actor.image may reference a MiniCompany or MiniProfile via entity map
    if (item.actor?.image?.attributes?.[0]) {
      const imgAttr = item.actor.image.attributes[0];

      // Company logo: look up *miniCompany in entity map
      const miniCompanyUrn = imgAttr["*miniCompany"];
      if (miniCompanyUrn) {
        const miniCompany = entityMap.get(miniCompanyUrn);
        const logo = miniCompany?.logo;
        if (logo?.rootUrl && logo?.artifacts?.length) {
          const artifact = logo.artifacts.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0];
          authorAvatar = `${logo.rootUrl}${artifact.fileIdentifyingUrlPathSegment}`;
        }
      }

      // Fallback: direct vectorImage or miniProfile picture
      if (!authorAvatar) {
        const pic = imgAttr.miniProfile?.picture?.["com.linkedin.common.VectorImage"] ||
          imgAttr.vectorImage;
        if (pic?.rootUrl && pic?.artifacts?.length) {
          const artifact = pic.artifacts.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0];
          authorAvatar = `${pic.rootUrl}${artifact.fileIdentifyingUrlPathSegment}`;
        }
      }
    }

    // Derive timestamp from LinkedIn activity ID (snowflake-style: ms since epoch in high bits)
    // LinkedIn activity IDs encode creation time: (id >> 22) gives milliseconds since a custom epoch
    // The custom epoch is approximately 2010-01-01T00:00:00Z (similar to Twitter snowflake)
    let publishedAt: string | undefined;
    try {
      const idBigInt = BigInt(activityId);
      const timestampMs = Number(idBigInt >> 22n);
      // LinkedIn's epoch offset (determined empirically)
      if (timestampMs > 1000000000000) {
        publishedAt = new Date(timestampMs).toISOString();
      }
    } catch {
      // Fallback: no timestamp
    }

    // Also check the Update wrapper for a permalink
    const updateUrn = `urn:li:fs_feedUpdate:(V2&COMPANY_FEED,urn:li:activity:${activityId})`;
    const updateWrapper = entityMap.get(updateUrn);
    const postUrl = updateWrapper?.permalink ||
      `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}`;

    posts.push({
      linkedin_post_id: postUrn,
      content: hasContent ? commentary! : undefined,
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

  console.log(`Parsed ${posts.length} posts from Voyager response`);
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
 * Download and cache all media (post images + author avatars) for scraped posts.
 * Replaces LinkedIn CDN URLs with local /api/media/ URLs.
 */
async function cachePostMedia(
  posts: ScrapedPost[],
  baseUrl: string,
  liAt?: string,
  jsessionId?: string
): Promise<void> {
  for (const post of posts) {
    // Cache post media image
    if (post.media_url) {
      const filename = await cacheImage(post.media_url, liAt, jsessionId);
      if (filename) {
        post.media_url = `${baseUrl}/api/media/${filename}`;
      }
    }

    // Cache author avatar
    if (post.author_avatar) {
      const filename = await cacheImage(post.author_avatar, liAt, jsessionId);
      if (filename) {
        post.author_avatar = `${baseUrl}/api/media/${filename}`;
      }
    }
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
  const baseUrl = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`).replace(/\/$/, "");

  // Try Voyager API if credentials are available
  if (liAt && jsessionId) {
    try {
      const posts = await scrapeVoyager(slug, liAt, jsessionId, count);
      if (posts.length > 0) {
        console.log(`Voyager: scraped ${posts.length} posts for "${slug}"`);
        await cachePostMedia(posts, baseUrl, liAt, jsessionId);
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
    await cachePostMedia(posts, baseUrl);
  } else {
    console.warn(`No posts scraped for "${slug}" (both methods failed)`);
  }
  return posts;
}
