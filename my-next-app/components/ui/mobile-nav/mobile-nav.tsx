"use client";

import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, PieChart, Plus, Settings, History, X } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";

import { navContainer, navItem } from "./animations";
import { BottomSheet } from "./";

// NavItem interface
interface NavItem {
  icon: React.ReactNode;
  href: string;
  labelKey: keyof typeof aiAssistantTranslations.en.mobileNav.navigation;
}

// Navigation items
const navItems: NavItem[] = [
  {
    icon: <Home className="h-6 w-6" />,
    href: "/home",
    labelKey: "home",
  },
  {
    icon: <PieChart className="h-6 w-6" />,
    href: "/dashboard",
    labelKey: "dashboard",
  },
  {
    icon: <Plus className="h-8 w-8" />,
    href: "#",
    labelKey: "add",
  },
  {
    icon: <History className="h-6 w-6" />,
    href: "/history",
    labelKey: "history",
  },
  {
    icon: <Settings className="h-6 w-6" />,
    href: "/settings",
    labelKey: "settings",
  },
];

// MobileNav component with performance optimizations
export const MobileNav = memo(function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // Track whether animations should play
  const [shouldAnimate, setShouldAnimate] = useState(false);
  
  // Track which button is currently animating
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);
  
  // Check animation status when component loads
  useEffect(() => {
    // Check if animation has been shown before
    const hasAnimated = sessionStorage.getItem("nav_animated") === "true";
    
    // If not shown before, enable animations
    setShouldAnimate(!hasAnimated);
    
    // If not shown before, mark as shown after animations complete
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        sessionStorage.setItem("nav_animated", "true");
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Cache navigation elements to avoid recalculations
  const navElements = useMemo(() => {
    return navItems.map((item, index) => {
      const isAddButton = item.href === "#";
      const isActive = pathname === item.href;
      
      return (
        <motion.div
          key={item.href}
          className="flex-1 flex items-stretch justify-center"
          variants={navItem}
        >
          {isAddButton ? (
            <div
              onClick={() => handleButtonClick(item.href)}
              className="flex-1 flex flex-col items-center justify-center cursor-pointer py-1 max-w-[80px]"
            >
              <div className="sm:-mt-6 -mt-5">
                <motion.div 
                  animate={animatingButton === item.href ? {
                    scale: [1, 1.2, 0.9, 1.1, 1],
                    transition: { duration: 0.4 }
                  } : {}}
                  className="flex items-center justify-center sm:h-16 sm:w-16 h-14 w-14 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg"
                >
                  {item.icon}
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex justify-center">
              <button
                onClick={() => handleButtonClick(item.href)}
                className="flex flex-col items-center w-full h-full px-1 py-1 cursor-pointer max-w-[60px]"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={animatingButton === item.href ? {
                      scale: [1, 1.2, 0.9, 1.1, 1],
                      transition: { duration: 0.4 }
                    } : {}}
                    className={cn(
                      "flex items-center justify-center sm:h-10 sm:w-10 h-8 w-8 rounded-full",
                      pathname === item.href
                        ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    )}
                  >
                    {item.icon}
                  </motion.div>
                  <span 
                    className={cn(
                      "mt-1 sm:text-xs text-[10px] truncate w-full text-center",
                      pathname === item.href
                        ? "text-[hsl(var(--foreground))] font-medium"
                        : "text-[hsl(var(--muted-foreground))]"
                    )}
                  >
                    {t.mobileNav.navigation[item.labelKey]}
                  </span>
                </div>
              </button>
            </div>
          )}
        </motion.div>
      );
    });
  }, [pathname, animatingButton, t, locale]);
  
  // Optimized button click handler
  const handleButtonClick = useCallback((href: string) => {
    setAnimatingButton(href);
    
    setTimeout(() => {
      setAnimatingButton(null);
    }, 300);
    
    if (href === "#") {
      setIsAddOpen(true);
    } else {
      router.push(href);
      
      if (isAddOpen) {
        setIsAddOpen(false);
      }
    }
  }, [router, isAddOpen]);
  
  // Detect active tab (optimized)
  const activeTab = useMemo(() => {
    if (pathname === '/') return 'dashboard';
    if (pathname.startsWith('/add')) return 'add';
    if (pathname.startsWith('/meals')) return 'meals';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/history')) return 'history';
    return 'dashboard';
  }, [pathname]);
  
  return (
    <>
      <BottomSheet 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onMealAdded={() => setIsAddOpen(false)}
      />
      
      <nav className="fixed bottom-0 left-0 z-50 w-full">
        <div className="mx-auto sm:px-6 px-2">
          <motion.div
            variants={navContainer}
            initial={shouldAnimate ? "hidden" : "show"}
            animate="show"
            className="flex pb-6 pt-1 items-center justify-around bg-[hsl(var(--background))] bg-opacity-50 backdrop-blur-md sm:rounded-t-xl rounded-t-lg sm:border border-b-0 border-x-0 sm:border-x sm:border-t border-[hsl(var(--border))] shadow-lg max-w-md mx-auto"
          >
            {navElements}
          </motion.div>
        </div>
      </nav>
    </>
  );
}); 