import { useState } from "react";
import { useNetwork } from "wagmi";

import { useUserStore } from "@/lib/store";
import { api } from "@/lib/utils";

import { TransactionsList } from "../TransactionsList";

export default function TransfersModal() {
  const { chain } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);

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
    <section className="pt-0 p-8 flex flex-col items-center">
      <ul className={`mt-12 `}>
        <TransactionsList txns={transfers} />

        {transfersCursor && (
          <li onClick={loadMore} className="cursor-pointer">
            Load more
          </li>
        )}
      </ul>
    </section>
  );
}
