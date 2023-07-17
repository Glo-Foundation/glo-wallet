import { createClient } from "@supabase/supabase-js";

export const clientSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export const generateAvatarUrl = (file: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public/${file}`;

// Equal to
/// serverSupabase.storage.from("public").getPublicUrl(
