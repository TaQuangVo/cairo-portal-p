import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionWraper from "@/components/AuthSessionWrapper";
import { Toaster } from "@/components/ui/sonner"
import Head from "next/head";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Säkra secure",
  description: "Säkra VP AB, intergration",
  icons: '/favicon.png',
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
        <AuthSessionWraper>
          {children}
        </AuthSessionWraper>
        <Toaster />
      </body>
    </html>
  );
}
