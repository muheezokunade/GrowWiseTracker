// Database error handler
export function handleDatabaseError(error: any, operation: string): never {
  console.error(`Database error during ${operation}:`, error);
  throw new Error(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
}

// General purpose error handling for API routes
export function apiErrorHandler(err: any, res: any) {
  console.error('API Error:', err);
  
  // Determine the appropriate status code based on the error
  let statusCode = 500;
  if (err.code === '23505') { // PostgreSQL unique violation
    statusCode = 409; // Conflict
  } else if (err.message?.includes('not found') || err.message?.includes('does not exist')) {
    statusCode = 404; // Not Found
  } else if (err.message?.includes('unauthorized') || err.message?.includes('not authenticated')) {
    statusCode = 401; // Unauthorized
  } else if (err.message?.includes('forbidden')) {
    statusCode = 403; // Forbidden
  }
  
  // Send error response
  res.status(statusCode).json({
    error: err.message || 'An unexpected error occurred',
    code: err.code,
  });
}