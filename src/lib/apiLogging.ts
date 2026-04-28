export function logApiError(scope: string, error: unknown): void {
  const errorName = error instanceof Error ? error.name : "UnknownError";
  console.error(`${scope} (${errorName})`);
}
