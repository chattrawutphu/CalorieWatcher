"use client";

import React, { useEffect, useState } from "react";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useSession } from "next-auth/react";
import { redirect, useRouter, usePathname } from "next/navigation";
import PageTransition from "@/components/page-transition";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { format, isToday } from "date-fns";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [mainContentReady, setMainContentReady] = useState(false);
  
  const { locale } = useLanguage();
  
  const { 
    initializeData, 
    syncData
  } = useNutritionStore();

  // เมื่อเริ่มต้นแอพ ให้โหลดข้อมูลจาก localStorage และซิงค์ข้อมูลจาก API
  useEffect(() => {
    if (status === "authenticated") {
      const initializeAndSync = async () => {
        await initializeData();
        
        // ตรวจสอบว่าเคยซิงค์ข้อมูลในเซสชั่นนี้แล้วหรือไม่
        const hasSessionSync = sessionStorage.getItem('has-synced-this-session');
        
        // ถ้ายังไม่เคยซิงค์ในเซสชั่นนี้ ให้ซิงค์ข้อมูล
        if (!hasSessionSync) {
          // ทำการซิงค์เงียบๆ ในพื้นหลังโดยไม่แจ้งเตือนผู้ใช้
          setTimeout(async () => {
            await syncData();
            
            // บันทึกเวลาซิงค์ล่าสุดใน localStorage
            localStorage.setItem('last-sync-time', new Date().toISOString());
            // บันทึกว่าได้ซิงค์ในเซสชั่นนี้แล้ว
            sessionStorage.setItem('has-synced-this-session', 'true');
            console.log(`[Synced] Automatic sync on app first start: ${new Date().toISOString()}`);
          }, 1000);
        }
      };
      
      initializeAndSync();
    }
  }, [status, initializeData, syncData]);

  // แสดงสถานะการโหลดตามเวลาจริง
  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);
  
  // ตั้งค่าว่าส่วนเนื้อหาหลักพร้อมแล้ว (ใช้ตรวจสอบเพื่อแสดง MobileNav)
  useEffect(() => {
    if (!isLoading) {
      // เมื่อโหลดเสร็จแล้ว ให้ตั้งค่าว่าพร้อมแสดงเนื้อหาหลักแล้ว
      setMainContentReady(true);
    }
  }, [isLoading]);

  // Prefetch main routes on layout mount to improve navigation speed
  useEffect(() => {
    // Prefetch main navigation pages
    router.prefetch('/dashboard');
    router.prefetch('/history');
    router.prefetch('/meals');
    router.prefetch('/settings');
    router.prefetch('/add');
    
    // Prefetch the next likely pages based on current location
    if (pathname === '/dashboard') {
      router.prefetch('/add');
      router.prefetch('/history');
    } else if (pathname === '/history') {
      router.prefetch('/dashboard');
      router.prefetch('/add');
    } else if (pathname === '/meals') {
      router.prefetch('/add');
      router.prefetch('/dashboard');
    }
  }, [router, pathname]);

  // Show loading state while checking authentication - real-time loading indicator
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Redirect unauthenticated users to sign in page
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  return (
    <div className="flex h-screen flex-col bg-[hsl(var(--background))] ">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated blobs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[hsl(var(--primary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-[hsl(var(--secondary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-4 left-20 w-32 h-32 bg-[hsl(var(--accent))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000" />
        
        {/* Theme-specific background elements - Optimized */}
        <div className="hidden chocolate:block">
          <div className="chocolate-emoji-1" />
          <div className="chocolate-emoji-2" />
          <div className="chocolate-small-1" />
          <div className="chocolate-small-2" />
        </div>
        
        <div className="hidden sweet:block">
          <div className="sweet-emoji-1" />
          <div className="sweet-emoji-2" />
          <div className="sweet-small-1" />
          <div className="sweet-small-2" />
        </div>

        <div className="hidden broccoli:block">
          <div className="broccoli-emoji-1" />
          <div className="broccoli-emoji-2" />
          <div className="broccoli-small-1" />
          <div className="broccoli-small-2" />
        </div>
      </div>

      <main className="flex-1 container px-4 pb-20 pt-safe relative z-10 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
      
      {/* รอให้เนื้อหาหลักพร้อมก่อนแสดง MobileNav */}
      {mainContentReady && <MobileNav />}
    </div>
  );
} 