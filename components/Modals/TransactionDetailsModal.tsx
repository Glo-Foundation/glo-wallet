import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";

import { getChainExplorerUrl } from "@/lib/config";
import { ModalContext } from "@/lib/context";

export default function TransactionDetailsModal({
  chain,
  type,
  ts,
  value,
  from,
  to,
  hash,
}: {
  chain: number;
  type: string;
  ts: string;
  value: string;
  from: string;
  to: string;
  hash: string;
}) {
  const { closeModal } = useContext(ModalContext);
  const scannerUrl = getChainExplorerUrl(chain);
  const counterParty = type === "outgoing" ? to : from;
  const dateTokens = new Date(ts).toDateString().split(" ");
  const txnDate = dateTokens[1] + " " + dateTokens[2];
  return (
    <div className="p-4">
      <div className="flex flex-row justify-between">
        <div></div>
        <button className="" onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <div>
        <p className="mb-2">
          <b>{type === "outgoing" ? "Sent to" : "From"} </b>
        </p>
        <p className="mb-6">
          <Link href={`${scannerUrl}/address/${counterParty}`} target="_blank">
            {counterParty}
          </Link>
        </p>
        <div className="text-2xl mt-6 mb-4">
          <b>
            <span>{type === "outgoing" ? "-" : "+"}</span>
            <span>
              {new Intl.NumberFormat("en-En", {
                style: "currency",
                currency: "USD",
              }).format(parseFloat(value))}
            </span>
          </b>
        </div>
        <p className="copy my-4">{txnDate}</p>
        <Link
          href={`${scannerUrl}/tx/${hash}`}
          target="_blank"
          className="text-sm"
        >
          View on Explorer
        </Link>
      </div>
    </div>
  );
}
