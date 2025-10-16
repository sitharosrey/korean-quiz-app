import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/contexts/UserContext";
import "@/lib/demo-users"; // Demo user utilities
import "@/lib/clear-users"; // Clear users utility

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Korean Learner",
  description: "Learn Korean vocabulary with interactive flashcards and OCR-powered word extraction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <UserProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
