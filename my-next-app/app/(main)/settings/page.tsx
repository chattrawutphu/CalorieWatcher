"use client";

import React, { useState, useEffect } from "react";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Save, LogOut, User, Check, Droplet, CupSoda, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// Animation variants
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

// Translations
const translations = {
  en: {
    settings: "Settings",
    account: "Account",
    profile: "Profile",
    signOut: "Sign Out",
    appearance: "Appearance",
    theme: "Theme",
    language: "Language",
    nutritionGoals: "Nutrition Goals",
    dailyCalories: "Daily Calories",
    macroDistribution: "Macro Distribution",
    protein: "Protein",
    fat: "Fat",
    carbs: "Carbohydrates",
    save: "Save Changes",
    saved: "Changes Saved!",
    of: "of",
    calories: "calories",
    waterSettings: "Water Intake",
    dailyWaterGoal: "Daily Water Goal",
    ml: "ml",
    liters: "liters",
    recommendedWater: "Recommended: 2000-3000 ml per day",
    glass: "glass",
  },
  th: {
    settings: "ตั้งค่า",
    account: "บัญชี",
    profile: "โปรไฟล์",
    signOut: "ออกจากระบบ",
    appearance: "การแสดงผล",
    theme: "ธีม",
    language: "ภาษา",
    nutritionGoals: "เป้าหมายโภชนาการ",
    dailyCalories: "แคลอรี่ต่อวัน",
    macroDistribution: "การกระจายของสารอาหาร",
    protein: "โปรตีน",
    fat: "ไขมัน",
    carbs: "คาร์โบไฮเดรต",
    save: "บันทึกการเปลี่ยนแปลง",
    saved: "บันทึกการเปลี่ยนแปลงแล้ว!",
    of: "จาก",
    calories: "แคลอรี่",
    waterSettings: "การดื่มน้ำ",
    dailyWaterGoal: "เป้าหมายการดื่มน้ำต่อวัน",
    ml: "มล.",
    liters: "ลิตร",
    recommendedWater: "แนะนำ: 2000-3000 มล. ต่อวัน",
    glass: "แก้ว",
  },
  ja: {
    settings: "設定",
    account: "アカウント",
    profile: "プロフィール",
    signOut: "サインアウト",
    appearance: "外観",
    theme: "テーマ",
    language: "言語",
    nutritionGoals: "栄養目標",
    dailyCalories: "1日のカロリー",
    macroDistribution: "マクロ分布",
    protein: "タンパク質",
    fat: "脂肪",
    carbs: "炭水化物",
    save: "変更を保存",
    saved: "保存しました！",
    of: "から",
    calories: "カロリー",
    waterSettings: "水分摂取",
    dailyWaterGoal: "1日の水分目標",
    ml: "ml",
    liters: "リットル",
    recommendedWater: "おすすめ：1日2000-3000ml",
    glass: "グラス",
  },
  zh: {
    settings: "设置",
    account: "账户",
    profile: "个人资料",
    signOut: "退出登录",
    appearance: "外观",
    theme: "主题",
    language: "语言",
    nutritionGoals: "营养目标",
    dailyCalories: "每日卡路里",
    macroDistribution: "宏量营养素分布",
    protein: "蛋白质",
    fat: "脂肪",
    carbs: "碳水化合物",
    save: "保存更改",
    saved: "已保存！",
    of: "共",
    calories: "卡路里",
    waterSettings: "饮水量",
    dailyWaterGoal: "每日饮水目标",
    ml: "ml",
    liters: "升",
    recommendedWater: "建议：每日2000-3000ml",
    glass: "杯",
  },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  const { goals, updateGoals } = useNutritionStore();
  
  // Local state for the form
  const [dailyCalories, setDailyCalories] = useState(goals.calories);
  const [proteinGrams, setProteinGrams] = useState(goals.protein);
  const [fatGrams, setFatGrams] = useState(goals.fat);
  const [carbsGrams, setCarbsGrams] = useState(goals.carbs);
  const [waterGoal, setWaterGoal] = useState(goals.water);
  const [isSaved, setIsSaved] = useState(false);
  
  // Calculate percentages based on grams
  const totalCaloriesFromMacros = 
    (proteinGrams * 4) + (fatGrams * 9) + (carbsGrams * 4);
  
  const proteinPercentage = Math.round((proteinGrams * 4 / totalCaloriesFromMacros) * 100) || 0;
  const fatPercentage = Math.round((fatGrams * 9 / totalCaloriesFromMacros) * 100) || 0;
  const carbsPercentage = Math.round((carbsGrams * 4 / totalCaloriesFromMacros) * 100) || 0;
  
  // Handle percentage changes while ensuring they sum to 100%
  const handleProteinChange = (value: number) => {
    const newProtein = Math.min(value, 100);
    const remaining = 100 - newProtein;
    
    // Distribute the remaining percentage between fat and carbs proportionally
    const currentRatio = carbsPercentage / (carbsPercentage + fatPercentage || 1);
    
    const newFat = Math.round(remaining * (1 - currentRatio));
    const newCarbs = 100 - newProtein - newFat;
    
    // Convert percentage back to grams
    setProteinGrams(Math.round((dailyCalories * newProtein / 100) / 4));
    setFatGrams(Math.round((dailyCalories * newFat / 100) / 9));
    setCarbsGrams(Math.round((dailyCalories * newCarbs / 100) / 4));
  };
  
  const handleFatChange = (value: number) => {
    const newFat = Math.min(value, 100);
    const remaining = 100 - newFat;
    
    // Distribute the remaining percentage between protein and carbs proportionally
    const currentRatio = carbsPercentage / (carbsPercentage + proteinPercentage || 1);
    
    const newProtein = Math.round(remaining * (1 - currentRatio));
    const newCarbs = 100 - newFat - newProtein;
    
    // Convert percentage back to grams
    setProteinGrams(Math.round((dailyCalories * newProtein / 100) / 4));
    setFatGrams(Math.round((dailyCalories * newFat / 100) / 9));
    setCarbsGrams(Math.round((dailyCalories * newCarbs / 100) / 4));
  };
  
  const handleCarbsChange = (value: number) => {
    const newCarbs = Math.min(value, 100);
    const remaining = 100 - newCarbs;
    
    // Distribute the remaining percentage between protein and fat proportionally
    const currentRatio = proteinPercentage / (proteinPercentage + fatPercentage || 1);
    
    const newProtein = Math.round(remaining * currentRatio);
    const newFat = 100 - newCarbs - newProtein;
    
    // Convert percentage back to grams
    setProteinGrams(Math.round((dailyCalories * newProtein / 100) / 4));
    setFatGrams(Math.round((dailyCalories * newFat / 100) / 9));
    setCarbsGrams(Math.round((dailyCalories * newCarbs / 100) / 4));
  };
  
  // Update grams when calories change
  useEffect(() => {
    // Recalculate macro grams when calories change
    setProteinGrams(Math.round((dailyCalories * proteinPercentage / 100) / 4));
    setFatGrams(Math.round((dailyCalories * fatPercentage / 100) / 9));
    setCarbsGrams(Math.round((dailyCalories * carbsPercentage / 100) / 4));
  }, [dailyCalories]);
  
  // Save changes
  const handleSave = async () => {
    await updateGoals({
      calories: dailyCalories,
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbsGrams,
      water: waterGoal,
    });
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };
  
  return (
    <motion.div
      className="max-w-md mx-auto min-h-screen pb-24"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.h1 variants={item} className="text-3xl font-bold mb-6">
        {t.settings}
      </motion.h1>
      
      {/* Account Section */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t.account}</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))]">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{session?.user?.name || "User"}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{session?.user?.email || ""}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut()}
                className="text-[hsl(var(--muted-foreground))]"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t.signOut}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Appearance Section */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t.appearance}</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <Label>{t.theme}</Label>
              <ThemeToggle />
            </div>
            <div className="flex justify-between items-center">
              <Label>{t.language}</Label>
              <LanguageSelector />
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Nutrition Goals Section */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t.nutritionGoals}</h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="calories">{t.dailyCalories}</Label>
              <Input
                id="calories"
                type="number"
                value={dailyCalories}
                onChange={(e) => setDailyCalories(Number(e.target.value))}
                min={500}
                max={10000}
                step={50}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>{t.macroDistribution}</Label>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">100%</span>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t.protein} ({proteinPercentage}%)</span>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{proteinGrams}g</span>
                  </div>
                  <Slider
                    value={[proteinPercentage]}
                    min={10}
                    max={60}
                    step={1}
                    onValueChange={(values) => handleProteinChange(values[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t.fat} ({fatPercentage}%)</span>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{fatGrams}g</span>
                  </div>
                  <Slider
                    value={[fatPercentage]}
                    min={10}
                    max={60}
                    step={1}
                    onValueChange={(values) => handleFatChange(values[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t.carbs} ({carbsPercentage}%)</span>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{carbsGrams}g</span>
                  </div>
                  <Slider
                    value={[carbsPercentage]}
                    min={10}
                    max={60}
                    step={1}
                    onValueChange={(values) => handleCarbsChange(values[0])}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Water Goal Section */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t.waterSettings}</h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="water">{t.dailyWaterGoal}</Label>
                <span className="text-sm text-[hsl(var(--primary))]">{waterGoal} {t.ml} ({(waterGoal / 1000).toFixed(1)} {t.liters})</span>
              </div>
              <Slider
                id="water"
                value={[waterGoal]}
                min={500}
                max={5000}
                step={100}
                onValueChange={(values) => setWaterGoal(values[0])}
              />
              <div className="flex items-center text-sm text-[hsl(var(--muted-foreground))]">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{t.recommendedWater}</span>
              </div>
              
              <div className="flex items-center justify-center mt-4 space-x-2">
                <CupSoda className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  = {Math.round(waterGoal / 250)} {t.glass} ({250} {t.ml})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Save Button */}
      <motion.div variants={item} className="mb-8">
        <Button 
          className="w-full"
          onClick={handleSave}
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4 mr-2" /> {t.saved}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> {t.save}
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
} 