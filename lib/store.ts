import { create } from "zustand";

interface UserStore {
  email: string | undefined;
  transfers: Transfer[];
  transfersCursor: string | null;
  ctas: CTA[];
  setTransfers: (transfers: TransfersPage) => void;
  setCTAs: (ctas: CTA[]) => void;
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
}));

interface ToastType {
  showToast: boolean;
  toastMessage: string;
  toastIcon: JSX.Element | React.FC | null;
}

interface ToastStore extends ToastType {
  setShowToast: (values: ToastType) => void;
}

export const defaultToastValues = {
  showToast: false,
  toastMessage: "",
  toastIcon: null,
};

export const useToastStore = create<ToastStore>((set, get) => ({
  ...defaultToastValues,
  setShowToast: (values: ToastType) => set({ ...get(), ...values }),
}));
