import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import { watches } from '../data/watches';

export function reconcileOrder(saved: unknown, ids = watches.map(w => w.id)): string[] {
  const valid = Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string' && ids.includes(id)) : [];
  return [...new Set([...valid, ...ids])];
}

type WatchState = {
  order: string[];
  storageError: boolean;
  move: (active: string, over: string) => void;
};

const storage = createJSONStorage(() => ({
  getItem: (key: string) => { try { return localStorage.getItem(key); } catch { return null; } },
  setItem: (key: string, value: string) => {
    try { localStorage.setItem(key, value); }
    catch { queueMicrotask(() => { if (!useWatchStore.getState().storageError) useWatchStore.setState({ storageError: true }); }); }
  },
  removeItem: (key: string) => { localStorage.removeItem(key); },
}));

export const useWatchStore = create<WatchState>()(persist((set) => ({
  order: watches.map(w => w.id),
  storageError: false,
  move: (active, over) => set(state => {
    const order = reconcileOrder(state.order);
    const from = order.indexOf(active), to = order.indexOf(over);
    return from < 0 || to < 0 || from === to ? state : { order: arrayMove(order, from, to) };
  }),
}), {
  name: 'watchtracker-ranking', version: 1, storage,
  partialize: state => ({ order: state.order }),
  merge: (saved, current) => ({ ...current, order: reconcileOrder((saved as { order?: unknown } | undefined)?.order) }),
}));
