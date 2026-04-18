export type FetchImplementation = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

export interface HttpClientOptions {
  readonly baseUrl: string;
  readonly timeoutMs?: number;
  readonly fetchImplementation?: FetchImplementation;
  readonly defaultHeaders?: Record<string, string>;
}

export interface RequestOptions<TResponse> {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly body?: unknown;
  readonly query?: Record<string, string | number | boolean | undefined>;
  readonly headers?: Record<string, string>;
  readonly transform?: (payload: unknown) => TResponse;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly method: string;
  public readonly path: string;
  public readonly details: unknown;

  public constructor(
    message: string,
    status: number,
    method: string,
    path: string,
    details?: unknown
  ) {
    super(message);
    this.name = "HyperionApiError";
    this.status = status;
    this.method = method;
    this.path = path;
    this.details = details;
  }
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: FetchImplementation;
  private readonly defaultHeaders: Record<string, string>;

  public constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? 15_000;
    this.fetchImpl =
      options.fetchImplementation ?? (globalThis.fetch?.bind(globalThis) as FetchImplementation);
    if (!this.fetchImpl) {
      throw new Error("No fetch implementation available. Provide one via HttpClientOptions.");
    }
    this.defaultHeaders = {
      Accept: "application/json",
      ...options.defaultHeaders,
    };
  }

  public async request<TResponse>(options: RequestOptions<TResponse>): Promise<TResponse> {
    const url = this.buildUrl(options.path, options.query);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        method: options.method,
        headers: this.composeHeaders(options),
        body: this.serializeBody(options.body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorPayload = await this.safeJson(response);
        throw new ApiError(
          `Request to ${options.path} failed with status ${response.status}`,
          response.status,
          options.method,
          options.path,
          errorPayload
        );
      }

      if (response.status === 204) {
        return undefined as TResponse;
      }

      const payload = await this.safeJson(response);
      const transformer = options.transform ?? ((value: unknown) => value as TResponse);
      return transformer(payload);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if ((error as { name?: string }).name === "AbortError") {
        throw new ApiError("Request timed out", 408, options.method, options.path);
      }
      throw new ApiError(
        (error as Error)?.message ?? "Unknown error",
        500,
        options.method,
        options.path,
        error
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  public get<TResponse>(
    path: string,
    transform?: (payload: unknown) => TResponse,
    query?: RequestOptions<TResponse>["query"]
  ): Promise<TResponse> {
    return this.request({ method: "GET", path, transform, query });
  }

  public post<TResponse>(
    path: string,
    body?: unknown,
    transform?: (payload: unknown) => TResponse
  ): Promise<TResponse> {
    return this.request({ method: "POST", path, body, transform });
  }

  public patch<TResponse>(
    path: string,
    body?: unknown,
    transform?: (payload: unknown) => TResponse
  ): Promise<TResponse> {
    return this.request({ method: "PATCH", path, body, transform });
  }

  public delete<TResponse>(
    path: string,
    transform?: (payload: unknown) => TResponse
  ): Promise<TResponse> {
    return this.request({ method: "DELETE", path, transform });
  }

  private buildUrl(path: string, query?: RequestOptions<unknown>["query"]): string {
    const url = new URL(path.replace(/^\//, ""), `${this.baseUrl}/`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (typeof value === "undefined" || value === null) {
          return;
        }
        url.searchParams.set(key, String(value));
      });
    }
    return url.toString();
  }

  private composeHeaders<TResponse>(options: RequestOptions<TResponse>): Record<string, string> {
    const headers: Record<string, string> = { ...this.defaultHeaders, ...(options.headers ?? {}) };
    if (options.body && !("Content-Type" in headers)) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  private serializeBody(body: unknown): BodyInit | undefined {
    if (body === undefined || body === null) {
      return undefined;
    }
    if (typeof body === "string" || body instanceof Blob || body instanceof ArrayBuffer) {
      return body as BodyInit;
    }
    return JSON.stringify(body);
  }

  private async safeJson(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new ApiError("Failed to parse JSON response", 500, response.url, response.url, error);
    }
  }
}
