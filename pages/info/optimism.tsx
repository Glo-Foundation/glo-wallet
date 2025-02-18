import { Charity, CharityChoice } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";

import { infoCards } from "@/components/Info/data";
import { InfoCard } from "@/components/Info/InfoCard";
import { splitAndAddEllipses, Table, TRow } from "@/components/Info/Table";
import { cachedOrFetch } from "@/lib/cache";
import { fetchHoldersList } from "@/lib/dune";
import prisma from "@/lib/prisma";

export default function InfoPage({
  distribution,
  top10holders,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const OptimismDelegates = () => (
    <div className="my-5">
      <Table
        title={"Delegate and cause"}
        headers={["Cause", "Amount", "Holders"]}
      >
        {Object.entries(distribution).map(([charity, { balance, count }]) => (
          <TRow
            key={charity}
            td={[charity, `$${Math.round(balance)}`, `#${count}`]}
          />
        ))}
      </Table>
    </div>
  );

  const LargestHolders = () => (
    <div className="my-5">
      <Table title={"Largest current holders"} headers={["Holder", "Amount"]}>
        {top10holders.map(({ address, balance }) => (
          <TRow
            key={address}
            td={[splitAndAddEllipses(address), `$${Math.round(balance)}`]}
          />
        ))}
      </Table>
    </div>
  );

  return (
    <div className="mt-4 px-4 bg-pine-100">
      <div className="grid grid-cols-2 gap-3">
        {infoCards.map((val, i) => (
          <InfoCard key={i} data={val} />
        ))}
      </div>
      <div className="my-5">
        <OptimismDelegates />
        <LargestHolders />
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const res = cachedOrFetch("op-info-data", fetchOpData);
  return { props: res };
}

const fetchOpData = async () => {
  const allFundingChoices = await prisma.charityChoice.findMany({
    distinct: ["address", "name"],
    orderBy: { choiceNum: "desc" },
  });

  const choicesByAddress = allFundingChoices.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.address.toLowerCase()]: [
        ...(acc[cur.address.toLowerCase()] || []),
        cur,
      ],
    }),
    {} as {
      [key: string]: CharityChoice[];
    }
  );

  const filteredChoicesByAddress = {} as {
    [key: string]: {
      name: Charity;
      percent: number;
    }[];
  };

  for (const address of Object.keys(choicesByAddress)) {
    const choices = choicesByAddress[address];
    const lastChoiceNum = Math.max(...choices.map((x) => x.choiceNum));
    const filteredChoices = choices.filter(
      (x) => x.choiceNum === lastChoiceNum
    );
    if (!filteredChoices.length) {
      continue;
    }

    filteredChoicesByAddress[address] = filteredChoices.map((x) => ({
      name: x.name,
      percent: x.percent,
    }));
  }

  const holders = await fetchHoldersList();

  const distribution: {
    [charity: string]: { balance: number; count: number };
  } = {
    RETRO_PG_OP: { balance: 0, count: 0 },
  };

  holders.data.forEach(({ address: addr, balance }) => {
    const address = addr.toLowerCase();

    if (filteredChoicesByAddress[address]) {
      const choices = filteredChoicesByAddress[address];

      choices.forEach(({ name, percent }) => {
        if (!(name in distribution)) {
          distribution[name] = { balance: 0, count: 0 };
        }
        distribution[name].balance += balance * (percent / 100);
        distribution[name].count += 1;
      });
    } else {
      distribution.RETRO_PG_OP.balance += balance;
      distribution.RETRO_PG_OP.count += 1;
    }
  });

  const top10holders = holders.data.slice(0, 10);

  return { distribution, top10holders };
};
