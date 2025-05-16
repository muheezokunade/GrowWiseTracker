// API Configuration for different environments

// Get the API URL from environment variables if available
const API_BASE_URL = import.meta.env.API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://growwise-api.onrender.com' 
    : '');

/**
 * Constructs an API URL by adding the base URL if needed
 * @param endpoint The API endpoint path
 * @returns The complete API URL
 */
export function getApiUrl(endpoint: string): string {
  // If the endpoint already starts with http, return it as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // If the endpoint already starts with /api, just add the base URL
  if (endpoint.startsWith('/api')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  
  // Otherwise, construct the full path
  return `${API_BASE_URL}/api/${endpoint}`;
}

export default {
  baseUrl: API_BASE_URL,
  getApiUrl
}; 