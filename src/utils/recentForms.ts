export type RecentFormMeta = {
  id: string;
  name: string;
  date: Date;
  encrypted: boolean;
  isPublished: boolean;
};

type RecentFormMetaRecord = {
  name: string;
  date: string;
  encrypted?: boolean;
  isPublished?: boolean;
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
      isPublished: meta.isPublished,
    }),
  );
}

export function saveDraftFormData(
  storage: StorageLike,
  id: string,
  data: string,
): void {
  storage.setItem(getRecentFormDataKey(id), data);
}

export function loadDraftFormData(
  storage: Pick<StorageLike, "getItem">,
  id: string,
): string | null {
  return storage.getItem(getRecentFormDataKey(id));
}

export function removeRecentFormFromStorage(
  storage: Pick<StorageLike, "removeItem">,
  id: string,
): void {
  storage.removeItem(getRecentFormMetaKey(id));
  removeDraftFormData(storage, id);
}

export function removeDraftFormData(
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
): RecentFormMeta[] {
  const forms: RecentFormMeta[] = [];

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
        isPublished: parsed.isPublished ?? false,
      });
    } catch (error) {
      console.error("Error parsing recent form metadata:", error);
    }
  }

  forms.sort((a, b) => b.date.getTime() - a.date.getTime());
  return forms;
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
