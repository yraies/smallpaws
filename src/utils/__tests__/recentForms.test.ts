import {
  clearRecentFormsFromStorage,
  getRecentFormDataKey,
  getRecentFormMetaKey,
  loadDraftFormData,
  loadRecentForms,
  removeRecentFormFromStorage,
  saveDraftFormData,
  saveRecentFormMeta,
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
      encrypted: false,
      isPublished: false,
      date: new Date("2026-04-03T10:00:00.000Z"),
    });

    const recentForms = loadRecentForms(storage);

    expect(recentForms).toHaveLength(1);
    expect(recentForms[0]).toMatchObject({
      id,
      name: "Draft Form",
      encrypted: false,
      isPublished: false,
    });
  });

  test("loads draft form data from the dedicated data key", () => {
    const storage = new MockStorage();
    const id = "form_01jz-example-hyphenated-id";
    const payload = JSON.stringify({ name: "Draft Form" });

    saveDraftFormData(storage, id, payload);

    expect(loadDraftFormData(storage, id)).toBe(payload);
    expect(storage.getItem(getRecentFormDataKey(id))).toBe(payload);
  });

  test("removes both metadata and data for one recent form", () => {
    const storage = new MockStorage();
    const id = "form_01jz-example-hyphenated-id";

    saveRecentFormMeta(storage, {
      id,
      name: "Draft Form",
      encrypted: false,
      isPublished: false,
    });
    saveDraftFormData(storage, id, JSON.stringify({ name: "Draft Form" }));

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
    });
    saveDraftFormData(storage, id, JSON.stringify({ name: "Draft Form" }));
    storage.setItem("display-preferences", JSON.stringify({ showIcon: true }));

    clearRecentFormsFromStorage(storage);

    expect(storage.getItem(getRecentFormMetaKey(id))).toBeNull();
    expect(storage.getItem(getRecentFormDataKey(id))).toBeNull();
    expect(storage.getItem("display-preferences")).toBe(
      JSON.stringify({ showIcon: true }),
    );
  });
});
