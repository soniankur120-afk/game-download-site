import { hashToken, now } from './security.js';
export function requireAuth(db) {
  return (req, res, next) => {
    const raw = req.get('authorization')?.replace(/^Bearer\s+/i, '') || req.cookies?.arcade_session;
    if (!raw) return res.status(401).json({ error: 'Authentication required.' });
    const session = db.prepare(`SELECT admins.id, admins.email, admins.role FROM sessions JOIN admins ON admins.id = sessions.admin_id WHERE sessions.token_hash = ? AND sessions.expires_at > ? AND admins.disabled_at IS NULL`).get(hashToken(raw), now());
    if (!session) return res.status(401).json({ error: 'Session expired or invalid.' });
    req.admin = session; next();
  };
}
export function requireOwner(req, res, next) { return req.admin?.role === 'owner' ? next() : res.status(403).json({ error: 'Owner permission required.' }); }
