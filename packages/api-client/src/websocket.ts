import { parseHyperionEvent } from "./events";
import type {
  ConnectionStatus,
  EventSubscriptionFilter,
  HyperionEvent,
  HyperionEventType,
} from "./types";

export interface WebSocketFactory {
  (url: string, protocols?: string | string[]): WebSocket;
}

export type StatusListener = (status: ConnectionStatus, cause?: CloseEvent | Event | Error) => void;

export interface WebSocketManagerOptions {
  readonly url: string;
  readonly protocols?: string | string[];
  readonly tokenProvider?: () => Promise<string | null>;
  readonly reconnectInitialDelayMs?: number;
  readonly reconnectMaxDelayMs?: number;
  readonly reconnectMultiplier?: number;
  readonly heartbeatIntervalMs?: number;
  readonly heartbeatPayload?: () => unknown;
  readonly maxQueueSize?: number;
  readonly factory?: WebSocketFactory;
  readonly logger?: (message: string, metadata?: Record<string, unknown>) => void;
}

interface Subscription {
  readonly id: number;
  readonly types?: ReadonlySet<HyperionEventType>;
  readonly filter?: EventSubscriptionFilter;
  readonly handler: (event: HyperionEvent) => void;
}

const DEFAULT_BACKOFF_INITIAL = 750;
const DEFAULT_BACKOFF_MAX = 10_000;
const DEFAULT_BACKOFF_MULTIPLIER = 2;
const DEFAULT_HEARTBEAT_INTERVAL = 20_000;
const DEFAULT_MAX_QUEUE_SIZE = 250;

function matchesFilter(event: HyperionEvent, filter?: EventSubscriptionFilter): boolean {
  if (!filter) {
    return true;
  }
  const shipId = (event.data as { shipId?: string }).shipId;
  const teamId = (event.data as { teamId?: string }).teamId;
  if (filter.shipId && filter.shipId !== shipId) {
    return false;
  }
  if (filter.teamId && filter.teamId !== teamId) {
    return false;
  }
  return true;
}

export class WebSocketManager {
  private readonly options: Required<WebSocketManagerOptions>;
  private readonly subscriptions = new Map<number, Subscription>();
  private readonly statusListeners = new Set<StatusListener>();
  private readonly messageQueue: HyperionEvent[] = [];
  private socket: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private nextSubscriptionId = 1;
  private reconnectAttempts = 0;
  private status: ConnectionStatus = "idle";
  private processingQueue = false;

  public constructor(options: WebSocketManagerOptions) {
    this.options = {
      reconnectInitialDelayMs: DEFAULT_BACKOFF_INITIAL,
      reconnectMaxDelayMs: DEFAULT_BACKOFF_MAX,
      reconnectMultiplier: DEFAULT_BACKOFF_MULTIPLIER,
      heartbeatIntervalMs: DEFAULT_HEARTBEAT_INTERVAL,
      heartbeatPayload: () => ({ type: "ping" }),
      maxQueueSize: DEFAULT_MAX_QUEUE_SIZE,
      factory: (url, protocols) => new WebSocket(url, protocols),
      logger: () => undefined,
      ...options,
    } as Required<WebSocketManagerOptions>;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public async connect(): Promise<void> {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    const token = this.options.tokenProvider ? await this.options.tokenProvider() : null;
    const url = this.appendToken(this.options.url, token);
    this.transition("connecting");
    try {
      this.socket = this.options.factory(url, this.options.protocols);
      this.attachSocketListeners(this.socket);
    } catch (error) {
      this.options.logger("websocket_factory_error", {
        error: (error as Error)?.message ?? "unknown",
      });
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.clearReconnect();
    this.clearHeartbeat();
    if (this.socket) {
      this.socket.removeEventListener("message", this.onMessage);
      this.socket.removeEventListener("open", this.onOpen);
      this.socket.removeEventListener("close", this.onClose);
      this.socket.removeEventListener("error", this.onError);
      try {
        this.socket.close(1000, "client_shutdown");
      } catch (error) {
        this.options.logger("websocket_close_error", {
          error: (error as Error)?.message ?? "unknown",
        });
      }
    }
    this.socket = null;
    this.transition("disconnected");
  }

  public subscribe(
    handler: (event: HyperionEvent) => void,
    options?: {
      readonly types?: HyperionEventType[];
      readonly filter?: EventSubscriptionFilter;
    }
  ): () => void {
    const subscription: Subscription = {
      id: this.nextSubscriptionId++,
      handler,
      types: options?.types ? new Set(options.types) : undefined,
      filter: options?.filter,
    };
    this.subscriptions.set(subscription.id, subscription);
    return () => {
      this.subscriptions.delete(subscription.id);
    };
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private appendToken(url: string, token: string | null): string {
    if (!token) {
      return url;
    }
    const parsed = new URL(url);
    parsed.searchParams.set("token", token);
    return parsed.toString();
  }

  private attachSocketListeners(socket: WebSocket): void {
    socket.addEventListener("open", this.onOpen);
    socket.addEventListener("message", this.onMessage);
    socket.addEventListener("close", this.onClose);
    socket.addEventListener("error", this.onError);
  }

  private readonly onOpen = (): void => {
    this.options.logger("websocket_opened");
    this.reconnectAttempts = 0;
    this.transition("connected");
    this.startHeartbeat();
  };

  private readonly onMessage = (event: MessageEvent): void => {
    try {
      const parsed = JSON.parse(event.data as string);
      const hyperionEvent = parseHyperionEvent(parsed);
      this.enqueueEvent(hyperionEvent);
    } catch (error) {
      this.options.logger("websocket_message_parse_error", {
        error: (error as Error)?.message ?? "unknown",
      });
    }
  };

  private readonly onClose = (event: CloseEvent): void => {
    this.options.logger("websocket_closed", { code: event.code, reason: event.reason });
    this.clearHeartbeat();
    this.transition("disconnected", event);
    this.scheduleReconnect();
  };

  private readonly onError = (event: Event): void => {
    this.options.logger("websocket_error");
    this.transition("error", event);
  };

  private enqueueEvent(event: HyperionEvent): void {
    this.messageQueue.push(event);
    if (this.messageQueue.length > this.options.maxQueueSize) {
      this.messageQueue.shift();
      this.options.logger("websocket_queue_overflow", { maxSize: this.options.maxQueueSize });
    }
    void this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processingQueue) {
      return;
    }
    this.processingQueue = true;
    try {
      while (this.messageQueue.length > 0) {
        const event = this.messageQueue.shift();
        if (!event) {
          continue;
        }
        for (const subscription of this.subscriptions.values()) {
          if (subscription.types && !subscription.types.has(event.type)) {
            continue;
          }
          if (!matchesFilter(event, subscription.filter)) {
            continue;
          }
          try {
            subscription.handler(event);
          } catch (error) {
            this.options.logger("websocket_handler_error", {
              error: (error as Error)?.message ?? "unknown",
            });
          }
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  private startHeartbeat(): void {
    this.clearHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        return;
      }
      try {
        this.socket.send(JSON.stringify(this.options.heartbeatPayload()));
      } catch (error) {
        this.options.logger("websocket_heartbeat_error", {
          error: (error as Error)?.message ?? "unknown",
        });
      }
    }, this.options.heartbeatIntervalMs);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnect();
    this.reconnectAttempts += 1;
    const delay = Math.min(
      this.options.reconnectInitialDelayMs *
        this.options.reconnectMultiplier ** (this.reconnectAttempts - 1),
      this.options.reconnectMaxDelayMs
    );
    const jitter = Math.random() * this.options.reconnectInitialDelayMs;
    this.reconnectTimer = setTimeout(() => {
      void this.connect();
    }, delay + jitter);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private transition(status: ConnectionStatus, cause?: CloseEvent | Event | Error): void {
    if (this.status === status) {
      return;
    }
    this.status = status;
    for (const listener of this.statusListeners) {
      try {
        listener(status, cause);
      } catch (error) {
        this.options.logger("websocket_status_listener_error", {
          error: (error as Error)?.message ?? "unknown",
        });
      }
    }
  }
}
