import crypto from 'node:crypto';

export const now = () => new Date().toISOString();
export const id = () => crypto.randomUUID();
export function hashToken(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
export function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}
export function verifyPassword(password, stored) {
  const [algorithm, salt, expected] = String(stored).split(':');
  if (algorithm !== 'scrypt' || !salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}
export function randomSessionToken() { return crypto.randomBytes(32).toString('base64url'); }
