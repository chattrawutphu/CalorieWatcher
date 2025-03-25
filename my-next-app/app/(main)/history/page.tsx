"use client";

import React, { useState, useEffect } from "react";
import { format, subDays, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, parse } from "date-fns";
import { th, ja, zhCN } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Droplet, Calendar as CalendarIcon, Smile, StickyNote, ArrowRight, Sparkles, X } from "lucide-react";
import { useNutritionStore, DailyLog, MealEntry } from "@/lib/store/nutrition-store";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Days of the week labels for different languages
const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAYS_OF_WEEK_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const DAYS_OF_WEEK_JA = ["日", "月", "火", "水", "木", "金", "土"];
const DAYS_OF_WEEK_ZH = ["日", "一", "二", "三", "四", "五", "六"];

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

// Date slider item animation variant
const sliderItem = {
  hidden: { opacity: 0 },
  show: { opacity: 1 }
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
  const t = aiAssistantTranslations[locale];
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
    onClose();
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
                <h2 className="text-lg font-semibold text-center">{t.mobileNav.navigation.history}</h2>
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
                  Today
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
                  const caloriePercentage = Math.min(100, (dayTotalCalories / (goals.calories || 2000)) * 100);
                  
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

export default function HistoryPage() {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  const { dailyLogs, currentDate, setCurrentDate } = useNutritionStore();
  
  // Generate an array of the last 7 days
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(currentDate);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Initialize dates on component mount
  useEffect(() => {
    const last7Days = Array.from({ length: 7 }).map((_, index) => {
      return format(subDays(new Date(), 6 - index), 'yyyy-MM-dd');
    });
    setDates(last7Days);
    
    // Set the selected date to today (most recent) by default
    const today = format(new Date(), 'yyyy-MM-dd');
    setSelectedDate(today);
  }, []);
  
  // Update selected log when selected date changes
  useEffect(() => {
    if (selectedDate) {
      setSelectedLog(dailyLogs[selectedDate] || null);
      setCurrentDate(selectedDate);
    }
  }, [selectedDate, dailyLogs, setCurrentDate]);
  
  // Format meal entry for display
  const formatMealEntry = (entry: MealEntry) => {
    return {
      ...entry,
      totalCalories: entry.foodItem.calories * entry.quantity,
      totalProtein: entry.foodItem.protein * entry.quantity,
      totalFat: entry.foodItem.fat * entry.quantity,
      totalCarbs: entry.foodItem.carbs * entry.quantity,
    };
  };
  
  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEE, dd MMM');
    } catch (error) {
      return dateString;
    }
  };
  
  // Group meal entries by type
  const getMealsByType = (entries: MealEntry[] = []) => {
    return entries.reduce((acc, entry) => {
      if (!acc[entry.mealType]) {
        acc[entry.mealType] = [];
      }
      acc[entry.mealType].push(formatMealEntry(entry));
      return acc;
    }, {} as Record<string, any[]>);
  };
  
  // Handle date selection from the calendar popup
  const handleCalendarDateSelect = (date: string) => {
    setSelectedDate(date);
    
    // If the selected date is outside the current 7-day range, update the date range
    const dateObj = parseISO(date);
    const startOfRange = parseISO(dates[0]);
    const endOfRange = parseISO(dates[dates.length - 1]);
    
    if (dateObj < startOfRange || dateObj > endOfRange) {
      const newDates = Array.from({ length: 7 }).map((_, index) => {
        return format(subDays(dateObj, 3 - index), 'yyyy-MM-dd');
      });
      setDates(newDates);
    }
  };
  
  // Render meal type section
  const renderMealTypeSection = (mealType: string, meals: any[]) => {
    return (
      <motion.div key={mealType} className="mb-4" variants={item}>
        <h3 className="text-lg font-semibold capitalize mb-2">{t.addMeal.mealTypes[mealType as keyof typeof t.addMeal.mealTypes]}</h3>
        <div className="space-y-2">
          {meals.map((meal, idx) => (
            <motion.div 
              key={meal.id} 
              className="bg-[hsl(var(--card))] p-3 rounded-lg border border-[hsl(var(--border))] hover:shadow-md transition-shadow"
              variants={item}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{meal.foodItem.name}</h4>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {meal.quantity} {meal.foodItem.servingSize} • {meal.totalCalories.toFixed(0)} {t.mobileNav.common.calories}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs">
                    <span className="font-medium">P:</span> {meal.totalProtein.toFixed(1)}g
                    <span className="ml-1 font-medium">F:</span> {meal.totalFat.toFixed(1)}g
                    <span className="ml-1 font-medium">C:</span> {meal.totalCarbs.toFixed(1)}g
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };
  
  return (
    <motion.div 
      className="max-w-md mx-auto min-h-screen pb-24"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div 
        className="flex items-center justify-between mb-4"
        variants={item}
      >
        <h1 className="text-xl font-bold">
          {t.mobileNav.navigation.history}
        </h1>
        <motion.div 
          className="h-10 w-10 bg-[hsl(var(--accent))]/10 rounded-full flex items-center justify-center text-[hsl(var(--foreground))]"
          variants={item}
          onClick={() => setIsCalendarOpen(true)}
        >
          <CalendarIcon className="h-5 w-5" />
        </motion.div>
      </motion.div>
      
      {/* Date Slider */}
      <motion.div className="mb-5" variants={item}>
        <div className="flex items-center justify-between mb-3">
          <motion.button 
            onClick={() => {
              const newDates = dates.map(date => format(subDays(parseISO(date), 7), 'yyyy-MM-dd'));
              setDates(newDates);
              setSelectedDate(newDates[newDates.length - 1]); // Select the last (most recent) date
            }}
            className="p-1.5 rounded-full hover:bg-[hsl(var(--accent))]/10 transition-colors"
            variants={item}
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>
          
          <Button 
            variant="ghost" 
            className="text-base font-medium hover:bg-[hsl(var(--accent))]/10 hover:text-[hsl(var(--foreground))]"
            onClick={() => setIsCalendarOpen(true)}
          >
            {format(parseISO(selectedDate), 'PPPP', { 
              locale: locale === 'th' ? th : 
                     locale === 'ja' ? ja : 
                     locale === 'zh' ? zhCN : undefined 
            })}
          </Button>
          
          <motion.button 
            onClick={() => {
              const today = format(new Date(), 'yyyy-MM-dd');
              const last7Days = Array.from({ length: 7 }).map((_, index) => {
                return format(subDays(new Date(), 6 - index), 'yyyy-MM-dd');
              });
              setDates(last7Days);
              setSelectedDate(today);
            }}
            className="p-1.5 rounded-full hover:bg-[hsl(var(--accent))]/10 transition-colors disabled:opacity-50"
            disabled={dates[dates.length - 1] === format(new Date(), 'yyyy-MM-dd')}
            variants={item}
          >
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>
        
        <motion.div 
          className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar"
          variants={container}
        >
          {dates.map((date, index) => (
            <motion.button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "min-w-[4.2rem] p-2 rounded-xl text-center transition-all shadow-sm",
                selectedDate === date 
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md" 
                  : "bg-[hsl(var(--card))] hover:bg-[hsl(var(--accent))]/10"
              )}
              variants={sliderItem}
            >
              <div className="font-medium">{format(parseISO(date), 'EEE')}</div>
              <div className="text-sm">{format(parseISO(date), 'dd')}</div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
      
      {/* Daily Log Display */}
      {selectedLog ? (
        <motion.div 
          className="space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Summary */}
          <motion.div variants={item}>
            <Card className="shadow-md rounded-2xl p-5">
              <CardHeader className="pb-2 px-0 pt-0">
                <CardTitle className="text-lg">{t.result.nutritionalInfo}</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.result.totalCalories}</p>
                    <p className="font-semibold text-[hsl(var(--primary))]">{selectedLog.totalCalories.toFixed(0)} kcal</p>
                  </div>
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.result.protein}</p>
                    <p className="font-semibold text-[hsl(var(--primary))]">{selectedLog.totalProtein.toFixed(1)}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.result.carbs}</p>
                    <p className="font-semibold text-[hsl(var(--primary))]">{selectedLog.totalCarbs.toFixed(1)}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.result.fat}</p>
                    <p className="font-semibold text-[hsl(var(--primary))]">{selectedLog.totalFat.toFixed(1)}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Water Intake */}
          <motion.div variants={item}>
            <Card className="shadow-md rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3">
                      <Droplet className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="font-semibold">Water Intake</h3>
                  </div>
                  <div className="font-medium text-[hsl(var(--primary))]">{selectedLog.waterIntake} ml</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Mood & Notes if available */}
          {(selectedLog.moodRating || selectedLog.notes) && (
            <motion.div variants={item}>
              <Card className="shadow-md rounded-2xl">
                <CardContent className="p-5">
                  {selectedLog.moodRating && (
                    <div className="flex items-center mb-2">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mr-3">
                        <Smile className="h-5 w-5 text-yellow-500" />
                      </div>
                      <h3 className="font-semibold">Mood</h3>
                      <div className="ml-auto">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span 
                            key={index}
                            className={cn(
                              "inline-block mx-0.5 text-lg",
                              index < selectedLog.moodRating! ? "text-yellow-500" : "text-[hsl(var(--muted-foreground))]"
                            )}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedLog.notes && (
                    <div className="flex items-start mt-4">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[hsl(var(--primary))]/10 mr-3 mt-0.5">
                        <StickyNote className="h-5 w-5 text-[hsl(var(--primary))]" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Notes</h3>
                        <p className="text-sm mt-1 text-[hsl(var(--foreground))]">{selectedLog.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Meals List */}
          <motion.div className="space-y-4" variants={item}>
            <Card className="shadow-md rounded-2xl p-5">
              <CardHeader className="pb-2 px-0 pt-0">
                <CardTitle className="text-lg flex items-center">
                  <span>Meals</span>
                  {selectedLog.meals.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-medium">
                      {selectedLog.meals.length}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pt-2">
                {selectedLog.meals.length > 0 ? (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {Object.entries(getMealsByType(selectedLog.meals)).map(([mealType, meals]) => 
                      renderMealTypeSection(mealType, meals)
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-[hsl(var(--muted-foreground))]">No meals recorded for this day</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <Card className="shadow-md rounded-2xl">
            <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
              <CalendarIcon className="h-12 w-12 text-[hsl(var(--muted-foreground))] mb-2" />
              <p className="text-[hsl(var(--muted-foreground))]">No data recorded for this day</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Add meals by tapping the + button</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Calendar Popup */}
      <CalendarPopup 
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={handleCalendarDateSelect}
      />
    </motion.div>
  );
} 