import { useState, useEffect } from "react";
import Sheet from "react-modal-sheet";

import { useToastStore } from "@/lib/store";

export default function Toast() {
  const { message, showToast, setShowToast } = useToastStore((store) => ({
    message: store.message,
    showToast: store.showToast,
    setShowToast: store.setShowToast,
  }));
  const [open, setOpen] = useState(false);

  // Ensure it animates in when loaded
  useEffect(() => {
    showToast && setOpen(true);
  }, [message, showToast]);

  const handleCLose = () => {
    setOpen(false);
    setShowToast({ showToast: false });
  };

  return (
    <Sheet
      isOpen={open}
      onClose={handleCLose}
      detent="content-height"
      style={{
        maxWidth: "500px",
        left: "0",
        right: "0",
        margin: "auto",
        overflow: "visible",
      }}
      tweenConfig={{ ease: "easeInOut", duration: 1.5 }}
    >
      <Sheet.Container>
        <Sheet.Header style={{ cursor: "pointer" }} onTap={handleCLose} />
        <Sheet.Content>
          <div className="flex justify-between items-center pb-6 px-8 copy z-90">
            <span className="font-semibold">{message}</span>
          </div>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
}
