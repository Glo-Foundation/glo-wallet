import { Charity } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../lib/prisma";

async function getLatestCharityChoiceNumForAddress(
  address: string
): Promise<number | null> {
  const latestChoiceNum = await prisma.charityChoice.findFirst({
    where: {
      address: address,
    },
    orderBy: {
      choiceNum: "desc",
    },
    select: {
      choiceNum: true,
    },
  });

  return latestChoiceNum ? latestChoiceNum.choiceNum : null;
}

async function getCharityChoiceForAddress(address: string) {
  const latestChoiceNum = await getLatestCharityChoiceNumForAddress(address);

  if (latestChoiceNum) {
    const latestCharityChoices = await prisma.charityChoice.findMany({
      where: {
        address: address,
        choiceNum: latestChoiceNum,
      },
    });

    return latestCharityChoices;
  } else {
    const newCharityChoice = await prisma.charityChoice.create({
      data: {
        address: address,
        choiceNum: 1,
        name: Charity.EXTREME_POVERTY,
        percent: 100,
      },
    });

    return [newCharityChoice];
  }
}

async function updateCharityChoicesForAddress(
  address: string,
  charityChoices: { charity: Charity; percent: number }[]
) {
  const latestChoiceNum = await getLatestCharityChoiceNumForAddress(address);
  const choiceNum = latestChoiceNum ? latestChoiceNum + 1 : 1;

  const totalPercent = charityChoices.reduce(
    (acc, curr) => acc + curr.percent,
    0
  );
  if (totalPercent !== 100) {
    throw new Error(
      `Total percent must equal 100. Current total: ${totalPercent}`
    );
  }

  // todo: make sure to not update if its the same data as the current choices
  const newCharityChoices = await prisma.$transaction([
    ...charityChoices.map((choice) =>
      prisma.charityChoice.create({
        data: {
          address,
          choiceNum,
          name: choice.charity,
          percent: choice.percent,
        },
      })
    ),
  ]);

  return newCharityChoices;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["glo-pub-address"] as string;

  if (req.method === "POST") {
    // update charity choices for address
    const newCharityChoices = await updateCharityChoicesForAddress(
      address,
      req.body
    );
    return res.status(201).json(newCharityChoices);
  } else {
    //return charity choices for address
    const currentCharityChoices = await getCharityChoiceForAddress(address);
    return res.status(200).json(currentCharityChoices);
  }
}
