import { beforeEach, describe, expect, it, vi } from "vitest";

import { WebSocketManager } from "./websocket";
import type { HyperionEvent } from "./types";

vi.mock("./events", () => ({
  parseHyperionEvent: vi.fn((payload: unknown) => payload as HyperionEvent),
}));

class MockWebSocket extends EventTarget {
  public static readonly CONNECTING = 0;
  public static readonly OPEN = 1;
  public static readonly CLOSING = 2;
  public static readonly CLOSED = 3;

  public readonly url: string;
  public readonly protocols?: string | string[];
  public readyState = MockWebSocket.CONNECTING;
  public sent: string[] = [];

  public constructor(url: string, protocols?: string | string[]) {
    super();
    this.url = url;
    this.protocols = protocols;
  }

  public open(): void {
    this.readyState = MockWebSocket.OPEN;
    this.dispatchEvent(new Event("open"));
  }

  public emitMessage(data: unknown): void {
    const event = new Event("message") as MessageEvent;
    Object.assign(event, { data: JSON.stringify(data) });
    this.dispatchEvent(event);
  }

  public close(code = 1000, reason = ""): void {
    this.readyState = MockWebSocket.CLOSED;
    const event = new Event("close") as CloseEvent;
    Object.assign(event, { code, reason });
    this.dispatchEvent(event);
  }

  public send(payload: string): void {
    this.sent.push(payload);
  }
}

const mockGlobalWebSocket = MockWebSocket as unknown as typeof WebSocket;

describe("WebSocketManager", () => {
  beforeEach(() => {
    (globalThis as Record<string, unknown>).WebSocket = mockGlobalWebSocket;
    vi.clearAllMocks();
  });

  it("appends authentication tokens to the WebSocket URL", async () => {
    const createdSockets: MockWebSocket[] = [];
    const factory = vi.fn((url: string, protocols?: string | string[]) => {
      const socket = new MockWebSocket(url, protocols);
      createdSockets.push(socket);
      return socket as unknown as WebSocket;
    });

    const manager = new WebSocketManager({
      url: "wss://example.com/ws",
      tokenProvider: async () => "secret-token",
      factory,
      logger: () => undefined,
    });

    await manager.connect();
    expect(factory).toHaveBeenCalledTimes(1);
    const [url] = factory.mock.calls[0];
    expect(url).toContain("token=secret-token");
    expect(createdSockets[0]?.url).toContain("token=secret-token");
  });

  it("delivers events to subscribers filtered by type", async () => {
    const sockets: MockWebSocket[] = [];
    const factory = vi.fn((url: string) => {
      const socket = new MockWebSocket(url);
      sockets.push(socket);
      return socket as unknown as WebSocket;
    });

    const manager = new WebSocketManager({
      url: "wss://example.com/ws",
      factory,
      logger: () => undefined,
    });

    await manager.connect();
    const socket = sockets[0]!;
    socket.open();

    const handler = vi.fn();
    manager.subscribe(handler, { types: ["ship_status"] });

    socket.emitMessage({
      type: "ship_status",
      data: { shipId: "ship-1", hull: 85, shields: 60, power: 95, statusEffects: [] },
    });
    socket.emitMessage({
      type: "communication",
      data: { fromShip: "ship-1", toShip: "ship-2", message: "Ping", tone: "neutral" },
    });

    await Promise.resolve();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toMatchObject({ type: "ship_status" });
  });

  it("applies subscription filters for ship identifiers", async () => {
    const sockets: MockWebSocket[] = [];
    const factory = vi.fn((url: string) => {
      const socket = new MockWebSocket(url);
      sockets.push(socket);
      return socket as unknown as WebSocket;
    });

    const manager = new WebSocketManager({
      url: "wss://example.com/ws",
      factory,
      logger: () => undefined,
    });

    await manager.connect();
    const socket = sockets[0]!;
    socket.open();

    const handler = vi.fn();
    manager.subscribe(handler, { filter: { shipId: "ship-42" } });

    socket.emitMessage({
      type: "ship_status",
      data: { shipId: "ship-7", hull: 10, shields: 5, power: 20, statusEffects: [] },
    });
    socket.emitMessage({
      type: "ship_status",
      data: { shipId: "ship-42", hull: 100, shields: 90, power: 80, statusEffects: [] },
    });

    await Promise.resolve();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toMatchObject({ data: { shipId: "ship-42" } });
  });
});
