import { create } from 'zustand';
import type { User, Session, Subscription } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

let authListenerSubscription: Subscription | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  checkSession: async () => {
    if (!isSupabaseConfigured) {
      set({ loading: false });
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, loading: false });

      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
        authListenerSubscription = null;
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
      });
      authListenerSubscription = subscription;
    } catch {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase não configurado. Verifique o arquivo .env.' };
    }
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }
    set({ session: data.session, user: data.user, loading: false });
    return { error: null };
  },

  signUp: async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase não configurado. Verifique o arquivo .env.' };
    }
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }
    set({ session: data.session, user: data.user, loading: false });
    return { error: null };
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({ user: null, session: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
