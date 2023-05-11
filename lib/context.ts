import { createContext } from "react";

export const ModalContext = createContext({
  openModal: (content: JSX.Element) => {},
  closeModal: () => {},
});
