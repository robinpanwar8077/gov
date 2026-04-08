import { CircleUser, Menu, Package2, Search } from "lucide-react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { MessagingBadge } from "@/components/messaging/messaging-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { NotificationCenter } from "@/components/notifications/notification-center";
import { getUnreadNotificationCount } from "@/lib/actions/notifications";

export default async function ConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { count } = await getUnreadNotificationCount();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 transition-all">
        {/* Desktop Nav */}
        <nav className="hidden flex-col z-50 gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Button variant="ghost" asChild className="px-0">
            <Link
              href="/consultant/dashboard"
              className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">GovProNet Consultant</span>
            </Link>
          </Button>

          <Button variant="ghost" asChild className="justify-start">
            <Link href="/consultant/dashboard">Dashboard</Link>
          </Button>

          <Button variant="ghost" asChild className="justify-start">
            <Link href="/consultant/services">Services</Link>
          </Button>

          <Button variant="ghost" asChild className="justify-start">
            <Link href="/consultant/profile">Profile & KYC</Link>
          </Button>

          <Button variant="ghost" asChild className="justify-start">
            <Link href="/membership">Membership</Link>
          </Button>

          <Button variant="ghost" asChild className="justify-start">
            <Link href="/consultant/messages" className="flex items-center">
              Messages
              <MessagingBadge />
            </Link>
          </Button>
        </nav>

        {/* Mobile Nav */}
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
              <Button variant="ghost" asChild className="px-0">
                <Link
                  href="/consultant/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">GovProNet Consultant</span>
                </Link>
              </Button>

              <Link
                href="/consultant/dashboard"
                className="hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/consultant/services"
                className="text-muted-foreground hover:text-foreground"
              >
                Services
              </Link>
              <Link
                href="/consultant/profile"
                className="text-muted-foreground hover:text-foreground"
              >
                Profile & KYC
              </Link>
              <Link
                href="/membership"
                className="text-muted-foreground hover:text-foreground"
              >
                Membership
              </Link>
              <Link
                href="/consultant/messages"
                className="text-muted-foreground hover:text-foreground flex items-center"
              >
                Messages
                <MessagingBadge />
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Right Section */}
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 sm:w-75 md:w-50 lg:w-75"
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
              <DropdownMenuLabel>Consultant Account</DropdownMenuLabel>
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
  );
}
