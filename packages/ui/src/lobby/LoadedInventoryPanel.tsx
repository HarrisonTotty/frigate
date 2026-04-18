/**
 * LoadedInventoryPanel Component
 *
 * Displays currently loaded ammunition with quantity controls.
 * Allows players to adjust quantities or remove items from inventory.
 * Follows the technical aesthetic with monospace typography and bracket notation.
 */
import React, { useState, useCallback } from "react";
import type { Ammunition, InventoryItem } from "@frigate/api-client";

/**
 * LoadedInventoryPanel Props
 */
export interface LoadedInventoryPanelProps {
  /** Current inventory items */
  inventory: InventoryItem[];
  /** Ammunition catalog for looking up details */
  ammoCatalog: Ammunition[];
  /** Callback to add quantity */
  onAddQuantity: (ammoId: string, amount?: number) => void;
  /** Callback to remove quantity */
  onRemoveQuantity: (ammoId: string, amount?: number) => void;
  /** Callback to set exact quantity */
  onSetQuantity: (ammoId: string, quantity: number) => void;
  /** Callback to remove all of an item */
  onRemoveAll: (ammoId: string) => void;
  /** Callback to show ammo details */
  onShowAmmoDetails?: (ammo: Ammunition) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Format number with thousand separators
 */
function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Individual inventory item row
 */
function InventoryItemRow({
  item,
  ammo,
  onAddQuantity,
  onRemoveQuantity,
  onSetQuantity,
  onRemoveAll,
  onShowDetails,
}: {
  item: InventoryItem;
  ammo: Ammunition;
  onAddQuantity: (amount?: number) => void;
  onRemoveQuantity: (amount?: number) => void;
  onSetQuantity: (quantity: number) => void;
  onRemoveAll: () => void;
  onShowDetails?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(item.quantity));

  const totalCost = ammo.cost * item.quantity;
  const totalWeight = ammo.weight * item.quantity;

  const handleQuantitySubmit = useCallback(() => {
    const newQuantity = parseInt(editValue, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      onSetQuantity(newQuantity);
    }
    setIsEditing(false);
  }, [editValue, onSetQuantity]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleQuantitySubmit();
      } else if (e.key === "Escape") {
        setEditValue(String(item.quantity));
        setIsEditing(false);
      }
    },
    [handleQuantitySubmit, item.quantity]
  );

  return (
    <div
      style={{
        backgroundColor: "var(--frigate-bg-surface)",
        border: "1px solid var(--frigate-border-base)",
        borderRadius: 0,
        marginBottom: "var(--frigate-space-1)",
      }}
    >
      {/* Item Header - Name and Quantity */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--frigate-space-2)",
          borderBottom: "1px solid var(--frigate-border-base)",
        }}
      >
        {/* Name (clickable for details) */}
        <button
          onClick={onShowDetails}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-small)",
            fontWeight: 600,
            color: "var(--frigate-text-primary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            cursor: onShowDetails ? "pointer" : "default",
            textDecoration: onShowDetails ? "underline" : "none",
            textAlign: "left",
          }}
          aria-label={`View details for ${ammo.name}`}
        >
          {ammo.name}
        </button>

        {/* Quantity Display */}
        {isEditing ? (
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleQuantitySubmit}
            onKeyDown={handleKeyDown}
            min={0}
            autoFocus
            style={{
              width: "80px",
              padding: "var(--frigate-space-1)",
              backgroundColor: "var(--frigate-bg-base)",
              border: "1px solid var(--frigate-primary)",
              borderRadius: 0,
              color: "var(--frigate-text-primary)",
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              fontWeight: 700,
              textAlign: "right",
            }}
            aria-label="Edit quantity"
          />
        ) : (
          <button
            onClick={() => {
              setEditValue(String(item.quantity));
              setIsEditing(true);
            }}
            style={{
              background: "none",
              border: "1px solid transparent",
              padding: "var(--frigate-space-1)",
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              fontWeight: 700,
              color: "var(--frigate-text-primary)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--frigate-border-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "transparent";
            }}
            title="Click to edit quantity"
            aria-label={`Quantity: ${item.quantity}, click to edit`}
          >
            {formatNumber(item.quantity)}
          </button>
        )}
      </div>

      {/* Item Stats Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--frigate-space-1) var(--frigate-space-2)",
          fontSize: "var(--frigate-font-tiny)",
          color: "var(--frigate-text-muted)",
          borderBottom: "1px solid var(--frigate-border-base)",
        }}
      >
        <span>
          {formatNumber(ammo.cost)} CR/ea | {ammo.weight} t/ea
        </span>
        <span>
          TOTAL: {formatNumber(totalCost)} CR | {totalWeight.toFixed(1)} t
        </span>
      </div>

      {/* Quantity Controls Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--frigate-space-1) var(--frigate-space-2)",
          gap: "var(--frigate-space-1)",
        }}
      >
        {/* Decrement Controls */}
        <div style={{ display: "flex", gap: "var(--frigate-space-1)" }}>
          <QuantityButton
            label="[-10]"
            onClick={() => onRemoveQuantity(10)}
            disabled={item.quantity < 10}
            title="Remove 10"
          />
          <QuantityButton
            label="[-1]"
            onClick={() => onRemoveQuantity(1)}
            disabled={item.quantity < 1}
            title="Remove 1"
          />
        </div>

        {/* Increment Controls */}
        <div style={{ display: "flex", gap: "var(--frigate-space-1)" }}>
          <QuantityButton label="[+1]" onClick={() => onAddQuantity(1)} title="Add 1" />
          <QuantityButton label="[+10]" onClick={() => onAddQuantity(10)} title="Add 10" />
        </div>

        {/* Remove Button */}
        <QuantityButton
          label="[REMOVE]"
          onClick={onRemoveAll}
          variant="danger"
          title="Remove all"
        />
      </div>
    </div>
  );
}

/**
 * Quantity adjustment button
 */
function QuantityButton({
  label,
  onClick,
  disabled = false,
  variant = "default",
  title,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  title?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseColor =
    variant === "danger" ? "var(--frigate-danger)" : "var(--frigate-text-secondary)";
  const hoverColor = variant === "danger" ? "var(--frigate-danger)" : "var(--frigate-text-primary)";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "var(--frigate-space-1)",
        backgroundColor: "transparent",
        border: "none",
        borderRadius: 0,
        color: disabled ? "var(--frigate-text-muted)" : isHovered ? hoverColor : baseColor,
        fontFamily: "var(--frigate-font-mono)",
        fontSize: "var(--frigate-font-tiny)",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        textTransform: "uppercase",
        transition: "color 0.1s ease",
      }}
      title={title}
      aria-label={title}
    >
      {label}
    </button>
  );
}

/**
 * Panel Header Component
 */
function PanelHeader({ itemCount }: { itemCount: number }) {
  return (
    <div
      style={{
        backgroundColor: "var(--frigate-bg-base)",
        padding: "var(--frigate-space-2)",
        borderBottom: "1px solid var(--frigate-border-base)",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: "var(--frigate-font-heading)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        LOADED INVENTORY
      </div>
      <div
        style={{
          fontSize: "var(--frigate-font-small)",
          color: "var(--frigate-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginTop: "var(--frigate-space-1)",
        }}
      >
        {itemCount} ITEM{itemCount !== 1 ? "S" : ""} LOADED
      </div>
    </div>
  );
}

/**
 * Panel Footer Component
 */
function PanelFooter() {
  return (
    <div
      style={{
        fontSize: "var(--frigate-font-tiny)",
        color: "var(--frigate-text-muted)",
        backgroundColor: "var(--frigate-bg-base)",
        padding: "var(--frigate-space-1) var(--frigate-space-2)",
        borderTop: "1px solid var(--frigate-border-base)",
        letterSpacing: "0.05em",
      }}
    >
      [+/-] ADJUST QTY [CLICK QTY] EDIT [DEL] REMOVE
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--frigate-space-4)",
        height: "100%",
        minHeight: 200,
      }}
    >
      <div
        style={{
          fontSize: "var(--frigate-font-small)",
          color: "var(--frigate-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          textAlign: "center",
        }}
      >
        [NO ITEMS LOADED]
      </div>
      <div
        style={{
          marginTop: "var(--frigate-space-2)",
          fontSize: "var(--frigate-font-tiny)",
          color: "var(--frigate-text-muted)",
          textAlign: "center",
        }}
      >
        Select ammunition from the catalog
      </div>
    </div>
  );
}

/**
 * LoadedInventoryPanel Component
 *
 * Displays current ship cargo with:
 * - List of loaded ammunition with quantities
 * - Per-item and total cost/weight display
 * - Quantity adjustment controls ([-10], [-1], [+1], [+10])
 * - Editable quantity input
 * - Remove button for each item
 */
export function LoadedInventoryPanel({
  inventory,
  ammoCatalog,
  onAddQuantity,
  onRemoveQuantity,
  onSetQuantity,
  onRemoveAll,
  onShowAmmoDetails,
  className = "",
}: LoadedInventoryPanelProps): React.ReactElement {
  // Look up ammo details for each inventory item
  const getAmmo = useCallback(
    (ammoId: string): Ammunition | undefined => {
      return ammoCatalog.find((a) => a.id === ammoId);
    },
    [ammoCatalog]
  );

  // Filter out items with invalid ammo IDs
  const validItems = inventory.filter((item) => getAmmo(item.itemId));

  return (
    <div
      className={className}
      style={{
        fontFamily: "var(--frigate-font-mono)",
        background: "var(--frigate-bg-base)",
        color: "var(--frigate-text-primary)",
        border: "1px solid var(--frigate-border-base)",
        borderRadius: 0,
        boxShadow: "none",
        minHeight: 400,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      aria-label="Loaded Inventory"
      role="region"
    >
      {/* Header */}
      <PanelHeader itemCount={validItems.length} />

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "var(--frigate-space-1)",
          backgroundColor: "var(--frigate-bg-surface)",
        }}
      >
        {validItems.length === 0 ? (
          <EmptyState />
        ) : (
          validItems.map((item) => {
            const ammo = getAmmo(item.itemId)!;
            return (
              <InventoryItemRow
                key={item.itemId}
                item={item}
                ammo={ammo}
                onAddQuantity={(amount) => onAddQuantity(item.itemId, amount)}
                onRemoveQuantity={(amount) => onRemoveQuantity(item.itemId, amount)}
                onSetQuantity={(qty) => onSetQuantity(item.itemId, qty)}
                onRemoveAll={() => onRemoveAll(item.itemId)}
                onShowDetails={onShowAmmoDetails ? () => onShowAmmoDetails(ammo) : undefined}
              />
            );
          })
        )}
      </div>

      {/* Footer */}
      <PanelFooter />
    </div>
  );
}

export default LoadedInventoryPanel;
