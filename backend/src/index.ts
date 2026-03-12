import "dotenv/config";
import express from "express";
import cron from "node-cron";
import { initializeDb } from "./db/schema.js";
import { createCorsMiddleware } from "./middleware/cors.js";
import { refreshAllPosts } from "./services/linkedin.js";
import widgetRoutes from "./routes/widget.js";
import adminRoutes from "./routes/admin.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// Middleware
app.use(createCorsMiddleware());
app.use(express.json());

// Routes
app.use("/api/widget", widgetRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Initialize
initializeDb();

// Cron: refresh LinkedIn posts every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  console.log("Cron: refreshing LinkedIn posts...");
  try {
    await refreshAllPosts();
  } catch (error) {
    console.error("Cron refresh failed:", error);
  }
});

app.listen(PORT, () => {
  console.log(`Feeder backend running on http://localhost:${PORT}`);
});
