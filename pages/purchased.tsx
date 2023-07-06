import { useEffect } from "react";

// Generic callback URL to reload the balance and ctas
export default function PurchasedCallback() {
  useEffect(() => {
    const bc = new BroadcastChannel("glo-channel-purchased");
    bc.postMessage({ success: true });
    window.close();
  }, []);

  // Fallback in case window is not closed automagically
  return (
    <>
      <div>Payment completed</div>
      <div onClick={() => window.close()}>Click close to continue</div>
    </>
  );
}
