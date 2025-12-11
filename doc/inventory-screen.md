# Ship Inventory Workspace

After a player designs their ship and clicks `REGISTER SCHEMATIC`, the next screen they are presented with is the ship inventory workspace. The purpose of this workspace is for players to add ammo and other types of cargo to their ship.

For the moment, the only type of cargo a player can add is ammunition. The amount of stuff they can add is limited by the amount of weight remaining after the previous step (the ship design workspace), as well as the remaining credits allocated to their team.

## UI Layout

The UI should be a searchable and filterable interface that allows players to add or remove items to/from their ship's inventory. Each element should have `[+]` and `[-]` buttons. Hovering over an item displays a tooltip with extended information about the item, which clicking on an item shows a floating dialog with the complete description and properties of the item.

Ensure that the current weight status of the ship and credits usage are clearly visible.

At the bottom right of the interface should be a `REGISTER CARGO >` button which serves to proceed to the next stage (which doesn't need to be implemented yet).

## Ammo Restriction

Players should be allowed to stock any kind of ammo regardless of whether they have a ship module installed that can use it, however we should indicate that ship lacks any such module. By default we should have a togglable filter enabled that excludes unusable items.

To determine what the ship can use, look at the `ammo_type` and `ammo_size` fields on modules installed on kinetic weapon ports. A player can use any missile so long as they have a missile launcher installed, and any torpedo as long as they have a torpedo tube installed.

