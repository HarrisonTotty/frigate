/**
 * Server Management Utilities
 * 
 * Handles server connection management, health checks, and persistence.
 */

const RECENT_SERVERS_KEY = 'frigate_recent_servers';
const MAX_RECENT_SERVERS = 5;
const DEFAULT_TIMEOUT = 5000; // 5 seconds

export interface ServerInfo {
  url: string;
  name?: string;
  version?: string;
  playerCount?: number;
  maxPlayers?: number;
  lastConnected?: number;
}

export interface ServerHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  name?: string;
  playerCount?: number;
  maxPlayers?: number;
  uptime?: number;
}

/**
 * Validate server URL format
 */
export function validateServerUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Check server health
 */
export async function checkServerHealth(
  serverUrl: string,
  timeout = DEFAULT_TIMEOUT
): Promise<ServerHealthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${serverUrl}/health`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // HYPERION server returns { status: "ok", message: "..." }
    // We need to adapt it to our expected format
    return {
      status: data.status === 'ok' ? 'healthy' : 'unhealthy',
      version: data.version || 'unknown',
      name: data.server || 'HYPERION',
      playerCount: data.playerCount || 0,
      maxPlayers: data.maxPlayers || 0,
      uptime: data.uptime || 0,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Connection timeout - server did not respond');
      }
      throw new Error(`Connection failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get recent servers from localStorage
 */
export function getRecentServers(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SERVERS_KEY);
    if (!stored) return [];
    
    const servers = JSON.parse(stored) as string[];
    return Array.isArray(servers) ? servers : [];
  } catch (e) {
    console.error('Failed to load recent servers:', e);
    return [];
  }
}

/**
 * Add server to recent list
 */
export function addRecentServer(url: string): void {
  try {
    const recent = getRecentServers();
    
    // Remove if already exists
    const filtered = recent.filter(s => s !== url);
    
    // Add to front
    const updated = [url, ...filtered].slice(0, MAX_RECENT_SERVERS);
    
    localStorage.setItem(RECENT_SERVERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save recent server:', e);
  }
}

/**
 * Remove server from recent list
 */
export function removeRecentServer(url: string): void {
  try {
    const recent = getRecentServers();
    const filtered = recent.filter(s => s !== url);
    localStorage.setItem(RECENT_SERVERS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to remove recent server:', e);
  }
}

/**
 * Clear all recent servers
 */
export function clearRecentServers(): void {
  try {
    localStorage.removeItem(RECENT_SERVERS_KEY);
  } catch (e) {
    console.error('Failed to clear recent servers:', e);
  }
}

/**
 * Measure connection latency (ping)
 */
export async function measureLatency(serverUrl: string): Promise<number> {
  const start = performance.now();
  
  try {
    await fetch(`${serverUrl}/health`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    
    const end = performance.now();
    return Math.round(end - start);
  } catch (error) {
    throw new Error('Failed to measure latency');
  }
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}
