import crypto from "crypto";
import { getDb } from "./schema.js";

// ─── Organization CRUD ───

export interface Organization {
  id: string;
  linkedin_id: string;
  name: string;
  logo_url: string | null;
  access_token: string;
  token_expires_at: string | null;
  created_at: string;
}

export function createOrganization(data: {
  linkedin_id: string;
  name: string;
  logo_url?: string;
  access_token?: string;
  token_expires_at?: string;
}): Organization {
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO organizations (id, linkedin_id, name, logo_url, access_token, token_expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, data.linkedin_id, data.name, data.logo_url ?? null, data.access_token ?? "", data.token_expires_at ?? null);
  return getOrganization(id)!;
}

export function updateOrganizationToken(
  id: string,
  accessToken: string,
  tokenExpiresAt: string | null
): void {
  const db = getDb();
  db.prepare(
    "UPDATE organizations SET access_token = ?, token_expires_at = ? WHERE id = ?"
  ).run(accessToken, tokenExpiresAt, id);
}

export function getOrganization(id: string): Organization | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM organizations WHERE id = ?").get(id) as Organization | undefined;
}

export function listOrganizations(): Organization[] {
  const db = getDb();
  return db.prepare("SELECT * FROM organizations ORDER BY created_at DESC").all() as Organization[];
}

// ─── Post CRUD ───

export interface Post {
  id: string;
  organization_id: string;
  linkedin_post_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  author_name: string | null;
  author_avatar: string | null;
  published_at: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  raw_data: string | null;
  fetched_at: string;
}

export function upsertPosts(
  organizationId: string,
  posts: Array<{
    linkedin_post_id: string;
    content?: string;
    media_url?: string;
    media_type?: string;
    author_name?: string;
    author_avatar?: string;
    published_at?: string;
    likes_count?: number;
    comments_count?: number;
    shares_count?: number;
    raw_data?: string;
  }>
): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO posts (id, organization_id, linkedin_post_id, content, media_url, media_type,
      author_name, author_avatar, published_at, likes_count, comments_count, shares_count, raw_data, fetched_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(linkedin_post_id) DO UPDATE SET
      content = excluded.content,
      media_url = excluded.media_url,
      media_type = excluded.media_type,
      author_name = excluded.author_name,
      author_avatar = excluded.author_avatar,
      published_at = excluded.published_at,
      likes_count = excluded.likes_count,
      comments_count = excluded.comments_count,
      shares_count = excluded.shares_count,
      raw_data = excluded.raw_data,
      fetched_at = excluded.fetched_at
  `);

  const transaction = db.transaction(() => {
    for (const post of posts) {
      stmt.run(
        crypto.randomUUID(),
        organizationId,
        post.linkedin_post_id,
        post.content ?? null,
        post.media_url ?? null,
        post.media_type ?? null,
        post.author_name ?? null,
        post.author_avatar ?? null,
        post.published_at ?? null,
        post.likes_count ?? 0,
        post.comments_count ?? 0,
        post.shares_count ?? 0,
        post.raw_data ?? null
      );
    }
  });

  transaction();
}

export function getPostsByOrg(organizationId: string, limit = 20): Post[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM posts WHERE organization_id = ? ORDER BY published_at DESC LIMIT ?"
    )
    .all(organizationId, limit) as Post[];
}

// ─── Widget CRUD ───

export interface Widget {
  id: string;
  organization_id: string;
  name: string;
  layout: string;
  config: string;
  created_at: string;
  updated_at: string;
}

export function createWidget(data: {
  organization_id: string;
  name: string;
  layout?: string;
  config?: Record<string, unknown>;
}): Widget {
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO widgets (id, organization_id, name, layout, config)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    id,
    data.organization_id,
    data.name,
    data.layout ?? "carousel",
    JSON.stringify(data.config ?? {})
  );
  return getWidget(id)!;
}

export function getWidget(id: string): Widget | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM widgets WHERE id = ?").get(id) as Widget | undefined;
}

export function updateWidget(
  id: string,
  data: { name?: string; layout?: string; config?: Record<string, unknown> }
): Widget | undefined {
  const db = getDb();
  const existing = getWidget(id);
  if (!existing) return undefined;

  db.prepare(
    `UPDATE widgets SET
       name = ?,
       layout = ?,
       config = ?,
       updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    data.name ?? existing.name,
    data.layout ?? existing.layout,
    data.config ? JSON.stringify(data.config) : existing.config,
    id
  );

  return getWidget(id);
}

export function deleteWidget(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM widgets WHERE id = ?").run(id);
  return result.changes > 0;
}

export function listWidgetsByOrg(organizationId: string): Widget[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM widgets WHERE organization_id = ? ORDER BY created_at DESC")
    .all(organizationId) as Widget[];
}

export function listAllWidgets(): Widget[] {
  const db = getDb();
  return db.prepare("SELECT * FROM widgets ORDER BY created_at DESC").all() as Widget[];
}
