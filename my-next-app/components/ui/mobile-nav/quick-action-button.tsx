"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { jellyItem } from "./animations";

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  description?: string;
}

// Version มีการ Memoize เพื่อหลีกเลี่ยงการ re-render ที่ไม่จำเป็น
const QuickActionButton = memo(function QuickActionButton({ 
  icon, 
  label, 
  onClick, 
  description 
}: QuickActionButtonProps) {
  return (
    <motion.div variants={jellyItem}>
      <motion.div
        whileTap={{ 
          scale: 0.98
        }}
      >
        <Button
          onClick={onClick}
          variant="outline"
          className="w-full flex items-center gap-4 h-auto p-4 sm:p-4 p-2 text-left font-normal hover:bg-[hsl(var(--accent))/0.1] transition-colors sm:rounded-lg rounded-none sm:border border-0 sm:my-2 my-1"
        >
          <div 
            className="flex-shrink-0 sm:w-12 sm:h-12 w-10 h-10 sm:rounded-2xl rounded-xl bg-[hsl(var(--accent))/0.1] flex items-center justify-center text-[hsl(var(--foreground))]"
          >
            {icon}
          </div>
          <div className="flex-grow">
            <div className="font-medium sm:text-base text-sm">{label}</div>
            {description && (
              <div className="text-sm sm:text-sm text-xs text-[hsl(var(--muted-foreground))]">{description}</div>
            )}
          </div>
          <ChevronRight className="sm:h-5 sm:w-5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        </Button>
      </motion.div>
    </motion.div>
  );
});

export default QuickActionButton; 