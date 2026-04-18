/**
 * Format relative time (e.g., "2d ago", "1w ago")
 */
export function formatRelativeTime(timestamp?: string): string {
  if (!timestamp) return "Never";

  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

/**
 * Format player ID as 8-character hex
 */
export function formatPlayerId(id: string): string {
  return id.substring(0, 8).toUpperCase();
}
