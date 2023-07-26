import { createClient } from "@supabase/supabase-js";

export const clientSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export const generateAvatarUrl = (avatar: string) =>
  clientSupabase.storage.from("public").getPublicUrl(avatar).data.publicUrl;

// `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public/${file}`;

// Equal to
/// serverSupabase.storage.from("public").getPublicUrl(
