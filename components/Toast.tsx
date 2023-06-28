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
    <Sheet isOpen={open}>
      <Sheet.Container>
        <Sheet.Header />
        <Sheet.Content>
          gud news, hullo everyone
          <button className="secondary-button" onClick={() => setOpen(false)}>
            Dismiss
          </button>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
}
