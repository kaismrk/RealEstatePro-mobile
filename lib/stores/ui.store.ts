import { create } from 'zustand';

type DraftValue = string | number | boolean | null | undefined | DraftObject | DraftArray;
interface DraftObject { [key: string]: DraftValue }
type DraftArray = DraftValue[];

interface UIState {
  activeSheet: string | null;
  createListingDraft: DraftObject | null;
  openSheet: (name: string) => void;
  closeSheet: () => void;
  setDraft: (partial: DraftObject) => void;
  clearDraft: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeSheet: null,
  createListingDraft: null,
  openSheet: (name) => set({ activeSheet: name }),
  closeSheet: () => set({ activeSheet: null }),
  setDraft: (partial) =>
    set((s) => ({
      createListingDraft: s.createListingDraft
        ? { ...s.createListingDraft, ...partial }
        : { ...partial },
    })),
  clearDraft: () => set({ createListingDraft: null }),
}));
