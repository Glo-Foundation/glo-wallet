import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../lib/prisma";

const serverSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log({ body: req.body });
  const { name, avatar } = req.body;

  const { publicUrl } = serverSupabase.storage
    .from("public")
    .getPublicUrl(avatar).data;

  try {
    const reponse = await axios.head(publicUrl);
    console.log({ reponse });

    if (reponse.status === 200) {
      prisma.user.update({
        data: {},
        where: {
          id: "",
        },
      });
      // console.log({ avatarPath, data });
      // if (data?.length) {
      //   //update db
      return res.status(200).json({ name, avatar });
    }
  } catch (err) {}

  //update db
  return res.status(200).json({ name });
}
