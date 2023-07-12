import { useContext } from "react";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";

import TransactionDetailsModal from "./Modals/TransactionDetailsModal";

export const TransactionsList = ({
  txns,
  chain,
}: {
  txns: Transfer[];
  chain: number;
}) => {
  const { openModal } = useContext(ModalContext);

  return (
    <>
      {txns.map((txn, idx) => {
        const dateTokens = new Date(txn.ts).toDateString().split(" ");
        const txnDate = dateTokens[1] + " " + dateTokens[2];

        const counterParty = txn.type === "outgoing" ? txn.to : txn.from;
        return (
          <li
            key={`txn-${idx}`}
            className="transaction-item"
            onClick={() =>
              openModal(
                <TransactionDetailsModal
                  chain={chain}
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
                {txn.type === "outgoing" ? "Sent to " : "Received from"}{" "}
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
          </li>
        );
      })}
    </>
  );
};
