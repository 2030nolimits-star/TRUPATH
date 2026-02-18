import { toast } from "sonner"

export interface NotificationOptions {
    title: string
    body: string
    icon?: string
    tag?: string
    data?: any
}

export const notificationService = {
    /**
     * Request permission for browser notifications
     */
    async requestPermission(): Promise<boolean> {
        if (typeof window === "undefined" || !("Notification" in window)) {
            console.warn("Notifications not supported in this browser")
            return false
        }

        if (Notification.permission === "granted") {
            return true
        }

        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission()
            return permission === "granted"
        }

        return false
    },

    /**
     * Send a notification (Browser + In-app Toast)
     */
    async send(options: NotificationOptions) {
        // 1. Send in-app toast
        toast(options.title, {
            description: options.body,
        })

        // 2. Send browser notification if permission granted
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
                // Try using ServiceWorker registration if available for better background support
                if ("serviceWorker" in navigator) {
                    const registration = await navigator.serviceWorker.getRegistration()
                    if (registration) {
                        registration.showNotification(options.title, {
                            body: options.body,
                            icon: options.icon || "/icon.svg",
                            tag: options.tag,
                            data: options.data,
                        })
                        return
                    }
                }

                // Fallback to standard Notification API
                new Notification(options.title, {
                    body: options.body,
                    icon: options.icon || "/icon.svg",
                    tag: options.tag,
                })
            } catch (error) {
                console.error("Failed to send browser notification:", error)
            }
        }
    },

    /**
     * Check if permission is already granted
     */
    getPermissionStatus(): NotificationPermission {
        if (typeof window === "undefined" || !("Notification" in window)) {
            return "denied"
        }
        return Notification.permission
    }
}
