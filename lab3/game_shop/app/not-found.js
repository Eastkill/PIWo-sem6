import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="main-content" style={{ display: 'block' }}>
      <div className="product-details" style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎲</div>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Nie znaleziono strony</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Szukana strona nie istnieje lub została przeniesiona.
        </p>
        <Link href="/games" className="btn btn-view">
          ← Wróć do listy gier
        </Link>
      </div>
    </main>
  );
}
