"use client";

import React from "react";
import { MobileNav } from "@/components/ui/mobile-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, LogOut } from "lucide-react";
import { LanguageSelector } from "@/components/ui/language-selector";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  // Redirect unauthenticated users to sign in page
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[hsl(var(--primary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-[hsl(var(--secondary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-4 left-20 w-32 h-32 bg-[hsl(var(--accent))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000" />
        {/* Additional Chocolate Theme Emojis */}
        <div className="chocolate-emoji-1" aria-hidden="true">🍫</div>
        <div className="chocolate-emoji-2" aria-hidden="true">🍪</div>
        {/* Small non-blurred chocolate emojis */}
        <div className="chocolate-small-1" aria-hidden="true">🍫</div>
        <div className="chocolate-small-2" aria-hidden="true">🍪</div>
        <div className="chocolate-small-3" aria-hidden="true">🍫</div>
        <div className="chocolate-small-4" aria-hidden="true">🍪</div>
        <div className="chocolate-small-5" aria-hidden="true">🍫</div>
        <div className="chocolate-small-6" aria-hidden="true">🍪</div>
        <div className="chocolate-small-7" aria-hidden="true">🍫</div>
        <div className="chocolate-small-8" aria-hidden="true">🍪</div>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))/0.8] backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div 
              className="relative h-8 w-8"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image 
                src="/app-icon.svg" 
                alt="CalorieWatcher logo" 
                fill 
                className="object-contain" 
                priority
              />
            </motion.div>
            <span className="text-xl font-bold text-[hsl(var(--foreground))]">CalorieWatcher</span>
          </Link>
          <div className="flex items-center space-x-3">
            <LanguageSelector />
            <ThemeToggle />
            {session?.user && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="/profile" className="flex items-center space-x-1">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User profile"}
                      className="h-8 w-8 rounded-full ring-2 ring-[hsl(var(--ring))]"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))]">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 container px-4 pb-20 pt-4 relative z-10">
        {status === "loading" ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-500"></div>
          </div>
        ) : (
          children
        )}
      </main>
      <MobileNav />
    </div>
  );
} 