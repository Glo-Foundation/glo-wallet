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
        <LeaderBoardTable title={"Delegation and cause"} />
        <LeaderBoardTable title={"Largest holders"} />
        <LeaderBoardTable title={"Largest holders in the last month"} />
      </div>
    </div>
  );
}
