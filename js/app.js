const DATA_URL = 'data/games.json';

export async function loadGames() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error('Game data could not be loaded.');
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Game data has an invalid format.');
  return data.filter(isValidGame);
}

export function isValidGame(game) {
  return game && typeof game.id === 'string' && typeof game.title === 'string' && typeof game.slug === 'string' && typeof game.category === 'string' && typeof game.coverImage === 'string';
}

export function gameCard(game) {
  const card = document.createElement('article');
  card.className = 'game-card';
  const link = document.createElement('a'); link.href = `game.html?slug=${encodeURIComponent(game.slug)}`; link.setAttribute('aria-label', `View details for ${game.title}`);
  const image = document.createElement('img'); image.className = 'game-cover'; image.src = game.coverImage; image.alt = `${game.title} cover artwork`; image.loading = 'lazy'; image.addEventListener('error', () => { image.src = 'assets/images/fallback.svg'; image.alt = 'Cover artwork unavailable'; }); link.append(image);
  const body = document.createElement('div'); body.className = 'game-card__body';
  const meta = document.createElement('div'); meta.className = 'game-card__meta'; meta.append(text(game.category), text(game.platform?.[0] || '')); body.append(meta);
  const heading = document.createElement('h3'); heading.textContent = game.title; body.append(heading);
  const description = document.createElement('p'); description.textContent = game.shortDescription || 'Explore this game in the catalog.'; body.append(description);
  const details = document.createElement('a'); details.className = 'card-link'; details.href = `game.html?slug=${encodeURIComponent(game.slug)}`; details.textContent = 'View details '; const arrow = document.createElement('span'); arrow.textContent = '→'; details.append(arrow); body.append(details); card.append(link, body); return card;
}
function text(value) { const span = document.createElement('span'); span.textContent = value; return span; }

export function renderShell() {
  const header = document.querySelector('[data-site-header]');
  if (header) { header.className = 'site-header'; header.innerHTML = '<a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true"></span>arcade atlas</a><nav class="nav-links" aria-label="Main navigation"><a href="games.html">Games</a><a href="about.html">About</a><a class="nav-cta" href="games.html">Explore ↗</a></nav>'; }
  const footer = document.querySelector('[data-site-footer]');
  if (footer) { footer.className = 'site-footer'; footer.innerHTML = '<a class="brand" href="index.html">arcade atlas</a><p>Curated discovery for authorized game downloads · <span>© 2026</span></p>'; }
}

function showError(container) { container.replaceChildren(); const state = document.createElement('div'); state.className = 'error-state'; state.textContent = 'We couldn’t load the catalog right now. Please try again later.'; container.append(state); }

renderShell();
const featured = document.querySelector('[data-featured-games]'); const latest = document.querySelector('[data-latest-games]'); const categories = document.querySelector('[data-categories]');
if (featured || latest) loadGames().then(games => { if (featured) { featured.replaceChildren(...games.filter(g => g.featured).map(gameCard)); } if (latest) { latest.replaceChildren(...games.slice().sort((a,b) => b.releaseDate.localeCompare(a.releaseDate)).slice(0,3).map(gameCard)); } if (categories) { const counts = games.reduce((map,g) => map.set(g.category,(map.get(g.category)||0)+1),new Map()); counts.forEach((count, category) => { const a=document.createElement('a'); a.className='category'; a.href=`games.html?category=${encodeURIComponent(category)}`; a.textContent=category; const small=document.createElement('small'); small.textContent=`${count} ${count === 1 ? 'title' : 'titles'}`; a.append(small); categories.append(a); }); } }).catch(() => { if (featured) showError(featured); if (latest) showError(latest); });
