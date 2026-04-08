import { Router } from "express";
import path from "path";
import { getCachedMediaPath } from "../services/media-cache.js";

const router = Router();

// GET /api/media/:filename — Serve cached media files
router.get("/:filename", (req, res) => {
  const filename = path.basename(req.params.filename); // prevent path traversal
  const filepath = getCachedMediaPath(filename);

  if (!filepath) {
    res.status(404).json({ error: "Media not found" });
    return;
  }

  // Set aggressive caching — these files are content-addressed
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.sendFile(filepath);
});

export default router;
