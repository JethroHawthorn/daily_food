import { Nunito } from "next/font/google";
import "./globals.css";
import { OfflineSync } from "@/components/offline-sync";
import DailyCheckIn from "@/components/daily-check-in";

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"], // Varied weights for better hierarchy
  variable: "--font-nunito",
});

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Món Ngon Mỗi Ngày",
  description: "Trợ lý chọn món ăn hàng ngày",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Food Daily",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Often used for app-like feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} antialiased font-sans`}
      >
        <OfflineSync />
        <DailyCheckIn />
        {children}
      </body>
    </html>
  );
}
