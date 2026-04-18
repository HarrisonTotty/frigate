/**
 * AmmunitionDetailModal Component
 *
 * Full specification modal for ammunition items.
 * Displays complete stats, description, and allows adding to inventory.
 * Follows the hard sci-fi design philosophy with technical aesthetic.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Ammunition } from "@frigate/api-client";
import { Button } from "../components";
import { formatNumber } from "../utils";

/**
 * AmmunitionDetailModal Props
 */
export interface AmmunitionDetailModalProps {
  /** Ammunition to display (null to close) */
  ammo: Ammunition | null;
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Callback to add ammunition to inventory */
  onAddToInventory: (ammoId: string, quantity: number) => void;
  /** Whether adding is allowed (within constraints) */
  canAdd: boolean;
  /** Check if can add specific quantity */
  canAddQuantity?: (ammoId: string, quantity: number) => boolean;
  /** Whether ammo is compatible with installed weapons */
  isCompatible?: boolean;
  /** Reason for incompatibility */
  incompatibilityReason?: string;
  /** Names of compatible weapons */
  compatibleWeapons?: string[];
  /** Optional CSS class name */
  className?: string;
}

/**
 * Stat cell component for the specs grid
 */
function StatCell({
  label,
  value,
  unit = "",
  span = 1,
}: {
  label: string;
  value: string | number;
  unit?: string;
  span?: number;
}) {
  return (
    <div
      style={{
        padding: "var(--frigate-space-2)",
        border: "1px solid var(--frigate-border-base)",
        gridColumn: `span ${span}`,
      }}
    >
      <div
        style={{
          fontSize: "var(--frigate-font-tiny)",
          color: "var(--frigate-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "var(--frigate-font-body)",
          fontWeight: 700,
          color: "var(--frigate-text-primary)",
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              color: "var(--frigate-text-muted)",
              fontWeight: 400,
              marginLeft: "4px",
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * AmmunitionDetailModal Component
 *
 * Full ammunition specification display with add-to-inventory functionality.
 *
 * Features:
 * - Complete ammunition specifications in grid layout
 * - Description text
 * - Compatibility status with weapon list
 * - Quantity input with quick-add buttons
 * - Subtotal calculation
 * - Keyboard support (Escape to close)
 */
export function AmmunitionDetailModal({
  ammo,
  isOpen,
  onClose,
  onAddToInventory,
  canAdd,
  canAddQuantity,
  isCompatible = true,
  incompatibilityReason,
  compatibleWeapons = [],
  className = "",
}: AmmunitionDetailModalProps): React.ReactElement | null {
  const [quantity, setQuantity] = useState(10);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Reset quantity when ammo changes
  useEffect(() => {
    setQuantity(10);
  }, [ammo?.id]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();

    return () => {
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle add to inventory
  const handleAdd = useCallback(() => {
    if (ammo && canAdd && quantity > 0) {
      onAddToInventory(ammo.id, quantity);
      onClose();
    }
  }, [ammo, canAdd, quantity, onAddToInventory, onClose]);

  // Handle quantity change
  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    }
  }, []);

  // Quick add buttons
  const handleQuickAdd = useCallback((amount: number) => {
    setQuantity((prev) => Math.max(0, prev + amount));
  }, []);

  if (!isOpen || !ammo) return null;

  // Calculate subtotals
  const subtotalCost = ammo.cost * quantity;
  const subtotalWeight = ammo.weight * quantity;

  // Build type string
  const typeString = [
    ammo.category.toUpperCase(),
    ammo.ammo_size?.toUpperCase(),
    ammo.ammo_type?.toUpperCase(),
  ]
    .filter(Boolean)
    .join(" / ");

  // Check if can add the current quantity
  const canAddCurrentQty = canAddQuantity
    ? canAddQuantity(ammo.id, quantity)
    : canAdd && quantity > 0;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ammo-detail-title"
        tabIndex={-1}
        className={className}
        style={{
          backgroundColor: "var(--frigate-bg-base)",
          border: "2px solid var(--frigate-primary)",
          borderRadius: 0,
          width: "600px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--frigate-font-mono)",
          boxShadow: "none",
          outline: "none",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--frigate-space-3)",
            borderBottom: "1px solid var(--frigate-border-base)",
            backgroundColor: "var(--frigate-bg-surface)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "var(--frigate-font-tiny)",
                color: "var(--frigate-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "4px",
              }}
            >
              AMMUNITION DETAILS
            </div>
            <h2
              id="ammo-detail-title"
              style={{
                margin: 0,
                fontSize: "var(--frigate-font-heading)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--frigate-text-primary)",
              }}
            >
              {ammo.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--frigate-text-secondary)",
              fontSize: "var(--frigate-font-heading)",
              cursor: "pointer",
              padding: "var(--frigate-space-2)",
              fontFamily: "var(--frigate-font-mono)",
              fontWeight: 700,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--frigate-danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--frigate-text-secondary)";
            }}
          >
            [CLOSE]
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "var(--frigate-space-3)",
          }}
        >
          {/* Type designation */}
          <div
            style={{
              fontSize: "var(--frigate-font-small)",
              color: "var(--frigate-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "var(--frigate-space-3)",
              paddingBottom: "var(--frigate-space-2)",
              borderBottom: "1px solid var(--frigate-border-base)",
            }}
          >
            {typeString}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "var(--frigate-font-small)",
              color: "var(--frigate-text-secondary)",
              lineHeight: 1.6,
              marginBottom: "var(--frigate-space-3)",
            }}
          >
            {ammo.description}
          </div>

          {/* Specifications Grid */}
          <div
            style={{
              marginBottom: "var(--frigate-space-3)",
            }}
          >
            <div
              style={{
                fontSize: "var(--frigate-font-tiny)",
                color: "var(--frigate-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "var(--frigate-space-2)",
                fontWeight: 700,
              }}
            >
              SPECIFICATIONS
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 0,
                border: "1px solid var(--frigate-border-base)",
              }}
            >
              <StatCell label="COST" value={formatNumber(ammo.cost)} unit="CR" />
              <StatCell label="WEIGHT" value={ammo.weight} unit="t" />
              <StatCell label="CATEGORY" value={ammo.category.toUpperCase()} />
              <StatCell label="IMPACT DMG" value={formatNumber(ammo.impact_damage)} />
              <StatCell label="BLAST DMG" value={formatNumber(ammo.blast_damage)} />
              <StatCell label="BLAST RADIUS" value={ammo.blast_radius} unit="m" />
              <StatCell label="VELOCITY" value={formatNumber(ammo.velocity)} unit="m/s" />
              <StatCell label="PENETRATION" value={ammo.armor_penetration} />
              {ammo.ammo_type && <StatCell label="TYPE" value={ammo.ammo_type.toUpperCase()} />}
            </div>
          </div>

          {/* Compatibility Section */}
          <div
            style={{
              marginBottom: "var(--frigate-space-3)",
              padding: "var(--frigate-space-2)",
              backgroundColor: isCompatible ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
              border: `1px solid ${isCompatible ? "var(--frigate-success)" : "var(--frigate-warning)"}`,
            }}
          >
            <div
              style={{
                fontSize: "var(--frigate-font-tiny)",
                color: "var(--frigate-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "var(--frigate-space-1)",
                fontWeight: 700,
              }}
            >
              COMPATIBILITY STATUS
            </div>
            {isCompatible ? (
              <>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--frigate-success)",
                    fontSize: "var(--frigate-font-small)",
                  }}
                >
                  [COMPATIBLE]
                </div>
                {compatibleWeapons.length > 0 && (
                  <div
                    style={{
                      marginTop: "var(--frigate-space-1)",
                      color: "var(--frigate-text-secondary)",
                      fontSize: "var(--frigate-font-tiny)",
                    }}
                  >
                    {compatibleWeapons.map((weapon, idx) => (
                      <div key={idx}>• {weapon}</div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--frigate-warning)",
                    fontSize: "var(--frigate-font-small)",
                  }}
                >
                  [INCOMPATIBLE]
                </div>
                {incompatibilityReason && (
                  <div
                    style={{
                      marginTop: "var(--frigate-space-1)",
                      color: "var(--frigate-text-secondary)",
                      fontSize: "var(--frigate-font-tiny)",
                    }}
                  >
                    {incompatibilityReason}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Add to Inventory Section */}
          <div
            style={{
              padding: "var(--frigate-space-2)",
              backgroundColor: "var(--frigate-bg-surface)",
              border: "1px solid var(--frigate-border-base)",
            }}
          >
            <div
              style={{
                fontSize: "var(--frigate-font-tiny)",
                color: "var(--frigate-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "var(--frigate-space-2)",
                fontWeight: 700,
              }}
            >
              ADD TO INVENTORY
            </div>

            {/* Quantity Input Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--frigate-space-2)",
                marginBottom: "var(--frigate-space-2)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-secondary)",
                  textTransform: "uppercase",
                }}
              >
                QUANTITY:
              </span>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={0}
                style={{
                  width: "100px",
                  padding: "var(--frigate-space-1) var(--frigate-space-2)",
                  backgroundColor: "var(--frigate-bg-base)",
                  border: "1px solid var(--frigate-border-light)",
                  borderRadius: 0,
                  color: "var(--frigate-text-primary)",
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-small)",
                  fontWeight: 700,
                  textAlign: "right",
                }}
                aria-label="Quantity to add"
              />
              <button
                onClick={() => handleQuickAdd(10)}
                style={{
                  padding: "var(--frigate-space-1) var(--frigate-space-2)",
                  backgroundColor: "var(--frigate-bg-base)",
                  border: "1px solid var(--frigate-border-base)",
                  borderRadius: 0,
                  color: "var(--frigate-text-secondary)",
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  cursor: "pointer",
                }}
                aria-label="Add 10"
              >
                [+10]
              </button>
              <button
                onClick={() => handleQuickAdd(100)}
                style={{
                  padding: "var(--frigate-space-1) var(--frigate-space-2)",
                  backgroundColor: "var(--frigate-bg-base)",
                  border: "1px solid var(--frigate-border-base)",
                  borderRadius: 0,
                  color: "var(--frigate-text-secondary)",
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  cursor: "pointer",
                }}
                aria-label="Add 100"
              >
                [+100]
              </button>
            </div>

            {/* Subtotal */}
            <div
              style={{
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-text-secondary)",
              }}
            >
              SUBTOTAL:{" "}
              <span style={{ color: "var(--frigate-text-primary)", fontWeight: 600 }}>
                {formatNumber(subtotalCost)} CR
              </span>
              {" | "}
              <span style={{ color: "var(--frigate-text-primary)", fontWeight: 600 }}>
                {subtotalWeight.toFixed(1)} t
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--frigate-space-3)",
            borderTop: "1px solid var(--frigate-border-base)",
            backgroundColor: "var(--frigate-bg-surface)",
          }}
        >
          <span
            style={{
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-muted)",
            }}
          >
            [ESC] CLOSE
          </span>
          <Button variant="primary" onClick={handleAdd} disabled={!canAddCurrentQty}>
            ADD TO INVENTORY
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AmmunitionDetailModal;
