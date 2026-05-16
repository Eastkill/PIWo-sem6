'use client';
import { isConfigured } from '../_lib/firebase';
import Link from 'next/link';

export default function FirebaseGuard({ children }) {
  if (!isConfigured) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '2.5rem',
          maxWidth: '540px',
          width: '100%',
        }}>
          <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🔥</div>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#e03131' }}>
            Firebase nie jest skonfigurowany
          </h2>
          <p style={{ color: '#555', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Brak pliku <code style={{ background: '#f0f0f0', padding: '0.1rem 0.4rem', borderRadius: 3 }}>.env.local</code>{' '}
            z kluczami Firebase. Aby uruchomić aplikację:
          </p>
          <ol style={{ paddingLeft: '1.5rem', color: '#444', lineHeight: 2 }}>
            <li>Utwórz projekt na <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" style={{ color: '#667eea' }}>console.firebase.google.com</a></li>
            <li>Włącz <strong>Firestore Database</strong> i <strong>Authentication</strong> (Google + Email/Password)</li>
            <li>Skopiuj <code>.env.local.example</code> jako <code>.env.local</code></li>
            <li>Uzupełnij wartości z <em>Project Settings → Your apps</em></li>
            <li>Uruchom ponownie <code>npm run dev</code></li>
            <li>Wejdź na <Link href="/admin/seed" style={{ color: '#667eea' }}>/admin/seed</Link> aby załadować przykładowe dane</li>
          </ol>

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#fff3e0',
            borderLeft: '4px solid #ff922b',
            borderRadius: '4px',
            fontSize: '0.9rem',
            color: '#555',
          }}>
            <strong>Reguły Firestore (Development):</strong>
            <pre style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#333' }}>{`rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /games/{id} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.owner_uid;
    }
  }
}`}</pre>
          </div>
        </div>
      </main>
    );
  }

  return children;
}
