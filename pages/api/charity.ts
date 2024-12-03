import { Charity } from "@prisma/client";
import * as StellarSdk from "@stellar/stellar-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { createPublicClient, http } from "viem";

import { DEFAULT_CHARITY_PER_CHAIN, isProd } from "@/lib/utils";

import prisma from "../../lib/prisma";

import type { Address, Chain, Hex } from "viem";

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

async function getCharityChoiceForAddress(address: string, chainId: string) {
  const latestChoiceNum = await getLatestCharityChoiceNumForAddress(address);

  if (latestChoiceNum) {
    const latestCharityChoices = await prisma.charityChoice.findMany({
      where: {
        address: address,
        choiceNum: latestChoiceNum,
      },
    });

    return latestCharityChoices;
  }

  const newCharityChoice = await prisma.charityChoice.create({
    data: {
      address: address,
      choiceNum: 1,
      name: DEFAULT_CHARITY_PER_CHAIN(chainId),
      percent: 100,
    },
  });

  return [newCharityChoice];
}

async function updateCharityChoicesForAddress(
  address: Address,
  chainId: string,
  body: UpdateCharityChoiceBody
) {
  const { choices, sigFields, chain } = body;

  if (!sigFields.sig) {
    throw new Error("Missing signature");
  }

  const sigDate = new Date(sigFields.timestamp);
  const latestCharityChoice = await getCharityChoiceForAddress(
    address,
    chainId
  );
  if (sigDate <= latestCharityChoice[0].creationDate || sigDate > new Date()) {
    throw new Error("Invalid date signature");
  }

  const message = JSON.stringify({
    timestamp: sigFields.timestamp,
    charities: choices,
    action: "Updating charity selection",
  });

  if (address.slice(0, 2) === "0x") {
    const publicClient = createPublicClient({
      chain: chain,
      transport: http(),
    });

    const valid = await publicClient.verifyMessage({
      address: address,
      message: message,
      signature: sigFields.sig,
    });

    if (!valid) {
      throw new Error("Invalid signature");
    }
  } else if (address.slice(0, 2) === "ve") {
    // Ve
  } else {
    // isStellar
    // Temp disabled
    // const tx = StellarSdk.TransactionBuilder.fromXDR(
    //   sigFields.sig,
    //   isProd() ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET
    // );
    // const sig = tx.signatures[0].signature();
    // const isValid = StellarSdk.verify(
    //   tx.hash(),
    //   sig,
    //   new StellarSdk.Address(address).toBuffer()
    // );
    // if (!isValid) {
    //   throw new Error("Invalid signature");
    // }
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
    charities: {
      charity: Charity;
      percent: number;
    }[];
    action: string;
    sig: Hex;
  };
  choices: {
    charity: Charity;
    percent: number;
  }[];
  chain: Chain;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["glo-pub-address"] as Address;
  const chainId = req.headers["glo-chain-id"] as string;
  if (req.method === "POST") {
    const newCharityChoices = await updateCharityChoicesForAddress(
      address,
      chainId,
      req.body as UpdateCharityChoiceBody
    );
    return res.status(201).json(newCharityChoices);
  }

  const currentCharityChoices = await getCharityChoiceForAddress(
    address,
    chainId
  );
  return res.status(200).json(currentCharityChoices);
}
