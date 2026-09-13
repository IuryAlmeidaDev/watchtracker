import { create } from 'zustand';

export const useExpansionStore = create<{ activeId: string | null; setActive: (id: string | null) => void }>((set) => ({
  activeId: null,
  setActive: (activeId) => set({ activeId }),
}));

export function useWatchExpansion(id: string) {
  const activeId = useExpansionStore(state => state.activeId);
  const setActive = useExpansionStore(state => state.setActive);
  return { open: activeId === id, setOpen: (open: boolean) => setActive(open ? id : null) };
}
