# Implementing Credit Cost

In addition to _Build Points_ and _Weight_, the game also has a concept of "cost" associated with each ship class, module slot, module, and inventory item (like ammo). Upon registering a new _Team_, each team is granted some number of starting credits which can be used to purchase ships and their components.

To review, the game will have the following parameters which constrain ship construction:

1. _Credits_ (New) - Shared amongst the entire team and can be increased through gameplay.
2. _Build Points_ - A limitation based on the class of a particular ship.
3. _Weight_ - Another limitation based on the class of a particular ship. Weight also impacts ship performance and handling.
4. _Module Maximum Constraint_ - Each ship class has a maximum number of allowed modules that can be installed.
5. _Individual Module Constraints_ - Certain modules can only be added a limited number of times to any ship.

## Current State

* All module slot YAML files have `base_cost` defined - **but this represents build points, not credits**.
* All module variant YAML files have `cost` defined - **but this represents build points, not credits**.
* All ammo YAML files have `cost` defined - this can be repurposed as credit cost since ammo doesn't use build points.
* Ship classes need to have `cost` defined. They have `maintenance_cost`, but this value is purely for lore purposes.
* The Hyperion API exposes `base_cost` and `cost` in catalog endpoints, but these are build point values.
* Teams have no credit tracking - only id, name, faction, and members.
* `data/game.yaml` exists but is empty.

### Important: Build Points vs Credits

The existing `base_cost` (module slots) and `cost` (module variants) fields are **actively used by the frontend for build point calculations**. These cannot be repurposed as credit costs without breaking existing functionality.

**Solution**: Add new `credit_cost` fields for credit tracking while preserving existing build point fields:

| Component | Build Points Field | Credit Cost Field |
|-----------|-------------------|-------------------|
| Ship Classes | `build_points` | `cost` (new) |
| Module Slots | `base_cost` | `credit_cost` (new) |
| Module Variants | `cost` | `credit_cost` (new) |
| Ammunition | N/A | `cost` (existing, repurpose) |

**Future improvement**: Consider renaming fields for clarity (e.g., `base_cost` → `build_points`, `cost` → `build_points` for variants).

## Known Tasks

### HYPERION (Server)

1. Add `credit_cost` fields to module slot and module variant YAML files with values per the ranges below.
2. Add `cost` field to ship class YAML files.
3. Add `team_starting_credits` parameter to `data/game.yaml`.
4. Update Rust structs to include new credit cost fields.
5. Expose credit costs in ship class and catalog APIs.
6. Add `credits` field to Team model, initialize with starting credits on team creation.
7. Update team API to return credits balance.
8. Implement credit deduction when creating ships.
9. Implement 100% refund when deleting ships or removing modules.

### Frigate (Frontend)

1. Add cost to ship class selection dialogs.
2. Add current credit balance to ship creation screen.
3. Add current credit balance to the ship design workspace and associated panels, dialogs, and tooltips.
4. Add credit calculations to ship design workspace validation process.
5. Use `credit_cost` field (not `base_cost`/`cost`) for credit calculations.


## Additional Notes

Ship classes should be the most expensive, with module slots being an order of magnitude below ship classes, and modules an order of magnitude below slots. Ammunition should be the cheapest. In general, I'm thinking:

| Category     | Credit Cost Range |
|--------------|-------------------|
| Kinetic Ammo | 1-10              |
| Missile Ammo | 10-100            |
| Torpedo Ammo | 10-100            |
| Ship Modules | 100-1000          |
| Module Slots | 1000-10000        |
| Ship Classes | 10000-100000      |

Based on this, I think we can set a default of each team starting with 1000000 (one million) credits by default.

Ensure that you deduct credits for the ship class once a player has selected a ship class and created a ship (before the ship design workspace). We will likely need to update the Hyperion endpoints to handle this.

## Design Decisions

1. **Build Points vs Credits**: Both systems are maintained. Build Points are scoped to a ship class (per-ship constraint), Credits are scoped to a team (shared resource).
2. **Refunds**: Ship destruction or module removal refunds at **100%** of original cost.
3. **Credit Earning**: Teams earn credits through quests and looting ships (out of scope for initial implementation).
4. **Module Slot Costs**: Module slots **do** have credit costs (in addition to their build point costs).

## Related Documents

- [Hyperion Action Plan](../../hyperion/doc/implementing-cost-action-plan.md) - Detailed implementation plan for server-side changes.
