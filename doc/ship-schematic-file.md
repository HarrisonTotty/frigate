# Ship Schematic Files

A ship schematic file is a YAML file that can be crafted by the user or saved from the ship design workspace.

## Goal / Summary

Currently the creation of a ship is a tedius process. This is actually by design, but for testing and replay purposes it can get really annoying to start from scratch each time. I propose the ability for a user to `[LOAD]` or `[SAVE]` a "ship schematic" while in the ship design workspace.

The schematic can also be loaded from the ship creation step (when you select the name and ship class).

## File Format

The format of the file is the following:

```yaml
# (int) The version of this file format.
version: 1

# (str) The name of the ship.
name: USS Enterprise

# (str) The class of the ship.
ship_class: Destroyer

# (list) The list of modules (and slots) attached to the ship.
modules:
    - slot: kinetic-weapon # (str) The ID of the module slot.
      module: autocannon # (str | null) The ID of the module installed in the slot (null if not selected or doesn't have varients).
```

## User Experience

1. A user can only `[SAVE]` a ship schematic from the ship design workspace screen.
2. If a user `[LOAD]`s a ship design schematic from the ship creation screen, the ship name and class will be populated (similar to passing `--ship` and `--ship-class` to the CLI) and the ship design workspace will also load the rest of the file.
3. If a user `[LOAD]`s a ship design schematic from the ship design workspace, the `name` and `ship_class` of the schematic will be _ignored_, since at this point they have already chosen a name and class for their ship. All of the module slots and modules defined in `modules` will be added to the ship schematic.

