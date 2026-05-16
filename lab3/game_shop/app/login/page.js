'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../_lib/auth';
import { useAuth } from '../_components/AuthProvider';

export default function LoginPage() {
  const user   = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [tab, setTab]         = useState('login'); // 'login' | 'register'
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [name, setName]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const returnTo = params.get('from') || '/games';

  useEffect(() => {
    if (user) router.replace(returnTo);
  }, [user, router, returnTo]);

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
      router.replace(returnTo);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      router.replace(returnTo);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  if (user === undefined) return <div className="loading-state">⏳ Ładowanie...</div>;

  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '2rem',
        width: '100%',
        maxWidth: '420px',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>
          🎲 Planszland
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e9ecef', marginBottom: '1.5rem' }}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              style={{
                flex: 1,
                padding: '0.7rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: tab === t ? 700 : 400,
                color: tab === t ? '#667eea' : '#666',
                borderBottom: tab === t ? '2px solid #667eea' : '2px solid transparent',
                marginBottom: '-2px',
                fontSize: '0.95rem',
              }}
            >
              {t === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
            </button>
          ))}
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="btn"
          style={{
            width: '100%',
            background: 'white',
            border: '1px solid #dee2e6',
            color: '#333',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.6 33.6 30 36.5 24 36.5c-6.9 0-12.5-5.6-12.5-12.5S17.1 11.5 24 11.5c3.1 0 5.8 1.2 8 3l6-6C34.5 5 29.5 3 24 3 12.7 3 3.5 12.2 3.5 23.5S12.7 44 24 44c11 0 20.5-8 20.5-20.5 0-1.4-.1-2.7-.5-3.5z"/>
          </svg>
          Kontynuuj z Google
        </button>

        <div style={{ textAlign: 'center', color: '#adb5bd', marginBottom: '1rem', fontSize: '0.85rem' }}>
          — lub —
        </div>

        {/* Form */}
        <form onSubmit={handleEmailSubmit}>
          {tab === 'register' && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="name">Imię (opcjonalnie)</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Twoje imię"
              />
            </div>
          )}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="adres@email.com"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password">Hasło</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPass(e.target.value)}
              placeholder="minimum 6 znaków"
            />
          </div>

          {error && (
            <div style={{
              background: '#fff5f5',
              border: '1px solid #ffc9c9',
              borderRadius: '4px',
              padding: '0.7rem 1rem',
              color: '#e03131',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-submit"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
          >
            {loading
              ? '⏳ Proszę czekać...'
              : tab === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
          <Link href="/games" style={{ color: '#667eea' }}>← Wróć do sklepu</Link>
        </p>
      </div>
    </main>
  );
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found':       'Nie znaleziono konta o podanym e-mailu.',
    'auth/wrong-password':       'Nieprawidłowe hasło.',
    'auth/invalid-credential':   'Nieprawidłowy e-mail lub hasło.',
    'auth/email-already-in-use': 'Ten e-mail jest już zarejestrowany.',
    'auth/weak-password':        'Hasło jest za słabe (min. 6 znaków).',
    'auth/invalid-email':        'Nieprawidłowy format adresu e-mail.',
    'auth/popup-closed-by-user': 'Zamknięto okno logowania.',
    'auth/network-request-failed': 'Błąd sieci. Sprawdź połączenie z internetem.',
  };
  return map[code] ?? `Błąd logowania (${code}).`;
}
