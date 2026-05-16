'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isConfigured } from '../_lib/firebase';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  // undefined = loading, null = not logged in, object = logged-in user
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (!isConfigured) { setUser(null); return; }
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
