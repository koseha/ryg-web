import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Layout } from "@/components/Layout/Layout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LOL Arena Nexus - 게임 커뮤니티 플랫폼",
  description: "친구들과 리그를 만들고, 매치를 생성하며, 함께 즐기는 새로운 방법",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Layout>
            {children}
          </Layout>
        </TooltipProvider>
      </body>
    </html>
  );
}