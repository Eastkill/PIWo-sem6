'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchGame, markAsSold, placeBid, deleteGame, getImageUrl } from '../../_lib/firestore';
import { useAuth } from '../../_components/AuthProvider';

export default function GameDetailPage() {
  const { id }    = useParams();
  const router    = useRouter();
  const user      = useAuth();

  const [game, setGame]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  // Buy Now
  const [buying, setBuying]     = useState(false);
  const [buyMsg, setBuyMsg]     = useState('');

  // Auction bid
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding]   = useState(false);
  const [bidMsg, setBidMsg]     = useState('');

  // Delete
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGame(id).then(g => { setGame(g); setLoading(false); });
  }, [id]);

  async function handleBuyNow() {
    if (!user) { router.push(`/login?from=/games/${id}`); return; }
    if (!window.confirm('Czy na pewno chcesz kupić tę grę?')) return;
    setBuying(true);
    try {
      await markAsSold(id, user.uid);
      setGame(prev => ({ ...prev, is_sold: true }));
      setBuyMsg('✅ Gratulacje! Gra została zakupiona.');
    } catch (err) {
      setBuyMsg(`❌ ${err.message}`);
    } finally {
      setBuying(false);
    }
  }

  async function handleBid(e) {
    e.preventDefault();
    if (!user) { router.push(`/login?from=/games/${id}`); return; }
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) { setBidMsg('Wprowadź poprawną kwotę.'); return; }
    setBidding(true);
    setBidMsg('');
    try {
      const { newBid } = await placeBid(id, amount, user);
      setGame(prev => ({
        ...prev,
        auction: {
          ...prev.auction,
          current_bid:          newBid,
          highest_bidder_uid:   user.uid,
          highest_bidder_email: user.email,
        },
      }));
      setBidMsg(`✅ Twoja oferta ${newBid.toFixed(2)} zł została przyjęta!`);
      setBidAmount('');
    } catch (err) {
      setBidMsg(`❌ ${err.message}`);
    } finally {
      setBidding(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) return;
    setDeleting(true);
    try {
      await deleteGame(id);
      router.push('/games');
    } catch (err) {
      alert(`Błąd usuwania: ${err.message}`);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="main-content" style={{ display: 'block' }}>
        <div className="loading-state">⏳ Ładowanie...</div>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="main-content" style={{ display: 'block' }}>
        <div className="product-details" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎲</div>
          <h2>Nie znaleziono gry</h2>
          <p style={{ color: '#666', margin: '1rem 0 2rem' }}>
            Gra o id <strong>{id}</strong> nie istnieje.
          </p>
          <Link href="/games" className="btn btn-back">← Wróć do listy</Link>
        </div>
      </main>
    );
  }

  const images = (game.images || []).map(getImageUrl).filter(Boolean);
  const description = Array.isArray(game.description)
    ? game.description
    : [game.description].filter(Boolean);
  const isOwner = user && game.owner_uid && user.uid === game.owner_uid;

  return (
    <main className="main-content" style={{ display: 'block' }}>
      <div className="product-details">
        <Link href="/games" className="btn btn-back">← Wróć do listy</Link>

        <div className="product-detail-container">
          {/* ── Lewa kolumna: zdjęcia ── */}
          <div>
            <div className={`product-detail-image${game.is_sold ? ' sold-image' : ''}`}>
              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[activeImg]} alt={game.title} />
              ) : (
                <div className="product-detail-image-placeholder">
                  🎲<span>Brak zdjęcia</span>
                </div>
              )}
              {game.is_sold && (
                <div className="sold-overlay">SPRZEDANA</div>
              )}
              {game.is_expansion && !game.is_sold && (
                <span className="product-badge detail-badge">Dodatek</span>
              )}
              {game.auction && !game.is_sold && (
                <span className="product-badge-auction" style={{ position: 'absolute', top: 15, left: 15 }}>
                  🔨 Aukcja
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="detail-gallery">
                {images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`${game.title} ${i + 1}`}
                    className={`detail-gallery-thumb${i === activeImg ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Prawa kolumna: szczegóły ── */}
          <div className="product-detail-info">
            <h1 className="detail-title">{game.title}</h1>
            {game.type && <p className="detail-type">📌 {game.type}</p>}

            <div className="detail-meta">
              {(game.min_players != null || game.max_players != null) && (
                <div className="meta-box">
                  <span className="meta-label">Liczba graczy</span>
                  <span className="meta-value">
                    {game.min_players === game.max_players
                      ? `${game.min_players} os.`
                      : `${game.min_players ?? '?'}–${game.max_players ?? '?'} os.`}
                  </span>
                </div>
              )}
              {game.avg_play_time_minutes != null && (
                <div className="meta-box">
                  <span className="meta-label">Czas gry</span>
                  <span className="meta-value">{game.avg_play_time_minutes} min</span>
                </div>
              )}
              {game.publisher && (
                <div className="meta-box">
                  <span className="meta-label">Wydawca</span>
                  <span className="meta-value">{game.publisher}</span>
                </div>
              )}
              {game.is_expansion != null && (
                <div className="meta-box">
                  <span className="meta-label">Rodzaj</span>
                  <span className="meta-value">{game.is_expansion ? 'Dodatek' : 'Gra podstawowa'}</span>
                </div>
              )}
            </div>

            <div className={`detail-price-section${game.is_sold ? ' sold-price' : ''}`}>
              <span className="detail-price">
                {game.price_pln != null
                  ? `${Number(game.price_pln).toFixed(2).replace('.', ',')} zł`
                  : 'Cena na zapytanie'}
              </span>
              <span className="detail-availability">
                {game.is_sold ? '🔴 Sprzedana' : '✅ Dostępna'}
              </span>
            </div>

            {/* ── Aukcja ── */}
            {game.auction && (
              <div className="auction-box">
                <h4>🔨 Trwa aukcja</h4>
                <p>Cena wywoławcza: <strong>
                  {Number(game.auction.starting_price).toFixed(2).replace('.', ',')} zł
                </strong></p>
                <p>Aktualna oferta: <span className="auction-bid">
                  {Number(game.auction.current_bid).toFixed(2).replace('.', ',')} zł
                </span></p>
                {game.auction.highest_bidder_email && (
                  <p style={{ fontSize: '0.85rem', color: '#777', marginTop: '0.3rem' }}>
                    Prowadzi: {game.auction.highest_bidder_email}
                  </p>
                )}

                {!game.is_sold && (
                  <form onSubmit={handleBid} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      step="0.01"
                      min={game.auction.current_bid + 0.01}
                      placeholder={`Min. ${(Number(game.auction.current_bid) + 0.01).toFixed(2)} zł`}
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      style={{
                        flex: 1, padding: '0.6rem', border: '1px solid #dee2e6',
                        borderRadius: '4px', fontSize: '0.95rem', fontFamily: 'inherit',
                      }}
                    />
                    <button
                      type="submit"
                      className="btn btn-view"
                      disabled={bidding}
                    >
                      {bidding ? '⏳' : '🔨 Licytuj'}
                    </button>
                  </form>
                )}
                {bidMsg && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem',
                    color: bidMsg.startsWith('✅') ? '#2f9e44' : '#e03131' }}>
                    {bidMsg}
                  </p>
                )}
              </div>
            )}

            {/* ── Opis ── */}
            {description.length > 0 && (
              <div className="detail-description">
                {description.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            )}

            {/* ── Akcje kupującego ── */}
            {!game.is_sold ? (
              <div className="detail-actions">
                <button
                  className="btn btn-add-cart-large"
                  onClick={handleBuyNow}
                  disabled={buying}
                >
                  {buying ? '⏳ Przetwarzanie...' : '🛒 Kup teraz'}
                </button>
                <button className="btn btn-wishlist">❤️ Dodaj do obserwowanych</button>
              </div>
            ) : (
              <div className="detail-actions">
                <button className="btn btn-add-cart-large" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  🔴 Niedostępna – sprzedana
                </button>
              </div>
            )}
            {buyMsg && (
              <p style={{ marginTop: '0.5rem', color: buyMsg.startsWith('✅') ? '#2f9e44' : '#e03131' }}>
                {buyMsg}
              </p>
            )}

            {/* ── Panel właściciela ── */}
            {isOwner && (
              <div className="owner-controls">
                <p className="owner-note">⚙️ To Twoje ogłoszenie</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link href={`/games/${id}/edit`} className="btn btn-edit-product" style={{ flex: 1 }}>
                    ✏️ Edytuj
                  </Link>
                  <button
                    className="btn btn-delete"
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{ flex: 1 }}
                  >
                    {deleting ? '⏳ Usuwanie...' : '🗑️ Usuń ogłoszenie'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
