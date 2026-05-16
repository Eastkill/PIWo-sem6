'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addGame, updateGame } from '../_lib/firestore';
import { useAuth } from './AuthProvider';

const GAME_TYPES = [
  'ekonomiczna', 'przygodowa', 'abstrakcyjna', 'rodzinna',
  'towarzyska', 'kooperacyjna', 'karciana', 'zręcznościowa', 'inna',
];

const EMPTY_FORM = {
  title: '',
  type: '',
  min_players: '',
  max_players: '',
  avg_play_time_minutes: '',
  publisher: '',
  price_pln: '',
  is_expansion: false,
  description: '',
  image_url_1: '',
  image_url_2: '',
  image_url_3: '',
  has_auction: false,
  auction_starting_price: '',
};

function gameToForm(game) {
  if (!game) return EMPTY_FORM;
  const images = game.images || [];
  const desc = Array.isArray(game.description)
    ? game.description.join('\n')
    : (game.description || '');
  return {
    title:                 game.title || '',
    type:                  game.type || '',
    min_players:           game.min_players ?? '',
    max_players:           game.max_players ?? '',
    avg_play_time_minutes: game.avg_play_time_minutes ?? '',
    publisher:             game.publisher || '',
    price_pln:             game.price_pln ?? '',
    is_expansion:          game.is_expansion || false,
    description:           desc,
    image_url_1:           images[0] || '',
    image_url_2:           images[1] || '',
    image_url_3:           images[2] || '',
    has_auction:           Boolean(game.auction),
    auction_starting_price: game.auction?.starting_price ?? '',
  };
}

function formToGame(form) {
  const images = [form.image_url_1, form.image_url_2, form.image_url_3].filter(Boolean);
  const description = form.description
    .split('\n').map(s => s.trim()).filter(Boolean);
  const auction = form.has_auction && form.auction_starting_price
    ? {
        starting_price:        Number(form.auction_starting_price),
        current_bid:           Number(form.auction_starting_price),
        highest_bidder_uid:    null,
        highest_bidder_email:  null,
        end_date:              null,
      }
    : null;
  return {
    title:                 form.title.trim(),
    type:                  form.type || null,
    min_players:           form.min_players !== '' ? Number(form.min_players) : null,
    max_players:           form.max_players !== '' ? Number(form.max_players) : null,
    avg_play_time_minutes: form.avg_play_time_minutes !== '' ? Number(form.avg_play_time_minutes) : null,
    publisher:             form.publisher.trim() || null,
    price_pln:             form.price_pln !== '' ? Number(form.price_pln) : null,
    is_expansion:          form.is_expansion,
    description,
    images,
    auction,
  };
}

export default function GameForm({ game }) {
  const user   = useAuth();
  const router = useRouter();
  const isEdit = Boolean(game);

  const [form, setForm]     = useState(() => gameToForm(game));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Tytuł jest wymagany.';
    if (form.min_players !== '' && form.max_players !== '' &&
        Number(form.min_players) > Number(form.max_players))
      e.max_players = 'Maks. graczy musi być ≥ min.';
    if (form.price_pln !== '' && Number(form.price_pln) < 0)
      e.price_pln = 'Cena nie może być ujemna.';
    if (form.has_auction && (form.auction_starting_price === '' || Number(form.auction_starting_price) <= 0))
      e.auction_starting_price = 'Podaj cenę wywoławczą > 0.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!user) { router.push('/login'); return; }

    setSaving(true);
    try {
      const gameData = formToGame(form);
      if (isEdit) {
        await updateGame(game.id, gameData);
        router.push(`/games/${game.id}`);
      } else {
        const newId = await addGame(gameData, user);
        router.push(`/games/${newId}`);
      }
    } catch (err) {
      alert(`Błąd zapisu: ${err.message}`);
      setSaving(false);
    }
  }

  function handleCancel() {
    router.push(isEdit ? `/games/${game.id}` : '/games');
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-grid">

        {/* Tytuł */}
        <div className="form-group full-width">
          <label htmlFor="title">Tytuł gry *</label>
          <input id="title" type="text" value={form.title}
            onChange={e => set('title', e.target.value)} placeholder="np. Catan, Gloomhaven..." />
          {errors.title && <small style={{ color: '#e03131' }}>{errors.title}</small>}
        </div>

        {/* Typ */}
        <div className="form-group">
          <label htmlFor="type">Rodzaj gry</label>
          <select id="type" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="">– wybierz –</option>
            {GAME_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Wydawca */}
        <div className="form-group">
          <label htmlFor="publisher">Wydawca</label>
          <input id="publisher" type="text" value={form.publisher}
            onChange={e => set('publisher', e.target.value)} placeholder="np. Galakta, Rebel..." />
        </div>

        {/* Min / Max graczy */}
        <div className="form-group">
          <label htmlFor="min_players">Min. graczy</label>
          <input id="min_players" type="number" min={1} value={form.min_players}
            onChange={e => set('min_players', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="max_players">Maks. graczy</label>
          <input id="max_players" type="number" min={1} value={form.max_players}
            onChange={e => set('max_players', e.target.value)} />
          {errors.max_players && <small style={{ color: '#e03131' }}>{errors.max_players}</small>}
        </div>

        {/* Czas */}
        <div className="form-group">
          <label htmlFor="avg_play_time_minutes">Czas gry (min)</label>
          <input id="avg_play_time_minutes" type="number" min={0} value={form.avg_play_time_minutes}
            onChange={e => set('avg_play_time_minutes', e.target.value)} />
        </div>

        {/* Cena */}
        <div className="form-group">
          <label htmlFor="price_pln">Cena (PLN)</label>
          <input id="price_pln" type="number" min={0} step="0.01" value={form.price_pln}
            onChange={e => set('price_pln', e.target.value)} />
          {errors.price_pln && <small style={{ color: '#e03131' }}>{errors.price_pln}</small>}
        </div>

        {/* Dodatek */}
        <div className="form-group" style={{ justifyContent: 'flex-end' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: 18, height: 18, accentColor: '#667eea' }}
              checked={form.is_expansion} onChange={e => set('is_expansion', e.target.checked)} />
            To jest dodatek / rozszerzenie
          </label>
        </div>

        {/* Opis */}
        <div className="form-group full-width">
          <label htmlFor="description">Opis</label>
          <textarea id="description" value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Każda linia tekstu stanie się osobnym akapitem..." />
          <small>Każda linia = osobny akapit</small>
        </div>

        {/* Zdjęcia */}
        <div className="form-group full-width">
          <label>Adresy URL zdjęć</label>
          {[1, 2, 3].map(n => (
            <input key={n} type="url" value={form[`image_url_${n}`]}
              onChange={e => set(`image_url_${n}`, e.target.value)}
              placeholder={`https://... (zdjęcie ${n}${n > 1 ? ', opcjonalnie' : ''})`}
              style={{ marginBottom: '0.5rem' }} />
          ))}
          <small>Podaj pełne adresy URL (ładowanie plików będzie dostępne po dodaniu Firebase Storage)</small>
        </div>

        {/* Aukcja */}
        <div className="form-group full-width">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.8rem' }}>
            <input type="checkbox" style={{ width: 18, height: 18, accentColor: '#ff922b' }}
              checked={form.has_auction} onChange={e => set('has_auction', e.target.checked)} />
            Włącz tryb aukcji
          </label>
          {form.has_auction && (
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="auction_starting_price">Cena wywoławcza (PLN) *</label>
              <input id="auction_starting_price" type="number" min={0.01} step="0.01"
                value={form.auction_starting_price}
                onChange={e => set('auction_starting_price', e.target.value)}
                placeholder="np. 50.00" />
              {errors.auction_starting_price && (
                <small style={{ color: '#e03131' }}>{errors.auction_starting_price}</small>
              )}
            </div>
          )}
        </div>

      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-submit" disabled={saving}>
          {saving ? '⏳ Zapisywanie...' : isEdit ? '💾 Zapisz zmiany' : '➕ Dodaj ogłoszenie'}
        </button>
        <button type="button" className="btn btn-cancel" onClick={handleCancel}>
          Anuluj
        </button>
      </div>
    </form>
  );
}
