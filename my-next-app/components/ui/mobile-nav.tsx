"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  Home, 
  PieChart, 
  Plus, 
  Settings, 
  History,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  {
    icon: <Home className="h-6 w-6" />,
    href: "/",
    label: "Home",
  },
  {
    icon: <PieChart className="h-6 w-6" />,
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    icon: <Plus className="h-7 w-7" />,
    href: "/add",
    label: "Add",
  },
  {
    icon: <History className="h-6 w-6" />,
    href: "/history",
    label: "History",
  },
  {
    icon: <Settings className="h-6 w-6" />,
    href: "/settings",
    label: "Settings",
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full">
      <div className="mx-auto px-6">
        <div className="flex h-16 items-center justify-around bg-white/80 backdrop-blur-md rounded-t-xl border border-purple-100 shadow-lg max-w-md mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center"
            >
              {item.href === "/add" ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center -mt-6 h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-300"
                >
                  {item.icon}
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-full",
                    pathname === item.href
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-500 hover:text-purple-600"
                  )}
                >
                  {item.icon}
                </motion.div>
              )}
              <span className={cn(
                "mt-1 text-xs",
                pathname === item.href
                  ? "text-purple-600 font-medium"
                  : "text-gray-500"
              )}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 