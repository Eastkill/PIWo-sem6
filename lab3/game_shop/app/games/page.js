'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { fetchGamesPage } from '../_lib/firestore';
import FiltersSidebar from '../_components/FiltersSidebar';
import GameCard from '../_components/GameCard';
import Pagination from '../_components/Pagination';

const DEFAULT_FILTERS = {
  search:     '',
  types:      [],
  players:    [],
  timeRanges: [],
  publisher:  '',
  priceMin:   0,
  priceMax:   500,
};

export default function GamesPage() {
  // Cursor cache: cursors[i] = Firestore doc cursor before page i
  // cursors[0] = null (no cursor needed for first page)
  const [cursors, setCursors]       = useState([null]);
  const [pageGames, setPageGames]   = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed
  const [hasMore, setHasMore]       = useState(true);
  const [loading, setLoading]       = useState(true);

  const [filters, setFilters]       = useState(DEFAULT_FILTERS);
  const [sort, setSort]             = useState('newest');

  const loadPage = useCallback(async (pageIdx) => {
    setLoading(true);
    try {
      const cursor = cursors[pageIdx] ?? null;
      const { games, lastDoc, hasMore: more } = await fetchGamesPage(cursor);
      setPageGames(games);
      setCurrentPage(pageIdx);
      setHasMore(more);

      // Store cursor for the next page (only if we don't have it yet)
      if (lastDoc) {
        setCursors(prev => {
          if (prev[pageIdx + 1]) return prev; // already cached
          const next = [...prev];
          next[pageIdx + 1] = lastDoc;
          return next;
        });
      }
    } catch (err) {
      console.error('Błąd pobierania gier:', err);
    } finally {
      setLoading(false);
    }
  }, [cursors]);

  useEffect(() => { loadPage(0); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side filtering on current page
  const filtered = useMemo(() => {
    let result = [...pageGames];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(g => {
        const desc = Array.isArray(g.description) ? g.description.join(' ') : (g.description || '');
        return (g.title || '').toLowerCase().includes(q) || desc.toLowerCase().includes(q);
      });
    }

    if (filters.types.length > 0) {
      result = result.filter(g => filters.types.includes(g.type));
    }

    if (filters.players.length > 0) {
      result = result.filter(g =>
        filters.players.some(p => {
          const min = g.min_players ?? 1;
          const max = g.max_players ?? 99;
          if (p === '1')   return min <= 1;
          if (p === '2')   return min <= 2 && max >= 2;
          if (p === '3-4') return min <= 4 && max >= 3;
          if (p === '5+')  return max >= 5;
          return false;
        })
      );
    }

    if (filters.timeRanges.length > 0) {
      result = result.filter(g => {
        const t = g.avg_play_time_minutes ?? 0;
        return filters.timeRanges.some(r => {
          if (r === '30')   return t <= 30;
          if (r === '60')   return t > 30 && t <= 60;
          if (r === '120')  return t > 60 && t <= 120;
          if (r === '120+') return t > 120;
          return false;
        });
      });
    }

    if (filters.publisher) {
      const pub = filters.publisher.toLowerCase();
      result = result.filter(g => (g.publisher || '').toLowerCase().includes(pub));
    }

    result = result.filter(g => {
      const price = g.price_pln ?? 0;
      return price >= filters.priceMin && price <= filters.priceMax;
    });

    if (sort === 'price-asc')  result.sort((a, b) => (a.price_pln ?? 0) - (b.price_pln ?? 0));
    if (sort === 'price-desc') result.sort((a, b) => (b.price_pln ?? 0) - (a.price_pln ?? 0));
    if (sort === 'name-asc')   result.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'pl'));
    if (sort === 'name-desc')  result.sort((a, b) => (b.title || '').localeCompare(a.title || '', 'pl'));

    return result;
  }, [pageGames, filters, sort]);

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
  }

  async function goToPage(pageIdx) {
    if (pageIdx < 0) return;
    if (pageIdx > 0 && !cursors[pageIdx]) return; // cursor not yet known
    await loadPage(pageIdx);
  }

  return (
    <main className="main-content">
      <FiltersSidebar filters={filters} onChange={handleFilterChange} />

      <section className="products-section">
        <div className="products-header">
          <h2>Gry planszowe</h2>
          <div className="sort-controls">
            <select
              className="sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="newest">Najnowsze</option>
              <option value="price-asc">Cena: od najtańszych</option>
              <option value="price-desc">Cena: od najdroższych</option>
              <option value="name-asc">Nazwa: A–Z</option>
              <option value="name-desc">Nazwa: Z–A</option>
            </select>
          </div>
          <Link href="/games/new" className="btn btn-add-product">
            ➕ Dodaj ogłoszenie
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">⏳ Ładowanie gier...</div>
        ) : (
          <>
            <p className="results-info">
              Pokazano: <strong>{filtered.length}</strong> z{' '}
              <strong>{pageGames.length}</strong> gier na tej stronie
            </p>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <p>🔍 Brak wyników dla podanych filtrów</p>
                <button
                  className="btn btn-reset"
                  onClick={() => handleFilterChange(DEFAULT_FILTERS)}
                >
                  Usuń filtry
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {filtered.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}

            {/* Firestore cursor pagination */}
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0 || loading}
              >
                ‹ Poprzednia
              </button>
              <span className="pagination-info">
                Strona {currentPage + 1}
              </span>
              <button
                className="pagination-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasMore || loading}
              >
                Następna ›
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
