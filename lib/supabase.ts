import { createBrowserClient } from "@supabase/ssr"

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase environment variables are missing. Check your .env.local file.")
      // Return a dummy client or throw error? 
      // Most Next.js apps will fail anyways, but let's make it clear.
      return createBrowserClient(
        "https://missing-url.supabase.co",
        "missing-key"
      )
    }

    supabaseInstance = createBrowserClient(
      supabaseUrl,
      supabaseKey,
    )
  }
  return supabaseInstance
}
