import { useRouter } from "next/router";
import { useEffect } from "react";

// Generic callback URL to reload the balance and ctas
export default function PurchasedCallback() {
  useEffect(() => {
    const bc = new BroadcastChannel("glo-channel-purchased");
    bc.postMessage({ success: true });
    window.close();
    const closed = window.closed;
    if (!closed) {
      push("/");
    }
  }, []);

  const { push } = useRouter();

  // Fallback in case window is not closed automagically
  return (
    <>
      <div>Payment completed</div>
      <div className="cursor-pointer" onClick={() => push("/")}>
        Click close to continue
      </div>
    </>
  );
}
