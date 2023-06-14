export const TransactionsList = ({ txns }: { txns: Transfer[] }) => (
  <>
    {txns.map((txn, idx) => {
      const dateTokens = new Date(txn.ts).toDateString().split(" ");
      const txnDate = dateTokens[1] + " " + dateTokens[2];
      return (
        <li key={`txn-${idx}`} className="transaction-item">
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
        </li>
      );
    })}
  </>
);
