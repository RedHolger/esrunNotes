/* eslint-disable no-console */
const { readFile } = require('fs/promises');
const { existsSync } = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load .env.local if present (Next.js style)
try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
} catch {}

function jsonPath(p) {
  return path.join(process.cwd(), 'data', p);
}

async function loadJson(file) {
  if (!existsSync(file)) return [];
  try {
    const raw = await readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );
    `);
    await client.query(`
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

    const users = await loadJson(jsonPath('users.json'));
    for (const u of users) {
      await client.query(
        `INSERT INTO users(id,name,email,password_hash,role)
         VALUES($1,$2,$3,$4,$5)
         ON CONFLICT (email) DO NOTHING`,
        [u.id, u.name, u.email, u.passwordHash || u.password_hash, u.role || 'student']
      );
    }

    const subjects = await loadJson(jsonPath('subjects.json'));
    for (const s of subjects) {
      await client.query(
        `INSERT INTO subjects(id,name)
         VALUES($1,$2)
         ON CONFLICT (name) DO NOTHING`,
        [s.id, s.name]
      );
    }

    const lectures = await loadJson(jsonPath('lectures.json'));
    for (const l of lectures) {
      // ensure subject exists
      let subjectId = null;
      const subjName = l.subject || 'General';
      const r = await client.query('SELECT id FROM subjects WHERE lower(name)=lower($1)', [subjName]);
      if (r.rowCount) {
        subjectId = r.rows[0].id;
      } else {
        subjectId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        await client.query('INSERT INTO subjects(id,name) VALUES($1,$2)', [subjectId, subjName]);
      }
      await client.query(
        `INSERT INTO lectures(id,title,subject_id,created_at,transcript,analysis,uploaded_by)
         VALUES($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO NOTHING`,
        [
          l.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          l.title || 'Untitled lecture',
          subjectId,
          l.createdAt || new Date().toISOString(),
          l.transcript || '',
          JSON.stringify(l.analysis || {}),
          l.uploadedBy || null,
        ]
      );
    }

    await client.query('COMMIT');
    console.log('Import completed');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Import failed:', e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
