import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if a user is authenticated and has admin privileges
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Check if user has admin role
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  next();
}