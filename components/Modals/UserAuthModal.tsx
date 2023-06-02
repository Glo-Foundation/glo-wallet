import { useConnect } from "wagmi";

export default function UserAuthModal() {
  const { connect, connectors } = useConnect();

  return (
    <>
      <button
        className="primary-button"
        onClick={() => connect({ connector: connectors[0] })}
      >
        Social
      </button>

      <button
        className="primary-button"
        onClick={() => connect({ connector: connectors[1] })}
      >
        Metamask
      </button>

      <button
        className="primary-button"
        onClick={() => connect({ connector: connectors[2] })}
      >
        WC
      </button>
    </>
  );
}
