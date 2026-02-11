import React, { createContext, useContext, useEffect, useState } from 'react';
import * as auth from '../core/supabase/auth';
import type { User } from '@supabase/supabase-js';

type AuthState = { user: User } | null;

interface AuthContextValue {
  session: AuthState;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthState>(null);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    setConfigured(auth.isSupabaseConfigured());
    if (!auth.isSupabaseConfigured()) return;

    auth.getSession().then((s) => {
      if (s) setSession({ user: s.user });
    });

    const unsubscribe = auth.onAuthStateChange((s) => setSession(s));
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => auth.signIn(email, password);
  const signUp = async (email: string, password: string, displayName?: string) =>
    auth.signUp(email, password, { displayName });
  const signOut = async () => {
    await auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        signIn,
        signUp,
        signOut,
        isConfigured: configured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      session: null,
      signIn: async () => ({ error: new Error('Auth not configured') }),
      signUp: async () => ({ error: new Error('Auth not configured') }),
      signOut: async () => {},
      isConfigured: false,
    };
  }
  return ctx;
}
