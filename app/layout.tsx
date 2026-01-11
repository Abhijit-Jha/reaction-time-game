import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "Reaction Test | Test Your Reflexes",
  description: "A fun, interactive reaction time game. Test your reflexes and compete on the leaderboard!",
  keywords: ["reaction time", "reflex test", "game", "speed test"],
  openGraph: {
    title: "Reaction Test",
    description: "How fast are your reflexes? Test your reaction time!",
    type: "website",
  },
};

import { Analytics } from './components/vercel-analytics'; // Adjust path as needed

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-white font-sans`}
      >
        {children}
        <Analytics />
        <Script
          src="https://cloud.blackbox.ai/api/widget-loader"
          data-widget-id="wdg_qzJU-3WsecIr"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

