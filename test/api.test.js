import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { createDatabase } from '../server/db.js';
import { createPasswordHash, id, now } from '../server/security.js';
function setup() { const db=createDatabase(':memory:'); db.prepare('INSERT INTO admins (id,email,password_hash,role,created_at) VALUES (?,?,?,?,?)').run(id(),'owner@example.test',createPasswordHash('correct horse battery staple'),'owner',now()); return { db, app:createApp({db}) }; }
const game={title:'Test Game',slug:'test-game',shortDescription:'A test game',description:'A longer test description',category:'Action',tags:['Action'],version:'1.0',platform:['Windows'],fileSize:'1 MB',releaseDate:'2026-01-01',coverImage:'assets/images/fallback.svg',downloadUrl:'https://downloads.example.test/game.zip'};
async function login(app) { const response=await request(app).post('/api/auth/login').send({email:'owner@example.test',password:'correct horse battery staple'}); return response.headers['set-cookie']; }
test('rejects unauthorized admin requests',async()=>{ const {app}=setup(); const response=await request(app).get('/api/admin/games'); assert.equal(response.status,401); });
test('authenticates and creates a game',async()=>{ const {app}=setup(); const cookie=await login(app); const response=await request(app).post('/api/admin/games').set('Cookie',cookie).send(game); assert.equal(response.status,201); });
test('rejects duplicate slugs and invalid download URLs',async()=>{ const {app}=setup(); const cookie=await login(app); assert.equal((await request(app).post('/api/admin/games').set('Cookie',cookie).send(game)).status,201); assert.equal((await request(app).post('/api/admin/games').set('Cookie',cookie).send({...game,downloadUrl:'http://unsafe.test/a'})).status,422); assert.equal((await request(app).post('/api/admin/games').set('Cookie',cookie).send(game)).status,422); });
test('hides drafts and enforces publish URL requirement',async()=>{ const {app}=setup(); const cookie=await login(app); const created=await request(app).post('/api/admin/games').set('Cookie',cookie).send({...game,downloadUrl:''}); assert.equal(created.status,201); const admin=(await request(app).get('/api/admin/games').set('Cookie',cookie)).body[0]; assert.equal((await request(app).get('/api/games')).body.length,0); assert.equal((await request(app).post(`/api/admin/games/${admin.id}/publish`).set('Cookie',cookie)).status,422); });
