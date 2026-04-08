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
router.post("/widgets", async (req, res) => {
  const { name, layout, config, linkedin_url } = req.body;

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const org = getOrCreateDefaultOrg();
  const widget = createWidget({ organization_id: org.id, name, layout, config, linkedin_url });

  // Scrape posts immediately if a LinkedIn URL is provided
  if (linkedin_url) {
    try {
      const count = await refreshPostsForUrl(org.id, linkedin_url);
      console.log(`Initial scrape: ${count} posts for "${linkedin_url}"`);
    } catch (error) {
      console.error("Initial scrape failed:", error);
    }
  }

  res.status(201).json({ widget });
});

// PUT /api/admin/widgets/:id
router.put("/widgets/:id", async (req, res) => {
  const { name, layout, config, linkedin_url } = req.body;
  const updated = updateWidget(req.params.id, { name, layout, config, linkedin_url });

  if (!updated) {
    res.status(404).json({ error: "Widget not found" });
    return;
  }

  // Scrape posts immediately if LinkedIn URL changed
  if (linkedin_url) {
    const org = getOrCreateDefaultOrg();
    try {
      const count = await refreshPostsForUrl(org.id, linkedin_url);
      console.log(`Scrape on update: ${count} posts for "${linkedin_url}"`);
    } catch (error) {
      console.error("Scrape on update failed:", error);
    }
  }

  res.json({ widget: updated });
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
