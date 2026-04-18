/**
 * Blueprint workflow container
 *
 * Orchestrates the complete ship blueprint design workflow including
 * blueprint selection, crew role assignment, and launch readiness.
 */

import React, { useState } from "react";
import { Grid } from "../layout";
import { BlueprintList, type Blueprint } from "./BlueprintList";
import { RoleAssignment } from "./RoleAssignment";
import { BlueprintReadiness } from "./BlueprintReadiness";

/**
 * Blueprint workflow props
 */
export interface BlueprintWorkflowProps {
  /** Base URL for HYPERION API */
  apiUrl: string;
  /** Current player ID */
  currentPlayerId?: string;
  /** Callback when ready to launch */
  onLaunch?: (blueprint: Blueprint) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Blueprint workflow container
 *
 * Provides a complete ship design interface with blueprint selection,
 * role assignment, and readiness management.
 */
export function BlueprintWorkflow({
  apiUrl,
  currentPlayerId,
  onLaunch: _onLaunch,
  className = "",
}: BlueprintWorkflowProps) {
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBlueprintSelected = (blueprint: Blueprint) => {
    setSelectedBlueprint(blueprint);
    // Trigger refresh of dependent components
    setRefreshKey((prev) => prev + 1);
  };

  const handleRolesChanged = () => {
    // Trigger refresh when roles change
    setRefreshKey((prev) => prev + 1);
  };

  const handleReadinessChanged = () => {
    // Trigger refresh when readiness changes
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className={className}>
      <Grid cols="1fr 1fr 1fr" gap={4} fullHeight>
        {/* Blueprint selection */}
        <BlueprintList
          apiUrl={apiUrl}
          currentPlayerId={currentPlayerId}
          onBlueprintSelected={handleBlueprintSelected}
          selectedBlueprint={selectedBlueprint}
        />

        {/* Role assignment */}
        <RoleAssignment
          key={`roles-${refreshKey}`}
          apiUrl={apiUrl}
          currentPlayerId={currentPlayerId}
          blueprint={selectedBlueprint}
          onRolesChanged={handleRolesChanged}
        />

        {/* Readiness and validation */}
        <BlueprintReadiness
          key={`readiness-${refreshKey}`}
          apiUrl={apiUrl}
          currentPlayerId={currentPlayerId}
          blueprint={selectedBlueprint}
          onReadinessChanged={handleReadinessChanged}
        />
      </Grid>
    </div>
  );
}
