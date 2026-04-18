# TypeScript Development Guidelines

Modern TypeScript development practices for the Frigate frontend application.

### Naming Prefixes

- **Booleans**: `is`, `has`, `can`, `should`
- **Event handlers**: `handle` or `on`
- **Hooks**: Always `use`

## TypeScript Best Practices

- Prefer `type` over `interface` for object shapes and unions
- Use `type` imports: `import type { Ship } from '@frigate/api-client'`
- Avoid `any`—use `unknown` with type guards instead
- Use discriminated unions for state machines and request states
- Use `as const` for literal types and frozen objects
- Leverage utility types: `Partial`, `Pick`, `Omit`, `Record`
- Handle `null`/`undefined` explicitly with `?.` and `??`

## React Patterns

- Use function components with explicit props types
- Extend `React.HTMLAttributes<Element>` for wrapper components
- Use `React.ReactNode` for children props
- Prefer controlled components over uncontrolled
- Keep state as close to where it's used as possible
- Don't store derived data as state—compute it on render

## Hooks

- Custom hooks must start with `use`
- Use cleanup functions in `useEffect` to prevent stale closures
- Prefer React Query (`@tanstack/react-query`) for server state
- Use Zustand selectors to avoid unnecessary re-renders

## State Management

- Follow existing Zustand patterns in `@frigate/state`
- Use `Record<string, T>` for indexed collections with `indexById` helper
- Always use selectors—even for single values—to avoid re-render issues
- Never mutate state directly; always use the `set` function
- Keep UI state local; lift to store only when shared
- Use React Query for server state, Zustand for client state

## Error Handling

- Use Error Boundaries for component-level error recovery
- Create typed error classes for API errors
- Always provide user-facing error messages

## Testing

- Place tests in `__tests__/` directories or co-locate as `Component.test.tsx`
- Use descriptive test names: `it('disables button when loading')`
- Use `screen` object for all queries, not destructured render results
- Prefer `getByRole` over `getByTestId`—it promotes accessibility
- Use `userEvent` over `fireEvent` for realistic interactions
- Use `@testing-library/jest-dom` matchers (e.g., `toBeDisabled()`)
- Use `find*` for async elements, `query*` only for asserting absence
- Test behavior, not implementation details

## Module Organization

- Use `index.ts` barrel files for public exports
- Keep components small and focused
- Co-locate related files (component, styles, tests, stories)

## Performance

- Only use `useMemo` for expensive calculations or memoized child props
- Only use `useCallback` when passing to `memo`-wrapped components or as hook dependencies
- Most performance issues come from Effects—fix those first before memoizing
- Lazy load heavy components with `React.lazy` and `Suspense`
- Use Zustand selectors to minimize re-renders
