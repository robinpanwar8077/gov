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


import { NotificationCenter } from "@/components/notifications/notification-center";
import { getUnreadNotificationCount } from "@/lib/actions/notifications";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { count } = await getUnreadNotificationCount();

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
                <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 text-lg font-semibold md:text-base"
                    >
                        <Package2 className="h-6 w-6" />
                        <span className="sr-only">GovProNet Admin</span>
                    </Link>
                    <Link
                        href="/admin/dashboard"
                        className="text-foreground transition-colors hover:text-foreground"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/approvals"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Approvals
                    </Link>
                    <Link
                        href="/admin/users"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Users
                    </Link>
                    <Link
                        href="/admin/authorizations"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Authorizations
                    </Link>
                    <Link
                        href="/admin/cms"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        CMS
                    </Link>
                </nav>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <nav className="grid gap-6 text-lg font-medium">
                            <Link
                                href="#"
                                className="flex items-center gap-2 text-lg font-semibold"
                            >
                                <Package2 className="h-6 w-6" />
                                <span className="sr-only">GovProNet Admin</span>
                            </Link>
                            <Link href="/admin/dashboard" className="hover:text-foreground">
                                Dashboard
                            </Link>
                            <Link
                                href="/admin/approvals"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Approvals
                            </Link>
                            <Link
                                href="/admin/users"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Users
                            </Link>
                        </nav>
                    </SheetContent>
                </Sheet>
                <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    <form className="ml-auto flex-1 sm:flex-initial">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search users..."
                                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
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
                            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
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
            <main className="flex min-h-[calc(100vh-(--spacing(16)))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                {children}
            </main>
        </div>
    )
}
