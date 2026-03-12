import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  const jwtSecret = process.env.JWT_SECRET || "change-this-secret";

  try {
    jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
