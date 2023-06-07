import { create } from "zustand";

interface UserStore {
  email: string;
  transfers: Transfer[];
  ctas: CTA[];
  setTransfers: (transfers: Transfer[]) => void;
  setCTAs: (ctas: CTA[]) => void;
}
export const useUserStore = create<UserStore>((set) => ({
  email: undefined,
  transfers: [],
  ctas: [],
  setTransfers: (transfers: Transfer[]) => set(() => ({ transfers })),
  setCTAs: (ctas: CTA[]) => set(() => ({ ctas })),
  setEmail: (email: string) => set(() => ({ email })),
}));
