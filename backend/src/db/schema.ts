import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "..", "data", "feeder.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

export function initializeDb(): void {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      linkedin_id TEXT NOT NULL,
      name TEXT NOT NULL,
      logo_url TEXT,
      access_token TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      linkedin_post_id TEXT NOT NULL UNIQUE,
      content TEXT,
      media_url TEXT,
      media_type TEXT,
      author_name TEXT,
      author_avatar TEXT,
      published_at TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      shares_count INTEGER DEFAULT 0,
      raw_data TEXT,
      fetched_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );

    CREATE TABLE IF NOT EXISTS widgets (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      layout TEXT NOT NULL DEFAULT 'carousel',
      config TEXT NOT NULL DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );
  `);

  console.log("Database initialized at", DB_PATH);
}
