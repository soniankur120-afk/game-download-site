import crypto from 'node:crypto';
import readline from 'node:readline';
import { createDatabase } from '../server/db.js';
import { createPasswordHash, id, now } from '../server/security.js';
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(); const password = process.env.ADMIN_PASSWORD;
if (!email || !password) { console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment. No default credentials are created.'); process.exit(1); }
if (password.length < 12) { console.error('ADMIN_PASSWORD must be at least 12 characters.'); process.exit(1); }
const db=createDatabase(); const existing=db.prepare('SELECT id FROM admins WHERE email=?').get(email); if(existing) { console.error('That admin already exists.'); process.exit(1); }
db.prepare('INSERT INTO admins (id,email,password_hash,role,created_at) VALUES (?,?,?,?,?)').run(id(),email,createPasswordHash(password),'owner',now()); console.log(`Created owner account for ${email}.`); db.close();
