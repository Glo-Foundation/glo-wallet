import { motion, useCycle, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useContext } from "react";
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
  const { openModal } = useContext(ModalContext);

  const [isOpen, toggleOpen] = useCycle(false, true);

  useEffect(() => {
    // force close to avoid race condition with fetching transfers
    toggleOpen(0);
  }, [transfers]);

  const variants = () => {
    const height = `${Math.min(transfers.length, 5) * 85}px`;
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
  const allTxnsVariants = () => ({
    open: {
      opacity: 1,
    },
    closed: {
      opacity: 0,
    },
  });

  return (
    <motion.div
      className="bg-white rounded-[20px] p-8"
      animate={isConnected && isOpen ? "open" : "closed"}
      initial={false}
    >
      <div
        className="flex justify-between cursor-default"
        onClick={() => transfers?.length && toggleOpen()}
      >
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
          onClick={() => openModal(<BuyGloModal totalBalance={1000} />)}
        >
          buy some Glo?
        </button>
      </div>
      <motion.ul variants={variants()}>
        <TransactionsList
          isOpen={isOpen}
          txns={transfers.slice(0, 5)}
          chain={chain?.id}
        />
        <AnimatePresence>
          {transfers.length && (
            <motion.li
              onClick={() => openModal(<AllTransactionsModal />)}
              className="underline cursor-pointer"
              variants={allTxnsVariants()}
            >
              View all transactions
            </motion.li>
          )}
        </AnimatePresence>
      </motion.ul>
      <div>
        {!isConnected && (
          <div className="mt-3 text-sm">
            <span> No transactions to show - </span>
            <button
              className="inline cursor-pointer hover:decoration-solid text-blue-500"
              onClick={() => console.log("implement opening userauth modal")}
            >
              please log in
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
