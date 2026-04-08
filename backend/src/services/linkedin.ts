import { listAllWidgets } from "../db/queries.js";
import { upsertPosts } from "../db/queries.js";
import { scrapeCompanyPosts, extractCompanySlug } from "./scraper.js";

/**
 * Refresh posts for all widgets by scraping LinkedIn company pages.
 * Called by the cron job every 30 minutes.
 */
export async function refreshAllPosts(): Promise<void> {
  const widgets = listAllWidgets();

  if (widgets.length === 0) {
    console.log("No widgets configured, skipping refresh");
    return;
  }

  console.log(`Refreshing posts for ${widgets.length} widget(s)...`);

  // Track already-scraped LinkedIn URLs to avoid duplicate requests
  const scraped = new Map<string, boolean>();

  for (const widget of widgets) {
    const linkedinUrl = widget.linkedin_url;
    if (!linkedinUrl) continue;

    // Deduplicate by LinkedIn URL
    if (scraped.has(linkedinUrl)) continue;
    scraped.set(linkedinUrl, true);

    const slug = extractCompanySlug(linkedinUrl);
    if (!slug) {
      console.warn(`Could not extract company slug from "${linkedinUrl}", skipping`);
      continue;
    }

    try {
      const posts = await scrapeCompanyPosts(slug);
      if (posts.length > 0) {
        upsertPosts(widget.organization_id, posts, linkedinUrl);
        console.log(`Upserted ${posts.length} posts for "${slug}" (${linkedinUrl})`);
      }
    } catch (error) {
      console.error(`Failed to scrape posts for "${slug}" (${linkedinUrl}):`, error);
    }

    // Rate limit: wait 3-5 seconds between different company pages
    if (scraped.size < widgets.length) {
      await new Promise((resolve) => setTimeout(resolve, 3000 + Math.random() * 2000));
    }
  }

  console.log("Post refresh complete");
}

/**
 * Scrape posts for a specific LinkedIn URL (used by admin manual refresh).
 */
export async function refreshPostsForUrl(
  organizationId: string,
  linkedinUrl: string
): Promise<number> {
  const slug = extractCompanySlug(linkedinUrl);
  if (!slug) {
    throw new Error(`Could not extract company slug from "${linkedinUrl}"`);
  }

  const posts = await scrapeCompanyPosts(slug);
  if (posts.length > 0) {
    upsertPosts(organizationId, posts, linkedinUrl);
  }
  return posts.length;
}
