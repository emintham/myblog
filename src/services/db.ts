/**
 * SQLite database service for AI assistant conversation history
 *
 * Stores chat messages grouped by session (per post or general)
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "assistant.db");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database connection
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    metadata TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_conversations_session
    ON conversations(session_id, created_at);
`);

/**
 * Message interface matching database schema
 */
export interface Message {
  id?: number;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
  metadata?: string;
}

/**
 * Get all messages for a session
 */
export function getConversation(sessionId: string): Message[] {
  const stmt = db.prepare(`
    SELECT id, session_id, role, content, created_at, metadata
    FROM conversations
    WHERE session_id = ?
    ORDER BY created_at ASC
  `);

  return stmt.all(sessionId) as Message[];
}

/**
 * Add a message to a session
 */
export function addMessage(message: Omit<Message, "id" | "created_at">): Message {
  const stmt = db.prepare(`
    INSERT INTO conversations (session_id, role, content, metadata)
    VALUES (?, ?, ?, ?)
  `);

  const info = stmt.run(
    message.session_id,
    message.role,
    message.content,
    message.metadata || null
  );

  return {
    id: info.lastInsertRowid as number,
    ...message,
    created_at: new Date().toISOString(),
  };
}

/**
 * Delete all messages in a session
 */
export function clearConversation(sessionId: string): void {
  const stmt = db.prepare(`
    DELETE FROM conversations
    WHERE session_id = ?
  `);

  stmt.run(sessionId);
}

/**
 * Get all unique session IDs
 */
export function getAllSessions(): string[] {
  const stmt = db.prepare(`
    SELECT DISTINCT session_id
    FROM conversations
    ORDER BY MAX(created_at) DESC
  `);

  const rows = stmt.all() as Array<{ session_id: string }>;
  return rows.map((row) => row.session_id);
}

/**
 * Delete a specific message by ID
 */
export function deleteMessage(messageId: number): void {
  const stmt = db.prepare(`
    DELETE FROM conversations
    WHERE id = ?
  `);

  stmt.run(messageId);
}

/**
 * Get conversation summary (first 100 chars of first message)
 */
export function getConversationSummary(sessionId: string): string | null {
  const stmt = db.prepare(`
    SELECT content
    FROM conversations
    WHERE session_id = ? AND role = 'user'
    ORDER BY created_at ASC
    LIMIT 1
  `);

  const row = stmt.get(sessionId) as { content: string } | undefined;
  if (!row) return null;

  return row.content.substring(0, 100) + (row.content.length > 100 ? "..." : "");
}

/**
 * Close database connection (for cleanup)
 */
export function closeDatabase(): void {
  db.close();
}

// Export db instance for advanced use cases
export { db };
