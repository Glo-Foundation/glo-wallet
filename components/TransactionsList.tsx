import { motion } from "framer-motion";
import { useContext } from "react";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";

import TransactionDetailsModal from "./Modals/TransactionDetailsModal";

export default function TransactionsList({
  txns,
  chain,
  isOpen,
}: {
  txns: Transfer[];
  chain: number | undefined;
  isOpen: boolean;
}) {
  const variants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { y: { stiffness: 1000, velocity: -100 } },
    },
    closed: {
      x: 50,
      opacity: 0,
      transition: { y: { stiffness: 1000 } },
    },
  };

  const { openModal } = useContext(ModalContext);

  const renderTxns = (txns: Transfer[]) =>
    txns.map((txn, idx) => {
      const dateTokens = new Date(txn.ts).toDateString().split(" ");
      const txnDate = dateTokens[1] + " " + dateTokens[2];
      const counterParty = txn.type === "outgoing" ? txn.to : txn.from;

      return (
        <motion.li
          key={`txn-${idx}`}
          className="transaction-item"
          variants={variants}
          onClick={() =>
            isOpen &&
            openModal(
              <TransactionDetailsModal
                chain={chain || 137}
                type={txn.type}
                ts={txn.ts}
                value={txn.value.toString()}
                from={txn.from}
                to={txn.to}
                hash={txn.hash}
              />
            )
          }
        >
          <div>
            <p>
              {txn.type === "outgoing" ? "Sent to " : "From"}{" "}
              {sliceAddress(counterParty)}
            </p>
            <p className="copy">{txnDate}</p>
          </div>
          <div>
            <b>
              <span>{txn.type === "outgoing" ? "-" : "+"}</span>
              <span>
                {new Intl.NumberFormat("en-En", {
                  style: "currency",
                  currency: "USD",
                }).format(txn.value as number)}
              </span>
            </b>
          </div>
        </motion.li>
      );
    });

  return <>{renderTxns(txns)}</>;
}
