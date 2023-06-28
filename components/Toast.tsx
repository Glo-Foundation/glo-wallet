import Image from "next/image";
import { useState, useEffect } from "react";
import Sheet from "react-modal-sheet";

import { useToastStore } from "@/lib/store";

export default function Toast() {
  const [open, setOpen] = useState(false);

  // Ensure it animates in when loaded
  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <Sheet
      isOpen={open}
      onClose={() => setOpen(false)}
      detent="content-height"
      style={{ maxWidth: "500px", left: "0", right: "0", margin: "auto" }}
      tweenConfig={{ ease: "easeInOut", duration: 1.5 }}
    >
      <Sheet.Container>
        <Sheet.Header
          style={{ cursor: "pointer" }}
          onTap={() => setOpen(false)}
        />
        <Sheet.Content>
          <div className="flex justify-between items-center pb-6 px-8">
            <span>gud news, hullo everyone</span>
          </div>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
}
