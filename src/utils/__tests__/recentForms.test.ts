import {
  clearRecentFormsFromStorage,
  clearRecentSharedForms,
  getRecentFormDataKey,
  getRecentFormMetaKey,
  hasLocalDraft,
  loadLocalDraft,
  loadRecentForms,
  loadRecentSharedForms,
  removeRecentFormFromStorage,
  removeRecentSharedForm,
  saveLocalDraft,
  saveRecentFormMeta,
  saveRecentSharedForm,
} from "../recentForms";

class MockStorage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

describe("recent forms storage", () => {
  test("preserves full hyphenated form ids when loading metadata", () => {
    const storage = new MockStorage();
    const id = "form_01jz-example-hyphenated-id";

    saveRecentFormMeta(storage, {
      id,
      name: "Draft Form",
      templateName: "Template Name",
      structureFingerprint: "fp-1",
      encrypted: false,
      kind: "form",
      phase: "draft",
      date: new Date("2026-04-03T10:00:00.000Z"),
    });

    const recentForms = loadRecentForms(storage);

    expect(recentForms).toHaveLength(1);
    expect(recentForms[0]).toMatchObject({
      id,
      name: "Draft Form",
      templateName: "Template Name",
      structureFingerprint: "fp-1",
      encrypted: false,
      kind: "form",
      phase: "draft",
    });
  });

  test("loads draft form data from the dedicated data key", () => {
    const storage = new MockStorage();
    const id = "form_01jz-example-hyphenated-id";
    const payload = JSON.stringify({ name: "Draft Form" });

    saveLocalDraft(storage, id, payload);

    expect(loadLocalDraft(storage, id)).toBe(payload);
    expect(storage.getItem(getRecentFormDataKey(id))).toBe(payload);
  });

  test("detects whether draft form data exists for a local draft", () => {
    const storage = new MockStorage();
    const id = "form_01jz-example-hyphenated-id";

    expect(hasLocalDraft(storage, id)).toBe(false);

    saveLocalDraft(storage, id, JSON.stringify({ name: "Draft Form" }));

    expect(hasLocalDraft(storage, id)).toBe(true);
  });

  test("removes both metadata and data for one recent form", () => {
    const storage = new MockStorage();
    const id = "form_01jz-example-hyphenated-id";

    saveRecentFormMeta(storage, {
      id,
      name: "Draft Form",
      encrypted: false,
      kind: "form",
      phase: "draft",
    });
    saveLocalDraft(storage, id, JSON.stringify({ name: "Draft Form" }));

    removeRecentFormFromStorage(storage, id);

    expect(storage.getItem(getRecentFormMetaKey(id))).toBeNull();
    expect(storage.getItem(getRecentFormDataKey(id))).toBeNull();
  });

  test("clears only recent-form keys and leaves unrelated storage intact", () => {
    const storage = new MockStorage();
    const id = "form_01jz-example-hyphenated-id";

    saveRecentFormMeta(storage, {
      id,
      name: "Draft Form",
      encrypted: false,
      isPublished: false,
      kind: "form",
    });
    saveLocalDraft(storage, id, JSON.stringify({ name: "Draft Form" }));
    storage.setItem("display-preferences", JSON.stringify({ showIcon: true }));

    clearRecentFormsFromStorage(storage);

    expect(storage.getItem(getRecentFormMetaKey(id))).toBeNull();
    expect(storage.getItem(getRecentFormDataKey(id))).toBeNull();
    expect(storage.getItem("display-preferences")).toBe(
      JSON.stringify({ showIcon: true }),
    );
  });

  test("preserves the recent item kind when loading metadata", () => {
    const storage = new MockStorage();
    const id = "template_01jz-example-hyphenated-id";

    saveRecentFormMeta(storage, {
      id,
      name: "Template Draft",
      encrypted: false,
      kind: "template",
      phase: "draft",
    });

    const recentForms = loadRecentForms(storage);

    expect(recentForms).toHaveLength(1);
    expect(recentForms[0]?.kind).toBe("template");
    expect(recentForms[0]?.phase).toBe("draft");
  });

  test("derives lifecycle phase from legacy published metadata", () => {
    const storage = new MockStorage();
    const id = "template_legacy";

    storage.setItem(
      getRecentFormMetaKey(id),
      JSON.stringify({
        name: "Legacy Finalized Template",
        date: new Date("2026-04-03T10:00:00.000Z").toISOString(),
        encrypted: false,
        isPublished: true,
        kind: "template",
      }),
    );

    const recentForms = loadRecentForms(storage);

    expect(recentForms[0]).toMatchObject({
      id,
      kind: "template",
      phase: "finalized",
    });
  });

  test("stores shared-form metadata with compare identity", () => {
    const storage = new MockStorage();

    saveRecentSharedForm(storage, {
      shareId: "share_123",
      compareIdentity: "compare_123",
      name: "Published Form",
      respondentName: "Alex",
      templateName: "Template Name",
      structureFingerprint: "fp-1",
      date: new Date("2026-04-03T10:00:00.000Z").toISOString(),
      encrypted: false,
    });

    expect(loadRecentSharedForms(storage)).toEqual([
      expect.objectContaining({
        shareId: "share_123",
        compareIdentity: "compare_123",
        respondentName: "Alex",
        templateName: "Template Name",
      }),
    ]);
  });

  test("removes one shared-form entry without clearing others", () => {
    const storage = new MockStorage();

    saveRecentSharedForm(storage, {
      shareId: "share_123",
      compareIdentity: "compare_123",
      name: "First",
      structureFingerprint: "fp-1",
      date: new Date("2026-04-03T10:00:00.000Z").toISOString(),
      encrypted: false,
    });
    saveRecentSharedForm(storage, {
      shareId: "share_456",
      compareIdentity: "compare_456",
      name: "Second",
      structureFingerprint: "fp-2",
      date: new Date("2026-04-03T11:00:00.000Z").toISOString(),
      encrypted: false,
    });

    removeRecentSharedForm(storage, "share_123");

    expect(loadRecentSharedForms(storage)).toEqual([
      expect.objectContaining({ shareId: "share_456" }),
    ]);
  });

  test("clears shared-form storage independently", () => {
    const storage = new MockStorage();

    saveRecentSharedForm(storage, {
      shareId: "share_123",
      compareIdentity: "compare_123",
      name: "First",
      structureFingerprint: "fp-1",
      date: new Date("2026-04-03T10:00:00.000Z").toISOString(),
      encrypted: false,
    });

    clearRecentSharedForms(storage);

    expect(loadRecentSharedForms(storage)).toEqual([]);
  });
});
