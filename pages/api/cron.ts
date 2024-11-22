import updateCacheHandler from "./funding/updateCache";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authorization check
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    req.method = "POST";
    await updateCacheHandler(req, res);
  } catch (error: any) {
    console.error("Cron job failed:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
