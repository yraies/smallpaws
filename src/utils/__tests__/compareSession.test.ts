import {
  createCompareSession,
  loadCompareSession,
  removeCompareSession,
  saveCompareSession,
} from "../compareSession";

class MockStorage {
  private data = new Map<string, string>();

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

describe("compare session storage", () => {
  test("creates and reloads a compare session", () => {
    const storage = new MockStorage();

    const sessionId = createCompareSession(storage, ["form_a", "form_b"]);

    expect(loadCompareSession(storage, sessionId)).toEqual(["form_a", "form_b"]);
  });

  test("updates an existing compare session", () => {
    const storage = new MockStorage();

    const sessionId = createCompareSession(storage, ["form_a"]);
    saveCompareSession(storage, sessionId, ["form_b", "form_c"]);

    expect(loadCompareSession(storage, sessionId)).toEqual(["form_b", "form_c"]);
  });

  test("removes a compare session", () => {
    const storage = new MockStorage();

    const sessionId = createCompareSession(storage, ["form_a"]);
    removeCompareSession(storage, sessionId);

    expect(loadCompareSession(storage, sessionId)).toEqual([]);
  });
});
