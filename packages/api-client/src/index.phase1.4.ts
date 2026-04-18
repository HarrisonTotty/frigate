import { HttpClient } from "./http";
import { CatalogResource } from "./catalog";
import { RestClient } from "./rest";
import { HyperionGraphQLClient } from "./graphql";
import { WebSocketManager } from "./websocket";
import type { ApiClientOptions } from "./index";

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

export * from "./types";
export { HttpClient, ApiError } from "./http";
export { RestClient } from "./rest";
export { CatalogResource } from "./catalog";
export { HyperionGraphQLClient, GraphQLApiError } from "./graphql";
export { WebSocketManager } from "./websocket";
export { parseHyperionEvent } from "./events";
