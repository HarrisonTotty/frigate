import { GraphQLClient, type RequestDocument, type RequestOptions, type Variables } from "graphql-request";
import type { FetchImplementation } from "./http";

export interface GraphQLClientOptions {
  readonly baseUrl: string;
  readonly path?: string;
  readonly headers?: Record<string, string>;
  readonly fetchImplementation?: FetchImplementation;
  readonly retries?: number;
  readonly retryDelayMs?: number;
}

export class GraphQLApiError extends Error {
  public readonly response: unknown;

  public constructor(message: string, response: unknown) {
    super(message);
    this.name = "HyperionGraphQLApiError";
    this.response = response;
  }
}

export class HyperionGraphQLClient {
  private readonly client: GraphQLClient;
  private readonly retries: number;
  private readonly retryDelayMs: number;

  public constructor(options: GraphQLClientOptions) {
    const endpoint = `${options.baseUrl.replace(/\/$/, "")}${options.path ?? "/graphql"}`;
    this.client = new GraphQLClient(endpoint, {
      headers: options.headers,
      fetch: options.fetchImplementation
    });
    this.retries = Math.max(0, options.retries ?? 2);
    this.retryDelayMs = Math.max(50, options.retryDelayMs ?? 250);
  }

  public async query<TData = unknown, TVariables extends Variables = Variables>(
    document: RequestDocument,
    variables?: TVariables
  ): Promise<TData> {
    return this.execute<TData, TVariables>(document, variables);
  }

  public async mutate<TData = unknown, TVariables extends Variables = Variables>(
    document: RequestDocument,
    variables?: TVariables
  ): Promise<TData> {
    return this.execute<TData, TVariables>(document, variables);
  }

  private async execute<TData, TVariables extends Variables>(
    document: RequestDocument,
    variables?: TVariables
  ): Promise<TData> {
    let attempt = 0;
    for (;;) {
      try {
        const options = (variables
          ? { document, variables }
          : { document }) as RequestOptions<TVariables, TData>;
        return await this.client.request<TData, TVariables>(options);
      } catch (error) {
        attempt += 1;
        if (attempt > this.retries) {
          throw new GraphQLApiError((error as Error)?.message ?? "GraphQL request failed", error);
        }
        await this.delay(attempt);
      }
    }
  }

  private async delay(attempt: number): Promise<void> {
    const base = Math.min(this.retryDelayMs * 2 ** (attempt - 1), this.retryDelayMs * 10);
    const jitter = Math.random() * this.retryDelayMs;
    await new Promise((resolve) => setTimeout(resolve, base + jitter));
  }
}
