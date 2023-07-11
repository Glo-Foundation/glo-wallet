import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chain } = req.body;

  const address = req.headers["glo-pub-address"] as string;

  if (typeof address !== "string" || typeof chain !== "string") {
    return res.status(405).json({
      message: "invalid req",
    });
  }

  const result = await axios.post(
    "https://api.sandbox.ratio.me/v1/client/sessions",
    {
      signingAddress: address,
      signingType: "EVM",
      depositAddress: address,
    },
    {
      headers: {
        "ratio-client-id": process.env.RATIO_CLIENT_ID,
        "ratio-client-secret": process.env.RATIO_CLIENT_SECRET,
      },
    }
  );

  return res.status(200).json(result.data.id);
}
