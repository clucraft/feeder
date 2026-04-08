import { Router } from "express";
import {
  getOrganization,
  getOrCreateDefaultOrg,
  getPostsByOrg,
  createWidget,
  updateWidget,
  deleteWidget,
  listAllWidgets,
  listWidgetsByOrg,
  getWidget,
  updateWidgetScrapedAt,
} from "../db/queries.js";
import { refreshPostsForUrl } from "../services/linkedin.js";
import { demoPosts } from "../data/demo-posts.js";

const router = Router();

// ─── Default Organization ───

// GET /api/admin/default-org — returns (or creates) a default organization
router.get("/default-org", (_req, res) => {
  const org = getOrCreateDefaultOrg();
  res.json({ organization: org });
});

// GET /api/admin/organizations/:id/posts
router.get("/organizations/:id/posts", (req, res) => {
  const org = getOrganization(req.params.id);
  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }

  const limit = parseInt(req.query.limit as string) || 20;
  const realPosts = getPostsByOrg(org.id, limit);
  const demo = realPosts.length === 0;
  const posts = demo
    ? demoPosts.slice(0, limit).map((p) => ({ ...p, organization_id: org.id }))
    : realPosts;
  res.json({ posts, ...(demo ? { demo: true } : {}) });
});

// POST /api/admin/organizations/:id/refresh — scrape posts for all widgets under this org
router.post("/organizations/:id/refresh", async (req, res) => {
  const org = getOrganization(req.params.id);
  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }

  try {
    let totalCount = 0;
    const widgets = listWidgetsByOrg(org.id);
    const fetched = new Set<string>();

    for (const widget of widgets) {
      const linkedinUrl = widget.linkedin_url;
      if (!linkedinUrl || fetched.has(linkedinUrl)) continue;
      fetched.add(linkedinUrl);

      const count = await refreshPostsForUrl(org.id, linkedinUrl);
      totalCount += count;
    }

    res.json({ message: `Refreshed ${totalCount} posts`, count: totalCount });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Failed to scrape posts from LinkedIn" });
  }
});

// ─── Widgets ───

// GET /api/admin/widgets
router.get("/widgets", (_req, res) => {
  const widgets = listAllWidgets();
  res.json({ widgets });
});

// POST /api/admin/widgets
router.post("/widgets", (req, res) => {
  const { name, layout, config, linkedin_url } = req.body;

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const org = getOrCreateDefaultOrg();
  const widget = createWidget({ organization_id: org.id, name, layout, config, linkedin_url });

  res.status(201).json({ widget });
});

// PUT /api/admin/widgets/:id
router.put("/widgets/:id", (req, res) => {
  const { name, layout, config, linkedin_url } = req.body;
  const updated = updateWidget(req.params.id, { name, layout, config, linkedin_url });

  if (!updated) {
    res.status(404).json({ error: "Widget not found" });
    return;
  }

  res.json({ widget: updated });
});

// POST /api/admin/widgets/:id/refresh — manually scrape posts for this widget (2-min cooldown)
const REFRESH_COOLDOWN_MS = 2 * 60 * 1000;

router.post("/widgets/:id/refresh", async (req, res) => {
  const widget = getWidget(req.params.id);
  if (!widget) {
    res.status(404).json({ error: "Widget not found" });
    return;
  }

  if (!widget.linkedin_url) {
    res.status(400).json({ error: "No LinkedIn URL configured for this widget" });
    return;
  }

  // Check cooldown
  if (widget.last_scraped_at) {
    const lastScraped = new Date(widget.last_scraped_at + "Z").getTime();
    const elapsed = Date.now() - lastScraped;
    if (elapsed < REFRESH_COOLDOWN_MS) {
      const remainingSec = Math.ceil((REFRESH_COOLDOWN_MS - elapsed) / 1000);
      res.status(429).json({ error: "Refresh cooldown active", retry_after: remainingSec });
      return;
    }
  }

  try {
    const org = getOrCreateDefaultOrg();
    const count = await refreshPostsForUrl(org.id, widget.linkedin_url);
    updateWidgetScrapedAt(widget.id);
    res.json({ message: `Refreshed ${count} posts`, count });
  } catch (error) {
    console.error("Manual refresh failed:", error);
    res.status(500).json({ error: "Failed to scrape posts from LinkedIn" });
  }
});

// DELETE /api/admin/widgets/:id
router.delete("/widgets/:id", (req, res) => {
  const deleted = deleteWidget(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Widget not found" });
    return;
  }
  res.json({ message: "Widget deleted" });
});

export default router;
