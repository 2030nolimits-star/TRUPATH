"use client"

import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 glass w-72 border-none">
                <SheetClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                </SheetClose>
                <Sidebar className="w-full h-full border-none static" />
            </SheetContent>
        </Sheet>
    )
}
