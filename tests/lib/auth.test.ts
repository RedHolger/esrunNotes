import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../../lib/auth';

describe('auth helpers', () => {
  it('hash and verify password', () => {
    const pw = 'TestP@ssw0rd!';
    const hash = hashPassword(pw);
    expect(verifyPassword(pw, hash)).toBe(true);
    expect(verifyPassword('wrong', hash)).toBe(false);
  });

  it('sign and verify token', () => {
    const token = signToken({ userId: 'u1', role: 'admin', iat: Date.now() });
    const payload = verifyToken(token);
    expect(payload?.userId).toBe('u1');
    expect(payload?.role).toBe('admin');
  });
});

