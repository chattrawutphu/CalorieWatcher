"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNutrition } from "@/components/providers/nutrition-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { dashboardTranslations, formatTranslation } from "@/app/locales/dashboard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { ArrowRight, Plus, Utensils, BarChart3, Settings, Calendar as CalendarIcon, ArrowLeft, ArrowRight as ArrowRightIcon, ChevronLeft, ChevronRight, Edit, Save, Sun, Moon, Check, SmilePlus, Pencil, X, Trash2, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { format, addDays, subDays, startOfWeek, endOfWeek, addMonths, subMonths, parse, isSameDay, getMonth, getYear, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { th, ja, zhCN } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { WaterTracker } from "@/components/ui/water-tracker";

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

// Calendar popup animation variants
const popupVariants = {
  hidden: { opacity: 0, y: 100, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    y: 100,
    scale: 0.98,
    transition: { 
      duration: 0.25,
      ease: "easeInOut" 
    }
  }
};

// Overlay animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.25 }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.25,
      ease: "easeInOut",
      delay: 0.05
    }
  }
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

// Calendar popup component
const CalendarPopup = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onSelectDate 
}: { 
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) => {
  const { locale } = useLanguage();
  const t = dashboardTranslations[locale as keyof typeof dashboardTranslations] || dashboardTranslations.en;
  const { dailyLogs, goals } = useNutritionStore();
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  
  useEffect(() => {
    // Set the current month to the month of the selected date when opening
    if (isOpen) {
      setCurrentMonthDate(parse(selectedDate, 'yyyy-MM-dd', new Date()));
    }
    
    // Prevent body scroll when popup is open
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen, selectedDate]);
  
  // Get date locale based on app language
  const getDateLocale = () => {
    switch (locale) {
      case 'th': return th;
      case 'ja': return ja;
      case 'zh': return zhCN;
      default: return undefined;
    }
  };
  
  // Get days of week labels based on app language
  const getDaysOfWeekLabels = () => {
    switch (locale) {
      case 'th': return DAYS_OF_WEEK_TH;
      case 'ja': return DAYS_OF_WEEK_JA;
      case 'zh': return DAYS_OF_WEEK_ZH;
      default: return DAYS_OF_WEEK;
    }
  };
  
  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonthDate(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonthDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentMonthDate(new Date());
    onSelectDate(format(new Date(), 'yyyy-MM-dd'));
    
    // Add a slight delay before closing to allow tap/click feedback
    setTimeout(() => {
      onClose();
    }, 120);
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonthDate);
    const monthEnd = endOfMonth(currentMonthDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };
  
  // Helper functions for displaying calendar data
  const hasEntries = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return dailyLogs[formattedDate] && dailyLogs[formattedDate].meals.length > 0;
  };
  
  const getEntryCount = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return dailyLogs[formattedDate]?.meals.length || 0;
  };
  
  const getTotalCalories = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return dailyLogs[formattedDate]?.totalCalories || 0;
  };
  
  const calendarDays = generateCalendarDays();
  const daysInWeek = getDaysOfWeekLabels();
  const selectedDateObj = parse(selectedDate, 'yyyy-MM-dd', new Date());
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    onSelectDate(formattedDate);
    
    // Add a slight delay before closing to allow tap/click feedback
    setTimeout(() => {
      onClose();
    }, 120);
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 touch-none"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          
          {/* Calendar Popup */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 bg-[hsl(var(--background))] rounded-t-xl p-5 max-h-[90vh] overflow-y-auto touch-auto shadow-md border-t border-[hsl(var(--border))]"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="max-w-md mx-auto">
              <div className="relative mb-4">
                <h2 className="text-lg font-semibold text-center">{t.calendar}</h2>
                <button
                  onClick={onClose}
                  className="absolute right-0 top-0 p-2 rounded-full hover:bg-[hsl(var(--muted))]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={goToToday}
                  className="text-xs px-2 py-1 h-8 text-[hsl(var(--primary))]"
                >
                  {t.today}
                </Button>
                
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToPreviousMonth} 
                    className="rounded-full w-8 h-8"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <span className="text-base font-medium mx-2">
                    {format(currentMonthDate, 'MMMM yyyy', { locale: getDateLocale() })}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToNextMonth} 
                    className="rounded-full w-8 h-8"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="w-16"></div> {/* Spacer for balance */}
              </div>
              
              <div className="grid grid-cols-7 text-center mb-2">
                {daysInWeek.map((day, i) => (
                  <div key={i} className="text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-5">
                {calendarDays.map((day, i) => {
                  const formattedDate = format(day, 'yyyy-MM-dd');
                  const isSelected = formattedDate === selectedDate;
                  const isDifferentMonth = !isSameMonth(day, currentMonthDate);
                  const isTodayDate = isToday(day);
                  const dayEntryCount = getEntryCount(day);
                  const dayTotalCalories = getTotalCalories(day);
                  const hasData = dayEntryCount > 0;
                  
                  // Calculate calorie percentage for visual indicator
                  const caloriePercentage = Math.min(100, (dayTotalCalories / (goals.dailyCalorieGoal || 2000)) * 100);
                  
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
                        ${isSelected ? 'hover:opacity-90' : 'hover:bg-[hsl(var(--muted))]/0.5'}
                      `}
                      onClick={() => handleDateSelect(day)}
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = dashboardTranslations[locale as keyof typeof dashboardTranslations] || dashboardTranslations.en;
  const { getTodayStats, goals, recentMeals = [], updateDailyMood, getDailyMood } = useNutrition();
  const { dailyLogs, setCurrentDate, currentDate } = useNutritionStore();
  
  // State for calendar
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  
  // State for mood and notes
  const [notes, setNotes] = useState("");
  const [moodRating, setMoodRating] = useState<number | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  
  // State for calendar popup
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // State for meal history editing
  const [isEditingMeals, setIsEditingMeals] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);
  const [mealToEdit, setMealToEdit] = useState<any | null>(null);
  const [editedQuantity, setEditedQuantity] = useState<number>(1);
  
  // Create additional translations for meal editing feature
  const additionalTranslations = {
    edit: locale === 'th' ? 'แก้ไข' : locale === 'ja' ? '編集' : locale === 'zh' ? '编辑' : 'Edit',
    done: locale === 'th' ? 'เสร็จสิ้น' : locale === 'ja' ? '完了' : locale === 'zh' ? '完成' : 'Done',
    confirmDelete: locale === 'th' ? 'ยืนยันการลบ' : locale === 'ja' ? '削除の確認' : locale === 'zh' ? '确认删除' : 'Confirm Delete',
    confirmDeleteMessage: locale === 'th' ? 'คุณแน่ใจหรือว่าต้องการลบรายการอาหารนี้? การกระทำนี้ไม่สามารถย้อนกลับได้' : 
                          locale === 'ja' ? 'この食事を削除してもよろしいですか？この操作は元に戻せません。' : 
                          locale === 'zh' ? '您确定要删除此餐食吗？此操作无法撤消。' : 
                          'Are you sure you want to delete this meal? This cannot be undone.',
    cancel: locale === 'th' ? 'ยกเลิก' : locale === 'ja' ? 'キャンセル' : locale === 'zh' ? '取消' : 'Cancel',
    delete: locale === 'th' ? 'ลบ' : locale === 'ja' ? '削除' : locale === 'zh' ? '删除' : 'Delete',
    editMeal: locale === 'th' ? 'แก้ไขอาหาร' : locale === 'ja' ? '食事の編集' : locale === 'zh' ? '编辑餐食' : 'Edit Meal',
    quantity: locale === 'th' ? 'จำนวน' : locale === 'ja' ? '量' : locale === 'zh' ? '数量' : 'Quantity',
    per: locale === 'th' ? 'ต่อ' : locale === 'ja' ? 'あたり' : locale === 'zh' ? '每' : 'per',
    save: locale === 'th' ? 'บันทึกการเปลี่ยนแปลง' : locale === 'ja' ? '変更を保存' : locale === 'zh' ? '保存更改' : 'Save Changes'
  };
  
  // Combine translations
  const translations = { ...t, ...additionalTranslations };
  
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
  
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setCurrentDate(date);
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentMonthDate(today);
    handleSelectDate(format(today, 'yyyy-MM-dd'));
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

  // Function to handle meal deletion
  const handleDeleteMeal = (mealId: string) => {
    // For confirmation dialog
    setMealToDelete(mealId);
  };
  
  // Function to confirm meal deletion
  const confirmDeleteMeal = () => {
    if (mealToDelete && dailyLogs[selectedDate]) {
      const updatedMeals = dailyLogs[selectedDate].meals.filter(meal => meal.id !== mealToDelete);
      
      // Update nutrition calculations
      const deletedMeal = dailyLogs[selectedDate].meals.find(meal => meal.id === mealToDelete);
      if (deletedMeal) {
        const mealCalories = deletedMeal.foodItem.calories * deletedMeal.quantity;
        const mealProtein = deletedMeal.foodItem.protein * deletedMeal.quantity;
        const mealCarbs = deletedMeal.foodItem.carbs * deletedMeal.quantity;
        const mealFat = deletedMeal.foodItem.fat * deletedMeal.quantity;
        
        // Update daily logs with recalculated totals
        const updatedDailyLog = {
          ...dailyLogs[selectedDate],
          meals: updatedMeals,
          totalCalories: dailyLogs[selectedDate].totalCalories - mealCalories,
          totalProtein: dailyLogs[selectedDate].totalProtein - mealProtein,
          totalCarbs: dailyLogs[selectedDate].totalCarbs - mealCarbs,
          totalFat: dailyLogs[selectedDate].totalFat - mealFat
        };
        
        // Update store
        useNutritionStore.setState({
          dailyLogs: {
            ...dailyLogs,
            [selectedDate]: updatedDailyLog
          }
        });
      }
      
      // Close confirmation dialog
      setMealToDelete(null);
    }
  };
  
  // Function to open meal edit dialog
  const handleEditMeal = (meal: any) => {
    setMealToEdit(meal);
    setEditedQuantity(meal.quantity);
  };
  
  // Function to save edited meal
  const saveEditedMeal = () => {
    if (mealToEdit && dailyLogs[selectedDate]) {
      // Calculate difference in nutrition values
      const oldCalories = mealToEdit.foodItem.calories * mealToEdit.quantity;
      const oldProtein = mealToEdit.foodItem.protein * mealToEdit.quantity;
      const oldCarbs = mealToEdit.foodItem.carbs * mealToEdit.quantity;
      const oldFat = mealToEdit.foodItem.fat * mealToEdit.quantity;
      
      const newCalories = mealToEdit.foodItem.calories * editedQuantity;
      const newProtein = mealToEdit.foodItem.protein * editedQuantity;
      const newCarbs = mealToEdit.foodItem.carbs * editedQuantity;
      const newFat = mealToEdit.foodItem.fat * editedQuantity;
      
      // Update the meal in the array
      const updatedMeals = dailyLogs[selectedDate].meals.map(meal => 
        meal.id === mealToEdit.id 
          ? { ...meal, quantity: editedQuantity } 
          : meal
      );
      
      // Update daily logs with recalculated totals
      const updatedDailyLog = {
        ...dailyLogs[selectedDate],
        meals: updatedMeals,
        totalCalories: dailyLogs[selectedDate].totalCalories - oldCalories + newCalories,
        totalProtein: dailyLogs[selectedDate].totalProtein - oldProtein + newProtein,
        totalCarbs: dailyLogs[selectedDate].totalCarbs - oldCarbs + newCarbs,
        totalFat: dailyLogs[selectedDate].totalFat - oldFat + newFat
      };
      
      // Update store
      useNutritionStore.setState({
        dailyLogs: {
          ...dailyLogs,
          [selectedDate]: updatedDailyLog
        }
      });
      
      // Close edit dialog
      setMealToEdit(null);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
        <motion.div variants={item} className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
              {t.dashboard}
            </h1>
            <motion.div 
              className="h-10 w-10 bg-[hsl(var(--accent))]/10 rounded-full flex items-center justify-center text-[hsl(var(--foreground))]"
              variants={item}
              onClick={() => setIsCalendarOpen(true)}
            >
              <CalendarIcon className="h-5 w-5" />
            </motion.div>
          </div>
          <p className="text-[hsl(var(--muted-foreground))]">
            {t.welcome}
          </p>
        </motion.div>

        {/* Selected Day Stats - Enhanced with Macros Distribution Charts */}
        <motion.div variants={item}>
          <Card className="p-5 shadow-md rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                {format(selectedDateObj, 'PPPP', { locale: getDateLocale() })}
              </h2>
            </div>
            
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
              
              {/* Macros Distribution Chart - Now part of the first card */}
              <div className="relative h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {data.map((entry, index) => (
                        <linearGradient key={`gradient-card1-${index}`} id={`gradientFill-card1-${index}`} x1="0" y1="0" x2="0" y2="1">
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
                        innerRadius={45}
                        outerRadius={65}
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
                                y={90}
                                textAnchor="middle" 
                                dominantBaseline="central" 
                                className="text-2xl font-bold"
                                fill="hsl(var(--foreground))"
                              >
                                0
                              </text>
                              <text 
                                x={100} 
                                y={110}
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
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        cornerRadius={4}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {data.map((entry, index) => (
                          <Cell 
                            key={`cell-card1-${index}`} 
                            fill={`url(#gradientFill-card1-${index})`}
                            stroke={entry.color}
                            strokeWidth={1.5}
                          />
                        ))}
                        <Label
                          content={() => (
                            <g>
                              <text 
                                x={100} 
                                y={90}
                                textAnchor="middle" 
                                dominantBaseline="central" 
                                className="text-2xl font-bold"
                                fill="hsl(var(--foreground))"
                              >
                                {Math.round(calories)}
                              </text>
                              <text 
                                x={100} 
                                y={110}
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
                    )}
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => [
                        <span key="tooltip-value" className="flex items-center gap-1">
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
              <div className="grid grid-cols-3 gap-3">
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
                      className="text-xl mb-1" 
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                    >
                      {entry.icon}
                    </motion.div>
                    
                    <div className="text-xs font-medium text-[hsl(var(--foreground))]">{entry.name}</div>
                    <div className="text-xs font-bold" style={{ color: entry.color }}>
                      {Math.round(entry.value)}{t.g}
                      <span className="text-[10px] ml-1 text-[hsl(var(--muted-foreground))]">
                        /{Math.round(entry.goal)}{t.g}
                      </span>
                </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Meals for selected day */}
        <motion.div variants={item}>
          <Card className="p-5 shadow-md rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{t.mealHistory}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingMeals(!isEditingMeals)}
                className="rounded-full h-8 w-8 p-0 flex items-center justify-center group transition-all duration-300 hover:bg-[hsl(var(--primary))/0.15] hover:scale-105 active:scale-95"
              >
                {isEditingMeals ? (
                  <Check className="h-4 w-4 text-[hsl(var(--primary))]" />
                ) : (
                  <Pencil className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" />
                )}
                <span className="sr-only">{isEditingMeals ? translations.done : translations.edit}</span>
              </Button>
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
                    <div className="flex-1">
                      <div className="font-medium text-[hsl(var(--foreground))]">{meal.foodItem.name}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {meal.quantity} {meal.foodItem.servingSize}
                      </div>
                    </div>
                    <div className="text-right flex items-center">
                      <div className="font-medium text-[hsl(var(--primary))]">
                        {Math.round(meal.foodItem.calories * meal.quantity)} {t.kcal}
                      </div>
                      
                      {isEditingMeals && (
                        <div className="flex ml-4 space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMeal(meal)}
                            className="h-7 w-7 p-0 rounded-full hover:bg-[hsl(var(--primary))/0.1]"
                          >
                            <Edit className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="h-7 w-7 p-0 rounded-full hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Water Tracker */}
        <motion.div variants={item}>
          <WaterTracker date={selectedDate} />
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

        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {mealToDelete && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/70 z-50 touch-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMealToDelete(null)}
              />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 bg-[hsl(var(--background))] rounded-t-xl p-5 max-h-[90vh] overflow-y-auto touch-auto shadow-md border-t border-[hsl(var(--border))]"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
              >
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">{translations.confirmDelete}</h3>
                    <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
                      {translations.confirmDeleteMessage}
                    </p>
                  </div>
                  
                  <div className="flex justify-center space-x-3 mt-6 pb-20">
                    <Button
                      variant="outline"
                      onClick={() => setMealToDelete(null)}
                      className="w-1/3"
                    >
                      {translations.cancel}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={confirmDeleteMeal}
                      className="w-1/3"
                    >
                      {translations.delete}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Edit Meal Dialog */}
        <AnimatePresence>
          {mealToEdit && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/70 z-50 touch-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMealToEdit(null)}
              />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 bg-[hsl(var(--background))] rounded-t-xl p-5 max-h-[90vh] overflow-y-auto touch-auto shadow-md border-t border-[hsl(var(--border))]"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
              >
                <div className="max-w-md mx-auto">
                  <div className="relative mb-4">
                    <h3 className="text-lg font-semibold text-center">{translations.editMeal}</h3>
                    <button
                      onClick={() => setMealToEdit(null)}
                      className="absolute right-0 top-0 p-2 rounded-full hover:bg-[hsl(var(--muted))]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-[hsl(var(--foreground))]">{mealToEdit?.foodItem.name}</h4>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {mealToEdit?.foodItem.calories} {translations.kcal} {translations.per} {mealToEdit?.foodItem.servingSize}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{translations.quantity}</label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline" 
                          size="icon"
                          onClick={() => setEditedQuantity(prev => Math.max(0.5, prev - 0.5))}
                          className="h-8 w-8 rounded-full"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        
                        <div className="flex-1 px-3 py-1.5 border rounded-md text-center bg-[hsl(var(--background))] text-sm">
                          {editedQuantity} {mealToEdit?.foodItem.servingSize}
                        </div>
                        
                        <Button
                          variant="outline" 
                          size="icon"
                          onClick={() => setEditedQuantity(prev => prev + 0.5)}
                          className="h-8 w-8 rounded-full"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      
                      <div className="text-right text-sm text-[hsl(var(--primary))]">
                        {Math.round(mealToEdit?.foodItem.calories * editedQuantity)} {translations.kcal}
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6 pb-20">
                      <Button
                        onClick={saveEditedMeal}
                        className="bg-[hsl(var(--primary))]"
                      >
                        {translations.save}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Calendar Popup */}
        <CalendarPopup 
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setCurrentDate(date);
          }}
        />
      </motion.div>
    </div>
  );
} 