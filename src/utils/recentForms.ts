export type RecentItemKind = "form" | "template";
export type RecentItemPhase = "draft" | "finalized" | "published";

export type RecentItemMeta = {
  id: string;
  name: string;
  respondentName?: string;
  templateName?: string;
  structureFingerprint?: string;
  compareIdentity?: string;
  date: Date;
  encrypted: boolean;
  kind: RecentItemKind;
  phase: RecentItemPhase;
};

export type RecentFormMeta = RecentItemMeta;

type RecentFormMetaRecord = {
  name: string;
  respondentName?: string;
  templateName?: string;
  structureFingerprint?: string;
  compareIdentity?: string;
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
      respondentName: meta.respondentName,
      templateName: meta.templateName,
      structureFingerprint: meta.structureFingerprint,
      compareIdentity: meta.compareIdentity,
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
        respondentName: parsed.respondentName,
        templateName: parsed.templateName,
        structureFingerprint: parsed.structureFingerprint,
        compareIdentity: parsed.compareIdentity,
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

// ── Recently viewed shared forms ──

const RECENT_SHARED_FORMS_KEY = "recent-shared-forms";
const MAX_RECENT_SHARED = 50;

export type RecentSharedFormMeta = {
  shareId: string;
  name: string;
  respondentName?: string;
  templateName?: string;
  structureFingerprint: string;
  compareIdentity?: string;
  date: string;
  encrypted: boolean;
};

/**
 * Computes a structure fingerprint from sorted category and question TypeIDs.
 * Forms from the same template share identical fingerprints.
 */
export function computeStructureFingerprint(form: {
  categories: {
    id: { toString(): string };
    questions: { id: { toString(): string } }[];
  }[];
}): string {
  const ids: string[] = [];
  for (const cat of form.categories) {
    ids.push(`c:${cat.id.toString()}`);
    for (const q of cat.questions) {
      ids.push(`q:${q.id.toString()}`);
    }
  }
  ids.sort();
  return ids.join("|");
}

export function saveRecentSharedForm(
  storage: StorageLike,
  meta: RecentSharedFormMeta,
): void {
  const existing = loadRecentSharedForms(storage);
  const filtered = existing.filter((f) => f.shareId !== meta.shareId);
  const updated = [meta, ...filtered].slice(0, MAX_RECENT_SHARED);
  storage.setItem(RECENT_SHARED_FORMS_KEY, JSON.stringify(updated));
}

export function loadRecentSharedForms(
  storage: Pick<StorageLike, "getItem">,
): RecentSharedFormMeta[] {
  const raw = storage.getItem(RECENT_SHARED_FORMS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RecentSharedFormMeta[];
  } catch {
    return [];
  }
}

export function replaceRecentSharedForms(
  storage: Pick<StorageLike, "setItem">,
  items: RecentSharedFormMeta[],
): void {
  storage.setItem(RECENT_SHARED_FORMS_KEY, JSON.stringify(items));
}

export function removeRecentSharedForm(
  storage: StorageLike,
  shareId: string,
): void {
  const existing = loadRecentSharedForms(storage);
  const filtered = existing.filter((f) => f.shareId !== shareId);
  storage.setItem(RECENT_SHARED_FORMS_KEY, JSON.stringify(filtered));
}

export function clearRecentSharedForms(storage: StorageLike): void {
  storage.removeItem(RECENT_SHARED_FORMS_KEY);
}
