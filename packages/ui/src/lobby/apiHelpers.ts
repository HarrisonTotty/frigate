/**
 * API helpers for lobby components
 * 
 * Provides utilities for making API calls with proper error handling.
 */

/**
 * Safely parse JSON response with content-type validation
 * Returns null if response is not JSON or parsing fails
 */
export async function safeJsonParse<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    console.warn(`Server returned non-JSON response (${contentType}) for ${response.url}`);
    return null;
  }
  
  try {
    return await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn(`JSON parsing failed for ${response.url} - server may not have implemented this endpoint yet`);
      return null;
    }
    throw error;
  }
}

/**
 * Check if error is a JSON parsing error
 */
export function isJsonParseError(error: unknown): boolean {
  return error instanceof SyntaxError;
}
