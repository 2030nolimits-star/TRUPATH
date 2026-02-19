import { NextResponse } from "next/server"

export async function GET() {
    return NextResponse.json({
        url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        url_preview: process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10)}...` : "missing",
        node_env: process.env.NODE_ENV,
        cwd: process.cwd(),
    })
}
