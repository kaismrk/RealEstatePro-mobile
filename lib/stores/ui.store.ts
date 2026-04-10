import { create } from 'zustand';

type DraftValue = string | number | boolean | null | undefined | DraftObject | DraftArray;
interface DraftObject { [key: string]: DraftValue }
type DraftArray = DraftValue[];

export interface OnboardingDraft {
  intent?: 'buy' | 'rent' | 'sell' | 'browse';
  region_id?: number;
  region_label?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
}

interface UIState {
  activeSheet: string | null;
  createListingDraft: DraftObject | null;
  onboardingDraft: OnboardingDraft;
  openSheet: (name: string) => void;
  closeSheet: () => void;
  setDraft: (partial: DraftObject) => void;
  clearDraft: () => void;
  setOnboardingDraft: (partial: OnboardingDraft) => void;
  clearOnboardingDraft: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeSheet: null,
  createListingDraft: null,
  onboardingDraft: {},
  openSheet: (name) => set({ activeSheet: name }),
  closeSheet: () => set({ activeSheet: null }),
  setDraft: (partial) =>
    set((s) => ({
      createListingDraft: s.createListingDraft
        ? { ...s.createListingDraft, ...partial }
        : { ...partial },
    })),
  clearDraft: () => set({ createListingDraft: null }),
  setOnboardingDraft: (partial) =>
    set((s) => ({
      onboardingDraft: { ...s.onboardingDraft, ...partial },
    })),
  clearOnboardingDraft: () => set({ onboardingDraft: {} }),
}));
