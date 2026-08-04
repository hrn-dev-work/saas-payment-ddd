import type { Metadata } from "next";
import { IBM_Plex_Sans_JP, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sans = IBM_Plex_Sans_JP({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Solidpath — SaaS 決済基盤サンプル",
  description:
    "DDD と Webhook 冪等性を可視化する SaaS サブスクリプション決済モック（ポートフォリオ）。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="ja" className={`${sans.variable} ${display.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            className: "font-[family-name:var(--font-sans)]",
          }}
        />
      </body>
    </html>
  );
}
