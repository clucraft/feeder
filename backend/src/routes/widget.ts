import { Router } from "express";
import { getWidget, getPostsByOrg } from "../db/queries.js";

const router = Router();

// GET /api/widget/:id — Returns widget config + its organization's posts
router.get("/:id", (req, res) => {
  const widget = getWidget(req.params.id);
  if (!widget) {
    res.status(404).json({ error: "Widget not found" });
    return;
  }

  const posts = getPostsByOrg(widget.organization_id);

  res.json({
    widget: {
      id: widget.id,
      name: widget.name,
      layout: widget.layout,
      config: JSON.parse(widget.config),
    },
    posts,
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
  const posts = getPostsByOrg(widget.organization_id, limit);

  res.json({ posts });
});

export default router;
