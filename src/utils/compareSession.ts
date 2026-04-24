import { typeid } from "typeid-js";

type StorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

const COMPARE_SESSION_PREFIX = "compare-session:";

function getCompareSessionKey(sessionId: string): string {
  return `${COMPARE_SESSION_PREFIX}${sessionId}`;
}

export function createCompareSession(
  storage: StorageLike,
  formIds: string[],
): string {
  const sessionId = typeid("cmp").toString();
  saveCompareSession(storage, sessionId, formIds);
  return sessionId;
}

export function saveCompareSession(
  storage: StorageLike,
  sessionId: string,
  formIds: string[],
): void {
  storage.setItem(getCompareSessionKey(sessionId), JSON.stringify(formIds));
}

export function loadCompareSession(
  storage: Pick<StorageLike, "getItem">,
  sessionId: string,
): string[] {
  const raw = storage.getItem(getCompareSessionKey(sessionId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function removeCompareSession(
  storage: Pick<StorageLike, "removeItem">,
  sessionId: string,
): void {
  storage.removeItem(getCompareSessionKey(sessionId));
}
