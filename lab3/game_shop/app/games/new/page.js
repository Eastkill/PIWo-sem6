'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../_components/AuthProvider';
import GameForm from '../../_components/GameForm';

export default function NewGamePage() {
  const user   = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace('/login?from=/games/new');
  }, [user, router]);

  if (user === undefined || user === null) {
    return <div className="loading-state">⏳ Sprawdzanie uprawnień...</div>;
  }

  return (
    <main className="main-content" style={{ display: 'block' }}>
      <section className="product-form-section">
        <h2>➕ Dodaj nowe ogłoszenie</h2>
        <p className="form-subtitle">
          Wypełnij formularz, aby wystawić grę na sprzedaż lub aukcję.
          Dane zostaną zapisane w Firestore.
        </p>
        <GameForm />
      </section>
    </main>
  );
}
