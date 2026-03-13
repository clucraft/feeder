import { Router } from "express";
import {
  createOrganization,
  listOrganizations,
  getOrganization,
  getPostsByOrg,
  getPostsByLinkedinUrl,
  createWidget,
  updateWidget,
  deleteWidget,
  listAllWidgets,
  listWidgetsByOrg,
  upsertPosts,
} from "../db/queries.js";
import { fetchOrganizationPosts, isTokenExpired } from "../services/linkedin.js";
import { consumeTempToken } from "./auth.js";
import { demoPosts } from "../data/demo-posts.js";

const router = Router();

// ─── Organizations ───

// GET /api/admin/organizations
router.get("/organizations", (_req, res) => {
  const orgs = listOrganizations();
  res.json({ organizations: orgs });
});

// POST /api/admin/organizations
router.post("/organizations", (req, res) => {
  const { name, linkedin_id, access_token, logo_url, temp_token_id } = req.body;

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  let resolvedToken: string;
  let tokenExpiresAt: string | undefined;

  if (temp_token_id) {
    // OAuth flow: retrieve token from temp store
    const tempToken = consumeTempToken(temp_token_id);
    if (!tempToken) {
      res.status(400).json({ error: "Invalid or expired temp_token_id. Please reconnect LinkedIn." });
      return;
    }
    resolvedToken = tempToken.accessToken;
    // Calculate expiry date
    const expiresAt = new Date(Date.now() + tempToken.expiresIn * 1000);
    tokenExpiresAt = expiresAt.toISOString();
  } else if (access_token) {
    // Legacy manual token flow
    resolvedToken = access_token;
  } else {
    // Demo mode: no token provided
    resolvedToken = "";
  }

  const org = createOrganization({
    name,
    linkedin_id: linkedin_id || "",
    access_token: resolvedToken || undefined,
    logo_url,
    token_expires_at: tokenExpiresAt,
  });
  res.status(201).json({ organization: org });
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

// POST /api/admin/organizations/:id/refresh
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

      const posts = await fetchOrganizationPosts(org.access_token, linkedinUrl);
      if (posts.length > 0) {
        upsertPosts(org.id, posts, linkedinUrl);
        totalCount += posts.length;
      }
    }

    // Fallback: if no widgets have linkedin_url, try the org's linkedin_id
    if (fetched.size === 0 && org.linkedin_id) {
      const posts = await fetchOrganizationPosts(org.access_token, org.linkedin_id);
      if (posts.length > 0) {
        upsertPosts(org.id, posts);
        totalCount += posts.length;
      }
    }

    res.json({ message: `Refreshed ${totalCount} posts`, count: totalCount });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Failed to refresh posts from LinkedIn" });
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
  const { organization_id, name, layout, config, linkedin_url } = req.body;

  if (!organization_id || !name) {
    res.status(400).json({ error: "organization_id and name are required" });
    return;
  }

  const org = getOrganization(organization_id);
  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }

  const widget = createWidget({ organization_id, name, layout, config, linkedin_url });
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
