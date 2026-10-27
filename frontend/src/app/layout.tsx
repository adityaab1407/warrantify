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
  title: "Warrantify Hub | Smart Consumer Tri-Warranty Manager",
  description: "Track Manufacturer, Extended, and Additional warranties for all your devices and appliances across India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <body className={`${geistSans.className} min-h-full flex flex-col font-sans antialiased text-zinc-900 dark:text-zinc-50 bg-zinc-50/50 dark:bg-zinc-950`}>
        {children}
      </body>
    </html>
  );
}
