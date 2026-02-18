"use client"

import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

export function LogoutButton() {
    const router = useRouter()
    const supabase = getSupabase()

    async function handleLogout() {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error("Error logging out")
        } else {
            toast.success("Logged out successfully")
            router.push("/login")
            router.refresh()
        }
    }

    return (
        <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
    )
}
