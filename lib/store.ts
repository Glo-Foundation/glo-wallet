import { create } from "zustand";

interface UserStore {
  email: string | undefined;
  avatar: string | undefined;
  transfers: Transfer[];
  transfersCursor: string | null;
  ctas: CTA[];
  setTransfers: (transfers: TransfersPage) => void;
  setCTAs: (ctas: CTA[]) => void;
  setAvatar: (avatar: string) => void;
}
export const useUserStore = create<UserStore>((set) => ({
  email: undefined,
  avatar: undefined,
  transfers: [],
  transfersCursor: null,
  ctas: [],
  setTransfers: (page: TransfersPage) =>
    set(() => ({ transfers: page.transfers, transfersCursor: page.cursor })),
  setCTAs: (ctas: CTA[]) => set(() => ({ ctas })),
  setAvatar: (avatar: string) => set(() => ({ avatar })),
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
