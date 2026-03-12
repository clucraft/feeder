import { Router } from "express";
import {
  createOrganization,
  listOrganizations,
  getOrganization,
  getPostsByOrg,
  createWidget,
  updateWidget,
  deleteWidget,
  listAllWidgets,
  upsertPosts,
} from "../db/queries.js";
import { fetchOrganizationPosts } from "../services/linkedin.js";
import { consumeTempToken } from "./auth.js";

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

  if (!name || !linkedin_id) {
    res.status(400).json({ error: "name and linkedin_id are required" });
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
    res.status(400).json({ error: "Either temp_token_id or access_token is required" });
    return;
  }

  const org = createOrganization({
    name,
    linkedin_id,
    access_token: resolvedToken,
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
  const posts = getPostsByOrg(org.id, limit);
  res.json({ posts });
});

// POST /api/admin/organizations/:id/refresh
router.post("/organizations/:id/refresh", async (req, res) => {
  const org = getOrganization(req.params.id);
  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }

  try {
    const posts = await fetchOrganizationPosts(org.access_token, org.linkedin_id);
    if (posts.length > 0) {
      upsertPosts(org.id, posts);
    }
    res.json({ message: `Refreshed ${posts.length} posts`, count: posts.length });
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
  const { organization_id, name, layout, config } = req.body;

  if (!organization_id || !name) {
    res.status(400).json({ error: "organization_id and name are required" });
    return;
  }

  const org = getOrganization(organization_id);
  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }

  const widget = createWidget({ organization_id, name, layout, config });
  res.status(201).json({ widget });
});

// PUT /api/admin/widgets/:id
router.put("/widgets/:id", (req, res) => {
  const { name, layout, config } = req.body;
  const updated = updateWidget(req.params.id, { name, layout, config });

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
