import Image from "next/image";
import { useConnect } from "wagmi";

export default function UserAuthModal() {
  const { connect, connectors } = useConnect();

  return (
    <>
      <section className="flex items-center border-b-2 p-8 bg-pine-100 rounded-xl">
        <Image src="/jeff.svg" alt="glo logo" width={196} height={196} />
        <h1 className="pl-8 text-2xl font-thin">Hey it’s Jeff 👋</h1>
      </section>
      <section>
        <h1 className="flex justify-center">Sign Up</h1>
        <div>
          <button
            className="auth-button"
            onClick={() => connect({ connector: connectors[0] })}
          >
            Social
          </button>

          <button
            className="auth-button"
            onClick={() => connect({ connector: connectors[1] })}
          >
            Metamask
          </button>

          <button
            className="auth-button"
            onClick={() => connect({ connector: connectors[2] })}
          >
            WC
          </button>
        </div>
      </section>
    </>
  );
}
