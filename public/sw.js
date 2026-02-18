self.addEventListener("push", (event) => {
    const data = event.data ? event.data.json() : {}
    const title = data.title || "New Notification"
    const options = {
        body: data.body || "You have a new update.",
        icon: data.icon || "/icon.svg",
        badge: data.badge || "/icon.svg",
        data: data.data,
    }

    event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
    event.notification.close()
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || "/")
    )
})
