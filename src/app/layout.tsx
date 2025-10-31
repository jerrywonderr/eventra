import { Providers } from "@/libs/providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import Navbar from "@/components/Navbar";
import { createClient } from "@/libs/supabase/server";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userPoints = 0;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', user.id)
      .single();
    
    userPoints = profile?.points || 0;
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script 
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />
        <Providers>
          <Navbar user={user} userPoints={userPoints} />
          {children}
        </Providers>
      </body>
    </html>
  );
}