import { Providers } from "@/libs/providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Eventra - Decentralized Event Management Platform",
  description:
    "Discover and book amazing events with blockchain-powered tickets on Hedera. Secure, transparent, and instant event booking platform.",
  keywords: [
    "events",
    "blockchain",
    "Hedera",
    "NFT tickets",
    "event management",
    "booking platform",
  ],
  authors: [{ name: "Eventra Team" }],
  openGraph: {
    title: "Eventra - Decentralized Event Management Platform",
    description:
      "Discover and book amazing events with blockchain-powered tickets on Hedera",
    type: "website",
    locale: "en_US",
    siteName: "Eventra",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventra - Decentralized Event Management Platform",
    description:
      "Discover and book amazing events with blockchain-powered tickets on Hedera",
  },
};

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
