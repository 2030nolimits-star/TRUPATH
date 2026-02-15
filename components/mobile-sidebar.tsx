"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-card w-72">
                <Sidebar className="w-full h-full border-none static" />
            </SheetContent>
        </Sheet>
    )
}
