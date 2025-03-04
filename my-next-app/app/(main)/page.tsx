"use client";

import React from "react";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, UtensilsCrossed, AppleIcon, Coffee, ArrowRight, Plus, PieChart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/providers/language-provider";
import { motion } from "framer-motion";
import Image from "next/image";

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
  },
};

// Spring animation variants
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
  
  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Welcome Section */}
      <motion.div className="flex flex-col space-y-2" variants={item}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 dark-chocolate:from-[#d4a66a] dark-chocolate:to-[#a3663d] sweet:from-[#FF85C0] sweet:via-[#6FB2FF] sweet:to-[#9DE7B5] bg-clip-text text-transparent">
          {t.greeting}, {session?.user?.name?.split(' ')[0] || ''}!
        </h1>
        <p className="text-gray-500 dark-chocolate:text-gray-400 sweet:text-pink-400">{t.subtitle}</p>
      </motion.div>

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