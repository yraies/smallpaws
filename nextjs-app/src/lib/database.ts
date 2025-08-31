import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data.db');
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

export interface StoredForm {
  id: string;
  modification_key: string;
  encrypted: boolean;
  password_hash?: string;
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

export class FormStorage {
  static getForm(id: string): StoredForm | null {
    const stmt = db.prepare('SELECT * FROM forms WHERE id = ?');
    const result = stmt.get(id) as Omit<StoredForm, 'encrypted'> & { encrypted: number } | null;
    if (!result) return null;
    
    // Convert integer back to boolean for the encrypted field
    return {
      id: result.id,
      modification_key: result.modification_key,
      encrypted: Boolean(result.encrypted),
      password_hash: result.password_hash,
      name: result.name,
      data: result.data,
      created_at: result.created_at,
      updated_at: result.updated_at
    };
  }

  static saveForm(form: Omit<StoredForm, 'created_at' | 'updated_at'>): void {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO forms (id, modification_key, encrypted, password_hash, name, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    // Convert boolean to integer for SQLite
    stmt.run(form.id, form.modification_key, form.encrypted ? 1 : 0, form.password_hash || null, form.name, form.data);

    // Also update or insert meta information
    const metaStmt = db.prepare(`
      INSERT OR REPLACE INTO form_meta (id, name, date, encrypted)
      VALUES (?, ?, datetime('now'), ?)
    `);
    metaStmt.run(form.id, form.name, form.encrypted ? 1 : 0);
  }

  static deleteForm(id: string): void {
    const stmt = db.prepare('DELETE FROM forms WHERE id = ?');
    stmt.run(id);
  }

  static getRecentForms(): FormMeta[] {
    const stmt = db.prepare('SELECT * FROM form_meta ORDER BY date DESC LIMIT 20');
    const rows = stmt.all() as Array<{id: string; name: string; date: string; encrypted: number}>;
    return rows.map(row => ({
      ...row,
      encrypted: Boolean(row.encrypted)
    })) as FormMeta[];
  }

  static clearAllForms(): void {
    db.exec('DELETE FROM forms');
    db.exec('DELETE FROM form_meta');
  }
}

export default db;
