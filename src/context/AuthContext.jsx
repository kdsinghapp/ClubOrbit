import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('authToken', token);
        } catch {
          localStorage.removeItem('authToken');
        }
      } else {
        localStorage.removeItem('authToken');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      // loading=true ke dauran user undefined rakho — taaki consumers
      // "auth abhi resolve ho rahi hai" aur "logged out" mein fark kar sakein
      user: loading ? undefined : user,
      loading,
      authError,
      clearAuthError: () => setAuthError(null),
      async loginWithEmail(email, password) {
        setAuthError(null);
        try {
          return await authService.loginWithEmail(email, password);
        } catch (error) {
          setAuthError(error);
          throw error;
        }
      },
      async registerWithEmail(payload) {
        setAuthError(null);
        try {
          return await authService.registerWithEmail(payload);
        } catch (error) {
          setAuthError(error);
          throw error;
        }
      },
      async loginWithGoogle() {
        setAuthError(null);
        try {
          return await authService.loginWithGoogle();
        } catch (error) {
          setAuthError(error);
          throw error;
        }
      },
      async logout() {
        setAuthError(null);
        return authService.logout();
      },
      async getToken(forceRefresh = false) {
        return authService.getIdToken(forceRefresh);
      },
    }),
    [user, loading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  }
  return ctx;
}