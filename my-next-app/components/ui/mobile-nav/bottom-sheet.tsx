"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { motion, PanInfo, useMotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X, Apple, Pencil, Scan, Clock, Bot, Clipboard, ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { useNutritionStore, FoodItem, MealEntry } from "@/lib/store/nutrition-store";
import { cn } from "@/lib/utils";
import CommonFoods from "./common-foods";
import QuickActionButton from "./quick-action-button";
import FoodDetail from "./food-detail";
import BarcodeScanner from "./barcode-scanner";
import RecentFoods from "./recent-foods";
import CustomFood from "./custom-food";

// Animations
import { container, item, jellyItem } from "./animations";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onMealAdded: (food?: FoodItem) => void;
}

// Optimisation du BottomSheet pour de meilleures performances
const BottomSheet = memo(function BottomSheet({ isOpen, onClose, onMealAdded }: BottomSheetProps) {
  const router = useRouter();
  const { addMeal } = useNutritionStore();
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // State management for different sections
  const [currentSection, setCurrentSection] = useState<
    "main" | "common" | "custom" | "barcode" | "recent" | "detail"
  >("main");
  
  // State for selected food
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Prevent scroll when modal is open and reset state on close
  useEffect(() => {
    if (isOpen) {
      // ลบการใช้ overflow-hidden เพื่อป้องกันพื้นที่ด้านล่างเพิ่ม
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
      // Reset state on close
      setCurrentSection("main");
      setSelectedFood(null);
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);
  
  // Add a food to the journal with useCallback for better efficiency
  const handleAddFood = useCallback((food: FoodItem, quantity: number, mealType: string) => {
    // Check if we're editing or adding to meal log
    if (selectedFood && food.id === selectedFood.id && currentSection === "detail") {
      // We're in edit mode, update the selected food
      setSelectedFood(food);
      // If we just want to edit without adding to meal, return early
      if (mealType === "edit") return;
    }
    
    const meal: MealEntry = {
      id: crypto.randomUUID(),
      mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      foodItem: food,
      quantity: quantity,
      date: new Date().toISOString().split('T')[0],
    };
    
    addMeal(meal);
    onMealAdded(food);
    onClose();
  }, [addMeal, onClose, onMealAdded, selectedFood, currentSection]);

  // Return null if closed to save resources
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40"
      />
      
      {/* Main container with slide animations */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 pt-0 pb-16 z-50 flex flex-col bg-[hsl(var(--background))]"
      >
        {/* Header - Fixed position to prevent scroll issues */}
        <div className="sticky top-0 z-10 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] pt-safe">
          {/* Header with title and close button */}
          <div className="px-6 py-4 flex justify-between items-center">
            {/* Title with icon and back button */}
            <div className="flex items-center gap-2">
              {currentSection !== "main" && (
                <button 
                  onClick={() => setCurrentSection("main")} 
                  className="p-1 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              
              {/* Title based on section */}
              <h2 className="text-2xl font-semibold">
                {currentSection === "main" && "Food"}
                {currentSection === "common" && t.mobileNav.commonFoods.title}
                {currentSection === "custom" && "Custom Food"}
                {currentSection === "barcode" && t.mobileNav.barcodeScanner.title}
                {currentSection === "recent" && t.mobileNav.recentFoods.title}
                {currentSection === "detail" && selectedFood?.name}
              </h2>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-[hsl(var(--muted))/0.15] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))/0.3] hover:text-[hsl(var(--foreground))] transition-all"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Subtitle for main section only */}
          {currentSection === "main" && (
            <div className="px-6 pb-3">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.addFood.subtitle}</p>
            </div>
          )}
        </div>
        
        {/* Scrolling content container - Touch events will be contained within this div */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="sm:px-6 px-3 py-4 max-w-md mx-auto pb-36">
            {/* Content based on current section */}
            {currentSection === "main" && (
              <div className="space-y-6">
                {/* AI Assistant Button */}
                <div>
                  <Button
                    onClick={() => {
                      router.push("/add/ai");
                      onClose();
                    }}
                    className="w-full h-auto sm:p-4 p-3 sm:mb-6 mb-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 transition-opacity sm:rounded-xl rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="sm:w-12 sm:h-12 w-10 h-10 sm:rounded-2xl rounded-xl bg-white/20 flex items-center justify-center">
                        <Bot className="sm:h-6 sm:w-6 h-5 w-5" />
                      </div>
                      <div className="flex-grow text-left">
                        <div className="font-medium sm:text-base text-sm">{t.mobileNav.aiAssistant.title}</div>
                        <div className="sm:text-sm text-xs opacity-90">{t.mobileNav.aiAssistant.description}</div>
                      </div>
                    </div>
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] sm:mb-3 mb-2">
                    {t.mobileNav.common.quickActions}
                  </h3>
                  
                  <QuickActionButton
                    icon={<Apple className="h-6 w-6" />}
                    label={t.mobileNav.commonFoods.title}
                    description={t.mobileNav.common.commonFoodsDesc}
                    onClick={() => setCurrentSection("common")}
                  />

                  <QuickActionButton
                    icon={<Pencil className="h-6 w-6" />}
                    label="Custom Food"
                    description="View and manage your custom foods"
                    onClick={() => setCurrentSection("custom")}
                  />

                  <QuickActionButton
                    icon={<Scan className="h-6 w-6" />}
                    label={t.mobileNav.barcodeScanner.title}
                    description={t.mobileNav.common.barcodeScannerDesc}
                    onClick={() => setCurrentSection("barcode")}
                  />

                  <QuickActionButton
                    icon={<Clock className="h-6 w-6" />}
                    label={t.mobileNav.recentFoods.title}
                    description={t.mobileNav.common.recentFoodsDesc}
                    onClick={() => setCurrentSection("recent")}
                  />
                </div>
              </div>
            )}
            
            {/* Common Foods Section */}
            {currentSection === "common" && (
              <CommonFoods 
                onSelectFood={(food) => {
                  setSelectedFood(food);
                  setCurrentSection("detail");
                }} 
                onBack={() => setCurrentSection("main")}
              />
            )}
            
            {/* Custom Foods Form */}
            {currentSection === "custom" && (
              <CustomFood 
                onAdd={(food) => {
                  setSelectedFood(food);
                  setCurrentSection("detail");
                }} 
                onBack={() => setCurrentSection("main")}
              />
            )}
            
            {/* Barcode Scanner */}
            {currentSection === "barcode" && (
              <BarcodeScanner 
                onFoodFound={(food) => {
                  setSelectedFood(food);
                  setCurrentSection("detail");
                }} 
                onBack={() => setCurrentSection("main")}
              />
            )}
            
            {/* Recent Foods */}
            {currentSection === "recent" && (
              <RecentFoods 
                onSelectFood={(food) => {
                  setSelectedFood(food);
                  setCurrentSection("detail");
                }} 
                onBack={() => setCurrentSection("main")}
              />
            )}
            
            {/* Food Detail */}
            {currentSection === "detail" && selectedFood && (
              <FoodDetail 
                food={selectedFood} 
                onBack={() => {
                  setSelectedFood(null);
                  setCurrentSection("main");
                }}
                onAddFood={handleAddFood}
              />
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
});

export default BottomSheet; 