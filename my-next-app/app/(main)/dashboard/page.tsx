"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNutrition } from "@/components/providers/nutrition-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowRight, Plus, Utensils, BarChart3, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

const translations = {
  en: {
    welcome: "Welcome back!",
    stats: "Today's Stats",
    calories: "Calories",
    remaining: "remaining",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    addMeal: "Add Meal",
    viewMeals: "View All Meals",
    recentMeals: "Recent Meals",
    noRecent: "No recent meals",
    macros: "Macros Distribution",
    g: "g",
    dashboard: "Dashboard",
    of: "of",
    kcal: "kcal",
  },
  th: {
    welcome: "ยินดีต้อนรับกลับ!",
    stats: "สถิติวันนี้",
    calories: "แคลอรี่",
    remaining: "เหลืออยู่",
    protein: "โปรตีน",
    carbs: "คาร์บ",
    fat: "ไขมัน",
    addMeal: "เพิ่มมื้ออาหาร",
    viewMeals: "ดูมื้ออาหารทั้งหมด",
    recentMeals: "มื้ออาหารล่าสุด",
    noRecent: "ไม่มีมื้ออาหารล่าสุด",
    macros: "การกระจายของมหโภชนาการ",
    g: "ก.",
    dashboard: "แดชบอร์ด",
    of: "จาก",
    kcal: "แคลอรี่",
  },
  ja: {
    welcome: "おかえりなさい！",
    stats: "今日の統計",
    calories: "カロリー",
    remaining: "残り",
    protein: "タンパク質",
    carbs: "炭水化物",
    fat: "脂肪",
    addMeal: "食事を追加",
    viewMeals: "すべての食事を見る",
    recentMeals: "最近の食事",
    noRecent: "最近の食事はありません",
    macros: "マクロ栄養素の分布",
    g: "g",
    dashboard: "ダッシュボード",
    of: "のうち",
    kcal: "カロリー",
  },
  zh: {
    welcome: "欢迎回来！",
    stats: "今日统计",
    calories: "卡路里",
    remaining: "剩余",
    protein: "蛋白质",
    carbs: "碳水化合物",
    fat: "脂肪",
    addMeal: "添加餐食",
    viewMeals: "查看所有餐食",
    recentMeals: "最近餐食",
    noRecent: "没有最近餐食",
    macros: "宏量营养素分布",
    g: "克",
    dashboard: "仪表板",
    of: "共",
    kcal: "卡路里",
  },
};

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

// Define colors
const COLORS = ["#8B5CF6", "#EC4899", "#F59E0B"];

export default function DashboardPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  const { getTodayStats, goals, recentMeals = [] } = useNutrition();
  
  const todayStats = getTodayStats();
  const { calories = 0, protein = 0, carbs = 0, fat = 0 } = todayStats;
  
  const caloriesRemaining = Math.max(0, goals.dailyCalorieGoal - calories);
  const caloriesPercentage = Math.min(100, (calories / goals.dailyCalorieGoal) * 100);
  
  // Prepare data for pie chart
  const data = [
    { name: t.protein, value: protein, goal: goals.macroRatios.protein * goals.dailyCalorieGoal / 4 },
    { name: t.fat, value: fat, goal: goals.macroRatios.fat * goals.dailyCalorieGoal / 9 },
    { name: t.carbs, value: carbs, goal: goals.macroRatios.carbs * goals.dailyCalorieGoal / 4 },
  ];

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen pb-24">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
        <motion.div variants={item} className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            {t.dashboard}
          </h1>
          <p className="text-gray-500">
            {t.welcome}
          </p>
        </motion.div>

        {/* Today's Stats */}
        <motion.div variants={item}>
          <Card className="p-5 shadow-md border-purple-100 rounded-2xl bg-white">
            <h2 className="text-lg font-semibold text-purple-900 mb-4">{t.stats}</h2>
            
            <div className="space-y-5">
              {/* Calories */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t.calories}</span>
                  <span className="font-medium text-purple-700">
                    {Math.round(calories)} / {goals.dailyCalorieGoal} {t.kcal}
                  </span>
                </div>
                <Progress value={caloriesPercentage} className="h-2 bg-purple-100" indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500" />
                <div className="text-right text-xs text-purple-600">
                  {Math.round(caloriesRemaining)} {t.kcal} {t.remaining}
                </div>
              </div>
              
              {/* Macros */}
              <div className="grid grid-cols-3 gap-3 text-center pt-2">
                <div className="bg-purple-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500">{t.protein}</div>
                  <div className="font-medium text-purple-700">{Math.round(protein)}{t.g}</div>
                </div>
                <div className="bg-pink-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500">{t.fat}</div>
                  <div className="font-medium text-pink-600">{Math.round(fat)}{t.g}</div>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500">{t.carbs}</div>
                  <div className="font-medium text-amber-600">{Math.round(carbs)}{t.g}</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => router.push('/add')}
              className="flex items-center justify-center h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl shadow-md"
            >
              <Plus size={18} className="mr-2" />
              {t.addMeal}
            </Button>
            <Button
              onClick={() => router.push('/meals')}
              variant="outline"
              className="flex items-center justify-center h-16 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl"
            >
              <Utensils size={18} className="mr-2" />
              {t.viewMeals}
            </Button>
          </div>
        </motion.div>

        {/* Macros Distribution Chart */}
        <motion.div variants={item}>
          <Card className="p-5 shadow-md border-purple-100 rounded-2xl bg-white">
            <h2 className="text-lg font-semibold text-purple-900 mb-4">{t.macros}</h2>
            
            <div className="relative h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${Math.round(value)}${t.g}`}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                      backgroundColor: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-2xl font-bold text-purple-900">{Math.round(calories)}</div>
                <div className="text-xs text-gray-500">{t.kcal}</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Meals */}
        <motion.div variants={item}>
          <Card className="p-5 shadow-md border-purple-100 rounded-2xl bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-purple-900">{t.recentMeals}</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/meals')}
                className="text-xs text-purple-600 p-0 h-auto"
              >
                <ArrowRight size={16} />
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentMeals.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  {t.noRecent}
                </div>
              ) : (
                recentMeals.map((meal, index) => (
                  <motion.div 
                    key={meal.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-medium text-purple-900">{meal.name}</div>
                      <div className="text-xs text-gray-500">{meal.portion || ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-purple-600">{Math.round(meal.calories)} {t.kcal}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
} 