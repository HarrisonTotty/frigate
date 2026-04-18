export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function indexById<T extends { id: string }, U = T>(
  items: readonly T[],
  transform?: (item: T) => U
): Record<string, U> {
  const result: Record<string, U> = {};
  for (const item of items) {
    result[item.id] = transform ? transform(item) : (item as unknown as U);
  }
  return result;
}
