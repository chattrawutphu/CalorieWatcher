"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { motion, PanInfo, useMotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X, Apple, Pencil, Scan, Clock, Bot, Clipboard, ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { useNutritionStore, FoodItem, MealEntry, FoodTemplate, MealFoodItem } from "@/lib/store/nutrition-store";
import { cn } from "@/lib/utils";
import CommonFoods from "./common-foods";
import QuickActionButton from "./quick-action-button";
import FoodDetail from "./food-detail";
import FoodEdit from "./food-edit";
import BarcodeScanner from "./barcode-scanner";
import RecentFoods from "./recent-foods";
import CustomFood from "./custom-food";

// Animations
import { container, item, jellyItem } from "./animations";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onMealAdded: (food?: FoodItem | FoodTemplate) => void;
}

// Optimisation du BottomSheet pour de meilleures performances
const BottomSheet = memo(function BottomSheet({ isOpen, onClose, onMealAdded }: BottomSheetProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // Access nutrition store
  const { 
    addMeal, 
    addFavoriteFood, 
    removeFavoriteFood,
    createMealItemFromTemplate,
    createMealFoodFromScratch,
    currentDate,
    updateFoodTemplate
  } = useNutritionStore();
  
  // State management for different sections
  const [currentSection, setCurrentSection] = useState<
    "main" | "common" | "custom" | "barcode" | "recent" | "detail" | "edit"
  >("main");
  
  // State for selected food
  const [selectedFood, setSelectedFood] = useState<FoodItem | FoodTemplate | null>(null);
  
  // State to store previous section for back navigation
  const [previousSection, setPreviousSection] = useState<string>("main");

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
  
  // Navigate to a section with history tracking
  const navigateToSection = useCallback((section: typeof currentSection) => {
    setPreviousSection(currentSection);
    setCurrentSection(section);
  }, [currentSection]);

  // Handle back navigation
  const handleBackNavigation = useCallback(() => {
    if (currentSection === "edit" && previousSection === "detail") {
      // Going back from edit to detail
      setCurrentSection("detail");
    } else if (currentSection === "detail" && ["common", "custom", "barcode", "recent"].includes(previousSection)) {
      // Going back from detail to its source
      setCurrentSection(previousSection as typeof currentSection);
    } else {
      // Default back to main
      setCurrentSection("main");
    }
  }, [currentSection, previousSection]);

  // Handle adding a food
  const handleAddFood = useCallback((food: MealFoodItem, quantity: number, mealType: string) => {
    if (!food) return;
    
    // Convert to MealFoodItem
    let mealFoodItem: MealFoodItem;
    
    // If it's a template, create meal food from template
    if ('isTemplate' in food && food.isTemplate) {
      const templateId = food.id;
      const createdMealFood = createMealItemFromTemplate(templateId);
      
      // If creation failed, create from scratch as fallback
      if (!createdMealFood) {
        mealFoodItem = {
          id: crypto.randomUUID(),
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          servingSize: food.servingSize,
          category: food.category,
          recordedAt: new Date()
        };
      } else {
        mealFoodItem = createdMealFood;
      }
    } else {
      mealFoodItem = {
        id: crypto.randomUUID(),
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        servingSize: food.servingSize,
        category: food.category,
        recordedAt: new Date()
      };
    }
    
    const meal: MealEntry = {
      id: crypto.randomUUID(),
      mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      foodItem: mealFoodItem,
      quantity: quantity,
      date: currentDate,
    };
    
    addMeal(meal);
    onMealAdded(food);
    onClose();
  }, [addMeal, onClose, onMealAdded, currentDate, createMealItemFromTemplate]);

  // Handle food edit request (transition to edit mode)
  const handleEditFood = useCallback((food: FoodItem | FoodTemplate) => {
    setSelectedFood(food);
    navigateToSection("edit");
  }, [navigateToSection]);

  // Handle food edit save
  const handleSaveEdit = useCallback((updatedFood: FoodItem) => {
    setSelectedFood(updatedFood);
    
    // ตรวจสอบว่ามี id อยู่แล้วหรือไม่ ถ้ามีให้ใช้ updateFoodTemplate แทน addFavoriteFood
    if (updatedFood.id) {
      if ('isTemplate' in updatedFood && updatedFood.isTemplate) {
        // ถ้าเป็น template อยู่แล้ว ให้อัพเดตตรงๆ
        updateFoodTemplate(updatedFood.id, updatedFood);
      } else {
        // ถ้าไม่ใช่ template ให้แปลงเป็น template ก่อนอัพเดต
        const template: FoodTemplate = {
          ...updatedFood,
          isTemplate: true,
          favorite: 'favorite' in updatedFood ? updatedFood.favorite : true,
          createdAt: 'createdAt' in updatedFood ? updatedFood.createdAt : new Date(),
        };
        updateFoodTemplate(updatedFood.id, template);
      }
    } else {
      // ถ้ายังไม่มี id ให้สร้างใหม่
      addFavoriteFood(updatedFood);
    }
    
    // Go back to detail view
    setCurrentSection("detail");
  }, [addFavoriteFood, updateFoodTemplate]);

  // Return null if closed to save resources
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 max-w-md mx-auto"
      />
      
      {/* Main container with slide animations */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 max-w-md mx-auto pb-12 z-50 flex flex-col bg-[hsl(var(--background))] overflow-y-auto overscroll-contain"
      >
        {/* Header - Fixed position to prevent scroll issues */}
        <div className="sticky top-0 z-10 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] pt-safe">
          {/* Header with title and close button */}
          <div className="py-4 flex justify-between items-center">
            {/* Title with icon and back button */}
            <div className="flex items-center gap-2">
              {/* Always show back button for consistent UI */}
              <button 
                onClick={currentSection === "main" ? onClose : handleBackNavigation} 
                className="p-1 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              {/* Title based on section */}
              <h2 className="text-2xl font-semibold">
                {currentSection === "main" && "Add Food"}
                {currentSection === "common" && t.mobileNav.commonFoods.title}
                {currentSection === "custom" && t.mobileNav.customFood.title}
                {currentSection === "barcode" && t.mobileNav.barcodeScanner.title}
                {currentSection === "recent" && t.mobileNav.recentFoods.title}
                {currentSection === "detail" && selectedFood?.name}
                {currentSection === "edit" && (t.mobileNav.foodDetail.editFood || "Edit Food")}
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
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Choose an option to add food</p>
            </div>
          )}
        </div>
        
        {/* Scrolling content container - Touch events will be contained within this div */}
        <div className="flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="">
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
                    label={t.mobileNav.customFood.title}
                    description={t.mobileNav.common.customFoodDesc}
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
                  navigateToSection("detail");
                }} 
                onBack={() => setCurrentSection("main")}
              />
            )}
            
            {/* Custom Foods Form */}
            {currentSection === "custom" && (
              <CustomFood 
                onAdd={(food) => {
                  setSelectedFood(food);
                  navigateToSection("detail");
                }} 
                onBack={() => setCurrentSection("main")}
              />
            )}
            
            {/* Barcode Scanner */}
            {currentSection === "barcode" && (
              <BarcodeScanner 
                onFoodFound={(food) => {
                  setSelectedFood(food);
                  navigateToSection("detail");
                }} 
                onBack={() => setCurrentSection("main")}
              />
            )}
            
            {/* Recent Foods */}
            {currentSection === "recent" && (
              <RecentFoods 
                onSelectFood={(food) => {
                  setSelectedFood(food);
                  navigateToSection("detail");
                }} 
                onBack={() => setCurrentSection("main")}
              />
            )}
            
            {/* Food Detail */}
            {currentSection === "detail" && selectedFood && (
              <FoodDetail 
                food={selectedFood}
                onAddFood={handleAddFood}
                onBack={handleBackNavigation}
                onEdit={handleEditFood}
              />
            )}
            
            {/* Food Edit */}
            {currentSection === "edit" && selectedFood && (
              <FoodEdit
                food={selectedFood}
                onSave={handleSaveEdit}
                onBack={() => setCurrentSection("detail")}
              />
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
});

export default BottomSheet; 