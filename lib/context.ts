import { createContext } from "react";

type Actions = {
  openModal: (_content: JSX.Element, _className?: string) => void;
  closeModal: () => void;
};

export const ModalContext = createContext<Actions>({
  openModal: () => null,
  closeModal: () => null,
});
