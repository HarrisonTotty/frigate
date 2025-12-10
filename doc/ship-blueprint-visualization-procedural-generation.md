# Ship Blueprint Visualization Panel - Procedural Generation - WIP DO NOT IMPLEMENT

## Goal

To improve the immersion of the ship design process, we should implement procedural generation of the ship's blueprint visualzation. As users add module slots, the schematic should update to reflect a ship with those slots.

## Procedure

The ship schematic should start with a baseline design dependent on the _size_ and _role_ of the selected ship class. Small ships should look more like large fighters, while medium and large ships should look bulkier.

As the user adds modules, the complexity of the ship's schematic should increase. Adding weapons should visibly show weapon ports being added to the sides and front of the ship. The impulse engines module should point to the aft of the ship, while the 