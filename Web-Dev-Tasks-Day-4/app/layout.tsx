import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "blog",
  description: "A cozy corner of the internet for curious minds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950" suppressHydrationWarning>
        <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl">🐼</span>
              <span>Blog</span>
              <span className="font-light text-zinc-400 dark:text-zinc-500">blog</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                Home
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
          {children}
        </main>
        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
          <div className="max-w-3xl mx-auto px-6 text-center text-sm text-zinc-400 dark:text-zinc-600">
            © {new Date().getFullYear()} blog — Built with Next.js 🐼
          </div>
        </footer>
      </body>
    </html>
  );
}
