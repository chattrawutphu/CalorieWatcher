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
import { Save, LogOut, User, Check, Droplet, CupSoda, AlertCircle, Cloud, RefreshCw, Loader2, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow, formatRelative } from 'date-fns';
import { th, ja, zhCN } from 'date-fns/locale';
import type { Locale } from 'date-fns';

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
    syncData: "Data Synchronization",
    lastSync: "Last synchronized",
    neverSynced: "Never synced",
    syncNow: "Sync Now",
    syncing: "Syncing...",
    syncComplete: "Sync Complete",
    weightSettings: "Weight Goal",
    weightGoal: "Weight Goal",
    kg: "kg",
    weightDescription: "Track weight regularly",
    trackWeightRegularly: "Track weight regularly",
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
    syncData: "การซิงค์ข้อมูล",
    lastSync: "ซิงค์ล่าสุดเมื่อ",
    neverSynced: "ไม่เคยซิงค์",
    syncNow: "ซิงค์ตอนนี้",
    syncing: "กำลังซิงค์...",
    syncComplete: "ซิงค์เสร็จสิ้น",
    weightSettings: "เป้าหมายน้ำหนัก",
    weightGoal: "เป้าหมายน้ำหนัก",
    kg: "กิโลกรัม",
    weightDescription: "ติดตามน้ำหนักประจำ",
    trackWeightRegularly: "ติดตามน้ำหนักประจำ",
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
    syncData: "データ同期",
    lastSync: "最終同期",
    neverSynced: "同期履歴なし",
    syncNow: "今すぐ同期",
    syncing: "同期中...",
    syncComplete: "同期完了",
    weightSettings: "体重目標",
    weightGoal: "体重目標",
    kg: "kg",
    weightDescription: "定期的に体重を記録する",
    trackWeightRegularly: "定期的に体重を記録する",
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
    syncData: "数据同步",
    lastSync: "最后同步时间",
    neverSynced: "从未同步",
    syncNow: "立即同步",
    syncing: "同步中...",
    syncComplete: "同步完成",
    weightSettings: "体重目标",
    weightGoal: "体重目标",
    kg: "公斤",
    weightDescription: "定期称重",
    trackWeightRegularly: "定期称重",
  },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  const { goals, updateGoals, syncData, isLoading: isSyncingFromStore } = useNutritionStore();
  
  // Local state for the form
  const [dailyCalories, setDailyCalories] = useState(goals.calories);
  const [proteinGrams, setProteinGrams] = useState(goals.protein);
  const [fatGrams, setFatGrams] = useState(goals.fat);
  const [carbsGrams, setCarbsGrams] = useState(goals.carbs);
  const [waterGoal, setWaterGoal] = useState(goals.water);
  const [weightGoal, setWeightGoal] = useState(goals.weight || 70);
  const [isSaved, setIsSaved] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncAnimating, setSyncAnimating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // โหลดเวลาซิงค์ล่าสุด
  useEffect(() => {
    // เนื่องจาก getLastSyncTime ไม่มีใน API ของ store จึงใช้ localStorage แทน
    const storedSyncTime = localStorage.getItem('last-sync-time');
    setLastSyncTime(storedSyncTime);
  }, []);

  // ฟังก์ชันสำหรับฟอร์แมตเวลา
  const formatLastSyncTime = () => {
    if (!lastSyncTime) return t.neverSynced;
    
    // เลือกภาษาตาม locale
    const localeOptions: Record<string, Locale> = {
      th: th,
      ja: ja,
      zh: zhCN
    };
    
    const localeOption = localeOptions[locale as keyof typeof localeOptions];
    
    return formatDistanceToNow(new Date(lastSyncTime), { 
      addSuffix: true,
      locale: localeOption
    });
  };
  
  // ฟังก์ชันสำหรับซิงค์ข้อมูลแบบ manual
  const handleSyncData = async () => {
    setSyncAnimating(true);
    setIsSyncing(true);
    
    await syncData();
    
    // บันทึกเวลาซิงค์ล่าสุดใน localStorage
    const now = new Date().toISOString();
    localStorage.setItem('last-sync-time', now);
    setLastSyncTime(now);
    
    // หลังจาก sync เสร็จ ให้แสดง "sync complete" เป็นเวลาสั้นๆ
    setTimeout(() => {
      setSyncAnimating(false);
      setIsSyncing(false);
    }, 1500);
  };
  
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
    // Update the goals in the store
    const updatedGoals = {
      calories: dailyCalories,
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbsGrams,
      water: waterGoal,
      weight: weightGoal
    };
    
    await updateGoals(updatedGoals);
    
    // Show saved message
    setIsSaved(true);
    
    // Hide the saved message after 2 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };
  
  return (
    <motion.div
      className="max-w-md mx-auto min-h-screen pb-24"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.h1 variants={item} className="text-xl font-extrabold mb-6">
        {t.settings}
      </motion.h1>
      
      {/* Data Sync Section */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t.syncData}</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <span>{t.lastSync}:</span>
                </div>
                <span className="text-[hsl(var(--muted-foreground))]">
                  {formatLastSyncTime()}
                </span>
              </div>
              <Button 
                onClick={handleSyncData}
                disabled={isSyncing || syncAnimating}
                className="w-full"
              >
                {isSyncing || syncAnimating ? (
                  <div className="flex items-center gap-2">
                    {syncAnimating ? (
                      <>
                        <Check className="h-4 w-4 animate-pulse" />
                        <span>{t.syncComplete}</span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t.syncing}</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>{t.syncNow}</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Account Section */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t.account}</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))]">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{session?.user?.name || "User"}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] truncate max-w-[200px] sm:max-w-[250px]">{session?.user?.email || ""}</p>
                </div>
              </div>
              <div className="mt-2 sm:mt-0 ml-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="rounded-full hover:bg-[hsl(var(--destructive))/0.1] hover:text-[hsl(var(--destructive))] transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.signOut}
                </Button>
              </div>
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
      
      {/* Weight Goal Section */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t.weightSettings}</h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="weight">{t.weightGoal}</Label>
                <span className="text-sm text-[hsl(var(--primary))]">{weightGoal} {t.kg}</span>
              </div>
              <Slider
                id="weight"
                value={[weightGoal]}
                min={30}
                max={150}
                step={0.5}
                onValueChange={(values) => setWeightGoal(values[0])}
              />
              <div className="flex items-center text-sm text-[hsl(var(--muted-foreground))]">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{t.weightDescription}</span>
              </div>
              
              <div className="flex items-center justify-center mt-4 space-x-2">
                <Scale className="h-5 w-5 text-[hsl(var(--primary))]" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  {t.trackWeightRegularly}
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