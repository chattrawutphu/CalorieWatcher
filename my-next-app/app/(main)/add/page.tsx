"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { FoodDatabase } from "@/lib/food-database";
import { useNutritionStore, MealEntry } from "@/lib/store/nutrition-store";
import { v4 as uuidv4 } from "uuid";
import { useLanguage } from "@/components/providers/language-provider";
import { Search, ArrowLeft, ChevronRight, Plus, Utensils, History } from "lucide-react";
import { motion } from "framer-motion";

// Translations
const translations = {
  en: {
    addFood: "Add Food",
    search: "Search",
    searchPlaceholder: "Search for a food...",
    recentlyAdded: "Recently Added",
    noRecent: "No recent foods added",
    mealType: "Meal Type",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    quantity: "Quantity",
    add: "Add to Log",
    macros: "Macros",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    custom: "Add Custom Food",
    foodName: "Food Name",
    calories: "Calories",
    servingSize: "Serving Size",
    itemAdded: "Item Added",
    selectFood: "Please select a food first",
    fillRequired: "Please fill in all required fields",
    create: "Create",
    kcal: "kcal",
    goBack: "Go Back",
    name: "Food Name",
    customDescription: "Create a custom food item"
  },
  th: {
    addFood: "เพิ่มอาหาร",
    search: "ค้นหา",
    searchPlaceholder: "ค้นหาอาหาร...",
    recentlyAdded: "เพิ่มล่าสุด",
    noRecent: "ไม่มีอาหารที่เพิ่มล่าสุด",
    mealType: "ประเภทมื้ออาหาร",
    breakfast: "อาหารเช้า",
    lunch: "อาหารกลางวัน",
    dinner: "อาหารเย็น",
    snack: "ของว่าง",
    quantity: "จำนวน",
    add: "เพิ่มลงในวันนี้",
    addAnother: "เพิ่มรายการอื่น",
    goBack: "ย้อนกลับ",
    itemAdded: "เพิ่มรายการลงในบันทึกของวันนี้แล้ว",
    custom: "เพิ่มอาหารเอง",
    customDescription: "สร้างรายการอาหารเอง",
    name: "ชื่ออาหาร",
    calories: "แคลอรี่",
    protein: "โปรตีน (ก.)",
    carbs: "คาร์โบไฮเดรต (ก.)",
    fat: "ไขมัน (ก.)",
    servingSize: "ขนาดการเสิร์ฟ",
    create: "สร้างรายการอาหาร",
    kcal: "กิโลแคลอรี่",
    macros: "สารอาหารหลัก",
    foodName: "ชื่ออาหาร",
    selectFood: "กรุณาเลือกอาหารก่อน",
    fillRequired: "กรุณากรอกข้อมูลที่จำเป็นทั้งหมด"
  },
  ja: {
    addFood: "食品を追加",
    search: "検索",
    searchPlaceholder: "食品を検索...",
    recentlyAdded: "最近追加した項目",
    noRecent: "最近追加した食品はありません",
    mealType: "食事タイプ",
    breakfast: "朝食",
    lunch: "昼食",
    dinner: "夕食",
    snack: "おやつ",
    quantity: "量",
    add: "今日に追加",
    addAnother: "別の項目を追加",
    goBack: "戻る",
    itemAdded: "今日のログにアイテムが追加されました",
    custom: "カスタム食品を追加",
    customDescription: "カスタム食品項目を作成",
    name: "食品名",
    calories: "カロリー",
    protein: "タンパク質 (g)",
    carbs: "炭水化物 (g)",
    fat: "脂肪 (g)",
    servingSize: "サービングサイズ",
    create: "食品アイテムを作成",
    kcal: "カロリー",
    macros: "マクロ栄養素",
    foodName: "食品名",
    selectFood: "最初に食品を選択してください",
    fillRequired: "必須項目をすべて入力してください"
  },
  zh: {
    addFood: "添加食物",
    search: "搜索",
    searchPlaceholder: "搜索食物...",
    recentlyAdded: "最近添加",
    noRecent: "没有最近添加的食物",
    mealType: "餐类型",
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snack: "零食",
    quantity: "数量",
    add: "添加到今天",
    addAnother: "添加另一个",
    goBack: "返回",
    itemAdded: "项目已添加到今天的日志",
    custom: "添加自定义食物",
    customDescription: "创建自定义食物",
    name: "食物名称",
    calories: "卡路里",
    protein: "蛋白质 (克)",
    carbs: "碳水化合物 (克)",
    fat: "脂肪 (克)",
    servingSize: "份量",
    create: "创建食物项目",
    kcal: "卡路里",
    macros: "宏量营养素",
    foodName: "食物名称",
    selectFood: "请先选择食物",
    fillRequired: "请填写所有必填字段"
  },
};

// Container and item variants for animation
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function AddFoodPage() {
  const searchParams = useSearchParams();
  const mealTypeParam = searchParams.get("type");
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  const { addMeal, dailyLogs, currentDate } = useNutritionStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<null | typeof FoodDatabase[0]>(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState(mealTypeParam || "breakfast");
  const [view, setView] = useState<"search" | "detail" | "custom">("search");
  
  // Custom food state
  const [customFood, setCustomFood] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    servingSize: "1 serving",
  });
  
  // Filter food items based on search term
  const filteredFoodItems = searchTerm
    ? FoodDatabase.filter((food) =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  // Get recently added items from today's log
  const todayLog = dailyLogs[currentDate] || { meals: [] };
  const recentFoods = [...todayLog.meals]
    .reverse()
    .slice(0, 5)
    .map((meal) => meal.foodItem);
  
  // Remove duplicates
  const uniqueRecentFoods = recentFoods.filter(
    (food, index, self) => 
      index === self.findIndex((f) => f.name === food.name)
  );
  
  const handleSelectFood = (food: typeof FoodDatabase[0]) => {
    setSelectedFood(food);
    setView("detail");
  };
  
  const handleAddMeal = () => {
    if (!selectedFood) return;
    
    const meal: MealEntry = {
      id: crypto.randomUUID(),
      mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      foodItem: {
        ...selectedFood,
        favorite: false,
        createdAt: new Date()
      },
      quantity: quantity,
      date: currentDate
    };
    
    addMeal(meal);
    
    toast({
      title: t.itemAdded,
      description: `${selectedFood.name} (${selectedFood.calories * quantity} ${t.kcal})`,
    });
    
    setSelectedFood(null);
    setQuantity(1);
  };
  
  const handleAddCustomFood = () => {
    if (!customFood.name || !customFood.calories) return;
    
    const newFood = {
      id: crypto.randomUUID(),
      name: customFood.name,
      calories: Number(customFood.calories),
      protein: Number(customFood.protein) || 0,
      carbs: Number(customFood.carbs) || 0,
      fat: Number(customFood.fat) || 0,
      servingSize: customFood.servingSize || "1 serving",
      favorite: false,
      createdAt: new Date()
    };
    
    const meal: MealEntry = {
      id: crypto.randomUUID(),
      mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      foodItem: newFood,
      quantity: quantity,
      date: currentDate
    };
    
    addMeal(meal);
    
    toast({
      title: t.itemAdded,
      description: `${customFood.name} (${Number(customFood.calories) * quantity} ${t.kcal})`,
    });
    
    // Reset form
    setCustomFood({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      servingSize: ""
    });
  };
  
  return (
    <motion.div
      className="space-y-6 pb-16" 
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Search View */}
      {view === "search" && (
        <>
          <motion.div variants={item}>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {t.addFood}
              </h1>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl"
                onClick={() => setView("custom")}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t.custom}
              </Button>
            </div>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="bg-[hsl(var(--background))/0.8] backdrop-blur-sm border-[hsl(var(--border))] shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
                  <CardTitle className="text-lg text-[hsl(var(--foreground))]">{t.search}</CardTitle>
                </div>
                <CardDescription className="text-[hsl(var(--muted-foreground))]">
                  {t.searchDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  />
                </div>
                
                {searchTerm && (
                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
                    {filteredFoodItems.length > 0 ? (
                      filteredFoodItems.map((food) => (
                        <motion.div
                          key={food.id}
                          className="p-3 rounded-xl bg-[hsl(var(--accent))/0.1] hover:bg-[hsl(var(--accent))/0.2] cursor-pointer flex items-center justify-between transition-colors"
                          onClick={() => handleSelectFood(food)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div>
                            <div className="font-medium text-[hsl(var(--foreground))]">{food.name}</div>
                            <div className="text-xs text-[hsl(var(--muted-foreground))]">{food.servingSize}</div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-[hsl(var(--primary))] font-semibold">{food.calories}</div>
                            <ChevronRight className="h-4 w-4 ml-1 text-[hsl(var(--muted-foreground))]" />
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-3 text-[hsl(var(--muted-foreground))]">{t.noResults}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {uniqueRecentFoods.length > 0 && (
            <motion.div variants={item}>
              <Card className="bg-[hsl(var(--background))/0.8] backdrop-blur-sm border-[hsl(var(--border))] shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <History className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
                    <CardTitle className="text-lg text-[hsl(var(--foreground))]">{t.recentlyAdded}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {uniqueRecentFoods.map((food) => (
                      <motion.div
                        key={food.id}
                        className="p-3 rounded-xl bg-[hsl(var(--accent))/0.1] hover:bg-[hsl(var(--accent))/0.2] cursor-pointer flex items-center justify-between transition-colors"
                        onClick={() => handleSelectFood(food)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div>
                          <div className="font-medium text-[hsl(var(--foreground))]">{food.name}</div>
                          <div className="text-xs text-[hsl(var(--muted-foreground))]">{food.servingSize}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-[hsl(var(--primary))] font-semibold">{food.calories}</div>
                          <ChevronRight className="h-4 w-4 ml-1 text-[hsl(var(--muted-foreground))]" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
      
      {/* Food Detail View */}
      {view === "detail" && selectedFood && (
        <>
          <motion.div 
            variants={item}
            className="flex items-center space-x-2"
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setView("search")}
              className="hover:bg-[hsl(var(--accent))/0.1] p-2 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{selectedFood.name}</h1>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="bg-[hsl(var(--background))/0.8] backdrop-blur-sm border-[hsl(var(--border))] shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[hsl(var(--foreground))]">{t.addFood}</CardTitle>
                <CardDescription className="text-[hsl(var(--muted-foreground))]">
                  {selectedFood.servingSize} • {selectedFood.calories} kcal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 pb-2">
                  <div className="p-3 rounded-xl bg-[hsl(var(--accent))/0.1]">
                    <div className="text-xs text-[hsl(var(--primary))]">{t.protein}</div>
                    <div className="text-lg font-semibold text-[hsl(var(--foreground))]">{selectedFood.protein}g</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[hsl(var(--accent))/0.1]">
                    <div className="text-xs text-[hsl(var(--primary))]">{t.carbs}</div>
                    <div className="text-lg font-semibold text-[hsl(var(--foreground))]">{selectedFood.carbs}g</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[hsl(var(--accent))/0.1]">
                    <div className="text-xs text-[hsl(var(--primary))]">{t.fat}</div>
                    <div className="text-lg font-semibold text-[hsl(var(--foreground))]">{selectedFood.fat}g</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="meal-type">{t.mealType}</Label>
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger id="meal-type" className="w-full rounded-xl border-[hsl(var(--border))]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">{t.breakfast}</SelectItem>
                      <SelectItem value="lunch">{t.lunch}</SelectItem>
                      <SelectItem value="dinner">{t.dinner}</SelectItem>
                      <SelectItem value="snack">{t.snack}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="quantity">{t.quantity}</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                      disabled={quantity <= 0.5}
                      className="h-10 w-10 rounded-xl border-[hsl(var(--border))]"
                    >
                      -
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="text-center rounded-xl border-[hsl(var(--border))]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 0.5)}
                      className="h-10 w-10 rounded-xl border-[hsl(var(--border))]"
                    >
                      +
                    </Button>
                  </div>
                  <div className="text-center text-sm text-[hsl(var(--muted-foreground))]">
                    {Math.round(selectedFood.calories * quantity)} kcal
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => setView("search")}
                  className="flex-1 border-[hsl(var(--border))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))/0.1] rounded-xl"
                >
                  {t.goBack}
                </Button>
                <Button
                  onClick={() => {
                    handleAddMeal();
                    setView("search");
                  }}
                  className="flex-1 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent))] hover:from-[hsl(var(--accent))/0.9] hover:to-[hsl(var(--accent))/0.9] rounded-xl"
                >
                  {t.add}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </>
      )}
      
      {/* Custom Food View */}
      {view === "custom" && (
        <>
          <motion.div 
            variants={item}
            className="flex items-center space-x-2"
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setView("search")}
              className="hover:bg-[hsl(var(--accent))/0.1] p-2 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {t.custom}
            </h1>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="bg-[hsl(var(--background))/0.8] backdrop-blur-sm border-[hsl(var(--border))] shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[hsl(var(--foreground))]">{t.custom}</CardTitle>
                <CardDescription className="text-[hsl(var(--muted-foreground))]">{t.customDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="food-name">{t.name}</Label>
                  <Input
                    id="food-name"
                    value={customFood.name}
                    onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                    className="rounded-xl border-[hsl(var(--border))]"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="calories">{t.calories}</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={customFood.calories}
                    onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                    className="rounded-xl border-[hsl(var(--border))]"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="protein">{t.protein}</Label>
                    <Input
                      id="protein"
                      type="number"
                      value={customFood.protein}
                      onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                      className="rounded-xl border-[hsl(var(--border))]"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="carbs">{t.carbs}</Label>
                    <Input
                      id="carbs"
                      type="number"
                      value={customFood.carbs}
                      onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                      className="rounded-xl border-[hsl(var(--border))]"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="fat">{t.fat}</Label>
                    <Input
                      id="fat"
                      type="number"
                      value={customFood.fat}
                      onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
                      className="rounded-xl border-[hsl(var(--border))]"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="serving-size">{t.servingSize}</Label>
                  <Input
                    id="serving-size"
                    value={customFood.servingSize}
                    onChange={(e) => setCustomFood({
                      ...customFood,
                      servingSize: e.target.value,
                    })}
                    placeholder="100g, 1 slice, etc."
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="meal-type">{t.mealType}</Label>
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger id="meal-type" className="w-full rounded-xl border-[hsl(var(--border))]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">{t.breakfast}</SelectItem>
                      <SelectItem value="lunch">{t.lunch}</SelectItem>
                      <SelectItem value="dinner">{t.dinner}</SelectItem>
                      <SelectItem value="snack">{t.snack}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => setView("search")}
                  className="flex-1 border-[hsl(var(--border))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))/0.1] rounded-xl"
                >
                  {t.goBack}
                </Button>
                <Button
                  onClick={handleAddCustomFood}
                  className="flex-1 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent))] hover:from-[hsl(var(--accent))/0.9] hover:to-[hsl(var(--accent))/0.9] rounded-xl"
                >
                  {t.create}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
} 