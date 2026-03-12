import cors from "cors";
import type { RequestHandler } from "express";

export function createCorsMiddleware(): RequestHandler {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Always allow the frontend URL
      if (origin === frontendUrl) {
        callback(null, true);
        return;
      }

      // Allow any origin for widget embed routes (handled per-request)
      // Since CORS middleware runs before route matching, we allow all origins
      // and rely on route-level logic if stricter control is needed.
      callback(null, true);
    },
    credentials: true,
  });
}
