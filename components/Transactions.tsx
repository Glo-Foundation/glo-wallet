import { motion, useCycle } from "framer-motion";
import Image from "next/image";
import { useContext } from "react";
import { useAccount, useNetwork } from "wagmi";

import BuyGloModal from "@/components/Modals/BuyGloModal";
import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";

import AllTransactionsModal from "./Modals/AllTransactionsModal";
import UserAuthModal from "./Modals/UserAuthModal";
import TransactionsList from "./TransactionsList";

export default function Transactions() {
  const { transfers } = useUserStore();
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const { openModal: open } = useContext(ModalContext);

  const [isOpen, toggleOpen] = useCycle(false, true);

  const openModal = (content: JSX.Element, className?: string | undefined) => {
    if (isOpen) {
      open(content, className);
    }
  };

  const variants = () => {
    const height = `${5 * 85}px`;
    return {
      open: {
        transition: { staggerChildren: 0.07, delayChildren: 0.2 },
        height,
        margin: "24px 0 0 0",
      },
      closed: {
        transition: { staggerChildren: 0.05, staggerDirection: -1, delay: 0.2 },
        height: "0px",
      },
    };
  };
  const allTxnsVariants = {
    open: {
      opacity: 1,
    },
    closed: {
      opacity: 0,
    },
  };

  return (
    <motion.div
      className="bg-white rounded-[20px] p-8"
      animate={isConnected && isOpen ? "open" : "closed"}
      initial={false}
      onClick={() => transfers?.length && toggleOpen()}
    >
      <div className="flex justify-between cursor-default">
        <h3>Transactions</h3>
        <button>
          {isConnected && (
            <Image
              className="cursor-pointer"
              src={`/${isOpen ? "up" : "down"}-caret.svg`}
              width={14}
              height={14}
              alt="down-arrow"
            />
          )}
        </button>
      </div>
      <div
        className={`${
          isConnected && !transfers.length
            ? "mt-6 max-h-6 opacity-100"
            : "max-h-0 invisible opacity-0"
        }
        text-sm `}
      >
        <span> No transactions yet - </span>
        <button
          className="inline cursor-pointer hover:decoration-solid text-blue-500"
          onClick={() => openModal(<BuyGloModal />)}
        >
          buy some Glo?
        </button>
      </div>
      <motion.ul variants={variants()}>
        <TransactionsList txns={transfers.slice(0, 5)} chain={chain?.id} />
        <motion.li
          onClick={() => openModal(<AllTransactionsModal />)}
          className="underline cursor-pointer"
          variants={allTxnsVariants}
        >
          View all transactions
        </motion.li>
      </motion.ul>
      <div>
        {!isConnected && (
          <div className="mt-3 text-sm">
            <span> No transactions to show - </span>
            <button
              className="inline cursor-pointer hover:decoration-solid text-blue-500"
              onClick={() => openModal(<UserAuthModal />, "bg-transparent")}
            >
              please log in
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
