import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CenteredModal, ConfirmationModal, FormModal, FormField, FormSelect } from "../modals";
import { Button } from "../components";

/**
 * Modal Components
 *
 * Reusable centered dialog components for creation flows and confirmations.
 * Features overlay, ASCII borders, keyboard handling (ESC to close, Enter to submit),
 * focus trap, and ARIA attributes for accessibility.
 */
const meta: Meta = {
  title: "Components/Modals",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

/**
 * CenteredModal - Base Modal Component
 */
export const BasicModal: StoryObj = {
  render: () => {
    const Demo = () => {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <div style={{ padding: "2rem" }}>
          <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
          <CenteredModal
            title="System Notification"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            actions={
              <>
                <Button variant="secondary" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsOpen(false)}>
                  Confirm
                </Button>
              </>
            }
          >
            <p style={{ margin: 0, fontFamily: "var(--frigate-font-mono)", lineHeight: 1.6 }}>
              This is a basic centered modal with ASCII borders and keyboard handling. Press ESC to
              close or click the overlay.
            </p>
          </CenteredModal>
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * CenteredModal with Dirty State
 */
export const ModalWithDirtyState: StoryObj = {
  render: () => {
    const Demo = () => {
      const [isOpen, setIsOpen] = useState(false);
      const [isDirty, setIsDirty] = useState(false);

      return (
        <div style={{ padding: "2rem" }}>
          <Button onClick={() => setIsOpen(true)}>Open Modal with Unsaved Changes</Button>
          <CenteredModal
            title="Edit Configuration"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            isDirty={isDirty}
            actions={
              <>
                <Button variant="secondary" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsDirty(false);
                    setIsOpen(false);
                  }}
                >
                  Save
                </Button>
              </>
            }
          >
            <div style={{ fontFamily: "var(--frigate-font-mono)" }}>
              <p>
                Try clicking the overlay or pressing ESC - you&apos;ll get a confirmation prompt.
              </p>
              <label style={{ display: "block", marginTop: "1rem" }}>
                <input
                  type="checkbox"
                  checked={isDirty}
                  onChange={(e) => setIsDirty(e.target.checked)}
                  style={{ marginRight: "0.5rem" }}
                />
                Mark as dirty (unsaved changes)
              </label>
            </div>
          </CenteredModal>
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * ConfirmationModal - Standard Confirmation
 */
export const StandardConfirmation: StoryObj = {
  render: () => {
    const Demo = () => {
      const [isOpen, setIsOpen] = useState(false);
      const [result, setResult] = useState<string>("");

      return (
        <div style={{ padding: "2rem" }}>
          <Button onClick={() => setIsOpen(true)}>Show Confirmation</Button>
          {result && (
            <p style={{ marginTop: "1rem", fontFamily: "var(--frigate-font-mono)" }}>
              Result: {result}
            </p>
          )}
          <ConfirmationModal
            title="Confirm Action"
            message="Are you sure you want to proceed with this operation?"
            isOpen={isOpen}
            onConfirm={() => {
              setResult("User confirmed");
              setIsOpen(false);
            }}
            onCancel={() => {
              setResult("User cancelled");
              setIsOpen(false);
            }}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * ConfirmationModal - Danger Variant
 */
export const DangerConfirmation: StoryObj = {
  render: () => {
    const Demo = () => {
      const [isOpen, setIsOpen] = useState(false);
      const [deleted, setDeleted] = useState(false);

      return (
        <div style={{ padding: "2rem" }}>
          {!deleted ? (
            <Button variant="danger" onClick={() => setIsOpen(true)}>
              Delete Ship Blueprint
            </Button>
          ) : (
            <p style={{ fontFamily: "var(--frigate-font-mono)", color: "var(--frigate-danger)" }}>
              Ship blueprint deleted
            </p>
          )}
          <ConfirmationModal
            title="Confirm Deletion"
            message="This will permanently delete the ship blueprint. This action cannot be undone."
            isOpen={isOpen}
            onConfirm={() => {
              setDeleted(true);
              setIsOpen(false);
            }}
            onCancel={() => setIsOpen(false)}
            confirmLabel="Delete"
            isDanger={true}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * ConfirmationModal - Leave Workspace
 */
export const LeaveWorkspaceConfirmation: StoryObj = {
  render: () => {
    const Demo = () => {
      const [isOpen, setIsOpen] = useState(false);
      const [left, setLeft] = useState(false);

      return (
        <div style={{ padding: "2rem" }}>
          {!left ? (
            <Button onClick={() => setIsOpen(true)}>Leave Design Workspace</Button>
          ) : (
            <p style={{ fontFamily: "var(--frigate-font-mono)" }}>You left the workspace</p>
          )}
          <ConfirmationModal
            title="Leave Workspace"
            message="You have unsaved changes to the ship blueprint. Are you sure you want to leave?"
            isOpen={isOpen}
            onConfirm={() => {
              setLeft(true);
              setIsOpen(false);
            }}
            onCancel={() => setIsOpen(false)}
            confirmLabel="Leave"
            cancelLabel="Stay"
            isDanger={true}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * FormModal - Player Creation
 */
export const PlayerCreationForm: StoryObj = {
  render: () => {
    const Demo = () => {
      const [isOpen, setIsOpen] = useState(false);
      const [playerName, setPlayerName] = useState("");
      const [callsign, setCallsign] = useState("");
      const [errors, setErrors] = useState<{ name?: string; callsign?: string }>({});
      const [createdPlayer, setCreatedPlayer] = useState<string>("");

      const handleSubmit = () => {
        const newErrors: { name?: string; callsign?: string } = {};

        if (!playerName.trim()) {
          newErrors.name = "Player name is required";
        }
        if (!callsign.trim()) {
          newErrors.callsign = "Callsign is required";
        } else if (callsign.length < 3) {
          newErrors.callsign = "Callsign must be at least 3 characters";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }

        setCreatedPlayer(`${playerName} [${callsign}]`);
        setPlayerName("");
        setCallsign("");
        setErrors({});
        setIsOpen(false);
      };

      return (
        <div style={{ padding: "2rem" }}>
          <Button onClick={() => setIsOpen(true)}>Create Player</Button>
          {createdPlayer && (
            <p style={{ marginTop: "1rem", fontFamily: "var(--frigate-font-mono)" }}>
              Created player: {createdPlayer}
            </p>
          )}
          <FormModal
            title="Create New Player"
            isOpen={isOpen}
            onSubmit={handleSubmit}
            onCancel={() => {
              setPlayerName("");
              setCallsign("");
              setErrors({});
              setIsOpen(false);
            }}
            submitLabel="Create"
            submitDisabled={!playerName.trim() || !callsign.trim()}
            isDirty={playerName !== "" || callsign !== ""}
          >
            <FormField
              label="Player Name"
              name="playerName"
              value={playerName}
              onChange={(value) => {
                setPlayerName(value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="ENTER NAME"
              required={true}
              error={errors.name}
            />
            <FormField
              label="Callsign"
              name="callsign"
              value={callsign}
              onChange={(value) => {
                setCallsign(value.toUpperCase());
                if (errors.callsign) setErrors({ ...errors, callsign: undefined });
              }}
              placeholder="ENTER CALLSIGN"
              required={true}
              error={errors.callsign}
            />
          </FormModal>
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * FormModal - Team Creation
 */
export const TeamCreationForm: StoryObj = {
  render: () => {
    const Demo = () => {
      const [isOpen, setIsOpen] = useState(false);
      const [teamName, setTeamName] = useState("");
      const [faction, setFaction] = useState("");
      const [isPrivate, setIsPrivate] = useState(false);
      const [error, setError] = useState<string>("");
      const [createdTeam, setCreatedTeam] = useState<string>("");

      const factions = [
        { value: "terran", label: "Terran Federation" },
        { value: "mars", label: "Mars Coalition" },
        { value: "belters", label: "Belt Alliance" },
        { value: "europa", label: "Europa Compact" },
      ];

      const handleSubmit = () => {
        if (!teamName.trim()) {
          setError("Team name is required");
          return;
        }
        if (!faction) {
          setError("Faction selection is required");
          return;
        }

        setCreatedTeam(`${teamName} (${factions.find((f) => f.value === faction)?.label})`);
        setTeamName("");
        setFaction("");
        setIsPrivate(false);
        setError("");
        setIsOpen(false);
      };

      return (
        <div style={{ padding: "2rem" }}>
          <Button onClick={() => setIsOpen(true)}>Create Team</Button>
          {createdTeam && (
            <p style={{ marginTop: "1rem", fontFamily: "var(--frigate-font-mono)" }}>
              Created team: {createdTeam}
            </p>
          )}
          <FormModal
            title="Create New Team"
            isOpen={isOpen}
            onSubmit={handleSubmit}
            onCancel={() => {
              setTeamName("");
              setFaction("");
              setIsPrivate(false);
              setError("");
              setIsOpen(false);
            }}
            submitLabel="Create"
            submitDisabled={!teamName.trim() || !faction}
            isDirty={teamName !== "" || faction !== "" || isPrivate}
            width={700}
          >
            <FormField
              label="Team Name"
              name="teamName"
              value={teamName}
              onChange={(value) => {
                setTeamName(value);
                setError("");
              }}
              placeholder="ENTER TEAM NAME"
              required={true}
              error={error && !teamName.trim() ? error : undefined}
            />
            <FormSelect
              label="Faction"
              name="faction"
              value={faction}
              onChange={(value) => {
                setFaction(value);
                setError("");
              }}
              options={factions}
              placeholder="SELECT FACTION"
              required={true}
              error={error && !faction ? error : undefined}
            />
            <div style={{ fontFamily: "var(--frigate-font-mono)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <span style={{ fontSize: "var(--frigate-font-small)", textTransform: "uppercase" }}>
                  Private Team (Invite Only)
                </span>
              </label>
            </div>
          </FormModal>
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * FormModal - Ship Blueprint Creation
 */
export const ShipCreationForm: StoryObj = {
  render: () => {
    const Demo = () => {
      const [isOpen, setIsOpen] = useState(false);
      const [shipName, setShipName] = useState("");
      const [shipClass, setShipClass] = useState("");
      const [isLoading, setIsLoading] = useState(false);
      const [createdShip, setCreatedShip] = useState<string>("");

      const shipClasses = [
        { value: "corvette", label: "Corvette (CRVT) - 5 Crew, 400 BP" },
        { value: "frigate", label: "Frigate (FRGT) - 7 Crew, 500 BP" },
        { value: "destroyer", label: "Destroyer (DSTRY) - 8 Crew, 600 BP" },
        { value: "cruiser", label: "Cruiser (CRSR) - 9 Crew, 750 BP" },
        { value: "battleship", label: "Battleship (BTLSHP) - 12 Crew, 1000 BP" },
      ];

      const handleSubmit = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setCreatedShip(
          `${shipName} - ${shipClasses.find((c) => c.value === shipClass)?.label.split(" - ")[0]}`
        );
        setShipName("");
        setShipClass("");
        setIsLoading(false);
        setIsOpen(false);
      };

      return (
        <div style={{ padding: "2rem" }}>
          <Button onClick={() => setIsOpen(true)}>Create Ship Blueprint</Button>
          {createdShip && (
            <p style={{ marginTop: "1rem", fontFamily: "var(--frigate-font-mono)" }}>
              Created ship: {createdShip}
            </p>
          )}
          <FormModal
            title="Create Ship Blueprint"
            isOpen={isOpen}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShipName("");
              setShipClass("");
              setIsOpen(false);
            }}
            submitLabel="Create Blueprint"
            submitDisabled={!shipName.trim() || !shipClass}
            isLoading={isLoading}
            isDirty={shipName !== "" || shipClass !== ""}
            width={800}
          >
            <FormField
              label="Ship Name"
              name="shipName"
              value={shipName}
              onChange={setShipName}
              placeholder="ENTER SHIP NAME"
              required={true}
              disabled={isLoading}
            />
            <FormSelect
              label="Ship Class"
              name="shipClass"
              value={shipClass}
              onChange={setShipClass}
              options={shipClasses}
              placeholder="SELECT SHIP CLASS"
              required={true}
              disabled={isLoading}
            />
            <div
              style={{
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-text-secondary)",
                padding: "var(--frigate-space-3)",
                backgroundColor: "var(--frigate-bg-secondary)",
                border: "1px solid var(--frigate-border-light)",
              }}
            >
              <p style={{ margin: 0 }}>
                <strong>NOTE:</strong> Blueprint creation initializes the ship with default loadout.
                You can customize modules and assign crew in the design workspace.
              </p>
            </div>
          </FormModal>
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * All Modals Together
 */
export const ModalShowcase: StoryObj = {
  render: () => {
    const Demo = () => {
      const [activeModal, setActiveModal] = useState<string | null>(null);

      return (
        <div style={{ padding: "2rem", display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <Button onClick={() => setActiveModal("basic")}>Basic Modal</Button>
          <Button onClick={() => setActiveModal("confirmation")}>Confirmation</Button>
          <Button variant="danger" onClick={() => setActiveModal("danger")}>
            Danger Confirmation
          </Button>
          <Button onClick={() => setActiveModal("form")}>Form Modal</Button>

          <CenteredModal
            title="Basic Modal"
            isOpen={activeModal === "basic"}
            onClose={() => setActiveModal(null)}
            actions={<Button onClick={() => setActiveModal(null)}>Close</Button>}
          >
            <p style={{ margin: 0, fontFamily: "var(--frigate-font-mono)" }}>
              This is a basic modal with minimal content.
            </p>
          </CenteredModal>

          <ConfirmationModal
            title="Confirm Action"
            message="Are you sure you want to proceed?"
            isOpen={activeModal === "confirmation"}
            onConfirm={() => setActiveModal(null)}
            onCancel={() => setActiveModal(null)}
          />

          <ConfirmationModal
            title="Danger Zone"
            message="This action is irreversible and will permanently delete your data."
            isOpen={activeModal === "danger"}
            onConfirm={() => setActiveModal(null)}
            onCancel={() => setActiveModal(null)}
            isDanger={true}
            confirmLabel="Delete Forever"
          />

          <FormModal
            title="Quick Form"
            isOpen={activeModal === "form"}
            onSubmit={() => setActiveModal(null)}
            onCancel={() => setActiveModal(null)}
          >
            <FormField
              label="Name"
              name="name"
              value=""
              onChange={() => {}}
              placeholder="ENTER NAME"
            />
          </FormModal>
        </div>
      );
    };
    return <Demo />;
  },
};
