import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GovProNet - India’s First Trusted Network for GeM Vendors & OEMs",
  description: "Helping GeM vendors get verified OEM authorization, trusted connections, and real government business opportunities.",
};

import { AuthProvider } from "@/components/providers/auth-provider";
import { OfflineBanner } from "@/components/offline-banner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <OfflineBanner />
          {children}
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
