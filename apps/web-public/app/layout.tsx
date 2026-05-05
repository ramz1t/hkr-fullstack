import type { Metadata } from "next";
import "./globals.css";
import { Inter, Figtree } from "next/font/google";
import { cn } from "@repo/ui/utils";
import { SessionExpiredModal } from "@/components/session-expired-modal";

const figtreeHeading = Figtree({
  subsets: ["latin"],
  variable: "--font-heading"
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CasinoApp",
  description: "Study project, HKR DA219B VT26 Fullstack Development"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased dark",
        "font-sans",
        "selection:text-primary-foreground selection:bg-primary",
        inter.variable,
        figtreeHeading.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SessionExpiredModal />
      </body>
    </html>
  );
}
