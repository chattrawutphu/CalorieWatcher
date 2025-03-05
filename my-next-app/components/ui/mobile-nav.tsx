"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  PieChart, 
  Plus, 
  Settings, 
  History,
  X,
  Search,
  ChevronRight,
  Pencil,
  Scan,
  Clock,
  Bot,
  Apple,
  Sparkles
} from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";

interface NavItem {
  icon: React.ReactNode;
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  {
    icon: <Home className="h-6 w-6" />,
    href: "/home",
    label: "Home",
  },
  {
    icon: <PieChart className="h-6 w-6" />,
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    icon: <Plus className="h-7 w-7" />,
    href: "#",
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

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const QuickActionButton = ({ icon, label, onClick, description }: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  description?: string;
}) => (
  <motion.div variants={item}>
    <Button
      onClick={onClick}
      variant="outline"
      className="w-full flex items-center gap-4 h-auto p-4 text-left font-normal hover:bg-[hsl(var(--accent))/0.1] transition-colors"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[hsl(var(--accent))/0.1] flex items-center justify-center text-[hsl(var(--foreground))]">
        {icon}
      </div>
      <div className="flex-grow">
        <div className="font-medium">{label}</div>
        {description && (
          <div className="text-sm text-[hsl(var(--muted-foreground))]">{description}</div>
        )}
      </div>
      <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
    </Button>
  </motion.div>
);

const BottomSheet = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleAddCustomFood = () => {
    router.push("/add/custom");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.4}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(velocity.y) > 300;
              const draggedDown = offset.y > 50 || swipe;
              if (draggedDown) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--background))] rounded-t-3xl min-h-[60vh] max-h-[90vh] overflow-y-auto pb-8"
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-[hsl(var(--muted))]" />
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Content */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="px-6"
            >
              <motion.div variants={item}>
                <h2 className="text-2xl font-bold mb-2">Add Food</h2>
                <p className="text-[hsl(var(--muted-foreground))] mb-6">Track your meals easily</p>
              </motion.div>
              
              {/* Search Bar */}
              <motion.div variants={item} className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <Input
                  type="text"
                  placeholder="Search food in database..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 h-14 text-lg rounded-2xl border-2 focus-visible:ring-offset-0 focus-visible:ring-1"
                />
              </motion.div>

              {/* AI Assistant Button */}
              <motion.div variants={item}>
                <Button
                  onClick={() => {
                    router.push("/add/ai");
                    onClose();
                  }}
                  className="w-full h-auto p-4 mb-6 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div className="flex-grow text-left">
                      <div className="font-medium">Ask AI Assistant</div>
                      <div className="text-sm opacity-90">Get help with portion sizes and calories</div>
                    </div>
                    <Sparkles className="h-5 w-5" />
                  </div>
                </Button>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={item} className="space-y-3">
                <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-3">
                  Quick Actions
                </h3>
                
                <QuickActionButton
                  icon={<Apple className="h-6 w-6" />}
                  label="Common Foods"
                  description="Choose from frequently used items"
                  onClick={() => {
                    router.push("/add/common");
                    onClose();
                  }}
                />

                <QuickActionButton
                  icon={<Pencil className="h-6 w-6" />}
                  label="Add Custom Food"
                  description="Create your own food entry"
                  onClick={handleAddCustomFood}
                />

                <QuickActionButton
                  icon={<Scan className="h-6 w-6" />}
                  label="Scan Barcode"
                  description="Get nutrition info from barcode"
                  onClick={() => {
                    router.push("/add/barcode");
                    onClose();
                  }}
                />

                <QuickActionButton
                  icon={<Clock className="h-6 w-6" />}
                  label="Recent Foods"
                  description="View your meal history"
                  onClick={() => {
                    router.push("/add/recent");
                    onClose();
                  }}
                />
              </motion.div>

              {/* Search Results */}
              {searchQuery && (
                <motion.div
                  variants={item}
                  initial="hidden"
                  animate="show"
                  className="mt-6"
                >
                  <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-3">
                    Search Results
                  </h3>
                  <div className="space-y-2">
                    {/* Example search result items */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors"
                    >
                      <div className="font-medium">Banana</div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">105 calories per piece</div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export function MobileNav() {
  const pathname = usePathname();
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <BottomSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      
      <nav className="fixed bottom-0 left-0 z-50 w-full">
        <div className="mx-auto px-6">
          <div className="flex h-16 items-center justify-around bg-[hsl(var(--background))/0.8] backdrop-blur-md rounded-t-xl border border-[hsl(var(--border))] shadow-lg max-w-md mx-auto">
            {navItems.map((item) => (
              <div
                key={item.href}
                onClick={() => {
                  if (item.href === "#") {
                    setIsAddOpen(true);
                  }
                }}
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                {item.href === "#" ? (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center -mt-6 h-14 w-14 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg"
                  >
                    {item.icon}
                  </motion.div>
                ) : (
                  <Link href={item.href} className="flex flex-col items-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex items-center justify-center h-10 w-10 rounded-full",
                        pathname === item.href
                          ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                          : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      )}
                    >
                      {item.icon}
                    </motion.div>
                    <span className={cn(
                      "mt-1 text-xs",
                      pathname === item.href
                        ? "text-[hsl(var(--foreground))] font-medium"
                        : "text-[hsl(var(--muted-foreground))]"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
} 