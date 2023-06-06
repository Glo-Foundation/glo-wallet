import { sequence } from "0xsequence";
import { ethers } from "ethers";
import { NextRequest } from "next/server";

import { signMsgContent } from "./utils";

export const isAuthenticated = async (req: NextRequest) => {
  const authorization = req.headers.get("authorization");
  const address = req.headers.get("glo-pub-address");
  const chainId = req.headers.get("glo-chain-id");

  if (!authorization || !address || !chainId) {
    return false;
  }

  // More static Provider? + Different chains handling
  const provider = new ethers.providers.JsonRpcProvider(
    `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
    parseInt(chainId)
  );

  const signature = authorization.split(" ")[1];

  // https://docs.sequence.xyz/wallet/guides/sign-message
  const isValid = await sequence.utils.isValidMessageSignature(
    address,
    signMsgContent,
    signature,
    provider,
    parseInt(chainId)
  );

  console.log({ address, isValid });

  return isValid;
};
