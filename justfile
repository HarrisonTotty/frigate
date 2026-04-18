set shell := ["bash", "-cu"]
set dotenv-load := true

# Default target: list available recipes.
default:
    @just --list

# Install workspace dependencies.
bootstrap:
    pnpm install

# Alias for `bootstrap`.
install: bootstrap

# Run ESLint across all packages.
lint:
    pnpm run --recursive lint

# Fix lint errors across all packages.
lint-fix:
    pnpm run --recursive lint --fix

# Type-check all packages with tsc.
typecheck:
    pnpm run --recursive typecheck

# Run the Vitest suite across all packages.
test *ARGS:
    pnpm run --recursive test {{ARGS}}

# Format the workspace with Prettier.
format:
    pnpm exec prettier --write "**/*.{ts,tsx,js,jsx,json,md,css,html}"

# Verify formatting without writing changes.
format-check:
    pnpm exec prettier --check "**/*.{ts,tsx,js,jsx,json,md,css,html}"

# Build all packages.
build:
    pnpm run --recursive build

# Full CI pipeline: lint, typecheck, test, build.
ci: lint typecheck test build

# Start the web app dev server.
web:
    pnpm --filter @frigate/web dev

# Start the Tauri desktop dev shell.
desktop:
    pnpm --filter @frigate/desktop tauri dev

# Launch the UI Storybook.
storybook:
    pnpm --filter @frigate/ui storybook

# Remove build artifacts and node_modules caches.
clean:
    pnpm run --recursive --if-present clean
    rm -rf node_modules apps/*/node_modules apps/*/dist packages/*/node_modules packages/*/dist
