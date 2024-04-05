import { Charity } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { createPublicClient, http } from "viem";
import { polygon } from "viem/chains";
import { Address } from "wagmi";

import prisma from "../../lib/prisma";

import type { ByteArray, Hex } from "viem/types/misc";

export const publicClient = createPublicClient({
  chain: polygon,
  transport: http(),
});

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
  address: Address,
  body: UpdateCharityChoiceBody
) {
  const { choices, sigFields } = body;

  const sigDate = new Date(sigFields.timestamp);
  const latestCharityChoice = await getCharityChoiceForAddress(address);
  if (sigDate <= latestCharityChoice[0].creationDate || sigDate > new Date()) {
    throw new Error("Invalid date signature");
  }

  const message = JSON.stringify({
    timestamp: sigFields.timestamp,
    charity: choices[0].charity,
    action: "Updating charity selection",
  });

  if (address.slice(0, 2) === "0x") {
    const valid = await publicClient.verifyMessage({
      address: address,
      message: message,
      signature: sigFields.sig,
    });

    if (!valid) {
      throw new Error("Invalid signature");
    }
  }

  const latestChoiceNum = latestCharityChoice[0].choiceNum;
  const choiceNum = latestChoiceNum ? latestChoiceNum + 1 : 1;

  const totalPercent = choices.reduce((acc, curr) => acc + curr.percent, 0);
  if (totalPercent !== 100) {
    throw new Error(
      `Total percent must equal 100. Current total: ${totalPercent}`
    );
  }

  // todo: make sure to not update if its the same data as the current choices
  const newCharityChoices = await prisma.$transaction([
    ...choices.map((choice) =>
      prisma.charityChoice.create({
        data: {
          address,
          choiceNum,
          name: choice.charity,
          percent: choice.percent,
          sig: sigFields.sig,
          sigMessage: message,
        },
      })
    ),
  ]);

  return newCharityChoices;
}

export interface UpdateCharityChoiceBody {
  sigFields: {
    timestamp: string;
    charity: Charity;
    action: string;
    sig: Hex;
  };
  choices: {
    charity: Charity;
    percent: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["glo-pub-address"] as Address;

  if (req.method === "POST") {
    // update charity choices for address

    const newCharityChoices = await updateCharityChoicesForAddress(
      address,
      req.body as UpdateCharityChoiceBody
    );
    return res.status(201).json(newCharityChoices);
  } else {
    //return charity choices for address
    const currentCharityChoices = await getCharityChoiceForAddress(address);
    return res.status(200).json(currentCharityChoices);
  }
}
