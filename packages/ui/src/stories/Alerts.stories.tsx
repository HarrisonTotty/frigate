/**
 * Storybook stories for alert system
 */

import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import {
  AlertProvider,
  AlertManager,
  AlertBanner,
  useAlert,
  useAlerts,
  type AlertSeverity,
} from "../alerts";
import { Panel } from "../layout";

const meta: Meta = {
  title: "Interaction/Alerts",
  decorators: [
    (Story) => (
      <AlertProvider>
        <Story />
        <AlertManager />
      </AlertProvider>
    ),
  ],
};

export default meta;

/**
 * Alert severity demonstration
 */
const AllSeveritiesDemo = () => {
  const alert = useAlert();
  const { soundEnabled, setSoundEnabled } = useAlerts();

  return (
    <Panel title="Alert System Demo">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sound"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />
          <label htmlFor="sound">Enable sound</label>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => alert.info("Information", "This is an informational message")}
            className="w-full px-4 py-2 bg-primary-600 rounded hover:bg-primary-500"
          >
            Show Info Alert
          </button>

          <button
            onClick={() => alert.success("Success", "Operation completed successfully")}
            className="w-full px-4 py-2 bg-success-600 rounded hover:bg-success-500"
          >
            Show Success Alert
          </button>

          <button
            onClick={() => alert.warning("Warning", "This requires your attention")}
            className="w-full px-4 py-2 bg-warning-600 rounded hover:bg-warning-500"
          >
            Show Warning Alert
          </button>

          <button
            onClick={() =>
              alert.danger("Danger", "Critical issue detected - requires acknowledgment")
            }
            className="w-full px-4 py-2 bg-danger-600 rounded hover:bg-danger-500"
          >
            Show Danger Alert
          </button>

          <button
            onClick={() => alert.critical("CRITICAL ALERT", "Hull breach on deck 7!")}
            className="w-full px-4 py-2 bg-danger-700 rounded hover:bg-danger-600 border-2 border-danger-400"
          >
            Show Critical Alert (with sound)
          </button>
        </div>
      </div>
    </Panel>
  );
};

export const AllSeverities: StoryObj = {
  render: () => <AllSeveritiesDemo />,
};

/**
 * Auto-dismiss demonstration
 */
export const AutoDismiss: StoryObj = {
  render: () => {
    const Demo = () => {
      const { addAlert } = useAlerts();

      return (
        <Panel title="Auto-Dismiss Demo">
          <div className="space-y-2">
            <button
              onClick={() =>
                addAlert({
                  severity: "info",
                  title: "Quick message",
                  message: "This will dismiss in 2 seconds",
                  timeout: 2000,
                })
              }
              className="w-full px-4 py-2 bg-primary-600 rounded hover:bg-primary-500"
            >
              2 Second Alert
            </button>

            <button
              onClick={() =>
                addAlert({
                  severity: "success",
                  title: "Saved",
                  timeout: 3000,
                })
              }
              className="w-full px-4 py-2 bg-success-600 rounded hover:bg-success-500"
            >
              3 Second Alert (no message)
            </button>

            <button
              onClick={() =>
                addAlert({
                  severity: "warning",
                  title: "Long warning",
                  message: "This stays for 10 seconds",
                  timeout: 10000,
                })
              }
              className="w-full px-4 py-2 bg-warning-600 rounded hover:bg-warning-500"
            >
              10 Second Alert
            </button>

            <button
              onClick={() =>
                addAlert({
                  severity: "info",
                  title: "Manual dismiss only",
                  message: "This will not auto-dismiss",
                  timeout: 0,
                })
              }
              className="w-full px-4 py-2 bg-background-700 rounded hover:bg-background-600"
            >
              No Auto-Dismiss
            </button>
          </div>
        </Panel>
      );
    };
    return <Demo />;
  },
};

/**
 * Acknowledgment workflow
 */
export const RequiresAcknowledgment: StoryObj = {
  render: () => {
    const Demo = () => {
      const alert = useAlert();

      return (
        <Panel title="Acknowledgment Workflow">
          <div className="space-y-2">
            <p className="text-sm text-text-secondary mb-4">
              Critical alerts require acknowledgment before they can be dismissed.
            </p>

            <button
              onClick={() =>
                alert.danger(
                  "System Failure",
                  "Life support systems are failing. Immediate action required."
                )
              }
              className="w-full px-4 py-2 bg-danger-600 rounded hover:bg-danger-500"
            >
              Show Danger (Requires Ack)
            </button>

            <button
              onClick={() =>
                alert.critical(
                  "HULL BREACH",
                  "Multiple hull breaches detected on decks 4, 7, and 9. Emergency containment protocols activated."
                )
              }
              className="w-full px-4 py-2 bg-danger-700 rounded hover:bg-danger-600 border-2 border-danger-400"
            >
              Show Critical (Requires Ack + Sound)
            </button>
          </div>
        </Panel>
      );
    };
    return <Demo />;
  },
};

/**
 * Multiple alerts
 */
export const MultipleAlerts: StoryObj = {
  render: () => {
    const Demo = () => {
      const alert = useAlert();
      const { clearAll } = useAlerts();

      return (
        <Panel title="Multiple Alerts">
          <div className="space-y-2">
            <button
              onClick={() => {
                alert.info("Scanning", "Long-range sensors active");
                setTimeout(() => alert.success("Scan complete", "No threats detected"), 1000);
                setTimeout(() => alert.info("Navigation", "Course plotted"), 2000);
              }}
              className="w-full px-4 py-2 bg-primary-600 rounded hover:bg-primary-500"
            >
              Show Sequence
            </button>

            <button
              onClick={() => {
                for (let i = 1; i <= 5; i++) {
                  alert.info(`Alert ${i}`, `Message number ${i}`);
                }
              }}
              className="w-full px-4 py-2 bg-primary-600 rounded hover:bg-primary-500"
            >
              Show 5 Alerts
            </button>

            <button
              onClick={clearAll}
              className="w-full px-4 py-2 bg-danger-600 rounded hover:bg-danger-500"
            >
              Clear All Alerts
            </button>
          </div>
        </Panel>
      );
    };
    return <Demo />;
  },
};

/**
 * Alert banner component (non-toast)
 */
export const BannerAlerts: StoryObj = {
  render: () => {
    const Demo = () => {
      const [visibleBanners, setVisibleBanners] = useState<AlertSeverity[]>([
        "info",
        "warning",
        "danger",
      ]);

      const toggleBanner = (severity: AlertSeverity) => {
        setVisibleBanners((prev) =>
          prev.includes(severity) ? prev.filter((s) => s !== severity) : [...prev, severity]
        );
      };

      return (
        <div className="space-y-4">
          <Panel title="Banner Controls">
            <div className="space-y-2">
              {(["info", "success", "warning", "danger", "critical"] as AlertSeverity[]).map(
                (severity) => (
                  <button
                    key={severity}
                    onClick={() => toggleBanner(severity)}
                    className={`w-full px-4 py-2 rounded ${
                      visibleBanners.includes(severity) ? "bg-primary-600" : "bg-background-700"
                    }`}
                  >
                    {visibleBanners.includes(severity) ? "Hide" : "Show"} {severity}
                  </button>
                )
              )}
            </div>
          </Panel>

          <div className="space-y-3">
            {visibleBanners.includes("info") && (
              <AlertBanner
                severity="info"
                title="Information"
                message="This is an informational banner"
                onClose={() => toggleBanner("info")}
              />
            )}

            {visibleBanners.includes("success") && (
              <AlertBanner
                severity="success"
                title="Success"
                message="Operation completed successfully"
                onClose={() => toggleBanner("success")}
              />
            )}

            {visibleBanners.includes("warning") && (
              <AlertBanner
                severity="warning"
                title="Warning"
                message="Power levels are below optimal"
                onClose={() => toggleBanner("warning")}
              />
            )}

            {visibleBanners.includes("danger") && (
              <AlertBanner
                severity="danger"
                title="Danger"
                message="Shield generators failing - immediate attention required"
                onClose={() => toggleBanner("danger")}
              />
            )}

            {visibleBanners.includes("critical") && (
              <AlertBanner
                severity="critical"
                title="CRITICAL SYSTEM FAILURE"
                message="Warp core containment breach imminent. Evacuate engineering section immediately."
                onClose={() => toggleBanner("critical")}
              />
            )}
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * Bridge scenario simulation
 */
export const BridgeScenario: StoryObj = {
  render: () => {
    const Demo = () => {
      const alert = useAlert();

      const runScenario = () => {
        // Combat scenario
        setTimeout(() => alert.warning("Incoming", "Hostile vessel detected on sensors"), 500);
        setTimeout(() => alert.info("Tactical", "Weapons systems armed"), 2000);
        setTimeout(() => alert.warning("Under Fire", "Taking enemy fire! Shields at 80%"), 4000);
        setTimeout(() => alert.danger("Shield Failure", "Forward shields down to 40%"), 6000);
        setTimeout(() => alert.critical("HULL BREACH", "Hull breach detected on deck 3!"), 8000);
        setTimeout(() => alert.success("Victory", "Enemy vessel destroyed"), 10000);
        setTimeout(() => alert.info("Status", "Damage control teams dispatched"), 11000);
      };

      return (
        <Panel title="Bridge Combat Scenario">
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Simulates a combat scenario with sequential alerts of increasing severity.
            </p>
            <button
              onClick={runScenario}
              className="w-full px-4 py-2 bg-danger-600 rounded hover:bg-danger-500"
            >
              Start Combat Scenario
            </button>
          </div>
        </Panel>
      );
    };
    return <Demo />;
  },
};
