import { generateJwt } from "@coinbase/cdp-sdk/auth";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["glo-pub-address"] as string;
  const { chain } = req.query;

  if (!address) {
    return res.status(405).json({
      message: "invalid req",
    });
  }

  const jwt = await generateJwt({
    apiKeyId: process.env.COINBASE_API_KEY!,
    apiKeySecret: process.env.COINBASE_SECRET!,
    requestMethod: "POST",
    requestHost: "api.developer.coinbase.com",
    requestPath: "/onramp/v1/token",
    expiresIn: 120, // optional (defaults to 120 seconds)
  });

  const response = await axios.post(
    "https://api.developer.coinbase.com/onramp/v1/token",

    {
      addresses: [
        {
          address,
          blockchains: [chain],
        },
      ],
      assets: ["USDC"],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  return res.status(200).json({ sessionToken: response.data.token });
}
