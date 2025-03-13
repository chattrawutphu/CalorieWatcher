"use client";

import React from "react";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

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
        {/* Animated blobs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[hsl(var(--primary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-[hsl(var(--secondary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-4 left-20 w-32 h-32 bg-[hsl(var(--accent))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000" />
        
        {/* Theme-specific background elements */}
        {/* Chocolate theme elements - only visible when chocolate theme is active */}
        <div className="hidden chocolate:block">
          <div className="chocolate-emoji-1" />
          <div className="chocolate-emoji-2" />
          <div className="chocolate-small-1" />
          <div className="chocolate-small-2" />
          <div className="chocolate-small-3" />
          <div className="chocolate-small-4" />
          <div className="chocolate-small-5" />
          <div className="chocolate-small-6" />
          <div className="chocolate-small-7" />
          <div className="chocolate-small-8" />
        </div>
        
        {/* Sweet theme elements - only visible when sweet theme is active */}
        <div className="hidden sweet:block">
          <div className="sweet-emoji-1" />
          <div className="sweet-emoji-2" />
          <div className="sweet-small-1" />
          <div className="sweet-small-2" />
          <div className="sweet-small-3" />
          <div className="sweet-small-4" />
          <div className="sweet-small-5" />
          <div className="sweet-small-6" />
          <div className="sweet-small-7" />
          <div className="sweet-small-8" />
        </div>

        {/* Broccoli theme elements - only visible when broccoli theme is active */}
        <div className="hidden broccoli:block">
          <div className="broccoli-emoji-1" />
          <div className="broccoli-emoji-2" />
          <div className="broccoli-small-1" />
          <div className="broccoli-small-2" />
          <div className="broccoli-small-3" />
          <div className="broccoli-small-4" />
        </div>
      </div>

      <main className="flex-1 container px-4 pb-20 pt-safe relative z-10">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
} 