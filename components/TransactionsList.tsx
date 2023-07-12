import Link from "next/link";

import { getChainExplorerUrl } from "@/lib/config";
import { sliceAddress } from "@/lib/utils";

export const TransactionsList = ({
  txns,
  chain,
}: {
  txns: Transfer[];
  chain: number;
}) => (
  <>
    {txns.map((txn, idx) => {
      const dateTokens = new Date(txn.ts).toDateString().split(" ");
      const txnDate = dateTokens[1] + " " + dateTokens[2];
      const scannerUrl = getChainExplorerUrl(chain);
      const counterParty = txn.type === "outgoing" ? txn.to : txn.from;
      return (
        <li key={`txn-${idx}`} className="transaction-item">
          <div>
            <Link
              href={`${scannerUrl}/address/${counterParty}`}
              target="_blank"
            >
              <p>
                {txn.type === "outgoing" ? "Sent to " : "Received from"}{" "}
                {sliceAddress(counterParty)}
              </p>
              <p className="copy">{txnDate}</p>
            </Link>
          </div>
          <div>
            <b>
              <Link href={`${scannerUrl}/tx/${txn.hash}`} target="_blank">
                <span>{txn.type === "outgoing" ? "-" : "+"}</span>
                <span>
                  {new Intl.NumberFormat("en-En", {
                    style: "currency",
                    currency: "USD",
                  }).format(txn.value as number)}
                </span>
              </Link>
            </b>
          </div>
        </li>
      );
    })}
  </>
);
