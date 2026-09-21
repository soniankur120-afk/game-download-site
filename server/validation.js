const limits = { title: 100, slug: 100, shortDescription: 180, description: 3000, category: 60, version: 40, fileSize: 40, coverImage: 500 };
const required = ['title','slug','shortDescription','description','category','version','platform','coverImage'];
function string(value, max) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
export function validateGame(input, { existingSlug = null } = {}) {
  const errors = {};
  const game = {};
  for (const name of Object.keys(limits)) game[name] = string(input?.[name], limits[name]);
  game.tags = Array.isArray(input?.tags) ? input.tags.map(tag => string(tag, 40)).filter(Boolean).slice(0, 20) : [];
  game.platform = Array.isArray(input?.platform) ? input.platform.map(item => string(item, 30)).filter(Boolean).slice(0, 10) : [];
  game.releaseDate = string(input?.releaseDate, 10);
  game.featured = Boolean(input?.featured);
  for (const name of required) if (!game[name] && !(name === 'platform' && game.platform.length)) errors[name] = 'This field is required.';
  if (game.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(game.slug)) errors.slug = 'Use lowercase letters, numbers, and hyphens.';
  if (existingSlug && game.slug === existingSlug) errors.slug = 'That slug is already in use.';
  if (game.releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(game.releaseDate)) errors.releaseDate = 'Use YYYY-MM-DD.';
  if (input?.downloadUrl) {
    try {
      const url = new URL(String(input.downloadUrl).trim());
      if (url.protocol !== 'https:' || url.username || url.password) errors.downloadUrl = 'Download URL must be HTTPS and contain no credentials.';
      game.downloadUrl = url.toString();
    } catch { errors.downloadUrl = 'Enter a valid HTTPS URL or leave it empty.'; }
  } else game.downloadUrl = '';
  return { valid: Object.keys(errors).length === 0, errors, game };
}
