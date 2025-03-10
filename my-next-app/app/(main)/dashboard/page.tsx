"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNutrition } from "@/components/providers/nutrition-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { ArrowRight, Plus, Utensils, BarChart3, Settings, Calendar as CalendarIcon, ArrowLeft, ArrowRight as ArrowRightIcon, ChevronLeft, ChevronRight, Edit, Save, Sun, Moon, Check, SmilePlus, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { format, addDays, subDays, startOfWeek, endOfWeek, addMonths, subMonths, parse, isSameDay, getMonth, getYear, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { th, ja, zhCN } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { WaterTracker } from "@/components/ui/water-tracker";

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
    calendar: "Calendar",
    today: "Today",
    selectDate: "Select date",
    previousWeek: "Previous week",
    nextWeek: "Next week",
    mealHistory: "Meal History",
    noMealsOnThisDay: "No meals on this day",
    mood: "Mood & Notes",
    moodRating: "How was your day?",
    notes: "Notes",
    saveNotes: "Save",
    editNotes: "Edit",
    placeholder: "Write your thoughts about today...",
    terrible: "Terrible",
    bad: "Bad",
    okay: "Okay",
    good: "Good",
    great: "Great",
    saved: "Saved!",
    water: {
      title: "Water Intake",
      completed: "completed",
      reset: "Reset",
      add: "Add",
      tip: "Experts recommend drinking at least 2 liters of water daily.",
      goal: "Goal"
    }
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
    calendar: "ปฏิทิน",
    today: "วันนี้",
    selectDate: "เลือกวันที่",
    previousWeek: "สัปดาห์ก่อน",
    nextWeek: "สัปดาห์ถัดไป",
    mealHistory: "ประวัติมื้ออาหาร",
    noMealsOnThisDay: "ไม่มีมื้ออาหารในวันนี้",
    mood: "อารมณ์และบันทึก",
    moodRating: "วันนี้เป็นอย่างไรบ้าง?",
    notes: "บันทึก",
    saveNotes: "บันทึก",
    editNotes: "แก้ไข",
    placeholder: "เขียนความคิดของคุณเกี่ยวกับวันนี้...",
    terrible: "แย่มาก",
    bad: "แย่",
    okay: "พอใช้",
    good: "ดี",
    great: "ดีมาก",
    saved: "บันทึกแล้ว!",
    water: {
      title: "การดื่มน้ำ",
      completed: "สำเร็จแล้ว",
      reset: "รีเซ็ต",
      add: "เพิ่ม",
      tip: "ผู้เชี่ยวชาญแนะนำให้ดื่มน้ำอย่างน้อย 2 ลิตรต่อวัน",
      goal: "เป้าหมาย"
    }
  },
  ja: {
    welcome: "お帰りなさい！",
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
    macros: "栄養素の分布",
    g: "g",
    dashboard: "ダッシュボード",
    of: "の",
    kcal: "kcal",
    calendar: "カレンダー",
    today: "今日",
    selectDate: "日付を選択",
    previousWeek: "前の週",
    nextWeek: "次の週",
    mealHistory: "食事履歴",
    noMealsOnThisDay: "この日の食事はありません",
    mood: "気分とメモ",
    moodRating: "今日はどうでしたか？",
    notes: "メモ",
    saveNotes: "保存",
    editNotes: "編集",
    placeholder: "今日についての考えを書いてください...",
    terrible: "ひどい",
    bad: "悪い",
    okay: "まあまあ",
    good: "良い",
    great: "素晴らしい",
    saved: "保存しました！",
    water: {
      title: "水分摂取量",
      completed: "完了",
      reset: "リセット",
      add: "追加",
      tip: "専門家は1日に少なくとも2リットルの水を飲むことをお勧めします。",
      goal: "目標"
    }
  },
  zh: {
    welcome: "欢迎回来！",
    stats: "今日统计",
    calories: "卡路里",
    remaining: "剩余",
    protein: "蛋白质",
    carbs: "碳水化合物",
    fat: "脂肪",
    addMeal: "添加餐点",
    viewMeals: "查看所有餐点",
    recentMeals: "最近餐点",
    noRecent: "没有最近餐点",
    macros: "营养分布",
    g: "克",
    dashboard: "仪表板",
    of: "的",
    kcal: "卡路里",
    calendar: "日历",
    today: "今天",
    selectDate: "选择日期",
    previousWeek: "上周",
    nextWeek: "下周",
    mealHistory: "餐点历史",
    noMealsOnThisDay: "这一天没有餐点",
    mood: "心情和笔记",
    moodRating: "今天怎么样？",
    notes: "笔记",
    saveNotes: "保存",
    editNotes: "编辑",
    placeholder: "写下你对今天的想法...",
    terrible: "糟糕",
    bad: "不好",
    okay: "一般",
    good: "好",
    great: "很好",
    saved: "已保存！",
    water: {
      title: "饮水量",
      completed: "已完成",
      reset: "重置",
      add: "添加",
      tip: "专家建议每天至少饮用2升水。",
      goal: "目标"
    }
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

const calendarVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

// Define colors - updating with more vibrant, cute theme-compatible colors
const COLORS = {
  protein: {
    light: "hsl(260, 80%, 65%)",
    dark: "hsl(260, 80%, 70%)",
    gradient: "linear-gradient(135deg, hsl(260, 80%, 65%), hsl(260, 60%, 75%))"
  },
  fat: {
    light: "hsl(330, 80%, 65%)",
    dark: "hsl(330, 80%, 70%)",
    gradient: "linear-gradient(135deg, hsl(330, 80%, 65%), hsl(330, 60%, 75%))"
  },
  carbs: {
    light: "hsl(35, 90%, 60%)",
    dark: "hsl(35, 90%, 65%)",
    gradient: "linear-gradient(135deg, hsl(35, 90%, 60%), hsl(35, 80%, 70%))"
  }
};

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAYS_OF_WEEK_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const DAYS_OF_WEEK_JA = ["日", "月", "火", "水", "木", "金", "土"];
const DAYS_OF_WEEK_ZH = ["日", "一", "二", "三", "四", "五", "六"];

// Mood emoji component
const MoodEmoji = ({ rating, selected, onClick }: { rating: number, selected: boolean, onClick: () => void }) => {
  const emojis = ["😖", "😔", "😐", "😊", "😁"];
  return (
    <button 
      onClick={onClick}
      className={`text-2xl sm:text-3xl transition-all ${selected ? 'transform scale-125' : 'opacity-50'}`}
      aria-label={`Mood rating ${rating}`}
    >
      {emojis[rating - 1]}
    </button>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  const { getTodayStats, goals, recentMeals = [], updateDailyMood, getDailyMood } = useNutrition();
  const { dailyLogs, setCurrentDate, currentDate } = useNutritionStore();
  
  // State for calendar
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  
  // State for mood and notes
  const [notes, setNotes] = useState("");
  const [moodRating, setMoodRating] = useState<number | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  
  const getDateLocale = () => {
    switch (locale) {
      case 'th': return th;
      case 'ja': return ja;
      case 'zh': return zhCN;
      default: return undefined;
    }
  };
  
  const getDaysOfWeekLabels = () => {
    switch (locale) {
      case 'th': return DAYS_OF_WEEK_TH;
      case 'ja': return DAYS_OF_WEEK_JA;
      case 'zh': return DAYS_OF_WEEK_ZH;
      default: return DAYS_OF_WEEK;
    }
  };
  
  const goToPreviousMonth = () => {
    setCurrentMonthDate(prevDate => subMonths(prevDate, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonthDate(prevDate => addMonths(prevDate, 1));
  };
  
  const handleSelectDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
    setCurrentDate(formattedDate);
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentMonthDate(today);
    handleSelectDate(today);
  };
  
  // Get stats for the currently selected date
  const getStatsForSelectedDate = () => {
    const dayLog = dailyLogs[selectedDate] || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      meals: []
    };
    
    return {
      calories: dayLog.totalCalories,
      protein: dayLog.totalProtein,
      carbs: dayLog.totalCarbs,
      fat: dayLog.totalFat,
      meals: dayLog.meals
    };
  };
  
  const selectedDayStats = getStatsForSelectedDate();
  const { calories = 0, protein = 0, carbs = 0, fat = 0, meals = [] } = selectedDayStats;
  
  const caloriesRemaining = Math.max(0, goals.dailyCalorieGoal - calories);
  const caloriesPercentage = Math.min(100, (calories / goals.dailyCalorieGoal) * 100);
  
  // Function to get theme-compatible colors
  const getCurrentThemeColors = () => {
    // Default colors for light theme
    let proteinColor = COLORS.protein.light;
    let fatColor = COLORS.fat.light;
    let carbsColor = COLORS.carbs.light;
    
    // Adjust colors based on current theme
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      const isChocolate = document.documentElement.classList.contains('chocolate');
      const isSweet = document.documentElement.classList.contains('sweet');
      const isBroccoli = document.documentElement.classList.contains('broccoli');
      const isWatermelon = document.documentElement.classList.contains('watermelon');
      const isHoney = document.documentElement.classList.contains('honey');
      
      if (isDark) {
        proteinColor = COLORS.protein.dark;
        fatColor = COLORS.fat.dark;
        carbsColor = COLORS.carbs.dark;
      } else if (isChocolate) {
        proteinColor = "hsl(25, 70%, 40%)";
        fatColor = "hsl(15, 80%, 50%)";
        carbsColor = "hsl(35, 90%, 45%)";
      } else if (isSweet) {
        proteinColor = "hsl(325, 90%, 80%)";
        fatColor = "hsl(350, 90%, 85%)";
        carbsColor = "hsl(35, 95%, 75%)";
      } else if (isBroccoli) {
        proteinColor = "hsl(120, 50%, 40%)";
        fatColor = "hsl(80, 60%, 45%)";
        carbsColor = "hsl(50, 90%, 55%)";
      } else if (isWatermelon) {
        proteinColor = "hsl(350, 80%, 55%)";  // แดงแตงโม
        fatColor = "hsl(140, 60%, 35%)";      // เขียวแตงโม
        carbsColor = "hsl(95, 70%, 45%)";     // เขียวอ่อน
      } else if (isHoney) {
        proteinColor = "hsl(28, 90%, 55%)";   // ส้มเข้ม
        fatColor = "hsl(35, 95%, 50%)";       // ส้มอำพัน
        carbsColor = "hsl(45, 100%, 60%)";    // เหลืองทอง
      }
    }
    
    return { proteinColor, fatColor, carbsColor };
  };

  // Prepare data for pie chart with enhanced properties
  const { proteinColor, fatColor, carbsColor } = getCurrentThemeColors();
  
  const data = [
    { 
      name: t.protein, 
      value: protein, 
      goal: Math.round(((goals.macroRatios.protein || 30) / 100) * goals.dailyCalorieGoal / 4),
      color: proteinColor,
      gradient: COLORS.protein.gradient,
      icon: "🍗"
    },
    { 
      name: t.fat, 
      value: fat, 
      goal: Math.round(((goals.macroRatios.fat || 30) / 100) * goals.dailyCalorieGoal / 9),
      color: fatColor,
      gradient: COLORS.fat.gradient,
      icon: "🥑"
    },
    { 
      name: t.carbs, 
      value: carbs, 
      goal: Math.round(((goals.macroRatios.carbs || 40) / 100) * goals.dailyCalorieGoal / 4),
      color: carbsColor,
      gradient: COLORS.carbs.gradient,
      icon: "🍚"
    },
  ];
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonthDate);
    const monthEnd = endOfMonth(currentMonthDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };
  
  const calendarDays = generateCalendarDays();
  const daysInWeek = getDaysOfWeekLabels();
  const selectedDateObj = parse(selectedDate, 'yyyy-MM-dd', new Date());
  
  // Check if date has entries
  const hasEntries = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return dailyLogs[formattedDate] && dailyLogs[formattedDate].meals.length > 0;
  };
  
  // Get entry count for a date
  const getEntryCount = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return dailyLogs[formattedDate]?.meals.length || 0;
  };
  
  // Get total calories for a date
  const getTotalCalories = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return dailyLogs[formattedDate]?.totalCalories || 0;
  };

  // Update mood and notes when selected date changes
  useEffect(() => {
    const { moodRating: currentMoodRating, notes: currentNotes } = getDailyMood(selectedDate);
    setMoodRating(currentMoodRating);
    setNotes(currentNotes || "");
    setSaved(false);
  }, [selectedDate, getDailyMood]);
  
  // Save mood and notes
  const handleSaveMood = () => {
    if (moodRating) {
      updateDailyMood(selectedDate, moodRating, notes);
      setSaved(true);
      
      // Reset saved message after 2 seconds
      setTimeout(() => {
        setSaved(false);
      }, 2000);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen pb-24">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
        <motion.div variants={item} className="mb-6">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            {t.dashboard}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            {t.welcome}
          </p>
        </motion.div>

        {/* Calendar Section */}
        <motion.div variants={item}>
          <Card className="p-5 shadow-md rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{t.calendar}</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goToToday}
                className="text-xs px-2 py-1 h-8 text-[hsl(var(--primary))]"
              >
                {t.today}
              </Button>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={format(currentMonthDate, 'yyyy-MM')}
                variants={calendarVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="flex justify-between items-center mb-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToPreviousMonth} 
                    aria-label={t.previousWeek}
                    className="rounded-full w-8 h-8"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <span className="text-base font-medium">
                    {format(currentMonthDate, 'MMMM yyyy', { locale: getDateLocale() })}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToNextMonth} 
                    aria-label={t.nextWeek}
                    className="rounded-full w-8 h-8"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-7 text-center mb-2">
                  {daysInWeek.map((day, i) => (
                    <div key={i} className="text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    const formattedDate = format(day, 'yyyy-MM-dd');
                    const isSelected = formattedDate === selectedDate;
                    const isDifferentMonth = !isSameMonth(day, currentMonthDate);
                    const isTodayDate = isToday(day);
                    const dayEntryCount = getEntryCount(day);
                    const dayTotalCalories = getTotalCalories(day);
                    const hasData = dayEntryCount > 0;
                    
                    // Calculate calorie percentage for visual indicator
                    const caloriePercentage = Math.min(100, (dayTotalCalories / goals.dailyCalorieGoal) * 100);
                    
                    return (
                      <Button
                        key={i}
                        variant="ghost"
                        size="sm"
                        className={`
                          relative p-0 h-auto aspect-square flex flex-col items-center justify-center
                          ${isSelected ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 
                            isDifferentMonth ? 'text-[hsl(var(--muted-foreground))] opacity-40' : ''}
                          ${isTodayDate && !isSelected ? 'ring-1 ring-[hsl(var(--primary))]' : ''}
                          ${hasData && !isSelected ? 'bg-[hsl(var(--accent))/0.1]' : ''}
                          hover:bg-[hsl(var(--accent))/0.2] transition-all
                        `}
                        onClick={() => handleSelectDate(day)}
                      >
                        <span className="text-sm font-semibold">
                          {format(day, 'd')}
                        </span>
                        
                        {hasData && (
                          <div className="absolute bottom-1 w-full px-1">
                            <div className="w-full h-[3px] rounded-full bg-[hsl(var(--muted))/0.3]">
                              <div 
                                className="h-full rounded-full bg-[hsl(var(--primary))]" 
                                style={{ width: `${caloriePercentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {hasData && (
                          <div className="absolute top-1 right-1">
                            <span className="text-[8px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-full w-3 h-3 flex items-center justify-center">
                              {dayEntryCount}
                            </span>
                          </div>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Selected Day Stats */}
        <motion.div variants={item}>
          <Card className="p-5 shadow-md rounded-2xl">
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
              {format(selectedDateObj, 'PPPP', { locale: getDateLocale() })}
            </h2>
            
            <div className="space-y-5">
              {/* Calories */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">{t.calories}</span>
                  <span className="font-medium text-[hsl(var(--primary))]">
                    {Math.round(calories)} / {goals.dailyCalorieGoal} {t.kcal}
                  </span>
                </div>
                <Progress value={caloriesPercentage} className="h-2" />
                <div className="text-right text-xs text-[hsl(var(--primary))]">
                  {Math.round(caloriesRemaining)} {t.kcal} {t.remaining}
                </div>
              </div>
              
              {/* Macros */}
              <div className="grid grid-cols-3 gap-3 text-center pt-2">
                <div className="bg-[hsl(var(--accent))/0.1] p-2 rounded-lg">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{t.protein}</div>
                  <div className="font-medium text-[hsl(var(--primary))]">
                    {Math.round(protein)}{t.g} <span className="text-xs text-[hsl(var(--muted-foreground))]">/ {Math.round(data[0].goal)}{t.g}</span>
                  </div>
                </div>
                <div className="bg-[hsl(var(--accent))/0.1] p-2 rounded-lg">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{t.fat}</div>
                  <div className="font-medium text-[hsl(var(--primary))]">
                    {Math.round(fat)}{t.g} <span className="text-xs text-[hsl(var(--muted-foreground))]">/ {Math.round(data[1].goal)}{t.g}</span>
                  </div>
                </div>
                <div className="bg-[hsl(var(--accent))/0.1] p-2 rounded-lg">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{t.carbs}</div>
                  <div className="font-medium text-[hsl(var(--primary))]">
                    {Math.round(carbs)}{t.g} <span className="text-xs text-[hsl(var(--muted-foreground))]">/ {Math.round(data[2].goal)}{t.g}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Water Tracker */}
        <motion.div variants={item}>
          <WaterTracker date={selectedDate} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => {
                router.push(`/add?date=${selectedDate}`);
              }}
              className="flex items-center justify-center h-16 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.9] rounded-xl shadow-md"
            >
              <Plus size={18} className="mr-2" />
              {t.addMeal}
            </Button>
            <Button
              onClick={() => router.push('/meals')}
              variant="outline"
              className="flex items-center justify-center h-16 bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))/0.1] rounded-xl"
            >
              <Utensils size={18} className="mr-2" />
              {t.viewMeals}
            </Button>
          </div>
        </motion.div>

        {/* Mood & Notes Section */}
        <motion.div variants={item}>
          <Card className="p-5 shadow-md rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{t.mood}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">{t.moodRating}</p>
                <div className="flex justify-between items-center p-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <MoodEmoji 
                      key={rating} 
                      rating={rating} 
                      selected={moodRating === rating}
                      onClick={() => setMoodRating(rating)}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] px-1 mt-1">
                  <span>{t.terrible}</span>
                  <span>{t.great}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">{t.notes}</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[100px] bg-[hsl(var(--muted))/0.15]"
                  placeholder={t.placeholder}
                />
                <div className="mt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSaveMood}
                    className="text-xs px-3 py-1 h-8"
                    disabled={saved}
                  >
                    {saved ? t.saved : t.saveNotes}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Macros Distribution Chart - Redesigned */}
        <motion.div variants={item}>
          <Card className="p-5 shadow-md rounded-2xl overflow-hidden">
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2 flex items-center">
              {t.macros}
              <motion.span 
                className="ml-2 inline-block" 
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                📊
              </motion.span>
            </h2>
            
            <div className="relative h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {data.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`gradientFill-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.5}/>
                      </linearGradient>
                    ))}
                  </defs>
                  {/* Show empty chart when no data */}
                  {protein === 0 && fat === 0 && carbs === 0 ? (
                    <Pie
                      data={[{ name: "empty", value: 1 }]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      cornerRadius={4}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={0}
                    >
                      <Cell fill="hsl(var(--muted))" opacity={0.2} />
                      <Label
                        content={() => (
                          <g>
                            <text 
                              x={100} 
                              y={100}
                              textAnchor="middle" 
                              dominantBaseline="central" 
                              className="text-2xl font-bold"
                              fill="hsl(var(--foreground))"
                            >
                              0
                            </text>
                            <text 
                              x={100} 
                              y={120}
                              textAnchor="middle" 
                              dominantBaseline="central" 
                              className="text-xs"
                              fill="hsl(var(--muted-foreground))"
                            >
                              {t.kcal}
                            </text>
                          </g>
                        )}
                      />
                    </Pie>
                  ) : (
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      cornerRadius={4}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#gradientFill-${index})`}
                          stroke={entry.color}
                          strokeWidth={1.5}
                        />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          return (
                            <g>
                              <text 
                                x={100} 
                                y={100}
                                textAnchor="middle" 
                                dominantBaseline="central" 
                                className="text-2xl font-bold"
                                fill="hsl(var(--foreground))"
                              >
                                {Math.round(calories)}
                              </text>
                              <text 
                                x={100} 
                                y={120}
                                textAnchor="middle" 
                                dominantBaseline="central" 
                                className="text-xs"
                                fill="hsl(var(--muted-foreground))"
                              >
                                {t.kcal}
                              </text>
                            </g>
                          );
                        }}
                      />
                    </Pie>
                  )}
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [
                      <span className="flex items-center gap-1">
                        <span className="text-lg">{props.payload.icon}</span>
                        <span>
                          <span className="font-medium">{Math.round(value)}{t.g}</span>
                          <span className="text-xs ml-1 text-[hsl(var(--muted-foreground))]">
                            ({Math.round((value / props.payload.goal) * 100)}%)
                          </span>
                        </span>
                      </span>,
                      name
                    ]}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0px 4px 20px hsl(var(--foreground)/0.05)',
                      backgroundColor: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Cute Macro Bubbles */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              {data.map((entry, index) => (
                <div 
                  key={`macro-${index}`}
                  className="flex flex-col items-center p-2 rounded-xl relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, hsl(var(--accent)/0.1), hsl(var(--accent)/0.05))`
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.15 }}
                    className="absolute inset-0 z-0 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${entry.color}20, ${entry.color}10)`,
                      border: `1px solid ${entry.color}30`
                    }}
                  />
                  
                  <motion.div
                    className="text-2xl mb-1" 
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {entry.icon}
                  </motion.div>
                  
                  <div className="text-sm font-medium text-[hsl(var(--foreground))]">{entry.name}</div>
                  <div className="text-sm font-bold" style={{ color: entry.color }}>
                    {Math.round(entry.value)}{t.g}
                  </div>
              </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Meals for selected day */}
        <motion.div variants={item}>
          <Card className="p-5 shadow-md rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{t.mealHistory}</h2>
            </div>
            
            <div className="space-y-3">
              {meals.length === 0 ? (
                <div className="text-center py-6 text-[hsl(var(--muted-foreground))] text-sm">
                  {t.noMealsOnThisDay}
                </div>
              ) : (
                meals.map((meal, index) => (
                  <motion.div 
                    key={meal.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-[hsl(var(--accent))/0.1] transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-medium text-[hsl(var(--foreground))]">{meal.foodItem.name}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {meal.quantity} {meal.foodItem.servingSize}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-[hsl(var(--primary))]">
                        {Math.round(meal.foodItem.calories * meal.quantity)} {t.kcal}
                      </div>
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