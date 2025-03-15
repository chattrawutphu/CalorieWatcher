"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodItem, useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { Plus, ArrowLeft, Pencil, Trash2, AlignLeft, Filter, Search, X, Check, Clipboard } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CustomFoodProps {
  onAdd: (food: FoodItem) => void;
  onBack: () => void;
}

// เพิ่มหมวดหมู่อาหาร
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

const CustomFood = ({ onAdd, onBack }: CustomFoodProps) => {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const [showAddForm, setShowAddForm] = useState(false);
  const { favoriteFoods, dailyLogs, addFavoriteFood } = useNutritionStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // รวบรวมรายการอาหารที่ผู้ใช้เคยสร้างไว้
  const [userCustomFoods, setUserCustomFoods] = useState<FoodItem[]>([]);
  
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
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-2 overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
            <TabsTrigger value="lunch">Lunch</TabsTrigger>
            <TabsTrigger value="dinner">Dinner</TabsTrigger>
          </TabsList>
          
          <div className="flex overflow-x-auto py-2 -mx-2 px-2 gap-2 scrollbar-hide">
            {FOOD_CATEGORIES.filter(cat => !['breakfast', 'lunch', 'dinner'].includes(cat.id)).map(category => (
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
        </Tabs>
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
              <Select
                value={customFood.mealCategory}
                onValueChange={(value) => setCustomFood({...customFood, mealCategory: value})}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {FOOD_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <span className="mr-2">{category.emoji}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

export default CustomFood; 