'use client';
import { useState } from 'react';
import { seedFromApi } from '../../_lib/firestore';
import { useAuth } from '../../_components/AuthProvider';
import Link from 'next/link';

export default function SeedPage() {
  const user    = useAuth();
  const [status, setStatus]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSeed() {
    if (!window.confirm(
      'Spowoduje to dodanie gier z zewnętrznego API do Firestore.\n' +
      'Uruchamiaj tylko raz, aby uniknąć duplikatów.\nKontynuować?'
    )) return;

    setLoading(true);
    setStatus('⏳ Pobieranie danych z API...');
    try {
      const { ok, fail } = await seedFromApi();
      setStatus(`✅ Gotowe! Dodano: ${ok} gier. Błędy: ${fail}.`);
    } catch (err) {
      setStatus(`❌ Błąd: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="main-content" style={{ display: 'block' }}>
        <div className="product-details" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Musisz być zalogowany</h2>
          <Link href="/login?from=/admin/seed" className="btn btn-view" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Zaloguj się
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content" style={{ display: 'block' }}>
      <div className="product-details">
        <h2 style={{ marginBottom: '1rem' }}>🌱 Seed Firestore</h2>
        <p style={{ color: '#666', marginBottom: '0.5rem' }}>
          Ta strona importuje przykładowe dane z API do kolekcji{' '}
          <code style={{ background: '#f0f0f0', padding: '0.2rem 0.4rem', borderRadius: 3 }}>games</code>{' '}
          w Firestore.
        </p>
        <p style={{ color: '#e67700', marginBottom: '2rem', fontSize: '0.9rem' }}>
          ⚠️ Uruchamiaj tylko raz! Każde kliknięcie doda kolejną kopię danych.
        </p>

        <button
          className="btn btn-add-product"
          onClick={handleSeed}
          disabled={loading}
          style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}
        >
          {loading ? '⏳ Importowanie...' : '🌱 Importuj dane z API'}
        </button>

        {status && (
          <p style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: status.startsWith('✅') ? '#ebfbee' : status.startsWith('❌') ? '#fff5f5' : '#e7f5ff',
            borderRadius: '6px',
            color: status.startsWith('✅') ? '#2f9e44' : status.startsWith('❌') ? '#e03131' : '#1971c2',
          }}>
            {status}
          </p>
        )}

        <p style={{ marginTop: '2rem' }}>
          <Link href="/games" className="btn btn-back">← Wróć do sklepu</Link>
        </p>
      </div>
    </main>
  );
}
