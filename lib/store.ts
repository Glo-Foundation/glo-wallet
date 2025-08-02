import { create } from "zustand";

interface UserStore {
  email: string | undefined;
  transfers: Transfer[];
  transfersCursor: string | null;
  ctas: CTA[];
  isRecipientsView: boolean;
  wcState?: WC_STATE;
  veBalanceRefresher: number;
  setTransfers: (transfers: TransfersPage) => void;
  setCTAs: (ctas: CTA[]) => void;
  setRecipientsView: (recipientsView: boolean) => void;
  setWcState: (wcState: WC_STATE) => void;
  refreshVeBalance: () => void;
}
export const useUserStore = create<UserStore>((set) => ({
  email: undefined,
  transfers: [],
  transfersCursor: null,
  ctas: [],
  isRecipientsView: false,
  wcState: undefined,
  veBalanceRefresher: Date.now(),
  setTransfers: (page: TransfersPage) =>
    set(() => ({ transfers: page.transfers, transfersCursor: page.cursor })),
  setCTAs: (ctas: CTA[]) => set(() => ({ ctas })),
  setEmail: (email: string) => set(() => ({ email })),
  setRecipientsView: (isRecipientsView: boolean) =>
    set(() => ({ isRecipientsView })),
  setWcState: (wcState: WC_STATE) => set(() => ({ wcState })),
  refreshVeBalance: () => ({ veBalanceRefresher: Date.now() }),
}));

interface ToastType {
  showToast: boolean;
  message?: string | JSX.Element;
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
