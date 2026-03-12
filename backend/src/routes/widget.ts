import { Router } from "express";
import { getWidget, getPostsByOrg } from "../db/queries.js";
import { demoPosts } from "../data/demo-posts.js";

const router = Router();

// GET /api/widget/:id — Returns widget config + its organization's posts
router.get("/:id", (req, res) => {
  const widget = getWidget(req.params.id);
  if (!widget) {
    res.status(404).json({ error: "Widget not found" });
    return;
  }

  const realPosts = getPostsByOrg(widget.organization_id);
  const demo = realPosts.length === 0;
  const posts = demo
    ? demoPosts.map((p) => ({ ...p, organization_id: widget.organization_id }))
    : realPosts;

  res.json({
    widget: {
      id: widget.id,
      name: widget.name,
      layout: widget.layout,
      config: JSON.parse(widget.config),
    },
    posts,
    ...(demo ? { demo: true } : {}),
  });
});

// GET /api/widget/:id/posts — Returns just the posts for a widget
router.get("/:id/posts", (req, res) => {
  const widget = getWidget(req.params.id);
  if (!widget) {
    res.status(404).json({ error: "Widget not found" });
    return;
  }

  const limit = parseInt(req.query.limit as string) || 20;
  const realPosts = getPostsByOrg(widget.organization_id, limit);
  const demo = realPosts.length === 0;
  const posts = demo
    ? demoPosts.slice(0, limit).map((p) => ({ ...p, organization_id: widget.organization_id }))
    : realPosts;

  res.json({ posts, ...(demo ? { demo: true } : {}) });
});

export default router;
