import { sequence } from "0xsequence";
import { NextRequest } from "next/server";

import { signMsgContent } from "./utils";

export const isAuthenticated = async (req: NextRequest) => true;

export const _isAuthenticated = async (req: NextRequest) => {
  const authorization = req.headers.get("authorization");
  const address = req.headers.get("glo-pub-address");
  const chainId = req.headers.get("glo-chain-id");

  if (!authorization || !address || !chainId) {
    return false;
  }

  // More static Provider? + Different chains handling
  const signature = authorization.split(" ")[1];

  // https://docs.sequence.xyz/wallet/guides/sign-message
  const api = new sequence.api.SequenceAPIClient("https://api.sequence.app");

  const { isValid } = await api.isValidMessageSignature({
    chainId,
    walletAddress: address,
    message: signMsgContent,
    signature,
  });

  // No idea why it doesn't work on backend for Seq wallet only
  // Worked for metamask without issues
  // const isValid = await sequence.utils.isValidMessageSignature(
  //   address,
  //   signMsgContent,
  //   signature,
  //   provider,
  //   parseInt(chainId)
  // );

  return isValid;
};
