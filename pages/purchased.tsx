import { useRouter } from "next/router";
import { useEffect } from "react";

export default function PurchasedCallback() {
  useEffect(() => {
    window.close();
    const closed = window.closed;
    if (!closed) {
      push("/buy");
    }
  }, []);

  const { push } = useRouter();

  // Fallback in case window is not closed automagically
  return (
    <>
      <div>Click close to continue Successfully bought USDC.</div>
      <div>Return to the app to exchange your USDC for Glo Dollars.</div>
      <div className="cursor-pointer" onClick={() => push("/buy")}>
        [Return to app]
      </div>
      This page will auto-redirect in 3 seconds.
    </>
  );
}
