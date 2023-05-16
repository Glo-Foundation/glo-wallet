import axios from "axios";
import {
  EvmChain,
  EvmErc20TransfersResponseJSON,
} from "moralis/common-evm-utils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("hello");
  console.log({ env: process.env });

  const instance = axios.create({
    baseURL: "https://deep-index.moralis.io/api/v2/",
    headers: {
      accept: "application/json",
      "X-API-Key": process.env.MORALIS_API_KEY,
    },
  });

  const transfers = await instance.get<EvmErc20TransfersResponseJSON>(
    `erc20/transfers?contract_addresses%5B0%5D=${
      process.env.NEXT_PUBLIC_USDGLO
    }&wallet_addresses%5B0%5D=${process.env.NEXT_PUBLIC_USDGLO}&chain=${
      EvmChain.MUMBAI.apiHex
    }&limit=${5}`
  );

  console.log({ list: transfers.data.result });
  return res.status(200).json({});
}
