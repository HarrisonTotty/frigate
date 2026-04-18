import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, HttpClient, type FetchImplementation } from "./http";

describe("HttpClient", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
  });

  it("builds requests with base URL, query params, and transforms responses", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ value: 42 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const client = new HttpClient({
      baseUrl: "https://example.com/api/",
      fetchImplementation: fetchMock as unknown as FetchImplementation,
    });
    const result = await client.get(
      "/resource",
      (payload) => (payload as { value: number }).value,
      { page: 2 }
    );

    expect(result).toBe(42);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://example.com/api/resource?page=2");
    expect((init?.headers as Record<string, string>).Accept).toBe("application/json");
    expect(init?.method).toBe("GET");
  });

  it("throws an ApiError when JSON parsing fails", async () => {
    fetchMock.mockResolvedValue(
      new Response("not-json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const client = new HttpClient({
      baseUrl: "https://example.com",
      fetchImplementation: fetchMock as unknown as FetchImplementation,
    });

    await expect(client.get("/broken")).rejects.toBeInstanceOf(ApiError);
  });

  it("aborts requests that exceed the configured timeout", async () => {
    vi.useFakeTimers();

    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise((_, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const error = new Error("Aborted");
          error.name = "AbortError";
          reject(error);
        });
      });
    });

    const client = new HttpClient({
      baseUrl: "https://example.com",
      fetchImplementation: fetchMock as unknown as FetchImplementation,
      timeoutMs: 25,
    });
    const pendingRequest = client.get("/slow");

    vi.advanceTimersByTime(30);

    await expect(pendingRequest).rejects.toMatchObject({ status: 408 });

    vi.useRealTimers();
  });
});
