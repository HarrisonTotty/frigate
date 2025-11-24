import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useFrigateStore, useSessionStore, type SessionState, type SessionUpdate } from "./index";

type PermissionChecker = (permission: string) => boolean;

type SessionContextValue = {
  readonly session: SessionState;
  readonly isAuthenticated: boolean;
  readonly assignedRoles: readonly string[];
  readonly permissions: Readonly<Record<string, boolean>>;
  readonly setSession: (update: SessionUpdate) => void;
  readonly hasPermission: PermissionChecker;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

interface SessionProviderProps {
  readonly children?: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps): JSX.Element {
  const session = useSessionStore();
  const setSession = useFrigateStore((state) => state.setSession);
  const hasPermission = useFrigateStore((state) => state.hasPermission);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isAuthenticated: session.playerId != null,
      assignedRoles: session.assignedRoles,
      permissions: session.permissions,
      setSession,
      hasPermission
    }),
    [session, setSession, hasPermission]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}

export function useHasPermission(permission: string): boolean {
  const context = useSessionContext();
  return context.hasPermission(permission);
}
