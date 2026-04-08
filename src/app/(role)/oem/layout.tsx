import Link from "next/link"
import { CircleUser, Menu, Package2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LogoutButton } from "@/components/auth/logout-button"
import { MessagingBadge } from "@/components/messaging/messaging-badge"

import { NotificationCenter } from "@/components/notifications/notification-center";
import { getUnreadNotificationCount } from "@/lib/actions/notifications";

export default async function OEMLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { count } = await getUnreadNotificationCount();

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 transition-all">
                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-5 text-sm font-medium lg:gap-6">
                    <Button variant="ghost" asChild className="px-0">
                        <Link
                            href="/oem/dashboard"
                            className="flex items-center gap-2 text-lg font-semibold md:text-base"
                        >
                            <Package2 className="h-6 w-6" />
                            <span className="sr-only">GovProNet OEM</span>
                        </Link>
                    </Button>

                    <Button variant="ghost" asChild>
                        <Link href="/oem/dashboard">Dashboard</Link>
                    </Button>

                    <Button variant="ghost" asChild>
                        <Link href="/oem/catalog">Catalog</Link>
                    </Button>

                    <Button variant="ghost" asChild>
                        <Link href="/oem/requests">Requests</Link>
                    </Button>

                    <Button variant="ghost" asChild>
                        <Link href="/oem/profile">Profile & KYC</Link>
                    </Button>

                    <Button variant="ghost" asChild>
                        <Link href="/oem/messages" className="flex items-center">
                            Messages
                            <MessagingBadge />
                        </Link>
                    </Button>
                </nav>

                {/* Mobile Nav */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="left">
                        <nav className="grid gap-6 text-lg font-medium p-10">
                            <Button variant="ghost" asChild className="justify-start px-0">
                                <Link
                                    href="/oem/dashboard"
                                    className="flex items-center gap-2 text-lg font-semibold"
                                >
                                    <Package2 className="h-6 w-6" />
                                    <span className="sr-only">GovProNet OEM</span>
                                </Link>
                            </Button>

                            <Button variant="ghost" asChild className="justify-start">
                                <Link href="/oem/dashboard">Dashboard</Link>
                            </Button>

                            <Button variant="ghost" asChild className="justify-start">
                                <Link href="/oem/catalog">Catalog</Link>
                            </Button>

                            <Button variant="ghost" asChild className="justify-start">
                                <Link href="/oem/requests">Requests</Link>
                            </Button>

                            <Button variant="ghost" asChild className="justify-start">
                                <Link href="/oem/profile">Profile & KYC</Link>
                            </Button>

                            <Button variant="ghost" asChild className="justify-start">
                                <Link href="/oem/messages" className="flex items-center">
                                    Messages
                                    <MessagingBadge />
                                </Link>
                            </Button>
                        </nav>
                    </SheetContent>
                </Sheet>

                {/* Right Side */}
                <div className="ml-auto flex items-center gap-4 md:gap-2 lg:gap-4">
                    <form className="hidden sm:block">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search catalog..."
                                className="pl-8 sm:w-[200px] lg:w-[300px]"
                            />
                        </div>
                    </form>

                    <NotificationCenter initialUnreadCount={count || 0} />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <CircleUser className="h-5 w-5" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>OEM Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <LogoutButton />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                {children}
            </main>
        </div>
    )
}
