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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-pink-200/40 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-4 left-20 w-32 h-32 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000" />
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-purple-100 bg-white/80 backdrop-blur-sm">
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
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">CalorieWatcher</span>
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
                      className="h-8 w-8 rounded-full ring-2 ring-purple-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white">
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