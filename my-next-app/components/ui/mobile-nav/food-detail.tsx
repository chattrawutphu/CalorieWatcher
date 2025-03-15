"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoodItem } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";

interface FoodDetailProps {
  food: FoodItem;
  onBack: () => void;
  onAddFood: (food: FoodItem, quantity: number, mealType: string) => void;
}

const FoodDetail = ({ food, onBack, onAddFood }: FoodDetailProps) => {
  // ผู้ใช้สามารถปรับปริมาณได้เป็นทศนิยม
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState("breakfast");
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // สถานะสำหรับโหมดแก้ไขและข้อมูลอาหารที่แก้ไขได้
  const [isEditing, setIsEditing] = useState(false);
  const [editableFood, setEditableFood] = useState<FoodItem>({...food});
  
  // อัปเดต editableFood เมื่อ food prop เปลี่ยน
  useEffect(() => {
    setEditableFood({...food});
  }, [food]);

  // นำการแก้ไขไปใช้กับอาหารที่แสดง
  const applyEdits = () => {
    // สร้าง FoodItem ใหม่พร้อมค่าที่แก้ไขแล้วแต่รักษา id ต้นฉบับ
    const updatedFood: FoodItem = {
      ...editableFood,
      id: food.id,
      createdAt: food.createdAt,
      favorite: food.favorite
    };
    
    // ส่งอาหารที่แก้ไขกลับไปที่ parent component
    onAddFood(updatedFood, quantity, mealType);
    
    // ออกจากโหมดแก้ไข
    setIsEditing(false);
  };

  // จัดรูปแบบตัวเลขเพื่อป้องกันทศนิยมมากเกินไป
  const formatNumber = (num: number): number => {
    return parseFloat(num.toFixed(2));
  };

  // ข้อมูลอาหารที่จะแสดง (ต้นฉบับหรือที่แก้ไข)
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

export default FoodDetail; 