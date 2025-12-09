# Ship Blueprint Design Workspace Redesign Proposal

This document proposes a redesign of the Ship Blueprint Design Workspace in the Frigate UI to align with the new module system defined in `doc/modules.md` of the HYPERION workspace. 

## General Workspace Layout

The workspace will be divided into three main columns:

1. **Left Column: Module Slot Browser**
   - Displays all available module slot types, filterable by group (from the `groups` field) and search.
   - Each slot type shows its name, description, cost, whether it is required, the maximum number allowed on the ship, and an `[ADD]` button.
   - Hovering over a slot type reveals a tooltip panel with additional details about the slot type, including base stats and extended description.
   - Clicking the `[ADD]` button adds an instance of that module slot to the ship blueprint in the center column.

2. **Center Column: Installed Modules**
    - Displays current usage of build points, module slots, and weight.
    - Displays a list of currently installed modules on the ship blueprint.
    - Each module shows its slot type name, selected variant (if any), and key stats.
    - Each module slot has `[SELECT]` and `[X]` buttons. If the module slot does not support variants, it will only have a `[X]` button.
    - Clicking `[SELECT]` opens the _Module Catalog_ to select or change the module for that module slot.
    - Clicking `[X]` removes the module from the blueprint.
    - Hovering over a module reveals a tooltip panel with detailed stats.

3. **Right Column: Ship Statistics**
    - Displays overall ship statistics, including total cost, total weight, total HP, power consumption, heat generation, and other relevant stats.
    - Updates dynamically as modules are added, edited, or removed.
    - Provides warnings if any constraints are violated (e.g., exceeding max weight or build points).

## Module Catalog

The _Module Catalog_ is a modal panel that appears when clicking `[SELECT]` on a module slot from the installed modules panel. It allows the user to select a specifc module for the chosen module slot type. It should have a two column layout:

1. **Left Column: Module List**
   - Displays all available modules for the selected module slot type.
   - Each module shows its name, additional cost, and key stats.
   - Clicking on a module selects it and updates the right column with detailed information.

2. **Right Column: Module Details**
   - Displays detailed information about the selected module, including full description, lore, and all stats.
   - Includes a `[SELECT]` button to confirm the selection and close the catalog, updating the associated module slot in the center column of the workspace.

## Example User Flow

1. The ship design workspace is populated with relevant information sourced from the selected ship class (like the max build points and maximum weight).
2. The user clicks `[ADD]` on a module slot in the _module slot browser_, which adds it to the _installed modules_ list. As an example let's say the user clicks `[ADD]` for "Kinetic Weapon Port". There will now be a new entry in the _installed modules_ list called "Kinetic Weapon Port". Since this module slot accepts any kinetic weapon module (aka it has subtypes/varients), there will be both an `[SELECT]` button and a `[X]` button for it.
3. The user then clicks `[SELECT]` for the "Kinetic Weapon Port" they just added, opening the _Module Catalog_ dialog for them to select which weapon they want to mount to the port.
4. After they have selected a kinetic weapon module (like a particular type of cannon for instance), the "Kinetic Weapon Port" module slot will be updated to reflect the selection, with the particular type of kinetic weapon shown.
5. The ship statistics panel and other statistics like the current usage of build points is updated to reflect the change.
6. The user repeats this process for other kinds of module slots.

## Notable Changes & Other Notes

1. The workspace no longer incorperates ship crew position selection. This will be handled in a separate crew management workspace.
2. Ammunition management is also removed from this workspace and will be handled in a dedicated inventory management interface.

## Implementation Guidelines

1. Be sure to ahere to the hard sci-fi design philosophy specified in `doc/design/design-philosophy.md`. Reuse components from the existing UI library where possible.
2. Separate components should be created for the Module Slot Browser, Installed Modules List, Ship Statistics Panel, and Module Catalog to ensure modularity and reusability.
3. Create unit tests for each component to ensure functionality and reliability.
4. Relevant components should be created in `packages/ui/src/lobby`.
