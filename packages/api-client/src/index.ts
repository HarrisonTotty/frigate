import type { FetchImplementation } from "./http";
import { HttpClient } from "./http";
import { RestClient } from "./rest";
import { CatalogResource } from "./catalog";
import { HyperionGraphQLClient } from "./graphql";
import { WebSocketManager, type WebSocketManagerOptions } from "./websocket";

export interface ApiClientOptions {
  readonly baseUrl: string;
  readonly websocketUrl?: string;
  readonly requestTimeoutMs?: number;
  readonly fetchImplementation?: FetchImplementation;
  readonly defaultHeaders?: Record<string, string>;
  readonly graphqlPath?: string;
  readonly websocketOptions?: Omit<WebSocketManagerOptions, "url">;
}

export class HyperionApiClient {
  private readonly http: HttpClient;
  public readonly rest: RestClient;
  public readonly catalog: CatalogResource;
  public readonly graphql: HyperionGraphQLClient;
  public readonly websocket: WebSocketManager;

  public constructor(options: ApiClientOptions) {
    this.http = new HttpClient({
      baseUrl: options.baseUrl,
      timeoutMs: options.requestTimeoutMs,
      fetchImplementation: options.fetchImplementation,
      defaultHeaders: options.defaultHeaders,
    });
    this.rest = new RestClient(this.http);
    this.catalog = new CatalogResource(this.http);
    this.graphql = new HyperionGraphQLClient({
      baseUrl: options.baseUrl,
      path: options.graphqlPath,
      fetchImplementation: options.fetchImplementation as typeof fetch | undefined,
      headers: options.defaultHeaders,
    });
    this.websocket = new WebSocketManager({
      ...(options.websocketOptions ?? {}),
      url: options.websocketUrl ?? this.deriveWebSocketUrl(options.baseUrl),
    });
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.http.get("/v1/health");
      return true;
    } catch (error) {
      void error;
      return false;
    }
  }

  private deriveWebSocketUrl(baseUrl: string): string {
    const parsed = new URL(baseUrl);
    parsed.protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
    parsed.pathname = `${parsed.pathname.replace(/\/$/, "")}/ws`;
    return parsed.toString();
  }
}

export type { FetchImplementation } from "./http";
export { HttpClient, ApiError } from "./http";
export { RestClient } from "./rest";
export {
  CatalogResource,
  fetchAmmoCategories,
  fetchAmmoInCategory,
  fetchAmmoDetails,
  fetchAllAmmunition,
} from "./catalog";
export { HyperionGraphQLClient, GraphQLApiError } from "./graphql";
export { WebSocketManager } from "./websocket";
export * from "./types";
export { parseHyperionEvent } from "./events";
