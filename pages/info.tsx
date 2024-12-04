import React from "react";

import { firstCount, InfoCard, LeaderBoardTable } from "@/components/Info";

export default function InfoPage() {
  return (
    <div className="mt-4 px-4 bg-pine-100">
      <div className="grid grid-cols-2 gap-3">
        {firstCount.map((val, i) => (
          <InfoCard key={i} data={val} />
        ))}
      </div>
      <div className="my-5">
        <LeaderBoardTable
          title={"Delegation and cause"}
          headers={["Delegate", "Cause"]}
          rows={[
            { td: ["Food", "Clothes"] },
            { td: ["Food", "Clothes"] },
            { td: ["Food", "Clothes"] },
          ]}
        />
        <LeaderBoardTable
          title={"Largest holders"}
          headers={["Holders", "Amount"]}
          rows={[
            { td: ["Food", "$450"] },
            { td: ["Food", "$450"] },
            { td: ["Food", "$450"] },
          ]}
        />
        <LeaderBoardTable
          title={"Largest holders in the last month"}
          headers={["Holders", "Amount"]}
          rows={[
            { td: ["Food", "$690"] },
            { td: ["Food", "$690"] },
            { td: ["Food", "$690"] },
          ]}
        />
      </div>
    </div>
  );
}
