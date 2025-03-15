"use client";

import React, { useState, useRef, useEffect, useMemo, memo, useCallback } from "react";
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
  Sparkles,
  ArrowLeft,
  Clipboard,
  Camera,
  Bookmark,
  AlertCircle,
  Loader2,
  Users,
  Check,
  Filter,
  AlignLeft,
  Pizza,
  Heart
} from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";
import { FoodDatabase } from "@/lib/food-database";
import { useNutritionStore, MealEntry, FoodItem } from "@/lib/store/nutrition-store";
import { v4 as uuidv4 } from "uuid";
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import { getFoodByBarcode, isValidBarcode } from "@/lib/api/barcode-api";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { USDAFoodItem, convertToAppFoodItem, FOOD_CATEGORIES, searchFoods, searchFoodsByCategory } from "@/lib/api/usda-api";
import { cacheService } from "@/lib/utils/cache-service";

interface NavItem {
  icon: React.ReactNode;
  href: string;
  labelKey: keyof typeof aiAssistantTranslations.en.mobileNav.navigation;
}

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

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

// Optimiser les animations pour qu'elles soient plus légères
const navContainer = {
  hidden: { opacity: 0.8 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Réduit de 0.1 à 0.05
      delayChildren: 0.05 // Réduit de 0.2 à 0.05
    }
  }
};

const navItem = {
  hidden: { y: 10, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "tween", // Utiliser "tween" au lieu de "spring" pour des animations plus légères
      duration: 0.2  // Réduire la durée
    }
  }
};

// Simplifier l'animation des items
const item = {
  hidden: { y: 10, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "tween",
      duration: 0.2
    }
  }
};

// Simplifier les animations de jelly
const jellyItem = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: {
      duration: 0.2
    }
  }
};

// Version mémorisée du bouton d'action rapide pour éviter les re-rendus inutiles
const QuickActionButton = memo(({ icon, label, onClick, description }: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  description?: string;
}) => (
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
));

// Common foods component
const CommonFoods = ({ onSelectFood, onBack }: { onSelectFood: (food: any) => void, onBack: () => void }) => {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchMode, setSearchMode] = useState<'category' | 'search'>('category');
  
  // Import from USDA API
  const { FOOD_CATEGORIES, searchFoods, searchFoodsByCategory, convertToAppFoodItem } = require('@/lib/api/usda-api');
  // Import cache service
  const { cacheService } = require('@/lib/utils/cache-service');
  
  // สำหรับตัวอย่าง - หมวดหมู่ย่อยของแต่ละหมวดหมู่
  const subcategories = useMemo(() => {
    switch (selectedCategory) {
      case 'vegetables':
        return [
          { id: 'leafy', name: 'Leafy Greens', emoji: '🥬' },
          { id: 'root', name: 'Root Vegetables', emoji: '🥕' },
          { id: 'cruciferous', name: 'Cruciferous', emoji: '🥦' },
          { id: 'allium', name: 'Allium', emoji: '🧅' },
          { id: 'other_veg', name: 'Other Vegetables', emoji: '🌽' },
        ];
      case 'fruits':
        return [
          { id: 'berries', name: 'Berries', emoji: '🍓' },
          { id: 'citrus', name: 'Citrus', emoji: '🍊' },
          { id: 'tropical', name: 'Tropical', emoji: '🍍' },
          { id: 'stone_fruits', name: 'Stone Fruits', emoji: '🍑' },
          { id: 'other_fruits', name: 'Other Fruits', emoji: '🍏' },
        ];
      case 'protein_foods':
        return [
          { id: 'meat', name: 'Meat', emoji: '🥩' },
          { id: 'poultry', name: 'Poultry', emoji: '🍗' },
          { id: 'seafood', name: 'Seafood', emoji: '🐟' },
          { id: 'eggs', name: 'Eggs', emoji: '🥚' },
          { id: 'legumes', name: 'Legumes', emoji: '🫘' },
          { id: 'nuts', name: 'Nuts & Seeds', emoji: '🥜' },
        ];
      case 'dairy':
        return [
          { id: 'milk', name: 'Milk', emoji: '🥛' },
          { id: 'cheese', name: 'Cheese', emoji: '🧀' },
          { id: 'yogurt', name: 'Yogurt', emoji: '🥣' },
          { id: 'other_dairy', name: 'Other Dairy', emoji: '🍦' },
        ];
      case 'grains':
        return [
          { id: 'bread', name: 'Bread', emoji: '🍞' },
          { id: 'rice', name: 'Rice', emoji: '🍚' },
          { id: 'pasta', name: 'Pasta', emoji: '🍝' },
          { id: 'cereal', name: 'Cereal', emoji: '🥣' },
          { id: 'other_grains', name: 'Other Grains', emoji: '🌾' },
        ];
      case 'beverages':
        return [
          { id: 'water', name: 'Water', emoji: '💧' },
          { id: 'juice', name: 'Juice', emoji: '🧃' },
          { id: 'coffee', name: 'Coffee', emoji: '☕' },
          { id: 'tea', name: 'Tea', emoji: '🍵' },
          { id: 'smoothies', name: 'Smoothies', emoji: '🥤' },
        ];
      default:
        return [];
    }
  }, [selectedCategory]);
  
  // ค้นหาอาหารด้วย USDA API
  const performSearch = useCallback(async (query: string, loadPage: number = 1) => {
    if (!query || query.length < 2) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // ตรวจสอบแคชก่อน
      const cachedResults = cacheService.getCachedFoodSearch(query, loadPage);
      
      if (cachedResults) {
        // ใช้ผลลัพธ์จากแคช
        const formattedFoods = cachedResults.map((food: USDAFoodItem) => convertToAppFoodItem(food));
        
        setFoods(loadPage === 1 ? formattedFoods : [...foods, ...formattedFoods]);
        setHasMore(formattedFoods.length === 20); // สมมติว่าเรียก 20 รายการต่อหน้า
      } else {
        // เรียก API
        const results = await searchFoods({
          query,
          pageNumber: loadPage,
          pageSize: 20,
          requireAllWords: false
        });
        
        // แคชผลลัพธ์
        cacheService.cacheFoodSearch(query, loadPage, results);
        
        // แปลงเป็นรูปแบบที่แอพใช้
        const formattedFoods = results.map((food: USDAFoodItem) => convertToAppFoodItem(food));
        
        setFoods(loadPage === 1 ? formattedFoods : [...foods, ...formattedFoods]);
        setHasMore(results.length === 20); // สมมติว่าเรียก 20 รายการต่อหน้า
      }
    } catch (err) {
      console.error("Error searching foods:", err);
      setError("ไม่สามารถค้นหาอาหารได้ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [foods, searchFoods, convertToAppFoodItem]);
  
  // ค้นหาอาหารตามหมวดหมู่
  const loadCategoryFoods = useCallback(async (category: string, subcat: string | null = null, loadPage: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // สร้างคำค้นหาจากหมวดหมู่และหมวดหมู่ย่อย
      let searchTerm = category;
      if (subcat) {
        // เพิ่มคำสำคัญของหมวดหมู่ย่อย
        switch (subcat) {
          // กรณี vegetables
          case 'leafy': searchTerm += ' AND (spinach OR lettuce OR kale OR greens)'; break;
          case 'root': searchTerm += ' AND (carrot OR beet OR potato OR root)'; break;
          case 'cruciferous': searchTerm += ' AND (broccoli OR cauliflower OR brussels OR cabbage)'; break;
          case 'allium': searchTerm += ' AND (onion OR garlic OR leek OR shallot)'; break;
          
          // กรณี fruits
          case 'berries': searchTerm += ' AND (berry OR berries OR strawberry OR blueberry OR raspberry)'; break;
          case 'citrus': searchTerm += ' AND (orange OR lemon OR lime OR grapefruit OR citrus)'; break;
          case 'tropical': searchTerm += ' AND (banana OR mango OR pineapple OR tropical)'; break;
          case 'stone_fruits': searchTerm += ' AND (peach OR plum OR nectarine OR cherry OR apricot)'; break;
          
          // กรณี protein
          case 'meat': searchTerm += ' AND (beef OR pork OR lamb OR meat)'; break;
          case 'poultry': searchTerm += ' AND (chicken OR turkey OR duck OR poultry)'; break;
          case 'seafood': searchTerm += ' AND (fish OR salmon OR tuna OR seafood OR shrimp)'; break;
          case 'eggs': searchTerm += ' AND (egg OR eggs OR omelette)'; break;
          case 'legumes': searchTerm += ' AND (bean OR beans OR lentil OR lentils OR legume)'; break;
          case 'nuts': searchTerm += ' AND (nut OR nuts OR seed OR seeds OR almond OR walnut)'; break;
          
          // อื่นๆ สำหรับหมวดหมู่อื่น - เพิ่มตามต้องการ
        }
      }
      
      // ตรวจสอบแคชก่อน
      const cacheKey = subcat ? `${category}_${subcat}` : category;
      const cachedResults = cacheService.getCachedFoodCategory(cacheKey, loadPage);
      
      if (cachedResults) {
        // ใช้ผลลัพธ์จากแคช
        const formattedFoods = cachedResults.map((food: USDAFoodItem) => convertToAppFoodItem(food));
        
        setFoods(loadPage === 1 ? formattedFoods : [...foods, ...formattedFoods]);
        setHasMore(formattedFoods.length === 20);
      } else {
        // เรียก API
        const results = await searchFoods({
          query: searchTerm,
          pageNumber: loadPage,
          pageSize: 20,
        });
        
        // แคชผลลัพธ์
        cacheService.cacheFoodCategory(cacheKey, loadPage, results);
        
        // แปลงเป็นรูปแบบที่แอพใช้
        const formattedFoods = results.map((food: USDAFoodItem) => convertToAppFoodItem(food));
        
        setFoods(loadPage === 1 ? formattedFoods : [...foods, ...formattedFoods]);
        setHasMore(results.length === 20);
      }
    } catch (err) {
      console.error(`Error loading foods for category ${category}:`, err);
      setError("ไม่สามารถโหลดข้อมูลอาหารได้ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [foods, searchFoods, convertToAppFoodItem]);
  
  // โหลดหน้าถัดไป
  const loadMoreFoods = useCallback(() => {
    const nextPage = page + 1;
    
    if (searchMode === 'search') {
      performSearch(searchQuery, nextPage);
    } else if (selectedCategory) {
      loadCategoryFoods(selectedCategory, subcategory, nextPage);
    }
    
    setPage(nextPage);
  }, [page, searchMode, searchQuery, selectedCategory, subcategory, performSearch, loadCategoryFoods]);
  
  // ติดตามการเปลี่ยนแปลงคำค้นหา
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSearchMode('search');
      setSelectedCategory(null);
      setSubcategory(null);
      setPage(1);
      
      // ใช้ debounce เพื่อลดการเรียก API บ่อยเกินไป
      const debounceTimer = setTimeout(() => {
        performSearch(searchQuery, 1);
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, performSearch]);
  
  // โหลดอาหารเมื่อเลือกหมวดหมู่หรือหมวดหมู่ย่อย
  useEffect(() => {
    if (selectedCategory) {
      setSearchMode('category');
      setPage(1);
      loadCategoryFoods(selectedCategory, subcategory, 1);
    }
  }, [selectedCategory, subcategory, loadCategoryFoods]);
  
  // ล้างการค้นหาและกลับไปที่หมวดหมู่
  const resetSearch = () => {
    setSearchQuery("");
    setSearchMode('category');
    setFoods([]);
    setSelectedCategory(null);
    setSubcategory(null);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* ช่องค้นหา */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.mobileNav.common.searchPlaceholder || "Search foods..."}
          className="pl-11 pr-10 py-2 rounded-xl"
        />
        {searchQuery && (
        <button 
            onClick={resetSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
            <X className="h-5 w-5" />
        </button>
        )}
      </div>
      
      {/* เนวิเกชันหมวดหมู่ */}
      {!searchQuery && searchMode === 'category' && (
        <div className="flex flex-col space-y-4">
          {!selectedCategory ? (
            // แสดงหมวดหมู่หลัก
            <div className="grid grid-cols-2 gap-3">
              {FOOD_CATEGORIES.map((category: { id: string; name: string; emoji: string }) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors flex flex-col items-center justify-center text-center aspect-square"
                >
                  <span className="text-3xl mb-2">{category.emoji}</span>
                  <span className="font-medium">{category.name}</span>
                </div>
              ))}
            </div>
          ) : (
            // แสดงหมวดหมู่ย่อย (ถ้ามี)
            <>
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSubcategory(null);
                    setFoods([]);
                  }}
                  className="flex items-center text-[hsl(var(--primary))]"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span>Back to Categories</span>
                </button>
              </div>
              
              {subcategories.length > 0 && !subcategory && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {subcategories.map((subcat) => (
                    <div
                      key={subcat.id}
                      onClick={() => setSubcategory(subcat.id)}
                      className="p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors flex flex-col items-center justify-center text-center"
                    >
                      <span className="text-2xl mb-1">{subcat.emoji}</span>
                      <span className="font-medium text-sm">{subcat.name}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {subcategory && (
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setSubcategory(null);
                      setFoods([]);
                    }}
                    className="flex items-center text-[hsl(var(--primary))]"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span>Back to {selectedCategory}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* ส่วนแสดงผลลัพธ์ */}
      {error ? (
        <div className="py-6 text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-2 text-red-500" />
          <p className="text-red-500">{error}</p>
          <Button onClick={resetSearch} className="mt-4">
            Reset Search
          </Button>
        </div>
      ) : loading && foods.length === 0 ? (
        <div className="py-10 text-center">
          <Loader2 className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--primary))] animate-spin" />
          <p className="text-[hsl(var(--muted-foreground))]">Loading...</p>
        </div>
      ) : foods.length > 0 ? (
        <div className="space-y-3">
          <div className="space-y-2">
            {foods.map((food) => (
              <div 
                key={food.id}
                onClick={() => onSelectFood(food)}
                className="p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors"
              >
                <div className="font-medium">{food.name}</div>
                <div className="flex justify-between items-center">
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  {food.calories} {t.mobileNav.common.calories} {t.mobileNav.common.per} {food.servingSize}
                </div>
                  {food.brandName && (
                    <div className="text-xs bg-[hsl(var(--muted))/0.5] px-2 py-0.5 rounded-full">
                      {food.brandName}
              </div>
                  )}
          </div>
                {food.dataType && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-xs text-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.1] px-2 py-0.5 rounded-full">
                      {food.dataType}
                    </span>
                  </div>
                )}
        </div>
      ))}
          </div>
          
          {/* Loader สำหรับการโหลดเพิ่ม */}
          {loading && (
            <div className="py-4 text-center">
              <Loader2 className="h-6 w-6 mx-auto animate-spin text-[hsl(var(--primary))]" />
            </div>
          )}
          
          {/* ปุ่มโหลดเพิ่มเติม */}
          {!loading && hasMore && (
            <div className="text-center pt-2 pb-8">
              <Button variant="outline" onClick={loadMoreFoods}>
                Load More
              </Button>
            </div>
          )}
        </div>
      ) : (searchQuery || selectedCategory) && !loading ? (
        <div className="py-8 text-center">
          <Clipboard className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
          <p className="text-[hsl(var(--muted-foreground))]">No foods found.</p>
        </div>
      ) : null}
    </div>
  );
};

// Custom food component
const CustomFood = ({ onAdd, onBack }: { onAdd: (food: FoodItem) => void, onBack: () => void }) => {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const [showAddForm, setShowAddForm] = useState(false);
  const { favoriteFoods, dailyLogs, addFavoriteFood } = useNutritionStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // รวบรวมรายการอาหารที่ผู้ใช้เคยสร้างไว้
  const [userCustomFoods, setUserCustomFoods] = useState<FoodItem[]>([]);
  
  // หมวดหมู่อาหาร
  const FOOD_CATEGORIES = [
    { id: 'breakfast', name: 'Breakfast', emoji: '🍳' },
    { id: 'lunch', name: 'Lunch', emoji: '🍱' },
    { id: 'dinner', name: 'Dinner', emoji: '🍲' },
    { id: 'snacks', name: 'Snacks', emoji: '🍿' },
    { id: 'drinks', name: 'Drinks', emoji: '🥤' },
    { id: 'desserts', name: 'Desserts', emoji: '🍰' },
    { id: 'protein', name: 'Protein', emoji: '🥩' },
    { id: 'vegetable', name: 'Vegetable', emoji: '🥦' },
    { id: 'fruit', name: 'Fruit', emoji: '🍎' },
    { id: 'grain', name: 'Grain', emoji: '🌾' },
    { id: 'dairy', name: 'Dairy', emoji: '🧀' },
    { id: 'other', name: 'Other', emoji: '🍴' }
  ];
  
  const [customFood, setCustomFood] = useState<{
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    servingSize: string;
    category: FoodItem['category'];
    mealCategory: string; // เพิ่มหมวดหมู่มื้ออาหาร
  }>({
    name: "",
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    servingSize: "1 serving",
    category: "other",
    mealCategory: "other" // ค่าเริ่มต้น
  });

  // ดึงรายการอาหารที่ผู้ใช้เคยเพิ่มไว้
  useEffect(() => {
    // รวบรวมอาหารจาก favoriteFoods
    const customFoodsFromFavorites = favoriteFoods.filter(food => !food.usdaId);
    
    // รวบรวมอาหารที่เคยบันทึกจาก dailyLogs
    const foodsFromLogs: Record<string, FoodItem> = {};
    
    Object.values(dailyLogs).forEach(log => {
      log.meals.forEach(meal => {
        // เก็บเฉพาะอาหารที่ไม่ได้มาจาก USDA API (custom food)
        if (!meal.foodItem.usdaId) {
          foodsFromLogs[meal.foodItem.id] = meal.foodItem;
        }
      });
    });
    
    // รวมรายการอาหารทั้งหมด และกำจัดรายการซ้ำ
    const allCustomFoods = [
      ...customFoodsFromFavorites,
      ...Object.values(foodsFromLogs)
    ];
    
    // กำจัดรายการซ้ำด้วย id
    const uniqueFoods: FoodItem[] = [];
    const seenIds = new Set();
    
    allCustomFoods.forEach(food => {
      if (!seenIds.has(food.id)) {
        seenIds.add(food.id);
        uniqueFoods.push(food);
      }
    });
    
    // เรียงตามวันที่สร้าง (ล่าสุดขึ้นก่อน)
    uniqueFoods.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    setUserCustomFoods(uniqueFoods);
  }, [favoriteFoods, dailyLogs]);

  // กรองอาหารตามการค้นหาและหมวดหมู่
  const filteredFoods = userCustomFoods.filter(food => {
    // กรองตามการค้นหา
    const matchesSearch = !searchQuery || 
      food.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // กรองตามหมวดหมู่
    const matchesCategory = activeTab === "all" || 
      (food.mealCategory ? food.mealCategory === activeTab : food.category === activeTab);
    
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = () => {
    if (!customFood.name || !customFood.calories) return;
    
    const newFood: FoodItem = {
      id: crypto.randomUUID(),
      name: customFood.name,
      calories: Number(customFood.calories),
      protein: Number(customFood.protein) || 0,
      carbs: Number(customFood.carbs) || 0,
      fat: Number(customFood.fat) || 0,
      servingSize: customFood.servingSize || "1 serving",
      favorite: false,
      createdAt: new Date(),
      category: customFood.category,
      mealCategory: customFood.mealCategory // เพิ่มหมวดหมู่มื้ออาหาร
    };
    
    // เพิ่มไปที่ favoriteFoods เพื่อให้เก็บไว้ใช้ต่อ
    addFavoriteFood(newFood);
    
    // ส่งต่อไปยัง onAdd
    onAdd(newFood);
    
    // Reset form และซ่อนฟอร์ม
    setCustomFood({
      name: "",
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      servingSize: "1 serving",
      category: "other",
      mealCategory: "other"
    });
    setShowAddForm(false);
  };

  // ล้างการค้นหา
  const resetSearch = () => {
    setSearchQuery("");
  };

  // ดึงไอคอนสำหรับหมวดหมู่
  const getCategoryEmoji = (categoryId: string) => {
    const category = FOOD_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.emoji : '🍴';
  };

  // ดึงชื่อสำหรับหมวดหมู่
  const getCategoryName = (categoryId: string) => {
    const category = FOOD_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : 'Other';
  };

  return (
    <div className="space-y-4">
      {/* หัวข้อและปุ่ม Add Custom Food */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Custom Foods</h3>
        <Button 
          onClick={() => setShowAddForm(true)} 
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add New Custom Food
        </Button>
      </div>
      
      {/* ช่องค้นหา */}
      {!showAddForm && userCustomFoods.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your custom foods..."
            className="pl-11 pr-10 py-2 rounded-xl"
          />
          {searchQuery && (
            <button 
              onClick={resetSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
      
      {/* แท็บหมวดหมู่ */}
      {!showAddForm && userCustomFoods.length > 0 && (
        <div className="space-y-2">
          <div className="flex space-x-2 overflow-x-auto py-1 scrollbar-hide">
            <Button 
              variant={activeTab === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className="flex-shrink-0"
            >
              All
            </Button>
            {FOOD_CATEGORIES.map(category => (
              <Button 
                key={category.id}
                variant={activeTab === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(category.id)}
                className="flex-shrink-0"
              >
                <span className="mr-1">{category.emoji}</span> {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* ฟอร์มเพิ่มอาหารใหม่ */}
      {showAddForm && (
        <div className="bg-[hsl(var(--card))] p-4 rounded-xl border border-[hsl(var(--border))]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Add New Custom Food</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAddForm(false)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Food Name</label>
              <Input
                value={customFood.name}
                onChange={(e) => setCustomFood({...customFood, name: e.target.value})}
                placeholder="e.g. Homemade Smoothie"
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Calories</label>
              <Input
                type="number"
                value={customFood.calories}
                onChange={(e) => setCustomFood({...customFood, calories: Number(e.target.value)})}
                placeholder="e.g. 250"
                className="rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Protein (g)</label>
                <Input
                  type="number"
                  value={customFood.protein}
                  onChange={(e) => setCustomFood({...customFood, protein: Number(e.target.value)})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Carbs (g)</label>
                <Input
                  type="number"
                  value={customFood.carbs}
                  onChange={(e) => setCustomFood({...customFood, carbs: Number(e.target.value)})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fat (g)</label>
                <Input
                  type="number"
                  value={customFood.fat}
                  onChange={(e) => setCustomFood({...customFood, fat: Number(e.target.value)})}
                  className="rounded-xl"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Serving Size</label>
              <Input
                value={customFood.servingSize}
                onChange={(e) => setCustomFood({...customFood, servingSize: e.target.value})}
                placeholder="e.g. 1 cup, 100g"
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select 
                value={customFood.mealCategory}
                onChange={(e) => setCustomFood({...customFood, mealCategory: e.target.value})}
                className="w-full rounded-xl border border-[hsl(var(--border))] p-3 bg-transparent"
              >
                {FOOD_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={handleSubmit}
              disabled={!customFood.name || !customFood.calories}
            >
              {t.addFood.submitButton}
            </Button>
          </div>
        </div>
      )}
      
      {/* รายการอาหารที่ผู้ใช้เคยเพิ่มไว้ */}
      {!showAddForm && filteredFoods.length > 0 ? (
        <div className="space-y-3 mt-2">
          {filteredFoods.map((food) => (
            <div 
              key={food.id}
              onClick={() => onAdd(food)}
              className="p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="font-medium">{food.name}</div>
                <div className="flex gap-1">
                  {food.mealCategory && (
                    <div className="text-xs bg-[hsl(var(--primary))/0.1] px-2 py-0.5 rounded-full flex items-center">
                      <span className="mr-1">{getCategoryEmoji(food.mealCategory)}</span> 
                      {getCategoryName(food.mealCategory)}
                    </div>
                  )}
                  <div className="text-xs bg-[hsl(var(--primary))/0.1] px-2 py-0.5 rounded-full flex items-center">
                    <Pencil className="h-3 w-3 mr-1" /> Custom
                  </div>
                </div>
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                {food.calories} calories per {food.servingSize}
              </div>
              <div className="mt-1 flex items-center gap-1">
                {food.protein > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-0.5 rounded-full">
                    P: {food.protein}g
                  </span>
                )}
                {food.carbs > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 px-2 py-0.5 rounded-full">
                    C: {food.carbs}g
                  </span>
                )}
                {food.fat > 0 && (
                  <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 px-2 py-0.5 rounded-full">
                    F: {food.fat}g
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : !showAddForm && userCustomFoods.length > 0 ? (
        <div className="text-center py-8">
          <Clipboard className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
          <p className="text-[hsl(var(--muted-foreground))] mb-4">No custom foods found with this filter.</p>
          <Button onClick={() => setActiveTab("all")}>
            <Filter className="h-4 w-4 mr-2" /> Clear Filters
          </Button>
        </div>
      ) : !showAddForm && (
        <div className="text-center py-8">
          <AlignLeft className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
          <p className="text-[hsl(var(--muted-foreground))] mb-4">No custom foods yet.</p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Your First Custom Food
          </Button>
        </div>
      )}
    </div>
  );
};

// Barcode scanner component
const BarcodeScanner = ({ onFoodFound, onBack }: { onFoodFound: (food: FoodItem) => void, onBack: () => void }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraPermissionRequested, setCameraPermissionRequested] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // เตรียม scanner
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    
    return () => {
      // Cleanup function to stop scanning when component unmounts
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);
  
  // Start/stop scanner based on isScanning state
  useEffect(() => {
    if (!codeReader.current || !videoRef.current) return;
    
    if (isScanning) {
      startScanner();
    } else if (codeReader.current) {
      codeReader.current.reset();
    }
    
    async function startScanner() {
      try {
        const videoElement = videoRef.current;
        if (!videoElement) return;
        
        setCameraPermissionRequested(true);
        
        // Check if user has previously granted camera permissions
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        
        if (cameras.length === 0) {
          throw new Error("No camera found on this device");
        }
        
        // Start scanning with explicit constraints
        await codeReader.current!.decodeFromConstraints(
          {
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          },
          videoElement,
          (result, error) => {
            if (result) {
              console.log("Scanned barcode:", result.getText());
              // เมื่อพบบาร์โค้ด ให้หยุดการสแกนและค้นหาข้อมูลอาหาร
              setIsScanning(false);
              lookupBarcodeData(result.getText());
            }
            
            if (error && !(error instanceof NotFoundException)) {
              console.error("Scanner error:", error);
            }
          }
        );
      } catch (err: any) {
        console.error("Failed to start scanner:", err);
        
        // Handle specific error cases with more helpful messages
        if (err.name === 'NotAllowedError') {
          setError("คุณไม่ได้อนุญาตให้เข้าถึงกล้อง กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่าเบราว์เซอร์");
        } else if (err.name === 'NotFoundError' || err.message.includes('No camera found')) {
          setError("ไม่พบกล้องบนอุปกรณ์นี้ กรุณาใช้อุปกรณ์ที่มีกล้อง");
        } else if (err.name === 'NotReadableError') {
          setError("ไม่สามารถเข้าถึงกล้องได้ อาจเนื่องจากกล้องกำลังถูกใช้งานโดยแอปพลิเคชันอื่น");
        } else {
          setError(`ไม่สามารถเข้าถึงกล้องได้: ${err.message || 'โปรดตรวจสอบการเชื่อมต่อกล้อง'}`);
        }
        
        setIsScanning(false);
      }
    }
  }, [isScanning]);
  
  // Explicitly request camera permission before starting scanner
  const requestCameraPermission = async () => {
    setCameraPermissionRequested(true);
    try {
      // ขอสิทธิ์การเข้าถึงกล้อง
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      // หากได้รับอนุญาต ให้หยุด stream และเริ่มสแกนเนอร์
      stream.getTracks().forEach(track => track.stop());
      
      // เริ่มสแกนเนอร์
      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera permission error:", err);
      
      if (err.name === 'NotAllowedError') {
        setError(t.mobileNav.barcodeScanner.errors.cameraPermission);
      } else if (err.name === 'NotFoundError') {
        setError(t.mobileNav.barcodeScanner.errors.noCamera);
      } else {
        setError(`${t.mobileNav.barcodeScanner.errors.general} ${err.message || ''}`);
      }
    }
  };
  
  // ค้นหาข้อมูลอาหารจากบาร์โค้ด
  const lookupBarcodeData = async (barcode: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // ตรวจสอบว่าบาร์โค้ดถูกต้องหรือไม่
      if (!isValidBarcode(barcode)) {
        setError(t.mobileNav.barcodeScanner.errors.invalidBarcode);
        setIsLoading(false);
        return;
      }
      
      // ค้นหาข้อมูลอาหารจากบาร์โค้ด
      const foodData = await getFoodByBarcode(barcode);
      
      if (foodData) {
        // พบข้อมูลอาหาร ส่งต่อไปยัง parent component
        onFoodFound(foodData);
      } else {
        setError(t.mobileNav.barcodeScanner.errors.notFound);
      }
    } catch (err) {
      console.error("Error looking up barcode:", err);
      setError(t.mobileNav.barcodeScanner.errors.general);
    } finally {
      setIsLoading(false);
      setManualBarcode("");
    }
  };
  
  // ค้นหาบาร์โค้ดที่ป้อนด้วยตนเอง
  const handleManualLookup = async () => {
    if (manualBarcode) {
      await lookupBarcodeData(manualBarcode);
    }
  };

  return (
    <div className="space-y-6">
      {isScanning ? (
        <div className="relative rounded-xl overflow-hidden h-64 bg-black">
          {/* กล้องสำหรับสแกนบาร์โค้ด */}
          <video ref={videoRef} className="w-full h-full object-cover" />
          
          {/* เส้นเป้าหมาย */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-white/60 rounded-lg w-3/4 h-1/3 flex items-center justify-center">
              <div className="w-full absolute h-0.5 bg-[hsl(var(--primary))]" />
            </div>
          </div>
          
          {/* ปุ่มยกเลิกการสแกน */}
          <Button
            onClick={() => setIsScanning(false)}
            variant="outline"
            className="absolute right-3 top-3 h-10 w-10 p-0 rounded-full bg-white/10 backdrop-blur-md border-white/30"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="bg-black/5 rounded-xl h-64 flex items-center justify-center border-2 border-dashed border-[hsl(var(--border))]">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))] animate-spin" />
              <p className="text-[hsl(var(--muted-foreground))]">{t.mobileNav.barcodeScanner.searching}</p>
            </div>
          ) : (
            <div className="text-center p-4">
              <Camera className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
              <p className="text-[hsl(var(--muted-foreground))] mb-4">{t.mobileNav.barcodeScanner.scanInstructions}</p>
              <Button
                className="mb-4"
                onClick={requestCameraPermission}
              >
                {t.mobileNav.barcodeScanner.openCamera}
              </Button>
              
              {error && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-300 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* ป้อนบาร์โค้ดด้วยตนเอง */}
      <div className="space-y-2">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          {t.mobileNav.barcodeScanner.manualInput}
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="8850329112224"
            className="rounded-xl"
          />
          <Button 
            variant="outline" 
            className="flex-shrink-0"
            onClick={handleManualLookup}
            disabled={!manualBarcode || isLoading}
          >
            {t.mobileNav.barcodeScanner.searchButton}
          </Button>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {t.mobileNav.barcodeScanner.testBarcodes}
        </p>
      </div>
    </div>
  );
};

// Recent foods component
const RecentFoods = ({ onSelectFood, onBack }: { onSelectFood: (food: any) => void, onBack: () => void }) => {
  const { dailyLogs, currentDate } = useNutritionStore();
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // Get all meals from all dates, sorted by most recent
  const allMeals: MealEntry[] = [];
  Object.values(dailyLogs).forEach(log => {
    allMeals.push(...log.meals);
  });
  
  // Sort by date (most recent first) and take the first 10
  const recentMeals = allMeals
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  
  // Remove duplicates (keep the most recent instance of each food)
  const uniqueFoods: FoodItem[] = [];
  const seenFoodIds = new Set();
  
  recentMeals.forEach(meal => {
    if (!seenFoodIds.has(meal.foodItem.id)) {
      seenFoodIds.add(meal.foodItem.id);
      uniqueFoods.push(meal.foodItem);
    }
  });

  return (
    <div className="space-y-6">
      {uniqueFoods.length > 0 ? (
        <div className="space-y-2">
          {uniqueFoods.map((food) => (
            <div 
              key={food.id}
              onClick={() => onSelectFood(food)}
              className="p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors"
            >
              <div className="font-medium">{food.name}</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                {food.calories} {t.mobileNav.common.calories} {t.mobileNav.common.per} {food.servingSize}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clipboard className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
          <p className="text-[hsl(var(--muted-foreground))]">{t.mobileNav.recentFoods.noFoods}</p>
        </div>
      )}
    </div>
  );
};

// Food detail component
const FoodDetail = ({ 
  food, 
  onBack,
  onAddFood 
}: { 
  food: FoodItem, 
  onBack: () => void,
  onAddFood: (food: FoodItem, quantity: number, mealType: string) => void 
}) => {
  // Change quantity state to support decimal values
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState("breakfast");
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // Add state for editing mode and editable food data
  const [isEditing, setIsEditing] = useState(false);
  const [editableFood, setEditableFood] = useState<FoodItem>({...food});
  
  // Update editable food when the food prop changes
  useEffect(() => {
    setEditableFood({...food});
  }, [food]);

  // Apply edited values to the food being displayed
  const applyEdits = () => {
    // Create a new FoodItem with edited values but preserve the original id
    const updatedFood: FoodItem = {
      ...editableFood,
      id: food.id,
      createdAt: food.createdAt,
      favorite: food.favorite
    };
    
    // The component expects food to be immutable, so we need to pass the edited food
    // back up to the parent component where it's stored in state
    onAddFood(updatedFood, quantity, mealType);
    
    // Exit edit mode
    setIsEditing(false);
  };

  // Format number to prevent excessive decimals
  const formatNumber = (num: number): number => {
    return parseFloat(num.toFixed(2));
  };

  // Food data being used (either original or edited)
  const displayFood = isEditing ? editableFood : food;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
      <Button 
        variant="ghost" 
          className="flex items-center gap-2 p-0 h-auto"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t.mobileNav.foodDetail.back}</span>
      </Button>
      
        <Button
          variant="ghost"
          size="sm"
          onClick={() => isEditing ? applyEdits() : setIsEditing(true)}
          className="flex items-center gap-1"
        >
          {isEditing ? (
            <>
              <Check className="h-4 w-4" />
              <span>Save</span>
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </>
          )}
        </Button>
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Food Name</label>
            <Input 
              value={editableFood.name}
              onChange={(e) => setEditableFood({...editableFood, name: e.target.value})}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Calories (kcal)</label>
            <Input 
              type="number"
              value={editableFood.calories}
              onChange={(e) => setEditableFood({
                ...editableFood, 
                calories: parseFloat(e.target.value) || 0
              })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Serving Size</label>
            <Input 
              value={editableFood.servingSize}
              onChange={(e) => setEditableFood({...editableFood, servingSize: e.target.value})}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">{t.result.protein} (g)</label>
              <Input 
                type="number"
                value={editableFood.protein}
                onChange={(e) => setEditableFood({
                  ...editableFood, 
                  protein: parseFloat(e.target.value) || 0
                })}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">{t.result.carbs} (g)</label>
              <Input 
                type="number"
                value={editableFood.carbs}
                onChange={(e) => setEditableFood({
                  ...editableFood, 
                  carbs: parseFloat(e.target.value) || 0
                })}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">{t.result.fat} (g)</label>
              <Input 
                type="number"
                value={editableFood.fat}
                onChange={(e) => setEditableFood({
                  ...editableFood, 
                  fat: parseFloat(e.target.value) || 0
                })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
      <div>
            <h2 className="text-xl font-semibold">{displayFood.name}</h2>
        <p className="text-[hsl(var(--muted-foreground))]">
              {displayFood.servingSize} • {displayFood.calories} kcal
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 pb-2">
        <div className="p-3 rounded-xl bg-[hsl(var(--accent))/0.1]">
          <div className="text-xs text-[hsl(var(--primary))]">{t.result.protein}</div>
              <div className="text-lg font-semibold">{displayFood.protein}g</div>
        </div>
        <div className="p-3 rounded-xl bg-[hsl(var(--accent))/0.1]">
          <div className="text-xs text-[hsl(var(--primary))]">{t.result.carbs}</div>
              <div className="text-lg font-semibold">{displayFood.carbs}g</div>
        </div>
        <div className="p-3 rounded-xl bg-[hsl(var(--accent))/0.1]">
          <div className="text-xs text-[hsl(var(--primary))]">{t.result.fat}</div>
              <div className="text-lg font-semibold">{displayFood.fat}g</div>
        </div>
      </div>
        </>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.mobileNav.foodDetail.mealType}</label>
          <select 
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="w-full rounded-xl border border-[hsl(var(--border))] p-3 bg-transparent"
          >
            <option value="breakfast">{t.mobileNav.foodDetail.mealTypes.breakfast}</option>
            <option value="lunch">{t.mobileNav.foodDetail.mealTypes.lunch}</option>
            <option value="dinner">{t.mobileNav.foodDetail.mealTypes.dinner}</option>
            <option value="snack">{t.mobileNav.foodDetail.mealTypes.snack}</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.mobileNav.foodDetail.quantity}</label>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-l-xl border-r-0"
              onClick={() => quantity > 0.25 && setQuantity(formatNumber(quantity - 0.25))}
            >
              -
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setQuantity(formatNumber(value));
                }
              }}
              step="0.25"
              min="0.25"
              className="h-10 rounded-none text-center border-x-0"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-r-xl border-l-0"
              onClick={() => setQuantity(formatNumber(quantity + 0.25))}
            >
              +
            </Button>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          {t.mobileNav.foodDetail.totalCalories}: {formatNumber(displayFood.calories * quantity)} kcal
        </div>
      </div>
      
      <Button 
        className="w-full" 
        onClick={() => onAddFood(displayFood, quantity, mealType)}
      >
        {t.mobileNav.foodDetail.addToMealButton}
      </Button>
    </div>
  );
};

// Optimisation du BottomSheet pour de meilleures performances
const BottomSheet = memo(function BottomSheet({ isOpen, onClose, onMealAdded }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onMealAdded: (food?: FoodItem) => void;
}) {
  const router = useRouter();
  const { addMeal } = useNutritionStore();
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // État pour gérer les différentes sections
  const [currentSection, setCurrentSection] = useState<
    "main" | "common" | "custom" | "barcode" | "recent" | "detail"
  >("main");
  
  // État pour l'aliment sélectionné
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Empêcher le défilement lorsque le modal est ouvert et réinitialiser l'état lors de la fermeture
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
      // Réinitialiser l'état lors de la fermeture pour éviter la persistance des données
      setCurrentSection("main");
      setSelectedFood(null);
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  // Ajouter un aliment au journal avec useCallback pour plus d'efficacité
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
      {/* Backdrop with simplified animations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.2,
          ease: "easeInOut" 
        }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40"
      />
      
      {/* Main container with optimized animations */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ 
          y: 0,
          transition: { 
            type: "tween", 
            duration: 0.3,
            ease: "easeOut"
          } 
        }}
        exit={{ 
          y: "100%", 
          transition: { 
            type: "tween", 
            duration: 0.2,
            ease: "easeIn"
          } 
        }}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[hsl(var(--background))] rounded-t-xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div>
          {/* Handle */}
          <div className="pt-2 pb-1 flex justify-center items-center">
            <div className="w-12 h-1.5 rounded-full bg-[hsl(var(--muted))]" />
          </div>

          {/* Header with title and close button */}
          <div className="px-6 py-3 flex justify-between items-center">
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
              
              {/* Icon based on section - ลบไอคอนจากหน้าหลัก */}
              {currentSection === "common" && <Apple className="h-6 w-6 text-[hsl(var(--primary))]" />}
              {currentSection === "custom" && <Pencil className="h-6 w-6 text-[hsl(var(--primary))]" />}
              {currentSection === "barcode" && <Scan className="h-6 w-6 text-[hsl(var(--primary))]" />}
              {currentSection === "recent" && <Clock className="h-6 w-6 text-[hsl(var(--primary))]" />}
              {currentSection === "detail" && <Clipboard className="h-6 w-6 text-[hsl(var(--primary))]" />}
              
              {/* Title based on section */}
              <h2 className="text-xl font-semibold">
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
            <div className="px-6 pb-2">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.addFood.subtitle}</p>
            </div>
          )}
        </div>
        
        {/* Scrolling content container */}
        <div className="flex-1 overflow-y-auto">
          <div className="sm:px-6 px-3 py-4 max-w-md mx-auto pb-36">
            {/* Content based on current section */}
            {currentSection === "main" && (
              <motion.div variants={container} initial="hidden" animate="show">
                {/* AI Assistant Button */}
                <motion.div variants={jellyItem}>
                  <Button
                    onClick={() => {
                      router.push("/add/ai");
                      onClose();
                    }}
                    className="w-full h-auto sm:p-4 p-3 sm:mb-6 mb-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 transition-opacity sm:rounded-xl rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="sm:w-12 sm:h-12 w-10 h-10 sm:rounded-2xl rounded-xl bg-white/20 flex items-center justify-center"
                        animate={{ 
                          rotate: [0, 0, -3, 3, 0],
                          scale: [1, 1, 1.05, 1.05, 1]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          repeatDelay: 4,
                          duration: 1,
                          ease: "easeInOut"
                        }}
                      >
                        <Bot className="sm:h-6 sm:w-6 h-5 w-5" />
                      </motion.div>
                      <div className="flex-grow text-left">
                        <div className="font-medium sm:text-base text-sm">{t.mobileNav.aiAssistant.title}</div>
                        <div className="sm:text-sm text-xs opacity-90">{t.mobileNav.aiAssistant.description}</div>
                      </div>
                    </div>
                  </Button>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={item} className="space-y-3">
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
                </motion.div>
              </motion.div>
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

// PageTransition component for showing loading animation between page navigations
const PageTransition = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--background))/40] backdrop-blur-[1px]"
        >
          <motion.div 
            className="flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { 
                type: "spring", 
                damping: 20,
                stiffness: 300
              }
            }}
            exit={{ 
              scale: 0.9, 
              opacity: 0,
              transition: { duration: 0.15 } 
            }}
          >
            {/* Just dots in circular arrangement */}
            <div className="relative flex items-center justify-center h-16 w-48">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute h-5 w-5 rounded-full bg-[hsl(var(--primary))]"
                  style={{
                    left: `${24 * i + 24}px`, 
                  }}
                  initial={{ y: 0 }}
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 0.1,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Composant MobileNav optimisé et mémorisé pour éviter les re-rendus excessifs
export const MobileNav = memo(function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // สร้าง state เพื่อติดตามว่าควรจะเล่นอนิเมชั่นหรือไม่
  const [shouldAnimate, setShouldAnimate] = useState(false);
  
  // État pour suivre quel bouton est actuellement en cours d'animation
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);
  
  // ตรวจสอบสถานะอนิเมชั่นเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    // ตรวจสอบว่าเคยแสดงอนิเมชั่นไปแล้วหรือไม่
    const hasAnimated = sessionStorage.getItem("nav_animated") === "true";
    
    // ถ้ายังไม่เคยแสดงอนิเมชั่น ให้แสดงอนิเมชั่น
    setShouldAnimate(!hasAnimated);
    
    // ถ้ายังไม่เคยแสดงอนิเมชั่น เมื่อแสดงอนิเมชั่นแล้วให้บันทึกลงใน sessionStorage
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        sessionStorage.setItem("nav_animated", "true");
      }, 800); // หลังจากอนิเมชั่นจบ
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Mettre en cache les éléments de navigation pour éviter les recalculs
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
                    scale: [1, 1.2, 0.9, 1.1, 1], // Animation simplifiée
                    transition: { duration: 0.3 }  // Durée réduite
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
                      scale: [1, 1.2, 0.9, 1.1, 1], // Animation simplifiée
                      transition: { duration: 0.3 }  // Durée réduite
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
  
  // Optimisé pour utiliser un seul gestionnaire d'événements
  const handleButtonClick = useCallback((href: string) => {
    setAnimatingButton(href);
    
    setTimeout(() => {
      setAnimatingButton(null);
    }, 300); // Réduit à 300ms
    
    if (href === "#") {
      setIsAddOpen(true);
    } else {
      router.push(href);
      
      if (isAddOpen) {
        setIsAddOpen(false);
      }
    }
  }, [router, isAddOpen]);
  
  // Détecter le tab actif (optimisé)
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