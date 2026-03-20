import { createHmac, randomBytes, timingSafeEqual, pbkdf2Sync } from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'dev-secret';

type TokenPayload = {
  userId: string;
  role: 'student' | 'teacher' | 'admin';
  iat: number;
};

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const verify = pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(verify, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function signToken(payload: TokenPayload) {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = createHmac('sha256', SECRET).update(data).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const json = Buffer.from(data, 'base64url').toString();
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

export function setSessionCookie(headers: Headers, token: string) {
  headers.append(
    'Set-Cookie',
    `session=${token}; Path=/; HttpOnly; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`
  );
}

export function getTokenFromCookie(reqHeaders: Headers): string | null {
  const cookie = reqHeaders.get('cookie') || '';
  const parts = cookie.split(';').map((s) => s.trim());
  for (const p of parts) {
    if (p.startsWith('session=')) {
      return p.slice('session='.length);
    }
  }
  return null;
}

