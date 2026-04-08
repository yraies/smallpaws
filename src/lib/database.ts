import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

// Use DATA_DIR env var if set, otherwise fall back to cwd for local dev
const dataDir = process.env.DATA_DIR ?? process.cwd();

// Ensure the directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "data.db");
const db = Database(dbPath);

// Initialize the database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS forms (
    id TEXT PRIMARY KEY,
    modification_key TEXT NOT NULL,
    encrypted BOOLEAN DEFAULT false,
    password_hash TEXT,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    encrypted BOOLEAN DEFAULT false,
    password_hash TEXT,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

try {
  db.exec(`ALTER TABLE templates ADD COLUMN encrypted BOOLEAN DEFAULT false`);
} catch {
  // Column already exists, ignore error
}

try {
  db.exec(`ALTER TABLE templates ADD COLUMN password_hash TEXT`);
} catch {
  // Column already exists, ignore error
}

// Add migration for existing databases to add new columns
try {
  db.exec(`ALTER TABLE forms ADD COLUMN encrypted BOOLEAN DEFAULT false`);
} catch {
  // Column already exists, ignore error
}

try {
  db.exec(`ALTER TABLE forms ADD COLUMN password_hash TEXT`);
} catch {
  // Column already exists, ignore error
}

try {
  db.exec(`ALTER TABLE forms ADD COLUMN cloned_from TEXT`);
} catch {
  // Column already exists, ignore error
}

db.exec(`
  CREATE TABLE IF NOT EXISTS form_meta (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    encrypted BOOLEAN DEFAULT false,
    FOREIGN KEY (id) REFERENCES forms (id) ON DELETE CASCADE
  )
`);

// Add migration for existing form_meta table
try {
  db.exec(`ALTER TABLE form_meta ADD COLUMN encrypted BOOLEAN DEFAULT false`);
} catch {
  // Column already exists, ignore error
}

db.exec(`
  CREATE TABLE IF NOT EXISTS shared_forms (
    share_id TEXT PRIMARY KEY,
    form_id TEXT NOT NULL,
    password_hash TEXT,
    expires_at DATETIME,
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms (id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS shared_templates (
    share_id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE
  )
`);

export interface StoredForm {
  id: string;
  modification_key: string;
  encrypted: boolean;
  password_hash?: string;
  name: string;
  data: string;
  cloned_from?: string;
  created_at: string;
  updated_at: string;
}

export interface StoredTemplate {
  id: string;
  encrypted: boolean;
  password_hash?: string | null;
  name: string;
  data: string;
  created_at: string;
  updated_at: string;
}

export interface FormMeta {
  id: string;
  name: string;
  date: string;
  encrypted: boolean;
}

export interface SharedForm {
  share_id: string;
  form_id: string;
  password_hash: string | null;
  expires_at: string | null;
  view_count: number;
  created_at: string;
}

export interface SharedTemplate {
  share_id: string;
  template_id: string;
  view_count: number;
  created_at: string;
}

// biome-ignore lint/complexity/noStaticOnlyClass: used as a namespace for DB operations
export class FormStorage {
  static getForm(id: string): StoredForm | null {
    const stmt = db.prepare("SELECT * FROM forms WHERE id = ?");
    const result = stmt.get(id) as
      | (Omit<StoredForm, "encrypted"> & { encrypted: number })
      | null;
    if (!result) return null;

    // Convert integer back to boolean for the encrypted field
    return {
      id: result.id,
      modification_key: result.modification_key,
      encrypted: Boolean(result.encrypted),
      password_hash: result.password_hash,
      name: result.name,
      data: result.data,
      cloned_from: result.cloned_from,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  }

  static saveForm(form: Omit<StoredForm, "created_at" | "updated_at">): void {
    // Check if form already exists (is published)
    const existingForm = FormStorage.getForm(form.id);
    if (existingForm) {
      throw new Error(
        "Cannot overwrite published form. This form has already been published and is immutable.",
      );
    }

    const stmt = db.prepare(`
      INSERT INTO forms (id, modification_key, encrypted, password_hash, name, data, cloned_from, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    // Convert boolean to integer for SQLite
    stmt.run(
      form.id,
      form.modification_key,
      form.encrypted ? 1 : 0,
      form.password_hash || null,
      form.name,
      form.data,
      form.cloned_from || null,
    );

    // Also insert meta information
    const metaStmt = db.prepare(`
      INSERT INTO form_meta (id, name, date, encrypted)
      VALUES (?, ?, datetime('now'), ?)
    `);
    metaStmt.run(form.id, form.name, form.encrypted ? 1 : 0);
  }

  static deleteForm(id: string): void {
    // Soft delete: clear form data but keep entry for statistics
    // This preserves cloned_from references and allows for usage analytics
    const stmt = db.prepare(`
      UPDATE forms 
      SET data = '{}', 
          name = '[Deleted]',
          updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(id);

    // Also update form_meta to mark as deleted
    const metaStmt = db.prepare(`
      UPDATE form_meta 
      SET name = '[Deleted]'
      WHERE id = ?
    `);
    metaStmt.run(id);
  }

  static getRecentForms(): FormMeta[] {
    const stmt = db.prepare(
      "SELECT * FROM form_meta ORDER BY date DESC LIMIT 20",
    );
    const rows = stmt.all() as Array<{
      id: string;
      name: string;
      date: string;
      encrypted: number;
    }>;
    return rows.map((row) => ({
      ...row,
      encrypted: Boolean(row.encrypted),
    })) as FormMeta[];
  }

  static clearAllForms(): void {
    db.exec("DELETE FROM forms");
    db.exec("DELETE FROM form_meta");
    db.exec("DELETE FROM shared_forms");
    db.exec("DELETE FROM templates");
    db.exec("DELETE FROM shared_templates");
  }

  // Shared Forms Operations
  static createSharedForm(shareData: {
    shareId: string;
    formId: string;
    passwordHash: string | null;
    expiresAt: string | null;
  }): SharedForm {
    const stmt = db.prepare(`
      INSERT INTO shared_forms (share_id, form_id, password_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(
      shareData.shareId,
      shareData.formId,
      shareData.passwordHash,
      shareData.expiresAt,
    );

    const result = db
      .prepare("SELECT * FROM shared_forms WHERE share_id = ?")
      .get(shareData.shareId) as {
      share_id: string;
      form_id: string;
      password_hash: string | null;
      expires_at: string | null;
      view_count: number;
      created_at: string;
    };
    return {
      share_id: result.share_id,
      form_id: result.form_id,
      password_hash: result.password_hash,
      expires_at: result.expires_at,
      view_count: result.view_count,
      created_at: result.created_at,
    };
  }

  static getSharedForm(shareId: string): SharedForm | null {
    const stmt = db.prepare("SELECT * FROM shared_forms WHERE share_id = ?");
    const result = stmt.get(shareId) as
      | {
          share_id: string;
          form_id: string;
          password_hash: string | null;
          expires_at: string | null;
          view_count: number;
          created_at: string;
        }
      | undefined;

    if (!result) {
      return null;
    }

    return {
      share_id: result.share_id,
      form_id: result.form_id,
      password_hash: result.password_hash,
      expires_at: result.expires_at,
      view_count: result.view_count,
      created_at: result.created_at,
    };
  }

  static incrementShareViewCount(shareId: string): void {
    const stmt = db.prepare(
      "UPDATE shared_forms SET view_count = view_count + 1 WHERE share_id = ?",
    );
    stmt.run(shareId);
  }

  static deleteSharedForm(shareId: string): void {
    const stmt = db.prepare("DELETE FROM shared_forms WHERE share_id = ?");
    stmt.run(shareId);
  }

  static getSharedFormsForForm(formId: string): SharedForm[] {
    const stmt = db.prepare(
      "SELECT * FROM shared_forms WHERE form_id = ? ORDER BY created_at DESC",
    );
    const rows = stmt.all(formId) as Array<{
      share_id: string;
      form_id: string;
      password_hash: string | null;
      expires_at: string | null;
      view_count: number;
      created_at: string;
    }>;
    return rows.map((row) => ({
      share_id: row.share_id,
      form_id: row.form_id,
      password_hash: row.password_hash,
      expires_at: row.expires_at,
      view_count: row.view_count,
      created_at: row.created_at,
    }));
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: used as a namespace for DB operations
export class TemplateStorage {
  static getTemplate(id: string): StoredTemplate | null {
    const stmt = db.prepare("SELECT * FROM templates WHERE id = ?");
    const result = stmt.get(id) as
      | (Omit<StoredTemplate, "encrypted"> & { encrypted: number })
      | undefined;
    if (!result) return null;

    return {
      id: result.id,
      encrypted: Boolean(result.encrypted),
      password_hash: result.password_hash,
      name: result.name,
      data: result.data,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  }

  static saveTemplate(
    template: Omit<StoredTemplate, "created_at" | "updated_at">,
  ): void {
    const existingTemplate = TemplateStorage.getTemplate(template.id);
    if (existingTemplate) {
      throw new Error(
        "Cannot overwrite finalized template. This template has already been finalized.",
      );
    }

    const stmt = db.prepare(`
      INSERT INTO templates (id, encrypted, password_hash, name, data, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      template.id,
      template.encrypted ? 1 : 0,
      template.password_hash || null,
      template.name,
      template.data,
    );
  }

  static createSharedTemplate(
    templateId: string,
    shareId: string,
  ): SharedTemplate {
    const stmt = db.prepare(`
      INSERT INTO shared_templates (share_id, template_id)
      VALUES (?, ?)
    `);

    stmt.run(shareId, templateId);

    const result = db
      .prepare("SELECT * FROM shared_templates WHERE share_id = ?")
      .get(shareId) as SharedTemplate;

    return result;
  }

  static getSharedTemplate(shareId: string): SharedTemplate | null {
    const stmt = db.prepare(
      "SELECT * FROM shared_templates WHERE share_id = ?",
    );
    const result = stmt.get(shareId) as SharedTemplate | undefined;
    return result ?? null;
  }

  static incrementSharedTemplateViewCount(shareId: string): void {
    const stmt = db.prepare(
      "UPDATE shared_templates SET view_count = view_count + 1 WHERE share_id = ?",
    );
    stmt.run(shareId);
  }

  static getSharedTemplatesForTemplate(templateId: string): SharedTemplate[] {
    const stmt = db.prepare(
      "SELECT * FROM shared_templates WHERE template_id = ? ORDER BY created_at DESC",
    );
    return stmt.all(templateId) as SharedTemplate[];
  }
}

export default db;
