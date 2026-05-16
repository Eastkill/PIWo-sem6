const API_URL = 'https://szandala.github.io/piwo-api/board-games.json';

export async function fetchApiGames() {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.board_games || [];
  } catch {
    return [];
  }
}
