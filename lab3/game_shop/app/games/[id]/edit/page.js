'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchGame } from '../../../_lib/firestore';
import { useAuth } from '../../../_components/AuthProvider';
import GameForm from '../../../_components/GameForm';

export default function EditGamePage() {
  const { id } = useParams();
  const user   = useAuth();
  const router = useRouter();

  const [game, setGame]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) { router.replace(`/login?from=/games/${id}/edit`); return; }
    if (user === undefined) return;

    fetchGame(id).then(g => { setGame(g); setLoading(false); });
  }, [id, user, router]);

  if (loading || user === undefined) {
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
          <h2>Nie znaleziono gry</h2>
          <Link href="/games" className="btn btn-back" style={{ marginTop: '1rem', display: 'inline-block' }}>
            ← Wróć do listy
          </Link>
        </div>
      </main>
    );
  }

  // Only the owner can edit
  if (game.owner_uid && user.uid !== game.owner_uid) {
    return (
      <main className="main-content" style={{ display: 'block' }}>
        <div className="product-details" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2>Brak dostępu</h2>
          <p style={{ color: '#666', margin: '1rem 0 2rem' }}>
            Możesz edytować tylko własne ogłoszenia.
          </p>
          <Link href={`/games/${id}`} className="btn btn-back">← Wróć do szczegółów</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content" style={{ display: 'block' }}>
      <section className="product-form-section">
        <Link href={`/games/${id}`} className="btn btn-back">← Wróć do szczegółów</Link>
        <h2 style={{ marginTop: '1rem' }}>✏️ Edytuj ogłoszenie</h2>
        <p className="form-subtitle">
          Edytujesz: <strong>{game.title}</strong>
        </p>
        <GameForm game={game} />
      </section>
    </main>
  );
}
