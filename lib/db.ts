import { Pool } from 'pg';

let pool: Pool | null = null;
let inited = false;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }

    const useSsl =
      /sslmode=require/i.test(connectionString) ||
      process.env.PGSSLMODE === 'require';

    pool = new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

export async function initDb() {
  if (inited) return;
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `);
  await p.query(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );
  `);
  await p.query(`
    CREATE TABLE IF NOT EXISTS lectures (
      id TEXT PRIMARY KEY,
      title TEXT,
      subject_id TEXT REFERENCES subjects(id),
      created_at TIMESTAMPTZ NOT NULL,
      transcript TEXT,
      analysis JSONB,
      uploaded_by TEXT REFERENCES users(id)
    );
  `);
  inited = true;
}

export function db() {
  return getPool();
}

