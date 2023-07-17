import { randomUUID } from "crypto";

import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

const serverSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data, error } = await serverSupabase.storage
    .from("public")
    .createSignedUploadUrl(`avatars/${randomUUID()}.jpg`);
  console.log({ data, error });

  return res.status(200).json({ path: data?.path, token: data?.token });
}
