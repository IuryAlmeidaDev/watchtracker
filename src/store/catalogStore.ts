import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { watches as initialLocalWatches, type Watch } from '../data/watches';
import type { WatchRecord } from '../types/database';

export interface WatchItem {
  id: string;
  brand: string;
  model: string;
  priceEstimate: string;
  specs: string;
  storeName: string | null;
  storeUrl: string | null;
  images: string[];
}

interface CatalogState {
  watches: WatchItem[];
  rankingIds: string[];
  collectionIds: string[];
  loading: boolean;
  syncError: boolean;
  loadData: (userId?: string) => Promise<void>;
  addToRanking: (watchId: string, userId?: string) => Promise<void>;
  removeFromRanking: (watchId: string, userId?: string) => Promise<void>;
  reorderRanking: (activeId: string, overId: string, userId?: string) => Promise<void>;
  addToCollection: (watchId: string, userId?: string) => Promise<void>;
  removeFromCollection: (watchId: string, userId?: string) => Promise<void>;
  moveToCollection: (watchId: string, userId?: string) => Promise<void>;
}

function mapLegacyWatch(w: Watch): WatchItem {
  return {
    id: w.id,
    brand: w.marca,
    model: w.nome,
    priceEstimate: typeof w.preco === 'number' ? `≈ R$ ${w.preco}` : `R$ ${w.preco.min}–R$ ${w.preco.max}`,
    specs: w.especificacoes,
    storeName: w.loja,
    storeUrl: w.url ?? null,
    images: w.imagem ? [w.imagem] : [],
  };
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  watches: initialLocalWatches.map(mapLegacyWatch),
  rankingIds: initialLocalWatches.map((w) => w.id),
  collectionIds: [],
  loading: false,
  syncError: false,

  loadData: async (userId) => {
    set({ loading: true, syncError: false });

    // Fallback se o Supabase não estiver configurado ou usuário não logado
    if (!isSupabaseConfigured) {
      if (!userId) {
        set({
          rankingIds: initialLocalWatches.map((w) => w.id),
          collectionIds: [],
        });
      }
      set({ loading: false });
      return;
    }

    try {
      // 1. Carregar catálogo público e imagens
      const { data: dbWatches, error: watchesError } = await supabase
        .from('watches')
        .select(`
          id, brand, model, reference, price_estimate, specs, store_name, store_url, created_at,
          watch_images ( image_url, display_order, is_cover )
        `)
        .order('brand', { ascending: true });

      if (watchesError) {
        set({ syncError: true });
      } else if (dbWatches && dbWatches.length > 0) {
        const formatted: WatchItem[] = (dbWatches as (WatchRecord & { watch_images: { image_url: string; display_order: number }[] })[]).map((w) => ({
          id: w.id,
          brand: w.brand,
          model: w.model,
          priceEstimate: w.price_estimate,
          specs: w.specs,
          storeName: w.store_name,
          storeUrl: w.store_url,
          images: w.watch_images
            ? w.watch_images.sort((a, b) => a.display_order - b.display_order).map((img) => img.image_url)
            : [],
        }));
        set({ watches: formatted });
      }

      // 2. Se o usuário estiver logado, carregar seu ranking e coleção; caso contrário, resetar para o padrão
      if (userId) {
        const [rankingRes, collectionRes] = await Promise.all([
          supabase.from('user_rankings').select('watch_id, position').eq('user_id', userId).order('position'),
          supabase.from('user_collections').select('watch_id').eq('user_id', userId),
        ]);

        if (rankingRes.error || collectionRes.error) {
          set({ syncError: true });
        }
        if (rankingRes.data) {
          set({ rankingIds: rankingRes.data.map((r) => r.watch_id) });
        }
        if (collectionRes.data) {
          set({ collectionIds: collectionRes.data.map((c) => c.watch_id) });
        }
      } else {
        set({
          rankingIds: initialLocalWatches.map((w) => w.id),
          collectionIds: [],
        });
      }
    } catch {
      set({ syncError: true });
    } finally {
      set({ loading: false });
    }
  },

  addToRanking: async (watchId, userId) => {
    const current = get().rankingIds;
    if (current.includes(watchId)) return;

    const updated = [...current, watchId];
    set({ rankingIds: updated });

    if (userId && isSupabaseConfigured) {
      const position = updated.length;
      const { error } = await supabase.from('user_rankings').insert({
        user_id: userId,
        watch_id: watchId,
        position,
      });
      if (error) set({ syncError: true });
    }
  },

  removeFromRanking: async (watchId, userId) => {
    const current = get().rankingIds;
    const updated = current.filter((id) => id !== watchId);
    set({ rankingIds: updated });

    if (userId && isSupabaseConfigured) {
      const { error } = await supabase.from('user_rankings').delete().eq('user_id', userId).eq('watch_id', watchId);
      if (error) set({ syncError: true });
    }
  },

  reorderRanking: async (activeId, overId, userId) => {
    const current = get().rankingIds;
    const from = current.indexOf(activeId);
    const to = current.indexOf(overId);

    if (from < 0 || to < 0 || from === to) return;

    const newOrder = arrayMove(current, from, to);
    set({ rankingIds: newOrder });

    if (userId && isSupabaseConfigured) {
      try {
        const updates = newOrder.map((id, index) => ({
          user_id: userId,
          watch_id: id,
          position: index + 1,
        }));
        const { error } = await supabase.from('user_rankings').upsert(updates, { onConflict: 'user_id,watch_id' });
        if (error) set({ syncError: true });
      } catch {
        set({ syncError: true });
      }
    }
  },

  addToCollection: async (watchId, userId) => {
    const current = get().collectionIds;
    if (current.includes(watchId)) return;

    const updated = [...current, watchId];
    set({ collectionIds: updated });

    if (userId && isSupabaseConfigured) {
      const { error } = await supabase.from('user_collections').insert({
        user_id: userId,
        watch_id: watchId,
      });
      if (error) set({ syncError: true });
    }
  },

  removeFromCollection: async (watchId, userId) => {
    const current = get().collectionIds;
    const updated = current.filter((id) => id !== watchId);
    set({ collectionIds: updated });

    if (userId && isSupabaseConfigured) {
      const { error } = await supabase.from('user_collections').delete().eq('user_id', userId).eq('watch_id', watchId);
      if (error) set({ syncError: true });
    }
  },

  moveToCollection: async (watchId, userId) => {
    await get().removeFromRanking(watchId, userId);
    await get().addToCollection(watchId, userId);
  },
}));
