# Ship Design Workspace Bugs

While going through the implementation of the ship design workspace action plan, I noticed the following bugs/issues.

1. The ASCII borders around each module slot in the module slot browser are too long (they extend past the border of the card itself).
2. Similarly, the module slot browser seems a little too compact in the X-direction. Ideally the Module Slot Browser, Installed Modules List, and Ship Statistics panel should each take up 30%, 40%, and 30% of the space, respectively.
3. The tooltips do not follow the mouse cursor properly.
4. The module catalog does not display as an dialog over the workspace (like the ship class dialog). It also should only display when clicking `[SELECT]` on a module slot.
5. I think the installed modules list should be redesigned. See the section below for more information.

## Installed Modules Interface

I'm thinking about how we can overhaul the installed modules list interface. I think it would be neat if we had a minimal abstract blueprint of the ship in the background with added module slots represented as boxes pointing at relevant areas on the ship blueprint. We could generate SVGs for each of the various ship classes based on their descriptions. This might take some considerable work, but I believe it would add a greatly increased level of emergence. This might require some changes on the backend, but I think we should pivot to this.

