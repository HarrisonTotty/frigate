import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import {
  LoadingText,
  LoadingOverlay,
  InlineLoading,
  ProgressText,
  ProcessingIndicator,
} from "../loading";
import { Panel } from "../layout";
import { Button } from "../components";

const meta: Meta = {
  title: "Feedback/Loading",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

/**
 * Text-based loading indicators (NO spinners)
 *
 * All loading states in Frigate use text-based indicators with animated dots.
 * This follows the hard sci-fi TUI aesthetic - no circular spinners or decorative animations.
 */
export const TextLoading: StoryObj = {
  render: () => (
    <Panel title="TEXT-BASED LOADING">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-4)" }}>
        <div>
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              color: "var(--frigate-text-secondary)",
              marginBottom: "var(--frigate-space-2)",
            }}
          >
            SMALL:
          </div>
          <LoadingText size="small" message="LOADING" />
        </div>

        <div>
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              color: "var(--frigate-text-secondary)",
              marginBottom: "var(--frigate-space-2)",
            }}
          >
            MEDIUM (DEFAULT):
          </div>
          <LoadingText size="medium" message="PROCESSING" />
        </div>

        <div>
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              color: "var(--frigate-text-secondary)",
              marginBottom: "var(--frigate-space-2)",
            }}
          >
            LARGE:
          </div>
          <LoadingText size="large" message="COMPILING" />
        </div>
      </div>
    </Panel>
  ),
};

/**
 * Full-screen loading overlay
 *
 * Used for major operations that block the entire interface (ship compilation, scene transitions)
 */
export const OverlayLoading: StoryObj = {
  render: () => {
    const Demo = () => {
      const [showOverlay, setShowOverlay] = useState(false);

      return (
        <Panel title="LOADING OVERLAY">
          <div style={{ padding: "var(--frigate-space-4)" }}>
            <Button onClick={() => setShowOverlay(true)}>[SHOW OVERLAY]</Button>

            {showOverlay && (
              <LoadingOverlay visible={true} message="COMPILING SHIP BLUEPRINT" backdrop={true} />
            )}

            <div
              style={{
                marginTop: "var(--frigate-space-4)",
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-text-secondary)",
              }}
            >
              Click button to show full-screen loading overlay.
              <br />
              (In production, overlay dismisses when operation completes)
            </div>
          </div>
        </Panel>
      );
    };
    return <Demo />;
  },
};

/**
 * Inline loading with content switcher
 *
 * Shows loading state or content based on loading boolean
 */
export const InlineLoadingState: StoryObj = {
  render: () => {
    const Demo = () => {
      const [loading, setLoading] = useState(false);

      const simulateLoad = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 3000);
      };

      return (
        <Panel title="INLINE LOADING">
          <div style={{ padding: "var(--frigate-space-4)" }}>
            <Button onClick={simulateLoad} disabled={loading}>
              {loading ? "[LOADING...]" : "[LOAD DATA]"}
            </Button>

            <div style={{ marginTop: "var(--frigate-space-4)" }}>
              <InlineLoading loading={loading} loadingText="FETCHING SHIP DATA">
                <div
                  style={{
                    fontFamily: "var(--frigate-font-mono)",
                    fontSize: "var(--frigate-font-body)",
                    color: "var(--frigate-text-primary)",
                  }}
                >
                  <div style={{ marginBottom: "var(--frigate-space-2)" }}>SHIP CLASS: FRIGATE</div>
                  <div style={{ marginBottom: "var(--frigate-space-2)" }}>CREW: 12 ASSIGNED</div>
                  <div>STATUS: [OPER]</div>
                </div>
              </InlineLoading>
            </div>
          </div>
        </Panel>
      );
    };
    return <Demo />;
  },
};

/**
 * Text-only progress indicator
 *
 * Shows completion percentage as text (NO visual progress bar)
 */
export const TextProgress: StoryObj = {
  render: () => {
    const Demo = () => {
      const [progress, setProgress] = useState(0);

      React.useEffect(() => {
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) return 0;
            return prev + 5;
          });
        }, 500);

        return () => clearInterval(interval);
      }, []);

      return (
        <Panel title="TEXT PROGRESS">
          <div style={{ padding: "var(--frigate-space-4)" }}>
            <ProgressText progress={progress} message="COMPILATION" />

            <div
              style={{
                marginTop: "var(--frigate-space-4)",
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-text-secondary)",
              }}
            >
              Progress shown as text only - no visual bar.
              <br />
              Loops from 0% to 100% for demonstration.
            </div>
          </div>
        </Panel>
      );
    };
    return <Demo />;
  },
};

/**
 * Background processing indicator
 *
 * Small badge showing ongoing background operations (autosave, sync, etc.)
 */
export const BackgroundProcessing: StoryObj = {
  render: () => {
    const Demo = () => {
      const [processing, setProcessing] = useState(false);

      return (
        <Panel title="BACKGROUND PROCESSING">
          <div style={{ padding: "var(--frigate-space-4)" }}>
            <div style={{ display: "flex", gap: "var(--frigate-space-3)", alignItems: "center" }}>
              <Button onClick={() => setProcessing(!processing)}>
                {processing ? "[STOP PROCESSING]" : "[START PROCESSING]"}
              </Button>

              <ProcessingIndicator processing={processing} processName="SAVE" />
            </div>

            <div
              style={{
                marginTop: "var(--frigate-space-4)",
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-text-secondary)",
              }}
            >
              Small indicator for background operations.
              <br />
              Only visible when processing=true.
            </div>
          </div>
        </Panel>
      );
    };
    return <Demo />;
  },
};

/**
 * All loading states together
 */
export const AllLoadingStates: StoryObj = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--frigate-space-4)",
        padding: "var(--frigate-space-4)",
        backgroundColor: "var(--frigate-bg-base)",
      }}
    >
      <Panel title="LOADING TEXT">
        <LoadingText message="LOADING" />
      </Panel>

      <Panel title="PROGRESS TEXT">
        <ProgressText progress={67} message="COMPILING" />
      </Panel>

      <Panel title="PROCESSING INDICATOR">
        <ProcessingIndicator processing={true} processName="SYNC" />
      </Panel>

      <Panel title="INLINE LOADING">
        <InlineLoading loading={true} loadingText="FETCHING DATA">
          <div>This content is hidden while loading</div>
        </InlineLoading>
      </Panel>
    </div>
  ),
};

/**
 * Custom messages
 */
export const CustomMessages: StoryObj = {
  render: () => (
    <Panel title="CUSTOM LOADING MESSAGES">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-3)" }}>
        <LoadingText message="INITIALIZING SYSTEMS" />
        <LoadingText message="COMPILING BLUEPRINT" />
        <LoadingText message="ESTABLISHING CONNECTION" />
        <LoadingText message="SCANNING CONTACTS" />
        <LoadingText message="CALCULATING TRAJECTORY" />
      </div>
    </Panel>
  ),
};
