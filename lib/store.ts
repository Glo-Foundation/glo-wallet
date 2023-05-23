import { create } from "zustand";

interface UserStore {
  transfers: Transfer[];
  actions: Action[];
  setTransfers: (transfers: Transfer[]) => void;
  setActions: (actions: Action[]) => void;
}
export const useUserStore = create<UserStore>((set) => ({
  transfers: [],
  actions: [],
  setTransfers: (transfers: Transfer[]) => set(() => ({ transfers })),
  setActions: (actions: Action[]) => set(() => ({ actions })),
}));
