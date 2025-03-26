"use client";

import React, { useEffect, useState, useCallback, memo } from "react";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useSession } from "next-auth/react";
import { redirect, useRouter, usePathname } from "next/navigation";
import PageTransition from "@/components/page-transition";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { format, isToday } from "date-fns";

// ใช้ memo เพื่อป้องกันการ re-render ที่ไม่จำเป็น
export default memo(function MainLayout({
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

  // เมื่อเริ่มต้นแอพ ให้โหลดข้อมูลจาก localStorage และซิงค์ข้อมูลจาก API (ปรับปรุงประสิทธิภาพ)
  useEffect(() => {
    if (status === "authenticated") {
      // ใช้ Promise.resolve() เพื่อให้เรียกใช้นอก callstack หลัก และไม่บล็อกการเรนเดอร์
      Promise.resolve().then(async () => {
        // ทำให้เนื้อหาพร้อมก่อน แล้วค่อยเริ่มโหลดข้อมูล
        setMainContentReady(true);
        await initializeData();
        
        // ตรวจสอบว่าเคยซิงค์ข้อมูลในเซสชั่นนี้แล้วหรือไม่
        const hasSessionSync = sessionStorage.getItem('has-synced-this-session');
        
        // ถ้ายังไม่เคยซิงค์ในเซสชั่นนี้ ให้ซิงค์ข้อมูลหลังจากที่แสดงหน้าจอแล้ว 
        if (!hasSessionSync) {
          // เพิ่มเวลาดีเลย์ให้นานขึ้นเพื่อให้หน้าจอโหลดเสร็จก่อน
          setTimeout(async () => {
            try {
              await syncData();
              // บันทึกเวลาซิงค์ล่าสุดใน localStorage
              localStorage.setItem('last-sync-time', new Date().toISOString());
              // บันทึกว่าได้ซิงค์ในเซสชั่นนี้แล้ว
              sessionStorage.setItem('has-synced-this-session', 'true');
              console.log(`[Synced] Automatic sync on app first start: ${new Date().toISOString()}`);
            } catch (error) {
              console.error('Failed to sync data:', error);
            }
          }, 3000); // เพิ่มจาก 1000ms เป็น 3000ms เพื่อให้หน้าจอโหลดเสร็จก่อน
        }
      });
    }
  }, [status, initializeData, syncData]);

  // แสดงสถานะการโหลดตามเวลาจริง (ทำให้เร็วขึ้น)
  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
      setMainContentReady(true); // ทำให้แสดง MobileNav ได้เร็วขึ้น
    }
  }, [status]);

  // Prefetch main routes on layout mount to improve navigation speed (ปรับปรุงประสิทธิภาพ)
  const prefetchRoutes = useCallback(() => {
    // หน้าหลักที่ควร prefetch ตลอดเวลา
    const mainRoutes = ['/dashboard', '/history', '/meals', '/settings'];
    mainRoutes.forEach(route => {
      router.prefetch(route);
    });
    
    // Prefetch เฉพาะหน้าที่น่าจะไปต่อเท่านั้น
    if (pathname === '/dashboard') {
      router.prefetch('/add');
    } else if (pathname === '/history') {
      router.prefetch('/dashboard');
    } else if (pathname === '/meals') {
      router.prefetch('/add');
    }
  }, [router, pathname]);
  
  // ใช้ requestIdleCallback (หรือ polyfill) เพื่อ prefetch routes เมื่อ browser ว่าง
  useEffect(() => {
    // ใช้ requestIdleCallback ถ้ามี มิฉะนั้นให้ใช้ setTimeout
    const requestIdleCallbackPolyfill = 
      window.requestIdleCallback || 
      ((cb) => setTimeout(cb, 1));
      
    // ทำ prefetch เมื่อ browser ว่าง
    requestIdleCallbackPolyfill(() => {
      prefetchRoutes();
    });
  }, [prefetchRoutes]);

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
    <div className="flex h-screen flex-col user-select-none">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated blobs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[hsl(var(--primary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-[hsl(var(--secondary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-4 left-20 w-32 h-32 bg-[hsl(var(--accent))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000" />
        
        {/* Theme-specific background elements - Optimized (ลดการแสดงผลองค์ประกอบที่ไม่จำเป็น) */}
        <div className="hidden chocolate:block">
          <div className="chocolate-emoji-1" />
          <div className="chocolate-emoji-2" />
        </div>
        
        <div className="hidden sweet:block">
          <div className="sweet-emoji-1" />
          <div className="sweet-emoji-2" />
        </div>

        <div className="hidden broccoli:block">
          <div className="broccoli-emoji-1" />
          <div className="broccoli-emoji-2" />
        </div>
      </div>

      <main className="flex-1 container px-2 pt-safe relative z-10">
        <div className="max-w-md mx-auto pb-12">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
      
      {/* รอให้เนื้อหาหลักพร้อมก่อนแสดง MobileNav */}
      {mainContentReady && <MobileNav />}
    </div>
  );
}); 