import { loadGames } from '../js/app.js';

const STORAGE_KEY = 'arcade-atlas-admin-draft-v1';
const root = document;
const list = root.querySelector('[data-record-list]');
const form = root.querySelector('[data-game-form]');
const status = root.querySelector('[data-admin-status]');
let games = [];
let editingId = '';

const fields = ['title','slug','shortDescription','description','category','tags','version','fileSize','releaseDate','platform','coverImage','downloadUrl'];
const byName = name => form.elements[name];

function shell() {
  const header = root.querySelector('[data-admin-header]');
  header.className = 'site-header';
  header.innerHTML = '<a class="brand" href="../index.html"><span class="brand-mark" aria-hidden="true"></span>arcade atlas</a><nav class="nav-links" aria-label="Admin navigation"><a href="../games.html">View site ↗</a><a class="nav-cta" href="../index.html">Exit console</a></nav>';
  const footer = root.querySelector('[data-admin-footer]');
  footer.className = 'site-footer';
  footer.innerHTML = '<a class="brand" href="../index.html">arcade atlas</a><p>Owner publishing console · local demonstration only</p>';
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function saveDraft() { localStorage.setItem(STORAGE_KEY, JSON.stringify(games)); }
function announce(message, kind = 'success') { status.textContent = message; status.dataset.kind = kind; }
function clearAnnouncement() { status.textContent = ''; status.removeAttribute('data-kind'); }
function escapeSlug(value) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function displayStatus(game) { return game.status === 'published' ? 'Published' : 'Draft'; }

function renderStats() {
  root.querySelector('[data-stat-total]').textContent = games.length;
  root.querySelector('[data-stat-published]').textContent = games.filter(game => game.status === 'published').length;
  root.querySelector('[data-stat-drafts]').textContent = games.filter(game => game.status !== 'published' || !game.downloadUrl).length;
}

function renderList() {
  const query = root.querySelector('[data-admin-search]').value.trim().toLowerCase();
  const visible = games.filter(game => [game.title, game.category, ...(game.tags || [])].join(' ').toLowerCase().includes(query));
  root.querySelector('[data-record-count]').textContent = `${visible.length} of ${games.length}`;
  list.replaceChildren();
  if (!visible.length) { const empty = document.createElement('div'); empty.className = 'empty-state'; empty.textContent = 'No records match this search.'; list.append(empty); return; }
  visible.forEach(game => {
    const item = document.createElement('article'); item.className = 'record';
    const image = document.createElement('img'); image.src = game.coverImage || '../assets/images/fallback.svg'; image.alt = ''; image.addEventListener('error', () => { image.src = '../assets/images/fallback.svg'; });
    const details = document.createElement('div'); details.className = 'record__details';
    const title = document.createElement('h3'); title.textContent = game.title; const meta = document.createElement('p'); meta.textContent = `${game.category} · ${displayStatus(game)}${game.downloadUrl ? '' : ' · no download URL'}`; details.append(title, meta);
    const actions = document.createElement('div'); actions.className = 'record__actions';
    const edit = document.createElement('button'); edit.className = 'text-button'; edit.type = 'button'; edit.textContent = 'Edit'; edit.addEventListener('click', () => loadEditor(game));
    const publish = document.createElement('button'); publish.className = 'text-button'; publish.type = 'button'; publish.textContent = game.status === 'published' ? 'Unpublish' : 'Publish'; publish.addEventListener('click', () => togglePublish(game.id));
    const remove = document.createElement('button'); remove.className = 'text-button text-button--danger'; remove.type = 'button'; remove.textContent = 'Delete'; remove.addEventListener('click', () => deleteGame(game.id)); actions.append(edit, publish, remove); item.append(image, details, actions); list.append(item);
  });
}

function fillForm(game) {
  fields.forEach(name => { const value = game[name]; byName(name).value = Array.isArray(value) ? value.join(', ') : value || ''; });
  byName('featured').checked = Boolean(game.featured); editingId = game.id;
  root.querySelector('#editor-title').textContent = 'Edit game';
}
function clearForm() { form.reset(); byName('id').value = ''; editingId = ''; root.querySelector('#editor-title').textContent = 'Add a game'; root.querySelectorAll('.field-error').forEach(error => error.textContent = ''); clearAnnouncement(); }
function loadEditor(game) { fillForm(game); window.scrollTo({ top: document.querySelector('.editor-panel').offsetTop - 20, behavior: 'smooth' }); }
function value(name) { return byName(name).value.trim(); }

function validate() {
  root.querySelectorAll('.field-error').forEach(error => error.textContent = '');
  const errors = {};
  ['title','slug','shortDescription','description','category','version','platform','coverImage'].forEach(name => { if (!value(name)) errors[name] = 'Required'; });
  if (value('slug') && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value('slug'))) errors.slug = 'Use lowercase letters, numbers, and hyphens only';
  if (games.some(game => game.slug === value('slug') && game.id !== editingId)) errors.slug = 'Slug must be unique';
  const download = value('downloadUrl');
  if (download) { try { const url = new URL(download); if (url.protocol !== 'https:') errors.downloadUrl = 'Only HTTPS download URLs are accepted'; } catch { errors.downloadUrl = 'Enter a valid HTTPS URL or leave this blank'; } }
  Object.entries(errors).forEach(([name, message]) => { const target = root.querySelector(`[data-error-for="${name}"]`); if (target) target.textContent = message; });
  return Object.keys(errors).length === 0;
}

function formGame() {
  return { id: editingId || crypto.randomUUID(), slug: value('slug'), title: value('title'), shortDescription: value('shortDescription'), description: value('description'), coverImage: value('coverImage'), screenshots: [], category: value('category'), tags: value('tags').split(',').map(tag => tag.trim()).filter(Boolean), version: value('version'), fileSize: value('fileSize'), platform: value('platform').split(',').map(item => item.trim()).filter(Boolean), developer: 'Site owner', publisher: 'Site owner', releaseDate: value('releaseDate'), downloadUrl: value('downloadUrl'), featured: byName('featured').checked, status: editingId ? (games.find(game => game.id === editingId)?.status || 'draft') : 'draft', demo: true };
}

function submit(event) { event.preventDefault(); if (!validate()) { announce('Please fix the highlighted fields.', 'error'); return; } const record = formGame(); const index = games.findIndex(game => game.id === record.id); if (index === -1) games.push(record); else games[index] = { ...games[index], ...record }; saveDraft(); renderStats(); renderList(); clearForm(); announce('Record saved to this browser draft. It is not published to a server.', 'success'); }
function togglePublish(id) { const game = games.find(item => item.id === id); if (!game) return; if (game.status !== 'published' && !game.downloadUrl) { announce('Add a valid authorized HTTPS download URL before publishing.', 'error'); return; } game.status = game.status === 'published' ? 'draft' : 'published'; saveDraft(); renderStats(); renderList(); announce(`${game.title} is now ${displayStatus(game).toLowerCase()} in this local draft.`, 'success'); }
function deleteGame(id) { const game = games.find(item => item.id === id); if (!game || !window.confirm(`Delete “${game.title}” from this local draft?`)) return; games = games.filter(item => item.id !== id); saveDraft(); renderStats(); renderList(); if (editingId === id) clearForm(); announce('Record deleted from this browser draft.', 'success'); }

async function init() { shell(); try { const stored = localStorage.getItem(STORAGE_KEY); games = stored ? JSON.parse(stored) : clone(await loadGames()); } catch { games = []; announce('Could not load catalog records. Start by adding a game.', 'error'); } renderStats(); renderList(); root.querySelector('[data-game-form]').addEventListener('submit', submit); root.querySelector('[data-new-game]').addEventListener('click', () => { clearForm(); document.querySelector('.editor-panel').scrollIntoView({ behavior: 'smooth' }); }); root.querySelector('[data-reset-form]').addEventListener('click', clearForm); root.querySelector('[data-clear-form]').addEventListener('click', clearForm); root.querySelector('[data-admin-search]').addEventListener('input', renderList); form.elements.title.addEventListener('input', () => { if (!editingId && !byName('slug').value) byName('slug').value = escapeSlug(value('title')); }); }

init();
