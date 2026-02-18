"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { User, Trash2, Bell } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [displayName, setDisplayName] = useState("")
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = getSupabase()

    useEffect(() => {
        async function loadUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                setDisplayName(user.user_metadata?.display_name || "")
                setNotificationsEnabled(user.user_metadata?.notifications_enabled !== false)
            }
        }
        loadUser()
    }, [])

    async function updateProfile() {
        if (!displayName.trim()) {
            toast.warning("Display name cannot be empty")
            return
        }

        setIsLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    display_name: displayName,
                    notifications_enabled: notificationsEnabled
                },
            })

            if (error) {
                toast.error(error.message)
            } else {
                toast.success("Profile updated successfully")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    async function changePassword() {
        if (!newPassword || !confirmPassword) {
            toast.warning("Please fill in all password fields")
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (error) {
                toast.error(error.message)
            } else {
                toast.success("Password changed successfully")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    async function deleteAccount() {
        setIsLoading(true)
        try {
            // Note: Supabase doesn't have a direct client-side delete user method
            // You would typically need to implement this via an Edge Function
            // For now, we'll just sign out and show a message
            await supabase.auth.signOut()
            toast.success("Account deletion initiated. Please contact support to complete the process.")
            router.push("/login")
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Profile Settings</h1>
                <p className="mt-2 text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <div className="space-y-6">
                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Account Information
                        </CardTitle>
                        <CardDescription>Your basic account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="flex items-center gap-2">
                                <Input id="email" value={user.email} disabled className="flex-1" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name"
                                disabled={isLoading}
                            />
                        </div>
                        <Button onClick={updateProfile} disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Profile"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Preferences
                        </CardTitle>
                        <CardDescription>Customize your application experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label htmlFor="notifications">Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive alerts for upcoming tasks and events
                                </p>
                            </div>
                            <Switch
                                id="notifications"
                                checked={notificationsEnabled}
                                onCheckedChange={setNotificationsEnabled}
                                disabled={isLoading}
                            />
                        </div>
                        <Button onClick={updateProfile} disabled={isLoading} variant="outline">
                            Save Preferences
                        </Button>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Change Password
                        </CardTitle>
                        <CardDescription>Update your password to keep your account secure</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                disabled={isLoading}
                            />
                        </div>
                        <Button onClick={changePassword} disabled={isLoading}>
                            {isLoading ? "Changing..." : "Change Password"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isLoading}>
                                    Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account and remove all your data
                                        from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={deleteAccount} className="bg-destructive text-destructive-foreground">
                                        Yes, delete my account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
