import { createContext } from "react";

type Actions = {
  openModal: (_content: JSX.Element) => void;
  closeModal: () => void;
};

export const ModalContext = createContext<Actions>({
  openModal: () => null,
  closeModal: () => null,
});
