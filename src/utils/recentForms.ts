export type RecentItemKind = "form" | "template";
export type RecentItemPhase = "draft" | "finalized" | "published";

export type RecentItemMeta = {
  id: string;
  name: string;
  date: Date;
  encrypted: boolean;
  kind: RecentItemKind;
  phase: RecentItemPhase;
};

export type RecentFormMeta = RecentItemMeta;

type RecentFormMetaRecord = {
  name: string;
  date: string;
  encrypted?: boolean;
  phase?: RecentItemPhase;
  isPublished?: boolean;
  kind?: RecentItemKind;
};

type StorageLike = Pick<
  Storage,
  "getItem" | "key" | "length" | "removeItem" | "setItem"
>;

const RECENT_FORM_META_SUFFIX = "-meta";
const RECENT_FORM_DATA_SUFFIX = "-data";

export function getRecentFormMetaKey(id: string): string {
  return `${id}${RECENT_FORM_META_SUFFIX}`;
}

export function getRecentFormDataKey(id: string): string {
  return `${id}${RECENT_FORM_DATA_SUFFIX}`;
}

export function saveRecentFormMeta(
  storage: StorageLike,
  meta: Omit<RecentFormMeta, "date"> & { date?: Date },
): void {
  storage.setItem(
    getRecentFormMetaKey(meta.id),
    JSON.stringify({
      name: meta.name,
      date: (meta.date ?? new Date()).toISOString(),
      encrypted: meta.encrypted,
      kind: meta.kind,
      phase: meta.phase,
    }),
  );
}

export function saveLocalDraft(
  storage: StorageLike,
  id: string,
  data: string,
): void {
  storage.setItem(getRecentFormDataKey(id), data);
}

export function loadLocalDraft(
  storage: Pick<StorageLike, "getItem">,
  id: string,
): string | null {
  return storage.getItem(getRecentFormDataKey(id));
}

export function hasLocalDraft(
  storage: Pick<StorageLike, "getItem">,
  id: string,
): boolean {
  return loadLocalDraft(storage, id) !== null;
}

export function removeRecentFormFromStorage(
  storage: Pick<StorageLike, "removeItem">,
  id: string,
): void {
  storage.removeItem(getRecentFormMetaKey(id));
  removeLocalDraft(storage, id);
}

export function removeLocalDraft(
  storage: Pick<StorageLike, "removeItem">,
  id: string,
): void {
  storage.removeItem(getRecentFormDataKey(id));
}

export function clearRecentFormsFromStorage(storage: StorageLike): void {
  for (const id of getRecentFormIds(storage)) {
    removeRecentFormFromStorage(storage, id);
  }
}

export function loadRecentForms(
  storage: Pick<StorageLike, "getItem" | "key" | "length">,
): RecentItemMeta[] {
  const forms: RecentItemMeta[] = [];

  for (const id of getRecentFormIds(storage)) {
    const rawMeta = storage.getItem(getRecentFormMetaKey(id));
    if (!rawMeta) continue;

    try {
      const parsed = JSON.parse(rawMeta) as RecentFormMetaRecord;
      forms.push({
        id,
        name: parsed.name,
        date: new Date(parsed.date),
        encrypted: parsed.encrypted ?? false,
        kind: parsed.kind ?? "form",
        phase: deriveRecentItemPhase(parsed),
      });
    } catch (error) {
      console.error("Error parsing recent form metadata:", error);
    }
  }

  forms.sort((a, b) => b.date.getTime() - a.date.getTime());
  return forms;
}

function deriveRecentItemPhase(parsed: RecentFormMetaRecord): RecentItemPhase {
  if (parsed.phase) {
    return parsed.phase;
  }

  const kind = parsed.kind ?? "form";
  const isPublished = parsed.isPublished ?? false;

  if (kind === "template") {
    return isPublished ? "finalized" : "draft";
  }

  return isPublished ? "published" : "draft";
}

function getRecentFormIds(
  storage: Pick<StorageLike, "key" | "length">,
): string[] {
  const ids: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key?.endsWith(RECENT_FORM_META_SUFFIX)) continue;
    ids.push(key.slice(0, -RECENT_FORM_META_SUFFIX.length));
  }

  return ids;
}
