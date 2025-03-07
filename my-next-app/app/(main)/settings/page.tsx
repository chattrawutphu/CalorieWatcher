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
import { Save, LogOut, User, Check, Droplet, CupSoda, AlertCircle } from "lucide-react";

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
  
  const { goals, setGoals } = useNutritionStore();
  
  // Local state for the form
  const [dailyCalories, setDailyCalories] = useState(goals.dailyCalorieGoal);
  const [proteinPercentage, setProteinPercentage] = useState(goals.macroRatios.protein);
  const [fatPercentage, setFatPercentage] = useState(goals.macroRatios.fat);
  const [carbsPercentage, setCarbsPercentage] = useState(goals.macroRatios.carbs);
  const [waterGoal, setWaterGoal] = useState(goals.waterGoal);
  const [isSaved, setIsSaved] = useState(false);
  
  // Calculate grams based on percentages and calorie goal
  const proteinGrams = Math.round((dailyCalories * (proteinPercentage / 100)) / 4); // 4 calories per gram of protein
  const fatGrams = Math.round((dailyCalories * (fatPercentage / 100)) / 9); // 9 calories per gram of fat
  const carbsGrams = Math.round((dailyCalories * (carbsPercentage / 100)) / 4); // 4 calories per gram of carbs
  
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
      dailyCalorieGoal: dailyCalories,
      macroRatios: {
        protein: proteinPercentage,
        fat: fatPercentage,
        carbs: carbsPercentage,
      },
      waterGoal: waterGoal,
    });
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
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
            <Label htmlFor="dailyCalories">{t.dailyCalories}</Label>
            <div className="flex items-center gap-4">
              <Input
                id="dailyCalories"
                type="number"
                min={1000}
                max={5000}
                value={dailyCalories}
                onChange={(e) => setDailyCalories(Number(e.target.value))}
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
          
          {/* Water Goal */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-500" />
              <Label className="text-base font-medium">{t.waterSettings}</Label>
            </div>
            
            <div className="bg-[hsl(var(--accent))/0.1] p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="waterGoal" className="font-medium">{t.dailyWaterGoal}</Label>
                <div className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                  <CupSoda className="h-4 w-4" />
                  <span className="text-sm">{Math.ceil(waterGoal / 250)} {t.glass.toLowerCase()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Input
                  id="waterGoal"
                  type="number"
                  min={500}
                  max={5000}
                  step={100}
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(Number(e.target.value))}
                  className="w-24"
                />
                <span>{t.ml}</span>
                <span className="text-[hsl(var(--primary))] font-medium text-base">
                  ({(waterGoal / 1000).toFixed(1)} {t.liters})
                </span>
              </div>
              
              {/* Quick preset buttons */}
              <div className="flex flex-wrap gap-2">
                {[1500, 2000, 2500, 3000].map((amount) => (
                  <Button 
                    key={amount} 
                    type="button" 
                    variant={waterGoal === amount ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWaterGoal(amount)}
                    className="flex items-center"
                  >
                    {amount === 2000 && <Check className="mr-1 h-3 w-3" />}
                    {amount / 1000}{t.liters}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-1">
                <Slider
                  defaultValue={[waterGoal]}
                  min={500}
                  max={5000}
                  step={100}
                  onValueChange={(value) => setWaterGoal(value[0])}
                  value={[waterGoal]}
                  className="[&_[role=slider]]:bg-blue-500"
                />
                <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                  <span>0.5 {t.liters}</span>
                  <span className="text-center">2.5 {t.liters}</span>
                  <span>5 {t.liters}</span>
                </div>
              </div>
              
              <div className="text-[hsl(var(--muted-foreground))] text-sm bg-[hsl(var(--background))] p-2 rounded border border-[hsl(var(--border))] flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{t.recommendedWater}</span>
              </div>
              
              {/* Visual representation */}
              <div className="flex justify-center space-x-1 py-2">
                {Array.from({ length: Math.min(8, Math.ceil(waterGoal / 250)) }).map((_, i) => (
                  <div key={i} className="relative w-6 h-8 rounded-b-lg border border-t-0 border-blue-500">
                    <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-blue-500/20" style={{ height: '100%' }}></div>
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] text-white z-10">
                      💧
                    </span>
                  </div>
                ))}
                {waterGoal > 2000 && (
                  <div className="flex items-center">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">+{Math.ceil((waterGoal - 2000) / 250)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Button onClick={handleSave} className="w-full" disabled={isSaved}>
            {isSaved ? (
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