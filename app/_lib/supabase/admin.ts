import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/app/_lib/env/server";
import type { Database } from "./database.types";

export function createAdminSupabaseClient() {
  const env = getServerEnv();

  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}
