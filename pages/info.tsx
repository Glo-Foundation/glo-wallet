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
          boardType="DELEGATE"
          title={"Delegation and cause"}
          headers={["Cause", "Amount Delegated"]}
        />
        <LeaderBoardTable
          boardType="LARGEST_CURRENT_HOLDER"
          title={"Largest current holders"}
          headers={["Holders", "Amount"]}
          rows={[
            { td: ["Food", "$450"] },
            { td: ["Food", "$450"] },
            { td: ["Food", "$450"] },
          ]}
        />
        <LeaderBoardTable
          boardType="LARGEST_MONTHLY_HOLDER"
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
