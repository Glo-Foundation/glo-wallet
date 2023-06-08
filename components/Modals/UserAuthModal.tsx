import { sequence } from "0xsequence";
import Image from "next/image";
import { useContext } from "react";
import { useConnect } from "wagmi";

import { ModalContext } from "@/lib/context";

export default function UserAuthModal() {
  const { connect, connectors } = useConnect();
  const { closeModal } = useContext(ModalContext);

  return (
    <>
      <section className="flex items-center border-b-2 p-8 bg-pine-100 rounded-xl">
        <Image src="/jeff.svg" alt="glo logo" width={150} height={150} />
        <h1 className="pl-8 text-2xl font-thin">Hey it’s Jeff 👋</h1>
      </section>
      <section>
        <h1 className="flex justify-center">Sign Up</h1>
        <div>
          <button
            className="auth-button"
            onClick={() => {
              connect({ connector: connectors[0] });
              closeModal();
            }}
          >
            Social Login
          </button>

          <button
            className="auth-button"
            onClick={() => {
              connect({ connector: connectors[1] });
              closeModal();
            }}
          >
            Metamask
          </button>

          <button
            className="auth-button"
            onClick={() => {
              connect({ connector: connectors[2] });
              closeModal();
            }}
          >
            WalletConnect
          </button>
        </div>
      </section>
    </>
  );
}
