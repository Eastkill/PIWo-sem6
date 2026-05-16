import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export const GAMES_COL = 'games';
const PAGE_SIZE = 10;

// ── Helpers ────────────────────────────────────────────────

export const API_BASE = 'https://szandala.github.io/piwo-api/';

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

function docToGame(snap) {
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    // Firestore Timestamps → ISO strings for safe serialisation in Client Components
    created_at: data.created_at?.toDate?.()?.toISOString?.() ?? null,
    auction: data.auction
      ? {
          ...data.auction,
          end_date: data.auction.end_date?.toDate?.()?.toISOString?.() ?? null,
        }
      : null,
  };
}

// ── Read ───────────────────────────────────────────────────

/**
 * Fetch one page of games (cursor-based).
 * @param {import('firebase/firestore').QueryDocumentSnapshot|null} lastDoc
 * @returns {{ games: object[], lastDoc: QueryDocumentSnapshot|null, hasMore: boolean }}
 */
export async function fetchGamesPage(lastDoc = null) {
  let q = query(
    collection(db, GAMES_COL),
    orderBy('created_at', 'desc'),
    limit(PAGE_SIZE)
  );
  if (lastDoc) {
    q = query(
      collection(db, GAMES_COL),
      orderBy('created_at', 'desc'),
      limit(PAGE_SIZE),
      startAfter(lastDoc)
    );
  }
  const snap = await getDocs(q);
  const games = snap.docs.map(docToGame);
  const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return { games, lastDoc: newLastDoc, hasMore: snap.docs.length === PAGE_SIZE };
}

export async function fetchGame(id) {
  const snap = await getDoc(doc(db, GAMES_COL, id));
  if (!snap.exists()) return null;
  return docToGame(snap);
}

// ── Write ──────────────────────────────────────────────────

export async function addGame(gameData, user) {
  const ref = await addDoc(collection(db, GAMES_COL), {
    ...gameData,
    is_sold:      false,
    owner_uid:    user.uid,
    owner_email:  user.email,
    created_at:   serverTimestamp(),
    auction:      gameData.auction ?? null,
  });
  return ref.id;
}

export async function updateGame(id, gameData) {
  await updateDoc(doc(db, GAMES_COL, id), gameData);
}

export async function deleteGame(id) {
  await deleteDoc(doc(db, GAMES_COL, id));
}

// ── Buy now ────────────────────────────────────────────────

export async function markAsSold(gameId, buyerUid) {
  await updateDoc(doc(db, GAMES_COL, gameId), {
    is_sold:   true,
    buyer_uid: buyerUid,
  });
}

// ── Auction bid (ACID transaction) ─────────────────────────

/**
 * Places a bid atomically.
 * Throws if bid ≤ current highest bid or if game is already sold / has no auction.
 */
export async function placeBid(gameId, newBid, bidder) {
  return runTransaction(db, async (tx) => {
    const gameRef  = doc(db, GAMES_COL, gameId);
    const gameSnap = await tx.get(gameRef);

    if (!gameSnap.exists()) throw new Error('Gra nie istnieje.');

    const game = gameSnap.data();

    if (game.is_sold) throw new Error('Ta gra jest już sprzedana.');
    if (!game.auction) throw new Error('Ta gra nie ma aukcji.');

    const currentBid = game.auction.current_bid ?? game.auction.starting_price ?? 0;
    if (newBid <= currentBid) {
      throw new Error(
        `Oferta musi być wyższa niż aktualna (${currentBid.toFixed(2)} zł).`
      );
    }

    tx.update(gameRef, {
      'auction.current_bid':          newBid,
      'auction.highest_bidder_uid':   bidder.uid,
      'auction.highest_bidder_email': bidder.email,
    });

    return { newBid };
  });
}

// ── Seed helper ────────────────────────────────────────────

const SEED_API = 'https://szandala.github.io/piwo-api/board-games.json';

export async function seedFromApi() {
  const res   = await fetch(SEED_API);
  const data  = await res.json();
  const games = data.board_games ?? [];

  const results = await Promise.allSettled(
    games.map(g =>
      addDoc(collection(db, GAMES_COL), {
        title:                  g.title,
        type:                   g.type ?? null,
        min_players:            g.min_players ?? null,
        max_players:            g.max_players ?? null,
        avg_play_time_minutes:  g.avg_play_time_minutes ?? null,
        publisher:              g.publisher ?? null,
        price_pln:              g.price_pln ?? null,
        is_expansion:           g.is_expansion ?? false,
        description:            Array.isArray(g.description) ? g.description : [],
        images:                 (g.images ?? []).map(getImageUrl),
        auction:                g.auction
          ? {
              starting_price:        g.auction.starting_price,
              current_bid:           g.auction.current_bid,
              highest_bidder_uid:    g.auction.highest_bidder_uid ?? null,
              highest_bidder_email:  null,
              end_date:              null,
            }
          : null,
        is_sold:      false,
        owner_uid:    null,
        owner_email:  null,
        created_at:   serverTimestamp(),
      })
    )
  );

  const ok   = results.filter(r => r.status === 'fulfilled').length;
  const fail = results.filter(r => r.status === 'rejected').length;
  return { ok, fail };
}
