import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const serverSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log({ body: req.body });
  const { name, avatarPath } = req.body;

  const { publicUrl } = serverSupabase.storage
    .from("public")
    .getPublicUrl(avatarPath).data;

  try {
    const reponse = await axios.head(publicUrl);
    console.log({ reponse });

    if (reponse.status === 200) {
      // console.log({ avatarPath, data });
      // if (data?.length) {
      //   //update db
      return res.status(200).json({ name, avatarPath });
    }
  } catch (err) {}

  //update db
  return res.status(200).json({ name });
}
