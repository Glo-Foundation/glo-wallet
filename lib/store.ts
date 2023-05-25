import { create } from "zustand";

interface UserStore {
  transfers: Transfer[];
  ctas: CTA[];
  setTransfers: (transfers: Transfer[]) => void;
  setCTAs: (ctas: CTA[]) => void;
}
export const useUserStore = create<UserStore>((set) => ({
  transfers: [],
  ctas: [],
  setTransfers: (transfers: Transfer[]) => set(() => ({ transfers })),
  setCTAs: (ctas: CTA[]) => set(() => ({ ctas })),
}));
