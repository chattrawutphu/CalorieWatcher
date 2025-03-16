"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodItem } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, ArrowLeft, Pencil, AlignLeft, X } from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/api/usda-api";
import { AnimatePresence } from "framer-motion";

interface CustomFoodProps {
  onAdd: (food: FoodItem) => void;
  onBack: () => void;
}

const CustomFood = ({ onAdd, onBack }: CustomFoodProps) => {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const [showAddForm, setShowAddForm] = useState(false);
  const { favoriteFoods, dailyLogs, addFavoriteFood } = useNutritionStore();
  
  // รวบรวมรายการอาหารที่ผู้ใช้เคยสร้างไว้
  const [userCustomFoods, setUserCustomFoods] = useState<FoodItem[]>([]);
  
  // แยก state สำหรับ serving size เป็นปริมาณและหน่วย
  const [servingAmount, setServingAmount] = useState<string>("1");
  const [servingUnit, setServingUnit] = useState<string>("serving");
  
  // รายการหน่วยที่ใช้บ่อย
  const commonUnits = [
    { value: "serving", label: "serving" },
    { value: "gram", label: "g" },
    { value: "milliliter", label: "ml" },
    { value: "cup", label: "cup" },
    { value: "tablespoon", label: "tbsp" },
    { value: "teaspoon", label: "tsp" },
    { value: "piece", label: "pcs" },
    { value: "ounce", label: "oz" },
    { value: "pound", label: "lb" }
  ];
  
  const [customFood, setCustomFood] = useState<{
    name: string;
    calories: string | number;
    protein: string | number;
    fat: string | number;
    carbs: string | number;
    servingSize: string;
    category: FoodItem['category'];
  }>({
    name: "",
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
    servingSize: "1 serving",
    category: "other"
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

  const bgVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.1 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.1 }
    }
  };

  const handleSubmit = () => {
    if (!customFood.name || !customFood.calories) return;
    
    // รวมปริมาณและหน่วยเป็น serving size เดียว
    const combinedServingSize = `${servingAmount} ${servingUnit}`;
    
    const newFood: FoodItem = {
      id: crypto.randomUUID(),
      name: customFood.name,
      calories: Number(customFood.calories) || 0,
      protein: Number(customFood.protein) || 0,
      carbs: Number(customFood.carbs) || 0,
      fat: Number(customFood.fat) || 0,
      servingSize: combinedServingSize,
      favorite: false,
      createdAt: new Date(),
      category: customFood.category
    };
    
    // เพิ่มไปที่ favoriteFoods เพื่อให้เก็บไว้ใช้ต่อ
    addFavoriteFood(newFood);
    
    // ส่งต่อไปยัง onAdd
    onAdd(newFood);
    
    // Reset form และซ่อนฟอร์ม
    setCustomFood({
      name: "",
      calories: "",
      protein: "",
      fat: "",
      carbs: "",
      servingSize: "1 serving",
      category: "other"
    });
    setServingAmount("1");
    setServingUnit("serving");
    setShowAddForm(false);
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
          <Plus className="h-4 w-4" /> Add Custom Food
        </Button>
      </div>
      
      {/* Modal สำหรับเพิ่มอาหารใหม่ - ลบ animation */}
      <AnimatePresence>
        {showAddForm && (
          <>
            {/* พื้นหลัง - ไม่ใช้ motion.div และไม่มี animation */}
            <div className="fixed inset-0 bg-[hsl(var(--background))] z-50" />
            
            {/* เนื้อหาหน้าใหม่ - ไม่ใช้ motion.div และไม่มี animation */}
            <div className="fixed inset-0 z-50 bg-[hsl(var(--background))] overflow-y-auto">
              <div className="max-w-md mx-auto p-5">
                <div className="flex items-center mb-4">
                  <button 
                    onClick={() => setShowAddForm(false)} 
                    className="p-2 mr-3 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h3 className="text-xl font-medium">Add New Custom Food</h3>
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
                    <label className="text-sm font-medium">Food Category</label>
                    <Select
                      value={customFood.category}
                      onValueChange={(value) => setCustomFood({...customFood, category: value as FoodItem['category']})}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {FOOD_CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <span>{category.emoji}</span>
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem value="other">
                          <div className="flex items-center gap-2">
                            <span>📋</span>
                            <span>Other</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Calories</label>
                    <Input
                      type="number"
                      value={customFood.calories}
                      onChange={(e) => setCustomFood({...customFood, calories: e.target.value === "0" ? "" : e.target.value})}
                      placeholder="0"
                      className="rounded-xl"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Protein (g)</label>
                      <Input
                        type="number"
                        value={customFood.protein}
                        onChange={(e) => setCustomFood({...customFood, protein: e.target.value === "0" ? "" : e.target.value})}
                        placeholder="0"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Carbs (g)</label>
                      <Input
                        type="number"
                        value={customFood.carbs}
                        onChange={(e) => setCustomFood({...customFood, carbs: e.target.value === "0" ? "" : e.target.value})}
                        placeholder="0"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fat (g)</label>
                      <Input
                        type="number"
                        value={customFood.fat}
                        onChange={(e) => setCustomFood({...customFood, fat: e.target.value === "0" ? "" : e.target.value})}
                        placeholder="0"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Serving Size</label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        value={servingAmount}
                        onChange={(e) => setServingAmount(e.target.value)}
                        placeholder="1"
                        className="flex-1 rounded-xl"
                      />
                      <Select
                        value={servingUnit}
                        onValueChange={setServingUnit}
                      >
                        <SelectTrigger className="w-32 rounded-xl">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonUnits.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleSubmit}
                    disabled={!customFood.name || !customFood.calories}
                  >
                    {t.addFood.submitButton || "Add Food"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
      
      {/* รายการอาหารที่ผู้ใช้เคยเพิ่มไว้ */}
      {userCustomFoods.length > 0 ? (
        <div className="space-y-3 mt-2">
          {userCustomFoods.map((food) => (
            <div 
              key={food.id}
              onClick={() => onAdd(food)}
              className="p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="font-medium">{food.name}</div>
                <div className="text-xs bg-[hsl(var(--primary))/0.1] px-2 py-0.5 rounded-full flex items-center">
                  <Pencil className="h-3 w-3 mr-1" /> Custom
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
