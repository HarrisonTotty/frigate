/**
 * JavaScript to Rust logging bridge for Tauri
 *
 * Intercepts console.log/warn/error/debug/trace calls and forwards
 * them to the Rust backend via Tauri commands. This allows JS logs
 * to be captured in the same log file as Rust logs when using
 * --log-file CLI argument.
 */

import { invoke } from "@tauri-apps/api/core";

type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

// Store original console methods
const originalConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: console.debug.bind(console),
  trace: console.trace.bind(console),
};

/**
 * Format arguments into a single string message
 */
function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === "string") {
        return arg;
      }
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}\n${arg.stack || ""}`;
      }
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    })
    .join(" ");
}

/**
 * Send log message to Rust backend
 */
async function sendToRust(level: LogLevel, message: string): Promise<void> {
  try {
    await invoke("js_log", { level, message });
  } catch (err) {
    // If Tauri invoke fails, fall back to original console
    originalConsole.error("[logBridge] Failed to send log to Rust:", err);
  }
}

/**
 * Create a wrapped console method that forwards to Rust
 */
function createWrapper(
  level: LogLevel,
  original: (...args: unknown[]) => void
): (...args: unknown[]) => void {
  return (...args: unknown[]) => {
    // Always call original for DevTools visibility
    original(...args);

    // Forward to Rust
    const message = formatArgs(args);
    sendToRust(level, message);
  };
}

/**
 * Initialize the logging bridge
 *
 * Call this early in your application startup to ensure
 * all console logs are captured.
 */
export function initLogBridge(): void {
  console.log = createWrapper("info", originalConsole.log);
  console.info = createWrapper("info", originalConsole.info);
  console.warn = createWrapper("warn", originalConsole.warn);
  console.error = createWrapper("error", originalConsole.error);
  console.debug = createWrapper("debug", originalConsole.debug);
  console.trace = createWrapper("trace", originalConsole.trace);

  originalConsole.info("[logBridge] Initialized - JS logs forwarded to Rust");
}

/**
 * Restore original console methods
 *
 * Useful for testing or if you need to disable the bridge.
 */
export function restoreConsole(): void {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
  console.trace = originalConsole.trace;

  originalConsole.info("[logBridge] Restored original console methods");
}
