'use client';

const GAME_TYPES = [
  'ekonomiczna', 'przygodowa', 'abstrakcyjna', 'rodzinna',
  'towarzyska', 'kooperacyjna', 'karciana', 'zręcznościowa',
];

const PLAYER_OPTIONS = [
  { value: '1', label: 'Solo (1 osoba)' },
  { value: '2', label: '2 osoby' },
  { value: '3-4', label: '3–4 osoby' },
  { value: '5+', label: '5+ osób' },
];

const TIME_OPTIONS = [
  { value: '30', label: 'Do 30 minut' },
  { value: '60', label: '30–60 minut' },
  { value: '120', label: '60–120 minut' },
  { value: '120+', label: 'Powyżej 120 minut' },
];

function toggleArrayValue(arr, val) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

export default function FiltersSidebar({ filters, onChange }) {
  function update(patch) {
    onChange(prev => ({ ...prev, ...patch }));
  }

  function toggleType(t) {
    update({ types: toggleArrayValue(filters.types, t) });
  }

  function togglePlayers(p) {
    update({ players: toggleArrayValue(filters.players, p) });
  }

  function toggleTime(t) {
    update({ timeRanges: toggleArrayValue(filters.timeRanges, t) });
  }

  function reset() {
    onChange({
      search: '',
      types: [],
      players: [],
      timeRanges: [],
      publisher: '',
      priceMin: 0,
      priceMax: 500,
    });
  }

  return (
    <aside className="filters-sidebar">
      <div className="filters-header">
        <h2>Filtry</h2>
        <button className="btn-reset" onClick={reset}>Resetuj</button>
      </div>

      {/* Szukaj w tytule/opisie */}
      <div className="filter-group">
        <label className="filter-label">Szukaj</label>
        <input
          type="text"
          placeholder="Tytuł lub słowa kluczowe..."
          className="filter-input"
          value={filters.search}
          onChange={e => update({ search: e.target.value })}
        />
      </div>

      {/* Cena */}
      <details className="filter-group" open>
        <summary>Cena (PLN)</summary>
        <input
          type="range"
          min={0}
          max={500}
          value={filters.priceMin}
          className="filter-input"
          onChange={e => update({ priceMin: Number(e.target.value) })}
        />
        <input
          type="range"
          min={0}
          max={500}
          value={filters.priceMax}
          className="filter-input"
          onChange={e => update({ priceMax: Number(e.target.value) })}
        />
        <div className="price-display">
          {filters.priceMin} zł – {filters.priceMax} zł
        </div>
      </details>

      {/* Typ gry */}
      <details className="filter-group" open>
        <summary>Rodzaj gry</summary>
        <div className="filter-options">
          {GAME_TYPES.map(t => (
            <label key={t} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.types.includes(t)}
                onChange={() => toggleType(t)}
              />
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </label>
          ))}
        </div>
      </details>

      {/* Liczba graczy */}
      <details className="filter-group">
        <summary>Liczba graczy</summary>
        <div className="filter-options">
          {PLAYER_OPTIONS.map(o => (
            <label key={o.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.players.includes(o.value)}
                onChange={() => togglePlayers(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </details>

      {/* Czas gry */}
      <details className="filter-group">
        <summary>Czas gry</summary>
        <div className="filter-options">
          {TIME_OPTIONS.map(o => (
            <label key={o.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.timeRanges.includes(o.value)}
                onChange={() => toggleTime(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </details>

      {/* Wydawnictwo */}
      <details className="filter-group">
        <summary>Wydawnictwo</summary>
        <input
          type="text"
          placeholder="Wpisz wydawnictwo..."
          className="filter-input"
          value={filters.publisher}
          onChange={e => update({ publisher: e.target.value })}
        />
      </details>
    </aside>
  );
}
