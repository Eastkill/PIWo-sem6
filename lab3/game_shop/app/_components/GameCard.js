'use client';
import Link from 'next/link';
import ImagePlaceholder from './ImagePlaceholder';
import { getImageUrl } from '../_lib/store';

export default function GameCard({ game }) {
  const firstImage = game.images?.[0] ? getImageUrl(game.images[0]) : null;
  const descriptionText = Array.isArray(game.description)
    ? game.description[0]
    : (game.description || '');

  return (
    <div className={`product-card${game.is_sold ? ' sold' : ''}`}>
      <div className="product-image">
        <ImagePlaceholder src={firstImage} alt={game.title} />
        {game.is_sold && <div className="sold-overlay">SPRZEDANA</div>}
        {!game.is_sold && game.is_expansion && <span className="product-badge">Dodatek</span>}
        {!game.is_sold && game.auction && <span className="product-badge-auction">🔨 Aukcja</span>}
      </div>

      <div className="product-info">
        <h3 className="product-name" title={game.title}>{game.title}</h3>
        {game.type && <p className="product-type">Kategoria: {game.type}</p>}

        <div className="product-meta">
          {(game.min_players != null || game.max_players != null) && (
            <span className="meta-item">
              👥 {game.min_players === game.max_players
                ? `${game.min_players} os.`
                : `${game.min_players ?? '?'}–${game.max_players ?? '?'} os.`}
            </span>
          )}
          {game.avg_play_time_minutes != null && (
            <span className="meta-item">⏱️ {game.avg_play_time_minutes} min</span>
          )}
        </div>

        {game.publisher && (
          <p className="product-publisher">Wydawca: {game.publisher}</p>
        )}

        {descriptionText && (
          <p className="product-description">{descriptionText}</p>
        )}

        <div className="product-footer">
          <span className="product-price">
            {game.price_pln != null
              ? `${Number(game.price_pln).toFixed(2).replace('.', ',')} zł`
              : 'brak ceny'}
          </span>
          <div className="product-actions">
            <Link href={`/games/${game.id}`} className="btn btn-view">
              👁️ Szczegóły
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
