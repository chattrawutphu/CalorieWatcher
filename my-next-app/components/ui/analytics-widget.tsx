"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parse } from "date-fns";
import { th, ja, zhCN } from "date-fns/locale";

// Animation variants
const chartVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
};

// Chart container variants for sliding
const chartContainerVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  })
};

// Button pill container variants
const pillContainerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1 
    }
  }
};

const pillItemVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2 }
  }
};

// Define colors - updating with more vibrant, cute theme-compatible colors
const COLORS = {
  protein: {
    light: "hsl(var(--primary))",
    dark: "hsl(var(--primary))",
    gradient: "linear-gradient(180deg, hsl(var(--primary-foreground)), hsl(var(--primary)))"
  },
  fat: {
    light: "hsl(var(--secondary))",
    dark: "hsl(var(--secondary))",
    gradient: "linear-gradient(180deg, hsl(var(--secondary-foreground)), hsl(var(--secondary)))"
  },
  carbs: {
    light: "hsl(var(--accent))",
    dark: "hsl(var(--accent))",
    gradient: "linear-gradient(180deg, hsl(var(--muted-foreground)), hsl(var(--accent)))"
  },
  calories: {
    light: "hsl(var(--primary))",
    dark: "hsl(var(--primary))",
    gradient: "linear-gradient(180deg, hsl(var(--primary-foreground)), hsl(var(--primary)))"
  },
  water: {
    light: "hsl(var(--accent))",
    dark: "hsl(var(--accent))",
    gradient: "linear-gradient(180deg, hsl(var(--muted-foreground)), hsl(var(--accent)))"
  }
};

// Calculate analytics data with some nice animated effects
const getAnalyticsData = (metric: string, period: string, dailyLogs: any, goals: any, getDateLocale: () => any) => {
  const today = new Date();
  let dates: Date[] = [];
  let labels: string[] = [];
  
  // Generate dates based on selected period
  if (period === "7d") {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date);
      labels.push(format(date, 'EEE', { locale: getDateLocale() }));
    }
  } else if (period === "4w") {
    // Last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - (i * 7));
      dates.push(date);
      labels.push(format(date, 'MMM d', { locale: getDateLocale() }));
    }
  } else if (period === "12m") {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      dates.push(date);
      labels.push(format(date, 'MMM', { locale: getDateLocale() }));
    }
  }
  
  // Map dates to data values
  const data = dates.map((date, index) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    // Get the daily log or create an empty one
    const dayLog = dailyLogs[formattedDate] || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      meals: []
    };
    
    // Get water data from a separate source if needed
    const waterData = dailyLogs[formattedDate]?.water || 0;
    
    // Get the value based on selected metric
    let value = 0;
    switch(metric) {
      case 'calories':
        value = dayLog.totalCalories || 0;
        break;
      case 'protein':
        value = dayLog.totalProtein || 0;
        break;
      case 'fat':
        value = dayLog.totalFat || 0;
        break;
      case 'carbs':
        value = dayLog.totalCarbs || 0;
        break;
      case 'water':
        value = waterData;
        break;
    }
    
    // Calculate goal based on metric
    let goal = 0;
    switch(metric) {
      case 'calories':
        goal = goals.calories || 2000;
        break;
      case 'protein':
        goal = Math.round(((goals.protein || 30) / 100) * goals.calories / 4);
        break;
      case 'fat':
        goal = Math.round(((goals.fat || 30) / 100) * goals.calories / 9);
        break;
      case 'carbs':
        goal = Math.round(((goals.carbs || 40) / 100) * goals.calories / 4);
        break;
      case 'water':
        goal = goals.water || 2000;
        break;
    }
    
    return {
      name: labels[index],
      value: value,
      goal: goal,
      date: formattedDate
    };
  });
  
  return data;
};

interface AnalyticsWidgetProps {
  dailyLogs: Record<string, any>;
  goals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    water: number;
  };
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ dailyLogs, goals }) => {
  const { locale } = useLanguage();
  
  // Analytics state
  const [currentMetric, setCurrentMetric] = useState<string>("calories");
  const [currentPeriod, setCurrentPeriod] = useState<string>("7d");
  const [chartDirection, setChartDirection] = useState<number>(0); // For slide animation direction
  
  // For swipe gestures
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  // First time view indicator for swipe instructions
  const [showSwipeInstruction, setShowSwipeInstruction] = useState<boolean>(true);
  
  // Clear swipe instruction after 5 seconds
  useEffect(() => {
    if (showSwipeInstruction) {
      const timer = setTimeout(() => {
        setShowSwipeInstruction(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeInstruction]);
  
  const getDateLocale = () => {
    switch (locale) {
      case 'th': return th;
      case 'ja': return ja;
      case 'zh': return zhCN;
      default: return undefined;
    }
  };
  
  // Get chart data for current selections - use memoized version to avoid recalculations
  const chartData = React.useMemo(() => 
    getAnalyticsData(currentMetric, currentPeriod, dailyLogs, goals, getDateLocale),
    [currentMetric, currentPeriod, dailyLogs, goals, locale]
  );
  
  // Get chart colors
  const getChartColor = (metric: string) => {
    switch(metric) {
      case 'calories':
        return COLORS.calories.light;
      case 'protein':
        return COLORS.protein.light;
      case 'fat':
        return COLORS.fat.light;
      case 'carbs':
        return COLORS.carbs.light;
      case 'water':
        return COLORS.water.light;
      default:
        return COLORS.calories.light;
    }
  };
  
  // Get current chart color
  const currentChartColor = getChartColor(currentMetric);
  
  // Get gradient for bars
  const getChartGradient = (metric: string) => {
    switch(metric) {
      case 'calories':
        return COLORS.calories.gradient;
      case 'protein':
        return COLORS.protein.gradient;
      case 'fat':
        return COLORS.fat.gradient;
      case 'carbs':
        return COLORS.carbs.gradient;
      case 'water':
        return COLORS.water.gradient;
      default:
        return COLORS.calories.gradient;
    }
  };
  
  // Get current chart gradient
  const currentChartGradient = getChartGradient(currentMetric);
  
  // Get unit for current metric
  const getMetricUnit = (metric: string) => {
    switch(metric) {
      case 'calories':
        return getMetricTranslation("kcal");
      case 'protein':
      case 'fat':
      case 'carbs':
        return getMetricTranslation("g");
      case 'water':
        return 'ml';
      default:
        return '';
    }
  };
  
  // Get translations for metrics
  const getMetricTranslation = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        calories: "Calories",
        protein: "Protein",
        fat: "Fat",
        carbs: "Carbs",
        water: "Water",
        kcal: "kcal",
        g: "g",
        goal: "Goal",
        average: "Average",
        "7d": "7 Days",
        "4w": "4 Weeks",
        "12m": "12 Months",
        analytics: "Analytics & Stats",
        swipeInstruction: "Swipe to change metrics",
        swipe: "Swipe"
      },
      th: {
        calories: "แคลอรี่",
        protein: "โปรตีน",
        fat: "ไขมัน",
        carbs: "คาร์บ",
        water: "น้ำ",
        kcal: "แคล",
        g: "ก.",
        goal: "เป้าหมาย",
        average: "เฉลี่ย",
        "7d": "7 วัน",
        "4w": "4 สัปดาห์",
        "12m": "12 เดือน",
        analytics: "สถิติและวิเคราะห์",
        swipeInstruction: "สับพิมพ์เพื่อเปลี่ยนหน่วยวิเคราะห์",
        swipe: "สับพิมพ์"
      },
      ja: {
        calories: "カロリー",
        protein: "タンパク質",
        fat: "脂肪",
        carbs: "炭水化物",
        water: "水分",
        kcal: "kcal",
        g: "g",
        goal: "目標",
        average: "平均",
        "7d": "7日",
        "4w": "4週間",
        "12m": "12ヶ月",
        analytics: "分析と統計",
        swipeInstruction: "スワイプして分析を変更",
        swipe: "スワイプ"
      },
      zh: {
        calories: "卡路里",
        protein: "蛋白质",
        fat: "脂肪",
        carbs: "碳水",
        water: "水分",
        kcal: "卡",
        g: "克",
        goal: "目标",
        average: "平均",
        "7d": "7天",
        "4w": "4周",
        "12m": "12个月",
        analytics: "分析和统计",
        swipeInstruction: "滑动以更改分析",
        swipe: "滑动"
      }
    };
    
    const currentLocale = locale as keyof typeof translations;
    const fallbackLocale = "en";
    
    return translations[currentLocale]?.[key] || translations[fallbackLocale][key] || key;
  };
  
  // Handle metric change with animation direction
  const handleMetricChange = (metric: string) => {
    if (metric === currentMetric) return;
    
    // Determine direction for animation
    const metrics = ['calories', 'protein', 'fat', 'carbs', 'water'];
    const currentIndex = metrics.indexOf(currentMetric);
    const newIndex = metrics.indexOf(metric);
    const direction = newIndex > currentIndex ? 1 : -1;
    
    setChartDirection(direction);
    setCurrentMetric(metric);
  };
  
  // Handle period change
  const handlePeriodChange = (period: string) => {
    if (period === currentPeriod) return;
    setCurrentPeriod(period);
  };
  
  // Handle swipe gesture start
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  
  // Handle swipe gesture end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX;
    
    // Determine if it was a significant swipe (more than 50px)
    if (Math.abs(diffX) > 50) {
      const metrics = ['calories', 'protein', 'fat', 'carbs', 'water'];
      const currentIndex = metrics.indexOf(currentMetric);
      
      // Swipe right (go to previous)
      if (diffX > 0 && currentIndex > 0) {
        const newMetric = metrics[currentIndex - 1];
        setChartDirection(-1);
        setCurrentMetric(newMetric);
      } 
      // Swipe left (go to next)
      else if (diffX < 0 && currentIndex < metrics.length - 1) {
        const newMetric = metrics[currentIndex + 1];
        setChartDirection(1);
        setCurrentMetric(newMetric);
      }
    }
    
    setTouchStartX(null);
  };
  
  // Get visual indicators for swiping - which metrics are available left/right
  const metrics = ['calories', 'protein', 'fat', 'carbs', 'water'];
  const currentIndex = metrics.indexOf(currentMetric);
  const hasNext = currentIndex < metrics.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <Card className="relative p-5 shadow-md rounded-2xl overflow-hidden">
      {/* Theme-compatible decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br from-[hsl(var(--background))]/10 to-[hsl(var(--background))]/5 blur-xl"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-gradient-to-tr from-[hsl(var(--background))]/15 to-[hsl(var(--background))]/5 blur-xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col space-y-4">
        {/* Title and Period Selector */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-8 w-8 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center shadow-sm"
            >
              <Activity className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </motion.div>
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              {getMetricTranslation("analytics")}
            </h2>
          </div>
          
          <motion.div 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex bg-[hsl(var(--muted))] p-1 rounded-full text-xs shadow-sm"
          >
            {['7d', '4w', '12m'].map((period, index) => (
              <motion.div 
                key={period}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Button
                  variant={currentPeriod === period ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePeriodChange(period)}
                  className={`px-3 py-1 text-xs h-7 
                    ${currentPeriod === period 
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' 
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'} 
                    rounded-full transition-all duration-200 hover:scale-105`}
                >
                  {getMetricTranslation(period)}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Metric Pills */}
        <motion.div 
          className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar"
          variants={pillContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {metrics.map((metric, index) => (
            <motion.div 
              key={metric} 
              variants={pillItemVariants}
              custom={index}
              transition={{ delay: 0.1 * index }}
            >
              <Button
                variant={currentMetric === metric ? "default" : "outline"}
                size="sm"
                onClick={() => handleMetricChange(metric)}
                className={`px-3 py-1 text-xs h-8 whitespace-nowrap rounded-full transition-all duration-200 
                  ${currentMetric === metric 
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]' 
                    : 'hover:bg-[hsl(var(--muted))] border-[hsl(var(--border))]'}`}
              >
                <span className="flex items-center gap-1">
                  {getMetricTranslation(metric)}
                </span>
              </Button>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Chart Area with Swipe Handler */}
        <div 
          className="h-60 w-full relative overflow-hidden rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-2"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Swipe Instruction - Shows only on first view */}
          {showSwipeInstruction && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1 }}
              className="absolute inset-0 z-40 bg-[hsl(var(--background))/70] backdrop-blur-sm flex items-center justify-center rounded-xl"
            >
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, duration: 0.3 }}
                className="text-center px-6 py-4 rounded-xl bg-[hsl(var(--background))] shadow-lg border border-[hsl(var(--border))]"
              >
                <div className="text-sm font-medium mb-2">{getMetricTranslation("swipeInstruction") || "Swipe to change metrics"}</div>
                <motion.div 
                  animate={{ x: [-20, 20, -20] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="flex items-center justify-center text-[hsl(var(--muted-foreground))]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="mx-2 text-xs">{getMetricTranslation("swipe") || "Swipe"}</span>
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
          
          <AnimatePresence custom={chartDirection} mode="popLayout">
            <motion.div
              key={currentMetric + currentPeriod}
              custom={chartDirection}
              variants={chartContainerVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              {/* Visual goal indicator */}
              {chartData.length > 0 && (
                <div 
                  className="absolute right-12 h-full w-px bg-[hsl(var(--muted))]/90 z-10 pointer-events-none"
                  style={{
                    height: '70%',
                    top: '15%'
                  }}
                />
              )}
              
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: -10, bottom: 20 }}
                  barGap={2}
                  barSize={currentPeriod === '12m' ? 12 : currentPeriod === '4w' ? 20 : 30}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 500 }}
                    tickMargin={8}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => value === 0 ? '' : value.toString()}
                    width={30}
                  />
                  <Tooltip
                    formatter={(value: number) => {
                      return [
                        `${Math.round(value)} ${getMetricUnit(currentMetric)}`,
                        getMetricTranslation(currentMetric)
                      ] as [string, string];
                    }}
                    labelFormatter={(name, payload) => {
                      if (payload && payload.length > 0) {
                        const date = payload[0].payload.date;
                        return format(parse(date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d', { locale: getDateLocale() });
                      }
                      return name;
                    }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0px 4px 20px hsl(var(--foreground)/0.05)',
                      backgroundColor: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      padding: '8px 12px'
                    }}
                  />
                  {/* Reference Line for Goal */}
                  {chartData.length > 0 && chartData[0].goal > 0 && (
                    <ReferenceLine 
                      y={chartData[0].goal} 
                      stroke="hsl(var(--primary))"
                      strokeDasharray="3 3"
                      strokeWidth={2}
                      opacity={0.7}
                      label={{
                        value: `${getMetricTranslation("goal")}: ${chartData[0].goal}${getMetricUnit(currentMetric)}`,
                        fill: "hsl(var(--primary))",
                        fontSize: 10,
                        position: 'right'
                      }}
                    />
                  )}
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary-foreground))" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" />
                    </linearGradient>
                  </defs>
                  <Bar 
                    dataKey="value" 
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill="hsl(var(--primary))"
                        fillOpacity={0.8}
                        stroke="hsl(var(--primary))"
                        strokeWidth={0.5}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Stat Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center pt-1 px-1"
        >
          <div className="flex flex-col">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {getMetricTranslation("average")}
            </span>
            <span className="font-semibold text-sm text-[hsl(var(--foreground))]">
              {Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / Math.max(1, chartData.length))} {getMetricUnit(currentMetric)}
            </span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {getMetricTranslation("goal")}
            </span>
            <span className="font-semibold text-sm text-[hsl(var(--foreground))]">
              {chartData.length > 0 ? chartData[0].goal : 0} {getMetricUnit(currentMetric)}
            </span>
          </div>
        </motion.div>
        
        {/* Progress Indicator */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-1 px-1"
          >
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1 flex justify-between">
              <span>{getMetricTranslation("progress") || "Progress"}</span>
              <span>
                {Math.min(100, Math.round((chartData[chartData.length-1].value / chartData[0].goal) * 100))}%
              </span>
            </div>
            <div className="h-2 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round((chartData[chartData.length-1].value / chartData[0].goal) * 100))}%` }}
                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-[hsl(var(--primary))]"
              />
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}; 