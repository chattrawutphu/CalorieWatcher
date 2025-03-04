"use client";

import React, { useState } from "react";
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
import { Save, LogOut, User, Check } from "lucide-react";

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
    saved: "บันทึกแล้ว!",
    of: "จาก",
    calories: "แคลอรี่",
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
  },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  const { goals, setGoals } = useNutritionStore();
  
  // Local state for the form
  const [calorieGoal, setCalorieGoal] = useState(goals.dailyCalorieGoal);
  const [proteinPercentage, setProteinPercentage] = useState(goals.macroRatios.protein);
  const [fatPercentage, setFatPercentage] = useState(goals.macroRatios.fat);
  const [carbsPercentage, setCarbsPercentage] = useState(goals.macroRatios.carbs);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Calculate grams based on percentages and calorie goal
  const proteinGrams = Math.round((calorieGoal * (proteinPercentage / 100)) / 4); // 4 calories per gram of protein
  const fatGrams = Math.round((calorieGoal * (fatPercentage / 100)) / 9); // 9 calories per gram of fat
  const carbsGrams = Math.round((calorieGoal * (carbsPercentage / 100)) / 4); // 4 calories per gram of carbs
  
  // Handle percentage changes while ensuring they sum to 100%
  const handleProteinChange = (value: number) => {
    const newProtein = Math.min(value, 100);
    const remaining = 100 - newProtein;
    
    // Distribute the remaining percentage between fat and carbs proportionally
    const currentRatio = carbsPercentage / (carbsPercentage + fatPercentage || 1);
    
    const newFat = Math.round(remaining * (1 - currentRatio));
    const newCarbs = 100 - newProtein - newFat;
    
    setProteinPercentage(newProtein);
    setFatPercentage(newFat);
    setCarbsPercentage(newCarbs);
  };
  
  const handleFatChange = (value: number) => {
    const newFat = Math.min(value, 100);
    const remaining = 100 - newFat;
    
    // Distribute the remaining percentage between protein and carbs proportionally
    const currentRatio = carbsPercentage / (carbsPercentage + proteinPercentage || 1);
    
    const newProtein = Math.round(remaining * (1 - currentRatio));
    const newCarbs = 100 - newFat - newProtein;
    
    setFatPercentage(newFat);
    setProteinPercentage(newProtein);
    setCarbsPercentage(newCarbs);
  };
  
  const handleCarbsChange = (value: number) => {
    const newCarbs = Math.min(value, 100);
    const remaining = 100 - newCarbs;
    
    // Distribute the remaining percentage between protein and fat proportionally
    const currentRatio = proteinPercentage / (proteinPercentage + fatPercentage || 1);
    
    const newProtein = Math.round(remaining * currentRatio);
    const newFat = 100 - newCarbs - newProtein;
    
    setCarbsPercentage(newCarbs);
    setProteinPercentage(newProtein);
    setFatPercentage(newFat);
  };
  
  // Save changes
  const handleSave = () => {
    setGoals({
      dailyCalorieGoal: calorieGoal,
      macroRatios: {
        protein: proteinPercentage,
        fat: fatPercentage,
        carbs: carbsPercentage,
      },
    });
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.settings}</h1>
      </div>
      
      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.account}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <User className="h-12 w-12 rounded-full border p-2" />
            )}
            <div>
              <div className="font-medium">{session?.user?.name}</div>
              <div className="text-sm text-muted-foreground">{session?.user?.email}</div>
            </div>
          </div>
          
          <Button variant="destructive" onClick={() => signOut()} className="w-full sm:w-auto">
            <LogOut className="mr-2 h-4 w-4" />
            {t.signOut}
          </Button>
        </CardContent>
      </Card>
      
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.appearance}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">{t.theme}</Label>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="language">{t.language}</Label>
            <LanguageSelector />
          </div>
        </CardContent>
      </Card>
      
      {/* Nutrition Goals */}
      <Card>
        <CardHeader>
          <CardTitle>{t.nutritionGoals}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="calories">{t.dailyCalories}</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="calories"
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(parseInt(e.target.value) || 0)}
                min="1000"
                max="8000"
                className="w-24"
              />
              <span>{t.calories}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-base">{t.macroDistribution}</Label>
              <p className="text-sm text-muted-foreground">
                {t.protein}: {proteinPercentage}% • {t.fat}: {fatPercentage}% • {t.carbs}: {carbsPercentage}%
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="protein">{t.protein} ({proteinPercentage}%)</Label>
                  <span className="text-sm">{proteinGrams}g</span>
                </div>
                <Slider
                  id="protein"
                  min={10}
                  max={70}
                  step={1}
                  value={[proteinPercentage]}
                  onValueChange={(value) => handleProteinChange(value[0])}
                  className="[&_[role=slider]]:bg-blue-600"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="fat">{t.fat} ({fatPercentage}%)</Label>
                  <span className="text-sm">{fatGrams}g</span>
                </div>
                <Slider
                  id="fat"
                  min={10}
                  max={70}
                  step={1}
                  value={[fatPercentage]}
                  onValueChange={(value) => handleFatChange(value[0])}
                  className="[&_[role=slider]]:bg-red-600"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="carbs">{t.carbs} ({carbsPercentage}%)</Label>
                  <span className="text-sm">{carbsGrams}g</span>
                </div>
                <Slider
                  id="carbs"
                  min={10}
                  max={70}
                  step={1}
                  value={[carbsPercentage]}
                  onValueChange={(value) => handleCarbsChange(value[0])}
                  className="[&_[role=slider]]:bg-yellow-600"
                />
              </div>
            </div>
          </div>
          
          <Button onClick={handleSave} className="w-full" disabled={saveSuccess}>
            {saveSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t.saved}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t.save}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 