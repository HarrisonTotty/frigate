# Ship Blueprint Design Workspace Redesign Proposal

This document proposes a redesign of the Ship Blueprint Design Workspace in the Frigate UI to align with the new module system defined in `doc/modules.md` of the HYPERION workspace. 

## General Workspace Layout

The workspace will be divided into three main columns:

1. **Left Column: Module Slot Browser**
   - Displays all available module slot types, filterable by group (from the `groups` field) and search.
   - Each slot type shows its name, description, cost, whether it is required, the maximum number allowed on the ship, and an `[ADD]` button.
   - Hovering over a slot type reveals a tooltip panel with additional details about the slot type, including base stats and extended description.
   - Clicking the `[ADD]` button adds an instance of that module slot to the ship blueprint in the center column, and opens the _Module Catalog_ to select a variant, if applicable.

2. **Center Column: Installed Modules**
    - Displays current usage of build points, module slots, and weight.
    - Displays a list of currently installed module instances on the ship blueprint.
    - Each module instance shows its slot type name, selected variant (if any), and key stats.
    - Each instance has `[EDIT]` and `[REMOVE]` buttons.
    - Clicking `[EDIT]` opens the _Module Catalog_ to select or change the variant for that module instance.
    - Clicking `[REMOVE]` removes the module instance from the blueprint.
    - Hovering over a module instance reveals a tooltip panel with detailed stats, including aggregated stats from the selected variant.

3. **Right Column: Ship Statistics**
    - Displays overall ship statistics, including total cost, total weight, total HP, power consumption, heat generation, and other relevant stats.
    - Updates dynamically as modules are added, edited, or removed.
    - Provides warnings if any constraints are violated (e.g., exceeding max weight or build points).

## Module Catalog

The _Module Catalog_ is a modal panel that appears when adding or editing a module instance. It allows the user to select a variant for the chosen module slot type. It should have a two column layout:

1. **Left Column: Variant List**
   - Displays all available variants for the selected module slot type.
   - Each variant shows its name, additional cost, and key stats.
   - Clicking on a variant selects it and updates the right column with detailed information.

2. **Right Column: Variant Details**
   - Displays detailed information about the selected variant, including full description, lore, and all stats.
   - Includes a `[SELECT]` button to confirm the selection and close the catalog, updating the module instance in the center column of the workspace.

## Notable Changes & Other Notes

1. The workspace no longer incorperates ship crew position selection. This will be handled in a separate crew management workspace.
2. Ammunition management is also removed from this workspace and will be handled in a dedicated inventory management interface.

## Implementation Guidelines

1. Be sure to ahere to the hard sci-fi design philosophy specified in `doc/design.md`. Reuse components from the existing UI library where possible.
2. Separate components should be created for the Module Slot Browser, Installed Modules List, Ship Statistics Panel, and Module Catalog to ensure modularity and reusability.
3. Create unit tests for each component to ensure functionality and reliability.
4. Relevant components should be created in `packages/ui/src/lobby`.
