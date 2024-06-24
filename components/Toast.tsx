import Image from "next/image";
import { useEffect } from "react";

import { useToastStore } from "@/lib/store";

export default function Toast() {
  const { message, showToast, setShowToast } = useToastStore((store) => ({
    message: store.message,
    showToast: store.showToast,
    setShowToast: store.setShowToast,
  }));

  useEffect(() => {
    if (showToast) {
      setTimeout(() => setShowToast({ showToast: false }), 3000);
    }
  }, [message, showToast]);

  if (!showToast) {
    return null;
  }

  return (
    <div className="flex items-center justify-center">
      <div className="fixed bottom-2 flex items-center justify-center px-3 py-1 rounded copy z-1000 bg-impact-bg">
        <Image alt="checkmark" src="check-alpha.svg" height={12} width={12} />
        <span className="font-semibold ml-2">{message}</span>
      </div>
    </div>
  );
}
