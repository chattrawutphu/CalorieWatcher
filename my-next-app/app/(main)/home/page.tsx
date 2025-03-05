"use client";

import React from "react";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, UtensilsCrossed, AppleIcon, Coffee, ArrowRight, Plus, PieChart, Sun, Moon, Cookie, Candy, Lock, Coins } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/providers/language-provider";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";

// Text translations
const translations = {
  en: {
    greeting: "Hello",
    todaySummary: "Today's Summary",
    caloriesRemaining: "Calories Remaining",
    of: "of",
    calories: "calories",
    protein: "Protein",
    fat: "Fat",
    carbs: "Carbs",
    g: "g",
    addMeal: "Add Meal",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    welcome: "Welcome back",
    subtitle: "Start tracking your nutrition",
    quickAdd: "Quick Add",
    viewDashboard: "View Dashboard",
    stats: "Your Stats",
    recentMeals: "Recent Meals",
    viewAll: "View All",
    noMeals: "No recent meals. Add your first meal!",
    themeStore: "Theme Store",
    themeStoreDesc: "Customize your experience with beautiful themes",
    coins: "coins",
    free: "Free",
    owned: "Owned",
    buy: "Buy",
    locked: "Locked",
    light: {
      name: "Light Theme",
      desc: "Clean and bright interface"
    },
    dark: {
      name: "Dark Theme",
      desc: "Easy on the eyes"
    },
    chocolate: {
      name: "Chocolate Theme",
      desc: "Rich and delicious design",
      price: 500
    },
    sweet: {
      name: "Sweet Theme",
      desc: "Cute and colorful experience",
      price: 800
    }
  },
  th: {
    greeting: "สวัสดี",
    todaySummary: "สรุปประจำวัน",
    caloriesRemaining: "แคลอรี่ที่เหลือ",
    of: "จาก",
    calories: "แคลอรี่",
    protein: "โปรตีน",
    fat: "ไขมัน",
    carbs: "คาร์โบไฮเดรต",
    g: "ก.",
    addMeal: "เพิ่มมื้อ",
    breakfast: "อาหารเช้า",
    lunch: "อาหารกลางวัน",
    dinner: "อาหารเย็น",
    snack: "ของว่าง",
    welcome: "ยินดีต้อนรับกลับ",
    subtitle: "เริ่มติดตามโภชนาการของคุณ",
    quickAdd: "เพิ่มอย่างรวดเร็ว",
    viewDashboard: "ดูแดชบอร์ด",
    stats: "สถิติของคุณ",
    recentMeals: "อาหารล่าสุด",
    viewAll: "ดูทั้งหมด",
    noMeals: "ไม่มีมื้ออาหารล่าสุด เพิ่มมื้อแรกของคุณ!",
    themeStore: "ร้านค้าธีม",
    themeStoreDesc: "ปรับแต่งประสบการณ์ด้วยธีมสวยๆ",
    coins: "เหรียญ",
    free: "ฟรี",
    owned: "เป็นเจ้าของ",
    buy: "ซื้อ",
    locked: "ล็อค",
    light: {
      name: "ธีมสว่าง",
      desc: "อินเตอร์เฟซที่สะอาดและสว่าง"
    },
    dark: {
      name: "ธีมมืด",
      desc: "ถนอมสายตา"
    },
    chocolate: {
      name: "ธีมช็อกโกแลต",
      desc: "การออกแบบที่หอมหวาน",
      price: 500
    },
    sweet: {
      name: "ธีมหวาน",
      desc: "ประสบการณ์ที่น่ารักและสีสันสดใส",
      price: 800
    }
  },
  ja: {
    greeting: "こんにちは",
    todaySummary: "今日のまとめ",
    caloriesRemaining: "残りのカロリー",
    of: "から",
    calories: "カロリー",
    protein: "タンパク質",
    fat: "脂肪",
    carbs: "炭水化物",
    g: "g",
    addMeal: "食事を追加",
    breakfast: "朝食",
    lunch: "昼食",
    dinner: "夕食",
    snack: "おやつ",
    welcome: "おかえりなさい",
    subtitle: "栄養トラッキングを始めましょう",
    quickAdd: "クイック追加",
    viewDashboard: "ダッシュボードを表示",
    stats: "あなたの統計",
    recentMeals: "最近の食事",
    viewAll: "すべて表示",
    noMeals: "最近の食事はありません。最初の食事を追加しましょう！",
    themeStore: "テーマストア",
    themeStoreDesc: "美しいテーマでカスタマイズ",
    coins: "コイン",
    free: "無料",
    owned: "所有",
    buy: "購入",
    locked: "ロック",
    light: {
      name: "ライトテーマ",
      desc: "クリーンで明るいインターフェース"
    },
    dark: {
      name: "ダークテーマ",
      desc: "目に優しい"
    },
    chocolate: {
      name: "チョコレートテーマ",
      desc: "リッチで美味しいデザイン",
      price: 500
    },
    sweet: {
      name: "スイートテーマ",
      desc: "かわいいカラフルな体験",
      price: 800
    }
  },
  zh: {
    greeting: "你好",
    todaySummary: "今日总结",
    caloriesRemaining: "剩余卡路里",
    of: "共",
    calories: "卡路里",
    protein: "蛋白质",
    fat: "脂肪",
    carbs: "碳水化合物",
    g: "克",
    addMeal: "添加餐食",
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snack: "点心",
    welcome: "欢迎回来",
    subtitle: "开始追踪您的营养",
    quickAdd: "快速添加",
    viewDashboard: "查看仪表板",
    stats: "您的统计数据",
    recentMeals: "最近的膳食",
    viewAll: "查看全部",
    noMeals: "没有最近的膳食。添加您的第一餐！",
    themeStore: "主题商店",
    themeStoreDesc: "使用精美主题自定义体验",
    coins: "金币",
    free: "免费",
    owned: "已拥有",
    buy: "购买",
    locked: "锁定",
    light: {
      name: "明亮主题",
      desc: "清新明亮的界面"
    },
    dark: {
      name: "暗黑主题",
      desc: "护眼模式"
    },
    chocolate: {
      name: "巧克力主题",
      desc: "丰富美味的设计",
      price: 500
    },
    sweet: {
      name: "甜蜜主题",
      desc: "可爱多彩的体验",
      price: 800
    }
  },
};

// Spring animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const ThemeCard = ({ 
  icon, 
  name, 
  description, 
  price, 
  isOwned,
  onClick,
  disabled
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  price?: number;
  isOwned: boolean;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <motion.div variants={item}>
    <Card className="overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--accent))/0.1] flex items-center justify-center text-[hsl(var(--foreground))]">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
            </div>
          </div>
        </div>
        <Button
          onClick={onClick}
          disabled={disabled}
          variant={isOwned ? "outline" : "default"}
          className="w-full"
        >
          {price ? (
            isOwned ? (
              <span>Owned</span>
            ) : (
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span>{price}</span>
              </div>
            )
          ) : (
            <span>Free</span>
          )}
        </Button>
      </div>
    </Card>
  </motion.div>
);

export default function HomePage() {
  const { data: session } = useSession();
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  const { goals, dailyLogs, currentDate } = useNutritionStore();
  
  // Get today's log or create an empty one
  const todayLog = dailyLogs[currentDate] || {
    date: currentDate,
    meals: [],
    totalCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
  };
  
  // Calculate remaining calories
  const caloriesRemaining = goals.dailyCalorieGoal - todayLog.totalCalories;
  const caloriesPercentage = Math.min(100, (todayLog.totalCalories / goals.dailyCalorieGoal) * 100);
  
  // Calculate macro progress
  const targetProtein = (goals.dailyCalorieGoal * (goals.macroRatios.protein / 100)) / 4; // 4 calories per gram of protein
  const targetFat = (goals.dailyCalorieGoal * (goals.macroRatios.fat / 100)) / 9; // 9 calories per gram of fat
  const targetCarbs = (goals.dailyCalorieGoal * (goals.macroRatios.carbs / 100)) / 4; // 4 calories per gram of carbs
  
  const proteinPercentage = Math.min(100, (todayLog.totalProtein / targetProtein) * 100);
  const fatPercentage = Math.min(100, (todayLog.totalFat / targetFat) * 100);
  const carbsPercentage = Math.min(100, (todayLog.totalCarbs / targetCarbs) * 100);
  
  // Group meals by meal type
  const mealsByType = {
    breakfast: todayLog.meals.filter(meal => meal.mealType === 'breakfast'),
    lunch: todayLog.meals.filter(meal => meal.mealType === 'lunch'),
    dinner: todayLog.meals.filter(meal => meal.mealType === 'dinner'),
    snack: todayLog.meals.filter(meal => meal.mealType === 'snack'),
  };
  
  // Get recent meals
  const recentMeals = todayLog.meals.slice(0, 3);

  const { theme, setTheme } = useTheme();
  
  // In a real app, these would come from a user's data
  const userCoins = 1000;
  const ownedThemes = ["light", "dark", "chocolate"];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-md mx-auto p-4 space-y-8"
    >
      <motion.div variants={item} className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 dark-chocolate:from-[#d4a66a] dark-chocolate:to-[#a3663d] sweet:from-[#FF85C0] sweet:via-[#6FB2FF] sweet:to-[#9DE7B5] bg-clip-text text-transparent">
          {t.greeting}, {session?.user?.name?.split(' ')[0] || ''}!
        </h1>
        <p className="text-gray-500 dark-chocolate:text-gray-400 sweet:text-pink-400">{t.subtitle}</p>
      </motion.div>

      <div className="space-y-4">
        <motion.div variants={item}>
          <h2 className="text-xl font-semibold mb-1">{t.themeStore}</h2>
          <p className="text-[hsl(var(--muted-foreground))]">{t.themeStoreDesc}</p>
        </motion.div>

        <div className="grid gap-4">
          <ThemeCard
            icon={<Sun className="h-6 w-6" />}
            name={t.light.name}
            description={t.light.desc}
            isOwned={true}
            onClick={() => setTheme("light")}
          />

          <ThemeCard
            icon={<Moon className="h-6 w-6" />}
            name={t.dark.name}
            description={t.dark.desc}
            isOwned={true}
            onClick={() => setTheme("dark")}
          />

          <ThemeCard
            icon={<Cookie className="h-6 w-6" />}
            name={t.chocolate.name}
            description={t.chocolate.desc}
            price={t.chocolate.price}
            isOwned={ownedThemes.includes("chocolate")}
            onClick={() => setTheme("chocolate")}
          />

          <ThemeCard
            icon={<Candy className="h-6 w-6" />}
            name={t.sweet.name}
            description={t.sweet.desc}
            price={t.sweet.price}
            isOwned={ownedThemes.includes("sweet")}
            onClick={() => {
              if (ownedThemes.includes("sweet")) {
                setTheme("sweet");
              }
              // Add purchase logic here
            }}
          />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <motion.div 
        className="grid grid-cols-2 gap-4"
        variants={item}
      >
        <Link href="/add">
          <Button className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 dark-chocolate:from-[#a3663d] dark-chocolate:to-[#8b4513] dark-chocolate:hover:from-[#8b4513] dark-chocolate:hover:to-[#6b3100] sweet:from-[#FF85C0] sweet:to-[#6FB2FF] sweet:hover:from-[#ff6eb3] sweet:hover:to-[#5a9ef0] rounded-xl shadow-md shadow-purple-200 dark-chocolate:shadow-[#2a1e16] sweet:shadow-pink-200">
            <Plus className="mr-2 h-5 w-5" />
            {t.quickAdd}
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="w-full h-14 border-purple-200 dark-chocolate:border-[#3a2a20] sweet:border-pink-200 text-purple-600 dark-chocolate:text-[#d4a66a] sweet:text-pink-500 hover:bg-purple-50 dark-chocolate:hover:bg-[#372518] sweet:hover:bg-pink-50 rounded-xl">
            <PieChart className="mr-2 h-5 w-5" />
            {t.viewDashboard}
          </Button>
        </Link>
      </motion.div>

      {/* Stats Card */}
      <motion.div variants={item}>
        <Card className="bg-white/80 dark-chocolate:bg-[#2a1e16]/80 backdrop-blur-sm border-purple-100 dark-chocolate:border-[#3a2a20] shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-800 dark-chocolate:text-[#e6c8a1]">{t.stats}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="col-span-4 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark-chocolate:from-[#a3663d] dark-chocolate:to-[#8b4513] text-white rounded-xl p-4 shadow-md shadow-purple-200 dark-chocolate:shadow-[#2a1e16]">
                  <p className="text-xs mb-1">{t.calories}</p>
                  <p className="text-3xl font-bold">{todayLog.totalCalories}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-16 rounded-xl bg-purple-100 dark-chocolate:bg-[#3a2a20] p-2 flex flex-col items-center justify-center">
                  <p className="text-xs text-purple-700 dark-chocolate:text-[#d4a66a]">{t.protein}</p>
                  <p className="text-lg font-bold text-purple-800 dark-chocolate:text-[#e6c8a1]">
                    {todayLog.totalProtein}<span className="text-xs ml-1">{t.g}</span>
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-16 rounded-xl bg-blue-100 dark-chocolate:bg-[#3a2a20] p-2 flex flex-col items-center justify-center">
                  <p className="text-xs text-blue-700 dark-chocolate:text-[#d4a66a]">{t.carbs}</p>
                  <p className="text-lg font-bold text-blue-800 dark-chocolate:text-[#e6c8a1]">
                    {todayLog.totalCarbs}<span className="text-xs ml-1">{t.g}</span>
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-16 rounded-xl bg-pink-100 dark-chocolate:bg-[#3a2a20] p-2 flex flex-col items-center justify-center">
                  <p className="text-xs text-pink-700 dark-chocolate:text-[#d4a66a]">{t.fat}</p>
                  <p className="text-lg font-bold text-pink-800 dark-chocolate:text-[#e6c8a1]">
                    {todayLog.totalFat}<span className="text-xs ml-1">{t.g}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Meals */}
      <motion.div variants={item}>
        <Card className="bg-white/80 dark-chocolate:bg-[#2a1e16]/80 backdrop-blur-sm border-purple-100 dark-chocolate:border-[#3a2a20] shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 flex justify-between items-center">
            <CardTitle className="text-lg text-gray-800 dark-chocolate:text-[#e6c8a1]">{t.recentMeals}</CardTitle>
            <Link href="/history">
              <Button variant="link" className="h-8 p-0 text-purple-500 dark-chocolate:text-[#d4a66a]">
                {t.viewAll} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentMeals.length > 0 ? (
              <div className="space-y-3">
                {recentMeals.map((meal, index) => (
                  <motion.div 
                    key={meal.id}
                    className="flex items-center justify-between p-3 bg-purple-50 dark-chocolate:bg-[#3a2a20] rounded-xl"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 dark-chocolate:from-[#a3663d] dark-chocolate:to-[#8b4513] flex items-center justify-center text-white mr-3">
                        {meal.mealType === 'breakfast' && '🍳'}
                        {meal.mealType === 'lunch' && '🍜'}
                        {meal.mealType === 'dinner' && '🍽️'}
                        {meal.mealType === 'snack' && '🍎'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark-chocolate:text-[#e6c8a1]">{meal.foodItem.name}</p>
                        <p className="text-xs text-gray-500 dark-chocolate:text-gray-400">
                          {meal.quantity} × {meal.foodItem.servingSize}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-purple-600 dark-chocolate:text-[#d4a66a]">
                      {Math.round(meal.foodItem.calories * meal.quantity)}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-gray-500 dark-chocolate:text-gray-400 text-sm">{t.noMeals}</p>
                <Link href="/add" className="mt-2 inline-block">
                  <Button variant="outline" size="sm" className="mt-2 border-purple-200 dark-chocolate:border-[#3a2a20] text-purple-600 dark-chocolate:text-[#d4a66a] hover:bg-purple-50 dark-chocolate:hover:bg-[#372518] rounded-lg">
                    <Plus className="mr-1 h-4 w-4" />
                    {t.quickAdd}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 