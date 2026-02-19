"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
    const [serverEnv, setServerEnv] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/debug-env")
            .then(res => res.json())
            .then(data => {
                setServerEnv(data)
                setLoading(false)
            })
            .catch(err => {
                console.error("Failed to fetch debug info:", err)
                setLoading(false)
            })
    }, [])

    const clientEnv = {
        url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        url_preview: process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10)}...` : "missing",
    }

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Environment Diagnostics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Client-Side (Browser)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-md">
                            {JSON.stringify(clientEnv, null, 2)}
                        </pre>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Server-Side (API)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p>Loading server info...</p>
                        ) : (
                            <pre className="bg-muted p-4 rounded-md">
                                {JSON.stringify(serverEnv, null, 2)}
                            </pre>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Troubleshooting Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p>1. <strong>Restart Server</strong>: <code>Ctrl+C</code> then <code>npm run dev</code></p>
                    <p>2. <strong>Clear Cache</strong>: Delete the <code>.next</code> folder and restart.</p>
                    <p>3. <strong>File Location</strong>: Ensure <code>.env.local</code> is in <code>{serverEnv?.cwd || "the root directory"}</code></p>
                </CardContent>
            </Card>
        </div>
    )
}
