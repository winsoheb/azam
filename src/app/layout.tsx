import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientSessionProvider } from "@/components/providers/client-session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexaSupport AI",
  description: "Resolve faster. Support smarter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientSessionProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
