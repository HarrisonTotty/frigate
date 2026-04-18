# Frigate

Frigate is the default frontend of HYPERION. It is a modular React application built using TypeScript, Vite, and Tailwind CSS. Frigate provides the user interface for players to interact with the HYPERION spaceship bridge simulation game.

## Documentation

Documentation for Frigate can be found in the `docs/` directory. In particular:

* `architecture.md` - Details the high-level architecture of the frontend.
* `design.md` - Details the overall visual design philosophy of the project.
* `plans/` - Contains detailed, phased action plans for implementing new features.
* `brainstorming/` - Contains brainstorming documents for new features/ideas.


## Visual Design Guidelines

Frigate follows a strict design system philosophy to ensure consistency and maintainability across the UI. Key guidelines include:

1. Flat, minimalistic design with a focus on realism. It should feel like a real spaceship interface.
2. Prefer hard sci-fi aesthetics over flashy or fantastical elements. Think The Expanse, not Star Wars. See `doc/design.md` for more details.
3. The UI should be designed to be intimidating to first-time users. Leverage complexity to convey depth, using things like acronyms, technical jargon, and dense data visualizations.
4. Any technical jargon should be realistic and grounded in actual spaceflight/nautical terminology.

## Development Guidelines

1. Write comprehensive unit tests for all components.
2. Document all components and modules using JSDoc comments.
3. Stick to modern React and TypeScript best practices.
4. Ensure all UI components follow the design philosophy outlined in `doc/design.md`.
5. Always run the build and test suites after making changes to code.

## Task Runner

Common workflows are wired up in the root `justfile`. Prefer these over calling `pnpm` directly so the commands stay consistent across contributors and CI. Run `just` (no args) to list recipes.

| Recipe                                         | Purpose                                          |
| ---------------------------------------------- | ------------------------------------------------ |
| `just bootstrap`                               | Install workspace dependencies (`pnpm install`). |
| `just lint` / `just lint-fix`                  | Run ESLint across all packages.                  |
| `just typecheck`                               | Run `tsc --noEmit` across all packages.          |
| `just test [ARGS]`                             | Run the Vitest suite; extra args are forwarded.  |
| `just format` / `just format-check`            | Run Prettier in write or check mode.             |
| `just build`                                   | Build every package.                             |
| `just ci`                                      | Lint, typecheck, test, and build (matches CI).   |
| `just web` / `just desktop` / `just storybook` | Launch dev shells.                               |
| `just clean`                                   | Remove build artifacts and `node_modules`.       |

After any code change, run `just ci` (or at minimum `just typecheck` and `just test`) before declaring the task complete.
