const ADDED_KEY = 'planszland_added';
const EDITED_KEY = 'planszland_edited';

export const API_BASE = 'https://szandala.github.io/piwo-api/';

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

export function getAddedGames() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(ADDED_KEY) || '[]'); }
  catch { return []; }
}

export function getEditedGames() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(EDITED_KEY) || '{}'); }
  catch { return {}; }
}

export function saveNewGame(gameData) {
  const added = getAddedGames();
  const id = `local_${Date.now()}`;
  const game = { ...gameData, id, isLocal: true };
  localStorage.setItem(ADDED_KEY, JSON.stringify([...added, game]));
  return game;
}

export function updateGame(id, gameData) {
  const edited = getEditedGames();
  edited[String(id)] = { ...(edited[String(id)] || {}), ...gameData };
  localStorage.setItem(EDITED_KEY, JSON.stringify(edited));
}

export function deleteLocalGame(id) {
  const added = getAddedGames().filter(g => String(g.id) !== String(id));
  localStorage.setItem(ADDED_KEY, JSON.stringify(added));
}
