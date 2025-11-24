/**
 * HYPERION API Client
 * 
 * Centralized API client for all HYPERION backend interactions.
 * Provides type-safe methods for all API endpoints.
 */

import type {
  ShipClassSummary,
  ShipClassDetails,
} from '../types/shipClass';

/**
 * API client configuration
 */
export interface ApiConfig {
  /** Base URL of the HYPERION server */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * API error with status code and message
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * HYPERION API Client
 */
export class HyperionApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 30000; // 30 second default
  }

  /**
   * Make a fetch request with timeout and error handling
   */
  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          response.statusText,
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(408, 'Request Timeout', 'Request timed out');
      }
      
      throw new ApiError(
        0,
        'Network Error',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  // ==================== Players ====================

  /**
   * List all players
   * GET /v1/players
   */
  async getPlayers(): Promise<Array<{ id: string; name: string; created_at: string }>> {
    return this.fetch('/v1/players');
  }

  /**
   * Create a new player
   * POST /v1/players
   */
  async createPlayer(name: string): Promise<{ id: string; name: string; created_at: string }> {
    return this.fetch('/v1/players', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // ==================== Teams ====================

  /**
   * List all teams
   * GET /v1/teams
   */
  async getTeams(): Promise<Array<{
    id: string;
    name: string;
    faction: string;
    created_at: string;
  }>> {
    return this.fetch('/v1/teams');
  }

  /**
   * Create a new team
   * POST /v1/teams
   */
  async createTeam(data: {
    name: string;
    faction_id: string;
    player_id?: string;
  }): Promise<{
    id: string;
    name: string;
    faction: string;
    created_at: string;
  }> {
    return this.fetch('/v1/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get team details
   * GET /v1/teams/:id
   */
  async getTeam(teamId: string): Promise<{
    id: string;
    name: string;
    faction: string;
    players: Array<{ id: string; name: string }>;
    created_at: string;
  }> {
    return this.fetch(`/v1/teams/${teamId}`);
  }

  // ==================== Factions ====================

  /**
   * List all factions
   * GET /v1/factions
   */
  async getFactions(): Promise<Array<{
    id: string;
    name: string;
    description: string;
  }>> {
    return this.fetch('/v1/factions');
  }

  // ==================== Ship Classes ====================

  /**
   * List all ship classes
   * GET /v1/ship-classes
   * 
   * @param faction Optional faction ID to filter by manufacturer
   */
  async getShipClasses(faction?: string): Promise<ShipClassSummary[]> {
    const query = faction ? `?faction=${encodeURIComponent(faction)}` : '';
    return this.fetch(`/v1/ship-classes${query}`);
  }

  /**
   * Get detailed ship class information
   * GET /ship-classes/:id
   * 
   * @param classId Ship class identifier (e.g., "frigate", "cruiser")
   */
  async getShipClass(classId: string): Promise<ShipClassDetails> {
    return this.fetch(`/v1/ship-classes/${classId}`);
  }

  // ==================== Blueprints ====================

  /**
   * List blueprints for a team
   * GET /v1/blueprints?team_id=:teamId
   */
  async getBlueprints(teamId: string): Promise<Array<{
    id: string;
    name: string;
    ship_class: string;
    created_at: string;
  }>> {
    return this.fetch(`/v1/blueprints?team_id=${encodeURIComponent(teamId)}`);
  }

  /**
   * Create a new blueprint
   * POST /v1/blueprints
   */
  async createBlueprint(data: {
    name: string;
    ship_class: string;
    team_id: string;
  }): Promise<{
    id: string;
    name: string;
    ship_class: string;
    team_id: string;
    created_at: string;
  }> {
    return this.fetch('/v1/blueprints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== Health Check ====================

  /**
   * Check server health
   * GET /v1/health
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.fetch('/v1/health');
  }

  /**
   * Get server info
   * GET /v1/info
   */
  async getServerInfo(): Promise<{
    server: string;
    version: string;
    factions_count: number;
    races_count: number;
    ship_classes_count: number;
  }> {
    return this.fetch('/v1/info');
  }
}

/**
 * Create a new API client instance
 */
export function createApiClient(config: ApiConfig): HyperionApiClient {
  return new HyperionApiClient(config);
}

/**
 * Default API client for development
 */
export const defaultApiClient = createApiClient({
  baseUrl: 'http://localhost:8000',
  timeout: 30000,
});
