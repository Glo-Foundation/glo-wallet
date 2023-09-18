import axios, { AxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

import { getToTalBalances } from "@/lib/balance";
import { isIdriss } from "@/lib/idriss";
import { isProd } from "@/lib/utils";
import prisma from "lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["glo-pub-address"] as string;

  const isAlreadyRegistered = await isIdriss(address);
  if (isAlreadyRegistered) {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        address,
      },
      select: {
        id: true,
      },
    });

    const props = {
      type: "REGISTER_IDRISS" as CTAType,
      userId: user.id,
      isCompleted: true,
    };

    const cta = await prisma.cTAs.findFirst({
      where: props,
    });

    if (!cta) {
      await prisma.cTAs.create({
        data: props,
      });
    }

    return res.status(200).json({ msg: "Already registered" });
  }

  const { balance } = await getToTalBalances(address);
  console.log({ balance });

  if (balance < 100) {
    return res.status(200).json({ msg: "Not enough GLO" });
  }

  const exists = await prisma.idrissInvite.findFirst({
    where: {
      address,
    },
  });

  if (exists) {
    return res.status(200).json({ msg: "Already invited" });
  }

  const apiUrl = "https://idriss.xyz/partner-whitelist";

  // 0 for testing, 1 for live version
  const apiType = Number(isProd());
  console.log({ url: `${apiUrl}?addresses=${address}&type=${apiType}` });
  try {
    const result = await axios.get(
      `${apiUrl}?addresses=${address}&type=${apiType}`,
      {
        headers: {
          Authorization: process.env.IDRISS_API_KEY,
        },
      }
    );

    console.log(result);

    if (result.status === 200 && result.data.message === "Access granted") {
      await prisma.idrissInvite.create({
        data: {
          address,
        },
      });

      return res.status(200).json({ msg: "OK" });
    }
  } catch (err: unknown | AxiosError) {
    if (axios.isAxiosError(err)) {
      const error: AxiosError = err;
      console.log({
        res: error.response,
      });
    } else {
      console.log(err);
    }
  }

  return res.status(200).json({ msg: "Idriss error" });
}
