'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { logout } from '../_lib/auth';

export default function Header() {
  const user   = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/games');
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/games" className="logo-link">
          <div className="logo-section">
            <h1 className="logo">Planszland</h1>
            <p className="tagline">Sklep z grami planszowymi</p>
          </div>
        </Link>

        <div className="header-actions">
          <button className="btn btn-cart">
            🛒 Koszyk <span className="cart-count">0</span>
          </button>

          <div className="auth-buttons">
            {user === undefined ? (
              /* loading – nic nie pokazujemy */
              null
            ) : user ? (
              <>
                <span style={{
                  color: 'white',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}>
                  👤 {user.displayName || user.email}
                </span>
                <button className="btn btn-logout" onClick={handleLogout}>
                  Wyloguj się
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-login">Zaloguj się</Link>
                <Link href="/login?tab=register" className="btn btn-register">Zarejestruj się</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
