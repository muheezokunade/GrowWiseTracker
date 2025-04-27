import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if a user is authenticated and has admin privileges
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // First check if the user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // Then check if the user has admin privileges
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }
  
  // If we made it here, the user is an authenticated admin
  next();
}