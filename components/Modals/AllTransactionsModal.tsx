import Image from "next/image";
import { useContext, useState } from "react";
import { useNetwork } from "wagmi";

import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { api } from "@/lib/utils";

import TransactionsList from "../TransactionsList";

export default function AllTransactionsModal() {
  const { chain } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);

  const { closeModal } = useContext(ModalContext);

  const { transfers, transfersCursor, setTransfers } = useUserStore();

  const loadMore = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    const { data } = await api().get<TransfersPage>(`/transfers/${chain?.id}`, {
      params: {
        cursor: transfersCursor,
      },
    });

    setTransfers({
      transfers: [...transfers, ...data.transfers],
      cursor: data.cursor,
    });

    setIsLoading(false);
  };

  return (
    <div className="p-8">
      <div className="flex flex-row justify-between">
        <div></div>
        <button onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <section className="flex flex-col items-center">
        <ul className={`mt-12 `}>
          <TransactionsList txns={transfers} />

          {transfersCursor && (
            <li onClick={loadMore} className="underline cursor-pointer">
              Load more
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
