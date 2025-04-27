import { Response } from "express";
import { z } from "zod";

/**
 * Handles database errors and provides a standardized way to report them
 * 
 * @param error The caught error
 * @param operation Description of the operation that failed
 */
export function handleDatabaseError(error: any, operation: string): never {
  console.error(`Database error during ${operation}:`, error);
  
  // Check if it's a connection error
  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
    throw new Error(`Database connection failed during ${operation}: ${error.message}`);
  }
  
  // Check for constraint violations
  if (error.code === '23505') { // Unique violation
    throw new Error(`Unique constraint violation during ${operation}: ${error.detail || error.message}`);
  }
  
  if (error.code === '23503') { // Foreign key violation
    throw new Error(`Foreign key constraint violation during ${operation}: ${error.detail || error.message}`);
  }
  
  // Generic database error
  throw new Error(`Database error during ${operation}: ${error.message}`);
}

/**
 * Handles API errors and sends appropriate responses
 * 
 * @param error The caught error
 * @param res Express response object
 */
export function apiErrorHandler(err: any, res: Response) {
  console.error("API error:", err);
  
  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    return res.status(400).json({ 
      message: "Validation error",
      errors: err.errors
    });
  }
  
  // Check for database connection issues
  if (err.message && (
    err.message.includes("connection failed") || 
    err.message.includes("ETIMEDOUT") ||
    err.message.includes("ECONNREFUSED")
  )) {
    return res.status(503).json({ 
      message: "Database service unavailable, using fallback storage", 
      error: err.message
    });
  }
  
  // Handle authorization errors
  if (err.message && err.message.includes("Not authorized")) {
    return res.status(403).json({ message: err.message });
  }
  
  // Handle not found errors
  if (err.message && err.message.includes("not found")) {
    return res.status(404).json({ message: err.message });
  }
  
  // Return a generic 500 error for all other errors
  return res.status(500).json({ 
    message: "An unexpected error occurred",
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
}