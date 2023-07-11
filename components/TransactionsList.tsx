import { motion } from "framer-motion";

export default function TransactionsList({ txns }: { txns: Transfer[] }) {
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

  const renderTxns = (txns: Transfer[], transfersCursor: any) =>
    txns.map((txn, idx) => {
      const dateTokens = new Date(txn.ts).toDateString().split(" ");
      const txnDate = dateTokens[1] + " " + dateTokens[2];
      return (
        <motion.li
          key={`txn-${idx}`}
          className="transaction-item"
          variants={variants}
        >
          <div>
            <p>
              {txn.type === "outgoing" ? "Sent to " : "Received from"}{" "}
              {txn.type === "outgoing" ? txn.to : txn.from}
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
