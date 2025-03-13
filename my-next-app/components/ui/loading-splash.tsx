"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";

interface LoadingSplashProps {
  /**
   * Whether to show the loading screen
   */
  show: boolean;
  
  /**
   * Callback when the exit animation is complete
   */
  onAnimationComplete?: () => void;
  
  /**
   * Minimum duration to show the splash screen in milliseconds
   * @default 2000
   */
  minDuration?: number;
}

export function LoadingSplash({
  show = true,
  onAnimationComplete,
  minDuration = 2000,
}: LoadingSplashProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // Loading text based on language
  const loadingText = {
    en: "Loading",
    th: "กำลังโหลด",
    ja: "読み込み中",
    zh: "加载中",
  }[locale] || "Loading";
  
  // Set of cute sayings that rotate
  const cuteSayings = {
    en: [
      "Counting calories...",
      "Preparing healthy options...",
      "Getting things ready...",
      "Measuring nutrients...",
      "Energy loading...",
    ],
    th: [
      "กำลังนับแคลอรี่...",
      "เตรียมตัวเลือกที่ดีต่อสุขภาพ...",
      "กำลังเตรียมทุกอย่าง...",
      "กำลังวัดสารอาหาร...",
      "กำลังโหลดพลังงาน...",
    ],
    ja: [
      "カロリーを計算中...",
      "健康的な選択肢を準備中...",
      "準備しています...",
      "栄養素を測定中...",
      "エネルギー充電中...",
    ],
    zh: [
      "正在计算卡路里...",
      "正在准备健康选项...",
      "正在准备一切...",
      "正在测量营养...",
      "能量加载中...",
    ],
  }[locale] || ["Getting things ready..."];
  
  const [sayingIndex, setSayingIndex] = useState(0);
  
  // Rotate through cute sayings
  useEffect(() => {
    const interval = setInterval(() => {
      setSayingIndex((prev) => (prev + 1) % cuteSayings.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [cuteSayings.length]);
  
  // Handle minimum duration
  useEffect(() => {
    if (show) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        if (!show) {
          setShouldRender(false);
        }
      }, minDuration);
      
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500); // Give time for exit animation
      
      return () => clearTimeout(timer);
    }
  }, [show, minDuration]);
  
  if (!shouldRender) return null;
  
  return (
    <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
      {shouldRender && (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[hsl(var(--background))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main animated logo */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              damping: 10, 
              stiffness: 100,
              delay: 0.2 
            }}
          >
            {/* Logo container with pulsing glow */}
            <motion.div
              className="relative"
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut" 
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-[hsl(var(--primary))/0.2] blur-xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut" 
                }}
              />
              
              {/* Main App Icon */}
              <div className="relative z-10 sm:w-32 sm:h-32 w-24 h-24 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] shadow-lg overflow-hidden">
                {/* Cute plate icon */}
                <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16">
                  <motion.path
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ 
                      duration: 1.5, 
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  />
                  <motion.path
                    d="M7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ 
                      duration: 1, 
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                  <motion.circle
                    cx="9"
                    cy="9"
                    r="1"
                    fill="currentColor"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.3 }}
                  />
                  <motion.circle
                    cx="15"
                    cy="9"
                    r="1"
                    fill="currentColor"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.7, duration: 0.3 }}
                  />
                </svg>
              </div>
            </motion.div>
            
            {/* Floating calorie icons */}
            <motion.div
              className="absolute sm:-top-6 -top-4 sm:-right-4 -right-2 sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] flex items-center justify-center shadow-md"
              initial={{ y: 10, opacity: 0 }}
              animate={{ 
                y: [10, -5, 0],
                opacity: 1
              }}
              transition={{ 
                delay: 0.8,
                duration: 0.5
              }}
            >
              🍎
            </motion.div>
            
            <motion.div
              className="absolute sm:top-4 top-2 sm:-left-6 -left-4 sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] flex items-center justify-center shadow-md"
              initial={{ y: 10, opacity: 0 }}
              animate={{ 
                y: [10, -5, 0],
                opacity: 1
              }}
              transition={{ 
                delay: 1,
                duration: 0.5
              }}
            >
              🍗
            </motion.div>
            
            <motion.div
              className="absolute sm:bottom-0 -bottom-2 sm:-left-4 -left-2 sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] flex items-center justify-center shadow-md"
              initial={{ y: 10, opacity: 0 }}
              animate={{ 
                y: [10, -5, 0],
                opacity: 1
              }}
              transition={{ 
                delay: 1.2,
                duration: 0.5
              }}
            >
              🥗
            </motion.div>
          </motion.div>
          
          {/* App name with highlight effect */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.3,
              duration: 0.5
            }}
          >
            <h1 className="sm:text-3xl text-2xl font-bold relative inline-block">
              <motion.span
                className="absolute -z-10 inset-0 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] opacity-20 blur-lg rounded-lg"
                animate={{ 
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
              />
              {t.title || "Calorie Watcher"}
            </h1>
          </motion.div>
          
          {/* Loading indicator */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-col items-center">
              <div className="relative flex justify-center mb-2">
                <div className="w-48 h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[hsl(var(--primary))] rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: ["0%", "30%", "60%", "100%"]
                    }}
                    transition={{
                      times: [0, 0.3, 0.6, 1],
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                
                {/* Cute loading dots that bounce */}
                <div className="absolute -top-4 flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]"
                      animate={{ 
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "loop",
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-[hsl(var(--foreground))] sm:text-base text-sm font-medium">
                {loadingText}...
              </p>
              
              <motion.p
                className="text-[hsl(var(--muted-foreground))] sm:text-sm text-xs mt-1"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {cuteSayings[sayingIndex]}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 