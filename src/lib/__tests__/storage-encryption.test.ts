import path from "node:path";
import Database from "better-sqlite3";

describe("storage encryption at rest", () => {
  const originalDataDir = process.env.DATA_DIR;
  const originalEncryptionKey = process.env.ARTIFACT_ENCRYPTION_KEY;

  afterEach(() => {
    jest.resetModules();

    if (originalDataDir === undefined) {
      delete process.env.DATA_DIR;
    } else {
      process.env.DATA_DIR = originalDataDir;
    }

    if (originalEncryptionKey === undefined) {
      delete process.env.ARTIFACT_ENCRYPTION_KEY;
    } else {
      process.env.ARTIFACT_ENCRYPTION_KEY = originalEncryptionKey;
    }
  });

  function openRawDb(dataDir: string) {
    return new Database(path.join(dataDir, "data.db"));
  }

  test("form rows are encrypted at rest but read back decrypted", async () => {
    process.env.DATA_DIR = `/tmp/garden-walk-test-storage-form-${Date.now()}-${Math.random()}`;
    process.env.ARTIFACT_ENCRYPTION_KEY = "test-master-key";

    const { FormStorage } = await import("../database");
    const data = JSON.stringify({ name: "Form", categories: [] });

    FormStorage.saveForm({
      id: "form_storage_encrypted",
      modification_key: "mod-key",
      encrypted: false,
      name: "Form",
      data,
    });

    const rawDb = openRawDb(process.env.DATA_DIR);
    const rawForm = rawDb
      .prepare("SELECT name, data FROM forms WHERE id = ?")
      .get("form_storage_encrypted") as { name: string; data: string };
    const rawMeta = rawDb
      .prepare("SELECT name FROM form_meta WHERE id = ?")
      .get("form_storage_encrypted") as { name: string };

    expect(rawForm.name).not.toBe("Form");
    expect(rawForm.data).not.toBe(data);
    expect(rawForm.name.startsWith("gwenc:v1:")).toBe(true);
    expect(rawForm.data.startsWith("gwenc:v1:")).toBe(true);
    expect(rawMeta.name.startsWith("gwenc:v1:")).toBe(true);

    const storedForm = FormStorage.getForm("form_storage_encrypted");
    expect(storedForm?.name).toBe("Form");
    expect(storedForm?.data).toBe(data);

    rawDb.close();
  });

  test("deleted form tombstones remain encrypted at rest", async () => {
    process.env.DATA_DIR = `/tmp/garden-walk-test-storage-delete-${Date.now()}-${Math.random()}`;
    process.env.ARTIFACT_ENCRYPTION_KEY = "test-master-key";

    const { FormStorage } = await import("../database");

    FormStorage.saveForm({
      id: "form_storage_deleted",
      modification_key: "mod-key",
      encrypted: false,
      name: "Form",
      data: JSON.stringify({ name: "Form" }),
    });
    FormStorage.deleteForm("form_storage_deleted");

    const rawDb = openRawDb(process.env.DATA_DIR);
    const rawForm = rawDb
      .prepare("SELECT name, data FROM forms WHERE id = ?")
      .get("form_storage_deleted") as { name: string; data: string };

    expect(rawForm.name).not.toBe("[Deleted]");
    expect(rawForm.data).not.toBe("{}");

    const deletedForm = FormStorage.getForm("form_storage_deleted");
    expect(deletedForm?.name).toBe("[Deleted]");
    expect(deletedForm?.data).toBe("{}");

    rawDb.close();
  });

  test("template rows are encrypted at rest but read back decrypted", async () => {
    process.env.DATA_DIR = `/tmp/garden-walk-test-storage-template-${Date.now()}-${Math.random()}`;
    process.env.ARTIFACT_ENCRYPTION_KEY = "test-master-key";

    const { TemplateStorage } = await import("../database");
    const data = JSON.stringify({ name: "Template", categories: [] });

    TemplateStorage.saveTemplate({
      id: "template_storage_encrypted",
      encrypted: false,
      name: "Template",
      data,
    });

    const rawDb = openRawDb(process.env.DATA_DIR);
    const rawTemplate = rawDb
      .prepare("SELECT name, data FROM templates WHERE id = ?")
      .get("template_storage_encrypted") as { name: string; data: string };

    expect(rawTemplate.name).not.toBe("Template");
    expect(rawTemplate.data).not.toBe(data);
    expect(rawTemplate.name.startsWith("gwenc:v1:")).toBe(true);
    expect(rawTemplate.data.startsWith("gwenc:v1:")).toBe(true);

    const storedTemplate = TemplateStorage.getTemplate(
      "template_storage_encrypted",
    );
    expect(storedTemplate?.name).toBe("Template");
    expect(storedTemplate?.data).toBe(data);

    rawDb.close();
  });

  test("legacy plaintext rows remain readable", async () => {
    process.env.DATA_DIR = `/tmp/garden-walk-test-storage-legacy-${Date.now()}-${Math.random()}`;
    process.env.ARTIFACT_ENCRYPTION_KEY = "test-master-key";

    const { FormStorage } = await import("../database");
    const rawDb = openRawDb(process.env.DATA_DIR);

    rawDb
      .prepare(
        `
          INSERT INTO forms (id, modification_key, encrypted, password_hash, name, data, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `,
      )
      .run(
        "form_legacy_plaintext",
        "mod-key",
        0,
        null,
        "Legacy Form",
        JSON.stringify({ name: "Legacy Form", categories: [] }),
      );

    const storedForm = FormStorage.getForm("form_legacy_plaintext");
    expect(storedForm?.name).toBe("Legacy Form");
    expect(storedForm?.data).toBe(
      JSON.stringify({ name: "Legacy Form", categories: [] }),
    );

    rawDb.close();
  });
});
