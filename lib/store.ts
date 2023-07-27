import { create } from "zustand";

interface UserStore {
  email: string | undefined;
  transfers: Transfer[];
  transfersCursor: string | null;
  ctas: CTA[];
  buyCheckDone: boolean;
  setTransfers: (transfers: TransfersPage) => void;
  setCTAs: (ctas: CTA[]) => void;
  setBuyCheckDone: (check: boolean) => void;
}
export const useUserStore = create<UserStore>((set) => ({
  email: undefined,
  transfers: [],
  transfersCursor: null,
  ctas: [],
  setTransfers: (page: TransfersPage) =>
    set(() => ({ transfers: page.transfers, transfersCursor: page.cursor })),
  setCTAs: (ctas: CTA[]) => set(() => ({ ctas })),
  setEmail: (email: string) => set(() => ({ email })),
  setBuyCheckDone: (buyCheckDone: boolean) => set(() => ({ buyCheckDone })),
}));

interface ToastType {
  showToast: boolean;
  message?: string;
}

interface ToastStore extends ToastType {
  setShowToast: (values: ToastType) => void;
}

const defaultToastValues = {
  showToast: false,
  message: "",
};

export const useToastStore = create<ToastStore>((set, get) => ({
  ...defaultToastValues,
  setShowToast: (values: ToastType) => set({ ...get(), ...values }),
}));
