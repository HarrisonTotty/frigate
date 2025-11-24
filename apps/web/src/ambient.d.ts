declare module "react" {
  export type ReactNode = unknown;
  export interface FC<P = Record<string, unknown>> {
    (props: P): ReactNode;
  }
  const React: {
    createElement: (...args: unknown[]) => ReactNode;
  };
  export default React;
}

declare module "react/jsx-runtime" {
  export const jsx: (...args: unknown[]) => unknown;
  export const jsxs: (...args: unknown[]) => unknown;
  export const Fragment: unknown;
}

declare module "react-dom/client" {
  export function createRoot(container: Element | DocumentFragment): {
    render(children: unknown): void;
  };
}

declare module "@frigate/ui" {
  export interface FrigateShellProps {
    readonly header?: unknown;
    readonly children?: unknown;
  }
  export function FrigateShell(props: FrigateShellProps): unknown;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elementName: string]: unknown;
  }
}
