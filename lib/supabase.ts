import { createBrowserClient } from "@supabase/ssr"

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      const missingVars = []
      if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
      if (!supabaseKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")

      console.error(`Supabase configuration error: Missing environment variables (${missingVars.join(", ")}). Please ensure they are defined in your .env.local and that you have restarted the dev server.`)

      // Fallback to avoid complete crash on import, but this client will fail on requests
      return createBrowserClient(
        supabaseUrl || "https://missing-url.supabase.co",
        supabaseKey || "missing-key"
      )
    }

    supabaseInstance = createBrowserClient(
      supabaseUrl,
      supabaseKey,
    )
  }
  return supabaseInstance
}
