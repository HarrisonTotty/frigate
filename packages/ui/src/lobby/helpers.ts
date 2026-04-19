export type { Faction } from "../types";

export { formatPlayerId } from "./playerUtils";

export function getStatusBadgeVariant(
  status?: string
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status) {
    case "recruiting":
      return "info";
    case "active":
      return "success";
    case "in-mission":
      return "warning";
    case "disbanded":
      return "danger";
    default:
      return "neutral";
  }
}
