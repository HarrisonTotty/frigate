/**
 * Main Menu Component
 *
 * Application entry point providing server connection interface.
 * Features startup sequence aesthetic with technical diagnostics
 * following hard sci-fi TUI design philosophy.
 */

import React, { useState, useEffect } from "react";
import { Stack } from "../layout";
import { Button } from "../components";

export interface MainMenuProps {
  /** Callback when user attempts to connect to a server */
  onConnect?: (serverUrl: string) => void;
  /** Callback when user clicks settings */
  onSettings?: () => void;
  /** Callback when user clicks quit */
  onQuit?: () => void;
  /** Current connection status */
  connectionStatus?: "disconnected" | "connecting" | "connected" | "error";
  /** Error message if connection failed */
  errorMessage?: string;
  /** List of recent server URLs */
  recentServers?: string[];
  /** Callback when user selects a recent server */
  onSelectRecentServer?: (serverUrl: string) => void;
  /** Application version */
  version?: string;
  /** Additional CSS class */
  className?: string;
  /** Server latency in milliseconds (for diagnostics) */
  latency?: number;
  /** Server protocol version (for diagnostics) */
  serverVersion?: string;
}

/**
 * Main menu screen with server connection
 */
export function MainMenu({
  onConnect,
  onSettings,
  onQuit,
  connectionStatus = "disconnected",
  errorMessage,
  recentServers = [],
  onSelectRecentServer,
  version = "0.1.0",
  latency,
  serverVersion,
  className = "",
}: MainMenuProps) {
  const [serverUrl, setServerUrl] = useState("http://localhost:8000");
  const [bootComplete, setBootComplete] = useState(false);
  const [bootMessages, setBootMessages] = useState<string[]>([]);

  // Startup sequence animation
  useEffect(() => {
    const messages = [
      "FRIGATE v" + version + " INITIALIZING...",
      "HYPERION CLIENT PROTOCOL v1.0",
      "GRAPHICS SUBSYSTEM: OK",
      "NETWORK INTERFACE: READY",
      "AWAITING SERVER CONNECTION...",
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < messages.length) {
        setBootMessages((prev) => [...prev, messages[messageIndex]]);
        messageIndex++;
      } else {
        setBootComplete(true);
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [version]);

  const handleConnect = () => {
    if (onConnect && serverUrl.trim()) {
      onConnect(serverUrl.trim());
    }
  };

  const handleRecentServerClick = (url: string) => {
    setServerUrl(url);
    if (onSelectRecentServer) {
      onSelectRecentServer(url);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && connectionStatus !== "connecting") {
      handleConnect();
    }
  };

  const isConnecting = connectionStatus === "connecting";
  const hasError = connectionStatus === "error";
  const isConnected = connectionStatus === "connected";

  // Connection status label
  const getConnectionLabel = () => {
    switch (connectionStatus) {
      case "disconnected":
        return "CONN: NONE";
      case "connecting":
        return "CONN: HANDSHAKE";
      case "connected":
        return "CONN: ESTABLISHED";
      case "error":
        return "CONN: FAILED";
      default:
        return "CONN: UNKNOWN";
    }
  };

  return (
    <div
      className={`min-h-screen bg-background-primary flex items-center justify-center p-8 ${className}`}
      style={{
        fontFamily: "var(--frigate-font-mono)",
      }}
    >
      <div className="w-full max-w-2xl">
        <Stack gap={6}>
          {/* ASCII Header */}
          <div
            style={{
              textAlign: "left",
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              lineHeight: "1.2",
              color: "var(--frigate-text-secondary)",
              borderTop: "2px solid var(--frigate-border-base)",
              borderBottom: "2px solid var(--frigate-border-base)",
              padding: "16px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ whiteSpace: "pre" }}>╔════════════════════════════════════════╗</div>
            <div style={{ whiteSpace: "pre" }}>║ FRIGATE v{version} ║</div>
            <div style={{ whiteSpace: "pre" }}>║ HYPERION TACTICAL INTERFACE ║</div>
            <div style={{ whiteSpace: "pre" }}>╚════════════════════════════════════════╝</div>
          </div>

          {/* Boot sequence */}
          {!bootComplete && (
            <div
              style={{
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-text-muted)",
                padding: "16px",
                backgroundColor: "var(--frigate-bg-base)",
                border: "1px solid var(--frigate-border-base)",
              }}
            >
              {bootMessages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: "4px" }}>
                  {msg}
                </div>
              ))}
              {bootMessages.length > 0 && bootMessages.length < 5 && <div>█</div>}
            </div>
          )}

          {/* System status (after boot) */}
          {bootComplete && (
            <div
              style={{
                textAlign: "center",
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              SYSTEM STATUS: ALL NOMINAL
            </div>
          )}

          {/* Server Connection Panel */}
          {bootComplete && (
            <div
              style={{
                border: "1px solid var(--frigate-border-base)",
                backgroundColor: "var(--frigate-bg-surface)",
              }}
            >
              {/* Panel header */}
              <div
                style={{
                  borderBottom: "1px solid var(--frigate-border-base)",
                  padding: "12px 16px",
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-small)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--frigate-text-primary)",
                }}
              >
                SERVER CONNECTION
              </div>

              {/* Panel content */}
              <div style={{ padding: "16px" }}>
                <Stack gap={4}>
                  <div>
                    <label
                      htmlFor="server-url"
                      style={{
                        display: "block",
                        fontFamily: "var(--frigate-font-mono)",
                        fontSize: "var(--frigate-font-tiny)",
                        color: "var(--frigate-text-muted)",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      URL:
                    </label>
                    <input
                      id="server-url"
                      type="text"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isConnecting}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        backgroundColor: "var(--frigate-bg-base)",
                        border: hasError
                          ? "1px solid var(--frigate-danger)"
                          : "1px solid var(--frigate-border-base)",
                        color: "var(--frigate-text-primary)",
                        fontFamily: "var(--frigate-font-mono)",
                        fontSize: "var(--frigate-font-body)",
                        outline: "none",
                      }}
                      placeholder="http://localhost:8000"
                      autoFocus
                    />
                    {hasError && errorMessage && (
                      <div
                        style={{
                          marginTop: "8px",
                          fontFamily: "var(--frigate-font-mono)",
                          fontSize: "var(--frigate-font-small)",
                          color: "var(--frigate-danger)",
                        }}
                      >
                        [{errorMessage.toUpperCase()}]
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting || !serverUrl.trim()}
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    {isConnecting ? "[CONNECTING...]" : "[CONNECT]"}
                  </Button>

                  {/* Connection status and diagnostics */}
                  <div
                    style={{
                      borderTop: "1px solid var(--frigate-border-base)",
                      paddingTop: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--frigate-font-mono)",
                        fontSize: "var(--frigate-font-tiny)",
                        color:
                          connectionStatus === "connected"
                            ? "var(--frigate-success)"
                            : connectionStatus === "connecting"
                              ? "var(--frigate-warning)"
                              : connectionStatus === "error"
                                ? "var(--frigate-danger)"
                                : "var(--frigate-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "4px",
                      }}
                    >
                      {getConnectionLabel()}
                    </div>

                    {/* Diagnostics (when connected or connecting) */}
                    {(isConnected || isConnecting) && (
                      <div
                        style={{
                          fontFamily: "var(--frigate-font-mono)",
                          fontSize: "var(--frigate-font-tiny)",
                          color: "var(--frigate-text-secondary)",
                          lineHeight: "1.6",
                        }}
                      >
                        {latency !== undefined && <div>LATENCY: {latency}ms</div>}
                        {serverVersion && <div>SERVER: HYPERION v{serverVersion}</div>}
                        {!latency && !serverVersion && isConnected && (
                          <>
                            <div>PROTOCOL: HTTP/1.1</div>
                            <div>SERVER: HYPERION v0.1.0</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </Stack>
              </div>
            </div>
          )}

          {/* Recent Servers */}
          {bootComplete && recentServers.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-muted)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                RECENT SERVERS:
              </div>
              <Stack gap={2}>
                {recentServers.map((url, _idx) => (
                  <button
                    key={url}
                    onClick={() => handleRecentServerClick(url)}
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      backgroundColor: "var(--frigate-bg-surface)",
                      color: "var(--frigate-text-secondary)",
                      fontFamily: "var(--frigate-font-mono)",
                      fontSize: "var(--frigate-font-small)",
                      border: "1px solid var(--frigate-border-base)",
                      cursor: "pointer",
                      transition: "all 50ms",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--frigate-bg-raised)";
                      e.currentTarget.style.borderColor = "var(--frigate-primary)";
                      e.currentTarget.style.color = "var(--frigate-text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--frigate-bg-surface)";
                      e.currentTarget.style.borderColor = "var(--frigate-border-base)";
                      e.currentTarget.style.color = "var(--frigate-text-secondary)";
                    }}
                  >
                    • {url}
                  </button>
                ))}
              </Stack>
            </div>
          )}

          {/* Footer Actions */}
          {bootComplete && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "16px",
              }}
            >
              <Button onClick={onSettings} variant="ghost" size="md">
                [SETTINGS]
              </Button>
              <Button onClick={onQuit} variant="ghost" size="md">
                [QUIT]
              </Button>
            </div>
          )}
        </Stack>
      </div>
    </div>
  );
}
