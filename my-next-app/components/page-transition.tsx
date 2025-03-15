"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

// Variants pour les animations de page
const variants = {
  hidden: { opacity: 0, y: 5 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.2,
      ease: "easeInOut"
    } 
  },
  exit: { 
    opacity: 0,
    y: 5,
    transition: { 
      duration: 0.15,
      ease: "easeInOut"
    } 
  }
};

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const router = useRouter();
  
  // Désactiver l'animation au premier rendu
  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  // ตรวจจับการเปลี่ยนหน้าเพื่อแสดงสถานะการโหลด
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleStart = (url: string) => {
      // ถ้าเป็นการเปลี่ยนหน้าจริงๆ (ไม่ใช่แค่ hash change หรือ query change)
      if (url.split('?')[0] !== pathname.split('?')[0]) {
        setIsRouteChanging(true);
      }
    };
    
    const handleComplete = () => {
      // ยกเลิกสถานะโหลดหลังจากการโหลดเสร็จสิ้น
      timeout = setTimeout(() => {
        setIsRouteChanging(false);
      }, 100); // เพียงพอให้การเปลี่ยนหน้าเสร็จสิ้น
    };

    // การเปลี่ยนแปลง pathname แสดงว่าการนำทางเสร็จสิ้น
    handleComplete();
    
    return () => {
      clearTimeout(timeout);
    };
  }, [pathname]);

  // Une clé unique basée sur le pathname pour forcer un nouveau rendu
  // quand le chemin change
  const basePathname = pathname.split('/')[1] || 'home';
  
  return (
    <>
      {/* ตัวแสดงสถานะการโหลดตามเวลาจริง */}
      <AnimatePresence>
        {isRouteChanging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]"
          >
            <motion.div
              className="h-full bg-[hsl(var(--primary))]"
              animate={{ 
                width: ["0%", "100%"],
                transition: { duration: 2, ease: "easeInOut" }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={basePathname}
          initial={isFirstRender ? "enter" : "hidden"}
          animate="enter"
          exit="exit"
          variants={variants}
          className="flex-1 w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
} 