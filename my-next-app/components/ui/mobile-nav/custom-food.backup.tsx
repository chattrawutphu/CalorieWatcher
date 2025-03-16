"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodItem } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomFoodProps {
  onAdd: (food: FoodItem) => void;
  onBack: () => void;
}

const CustomFood = ({ onAdd, onBack }: CustomFoodProps) => {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  const [userCustomFoods, setUserCustomFoods] = useState<FoodItem[]>([]);
  
  const [servingAmount, setServingAmount] = useState<string>("1");
  const [servingUnit, setServingUnit] = useState<string>("serving");
  
  const commonUnits = [
    { value: "serving", label: "serving" },
    { value: "g", label: "g" },
    { value: "ml", label: "ml" },
    { value: "cup", label: "cup" },
    { value: "tbsp", label: "tbsp" },
    { value: "tsp", label: "tsp" },
    { value: "pcs", label: "pcs" },
    { value: "oz", label: "oz" }
  ];

  const [customFood, setCustomFood] = useState<{
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    servingSize: string;
    category: FoodItem['category'];
    mealCategory: FoodItem['mealCategory'];
  }>({
    name: "",
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    servingSize: "1 serving",
    category: "other",
    mealCategory: "other"
  });

  const handleSubmit = () => {
    if (!customFood.name || !customFood.calories) return;
    
    const combinedServingSize = `${servingAmount} ${servingUnit}`;
    
    const newFood: FoodItem = {
      id: crypto.randomUUID(),
      name: customFood.name,
      calories: Number(customFood.calories),
      protein: Number(customFood.protein) || 0,
      carbs: Number(customFood.carbs) || 0,
      fat: Number(customFood.fat) || 0,
      servingSize: combinedServingSize,
      favorite: false,
      createdAt: new Date(),
      category: customFood.category,
      mealCategory: customFood.mealCategory
    };
    
    onAdd(newFood);
    
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
    setServingAmount("1");
    setServingUnit("serving");
  };

  return (
    <div className="px-0 py-6">
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
          {t.addFood.submitButton}
        </Button>
      </div>
    </div>
  );
};

export default CustomFood; 
