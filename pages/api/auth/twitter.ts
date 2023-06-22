import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, userId } = req.query;

  if (typeof code !== "string" || typeof userId !== "string") {
    return res.status(405).json({
      message: "invalid req",
    });
  }

  const cta = await prisma.cTAs.findFirst({
    where: {
      userId,
      type: "TWEEET_IMPACT" as CTAType,
    },
  });

  if (cta) {
    return res.status(200).json({ success: true });
  }

  const token = Buffer.from(
    `${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`,
    "utf8"
  ).toString("base64");

  const { host } = req.headers;

  const isLocalhost = host?.includes("localhost") ? "" : "s";

  const result = await axios.post(
    "https://api.twitter.com/2/oauth2/token",
    {
      code,
      redirect_uri: `http${isLocalhost}://${req.headers.host}/oauth2/twitter?userId=${userId}`,
      grant_type: "authorization_code",
      client_id: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID,
      code_verifier: process.env.NEXT_PUBLIC_CODE_CHALLENGE,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${token}`,
      },
    }
  );

  const { data } = result;

  const { access_token: accessToken } = data;

  const headers = {
    "Content-type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  const { data: userData } = await axios.get(
    "https://api.twitter.com/2/users/me",
    {
      headers,
    }
  );

  const { data: tweetsData } = await axios.get(
    `https://api.twitter.com/2/users/${userData.data.id}/tweets`,
    {
      headers,
    }
  );

  for (const tweet of tweetsData.data) {
    const { text } = tweet;

    if (
      text.includes("@glodollar") &&
      (text.includes("$") || text.includes("bought"))
    ) {
      await prisma.cTAs.create({
        data: {
          type: "TWEEET_IMPACT" as CTAType,
          userId,
          isCompleted: true,
        },
      });
      return res.status(200).json({ success: true });
    }
  }

  return res.status(200).json({ success: false });
}
