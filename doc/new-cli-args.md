# New Frigate Desktop CLI Aguments

To improve the testing and launch process, I'd like to add additional CLI arguments to shortcut some stuff in the UI.

* `--connect <HOST>:<PORT>` allows one to connect directly to the specified server. If `<PORT>` is omitted, it is assumed to be the default HYPERION port (`8000`).
* `--user <name>`  selects or registers the specified user name.
* `--team <name>` selects or creates the specified team by name. Must be paired with `--faction` if creating a new team.
* `--faction <id>` selects the faction to be associated with the specified `--team`. Has no effect if the team already exists.
* `--ship <name>` creates or selects the specified ship to join. Must be paired with `--ship-class` if creating a ship.
* `--ship-class <name>` if creating a new ship, specifies the ship class. Has no effect if the ship already exists.

## Examples

This allows one to run the app like so:

```bash
frigate --connect localhost --user Harry --team Red --faction terran-federation --ship "USS Enterprise" --ship-class Battleship
```

Which would:

1. Connect to the HYPERION server at `http://localhost:8000`.
2. Create a new user called `Harry` (or select `Harry` if that user already exists).
3. Create a new team called `Red` with the Terran Federation as its faction.
4. Create a new Battleship with the name `USS Enterprise`.

The user would essentially skip the first 4 steps of the wizard process and jump straight into the ship design workspace.

## Other Notes

* The app currently requires a full URL to specify a server, so `--connect localhost` should translate to `http://localhost:8000`.
* It is unclear if we can support a similar system for the web version of the app, but either way ensure this change doesn't break the web app.