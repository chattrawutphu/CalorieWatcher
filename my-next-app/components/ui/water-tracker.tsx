import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplet, Plus, Minus, RotateCcw, Trophy, CupSoda, AlertCircle, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNutritionStore } from '@/lib/store/nutrition-store';
import { format } from 'date-fns';
import { useLanguage } from '@/components/providers/language-provider';
import { cn } from '@/lib/utils';

// กำหนด translations ภายในไฟล์โดยตรง
const translations = {
  en: {
    water: {
      title: "Water Intake",
      completed: "completed",
      reset: "Reset",
      add: "Add",
      tip: "Experts recommend drinking at least 2 liters of water daily.",
      goal: "Goal",
      quickAdd: "Quick Add",
      glass: "Glass",
      bottle: "Bottle",
      achievement: "Goal Achieved! Great job staying hydrated!",
      keepGoing: "Keep going! You're doing great!",
      almostThere: "Almost there! Just a bit more.",
      startDrinking: "Start your hydration journey!",
      cups: "cups"
    }
  },
  th: {
    water: {
      title: "การดื่มน้ำ",
      completed: "สำเร็จแล้ว",
      reset: "รีเซ็ต",
      add: "เพิ่ม",
      tip: "ผู้เชี่ยวชาญแนะนำให้ดื่มน้ำอย่างน้อย 2 ลิตรต่อวัน",
      goal: "เป้าหมาย",
      quickAdd: "เพิ่มด่วน",
      glass: "แก้ว",
      bottle: "ขวด",
      achievement: "บรรลุเป้าหมายแล้ว! เยี่ยมมากที่ดูแลการดื่มน้ำ!",
      keepGoing: "ดื่มต่อไป! คุณทำได้ดีมาก!",
      almostThere: "เกือบถึงเป้าหมายแล้ว! อีกนิดเดียว",
      startDrinking: "เริ่มต้นการดื่มน้ำวันนี้!",
      cups: "แก้ว"
    }
  },
  ja: {
    water: {
      title: "水分摂取量",
      completed: "完了",
      reset: "リセット",
      add: "追加",
      tip: "専門家は1日に少なくとも2リットルの水を飲むことをお勧めします。",
      goal: "目標",
      quickAdd: "クイック追加",
      glass: "グラス",
      bottle: "ボトル",
      achievement: "目標達成！水分補給を続けてください！",
      keepGoing: "続けてください！うまくいっています！",
      almostThere: "もう少しです！",
      startDrinking: "水分補給を始めましょう！",
      cups: "杯"
    }
  },
  zh: {
    water: {
      title: "饮水量",
      completed: "已完成",
      reset: "重置",
      add: "添加",
      tip: "专家建议每天至少饮用2升水。",
      goal: "目标",
      quickAdd: "快速添加",
      glass: "杯",
      bottle: "瓶",
      achievement: "目标达成！保持良好的水分摄入！",
      keepGoing: "继续努力！你做得很好！",
      almostThere: "即将达成！还差一点点。",
      startDrinking: "开始你的水分摄入之旅！",
      cups: "杯"
    }
  }
};

const presetAmounts = [
  { label: '🥛', value: 200, name: 'glass' },
  { label: '🧃', value: 350, name: 'pack' },
  { label: '🍶', value: 500, name: 'bottle' }
]; 

// น่ารักๆ แอนิเมชัน
const waveAnimation = {
  animate: {
    y: [0, -3, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut"
    }
  }
};

const popAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 }
  }
};

const rainbowColors = [
  "from-blue-400 to-blue-300",
  "from-blue-500 to-cyan-400",
  "from-cyan-500 to-teal-400",
  "from-teal-400 to-green-300",
  "from-green-400 to-emerald-300",
];

export function WaterTracker({ date }: { date: string }) {
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations]?.water || translations.en.water;
  const { addWaterIntake, resetWaterIntake, getWaterIntake, getWaterGoal } = useNutritionStore();
  const waterIntake = getWaterIntake(date) || 0;
  const waterGoal = getWaterGoal() || 2000; // ใช้ค่า default 2000ml ถ้าไม่มีการตั้งค่า
  const percentage = waterGoal > 0 ? Math.min(Math.round((waterIntake / waterGoal) * 100), 100) : 0;
  const [showAchievement, setShowAchievement] = useState(false);
  const [lastAddedAmount, setLastAddedAmount] = useState(0);

  const [customAmount, setCustomAmount] = useState(250);

  // สถานะความก้าวหน้า
  const getProgressStatus = () => {
    if (percentage >= 100) return 'complete';
    if (percentage >= 75) return 'almostThere';
    if (percentage > 0) return 'inProgress';
    return 'notStarted';
  };

  const progressStatus = getProgressStatus();
  
  // Emoji ตามความก้าวหน้า
  const getProgressEmoji = () => {
    if (progressStatus === 'complete') return '🎉';
    if (progressStatus === 'almostThere') return '💪';
    if (progressStatus === 'inProgress') return '😊';
    return '💧';
  };

  // ข้อความตามความก้าวหน้า
  const getProgressMessage = () => {
    if (progressStatus === 'complete') return t.achievement;
    if (progressStatus === 'almostThere') return t.almostThere;
    if (progressStatus === 'inProgress') return t.keepGoing;
    return t.startDrinking;
  };

  const handleAddWater = (amount: number) => {
    addWaterIntake(date, amount);
    setLastAddedAmount(amount);
    setShowAchievement(percentage + (amount / waterGoal) * 100 >= 100);
    
    // Set achievement timeout
    if (percentage + (amount / waterGoal) * 100 >= 100) {
      setTimeout(() => setShowAchievement(false), 3000);
    }
  };

  const handleResetWater = () => {
    resetWaterIntake(date);
    setShowAchievement(false);
  };

  const handleIncrement = () => {
    setCustomAmount(prev => prev + 50);
  };

  const handleDecrement = () => {
    setCustomAmount(prev => Math.max(50, prev - 50));
  };

  // สร้างสีพื้นหลัง Progress ตามธีม
  const getWaterProgressColor = () => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      const isChocolate = document.documentElement.classList.contains('chocolate');
      const isSweet = document.documentElement.classList.contains('sweet');
      const isBroccoli = document.documentElement.classList.contains('broccoli');
      const isWatermelon = document.documentElement.classList.contains('watermelon');
      const isHoney = document.documentElement.classList.contains('honey');
      
      if (isDark) return 'text-[hsl(var(--primary))]';
      if (isChocolate) return 'text-[hsl(var(--primary))]';
      if (isSweet) return 'text-[hsl(var(--primary))]';
      if (isBroccoli) return 'text-[hsl(var(--primary))]';
      if (isWatermelon) return 'text-[hsl(var(--primary))]';
      if (isHoney) return 'text-[hsl(var(--primary))]';
    }
    
    return 'text-[hsl(var(--primary))]';
  };

  // คำนวณจำนวนแก้วที่ดื่มแล้ว (นับแก้วละ 250ml)
  const glassCount = Math.floor(waterIntake / 250);
  const totalGlasses = Math.max(1, Math.ceil(waterGoal / 250));

  const waterProgressColor = getWaterProgressColor();
  const textColor = waterProgressColor;
  const gradientColor = waterProgressColor;

  return (
    <Card className="p-5 shadow-md rounded-2xl overflow-hidden relative bg-[hsl(var(--card))]">
      <div className="space-y-5 relative z-1">
        {/* ส่วนหัว - ทำให้น่ารักมากขึ้น */}
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2 bg-[hsl(var(--primary))/0.1] px-3 py-1.5 rounded-full"
            whileHover={{ scale: 1.03 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            >
              <Droplet className={`h-5 w-5 ${textColor} fill-[hsl(var(--primary))/30]`} />
            </motion.div>
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{t.title}</h2>
          </motion.div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetWater}
            title={t.reset}
            className="rounded-full hover:bg-[hsl(var(--primary))/0.1] border-[hsl(var(--primary))/0.2]"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* แสดงปริมาณน้ำปัจจุบันและเป้าหมาย - น่ารักมากขึ้น */}
        <motion.div 
          className="text-center bg-[hsl(var(--primary))/0.1] rounded-xl p-3 backdrop-blur-sm"
          initial={popAnimation.initial}
          animate={popAnimation.animate}
        >
          <div className="text-3xl font-bold text-[hsl(var(--foreground))]">
            {waterIntake} <span className="text-base font-normal text-[hsl(var(--muted-foreground))]">/ {waterGoal} ml</span>
          </div>
          <motion.div 
            className="text-sm text-[hsl(var(--muted-foreground))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {percentage}% {t.completed}
          </motion.div>
        </motion.div>

        {/* แสดงแก้วน้ำเป็นภาพ - ทำให้น่ารักมากขึ้น */}
        <div className="relative h-20 bg-[hsl(var(--primary))/0.1] rounded-xl overflow-hidden p-2">
          <div className="flex justify-center space-x-2 relative z-10">
            {Array.from({ length: Math.min(8, totalGlasses) }).map((_, index) => {
              const isFilled = index < glassCount;
              const fillLevel = index === Math.floor(glassCount) && waterIntake % 250 > 0 
                ? (waterIntake % 250) / 250 * 100
                : isFilled ? 100 : 0;
                
              return (
                <motion.div 
                  key={index}
                  className={cn(
                    "relative w-7 h-10 rounded-b-lg border-2 overflow-hidden",
                    isFilled ? "border-[hsl(var(--primary))]" : "border-[hsl(var(--muted))]"
                  )}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 5 : -5 }}
                >
                  <div className="absolute inset-x-0 bottom-0 bg-[hsl(var(--primary))] transition-all duration-500" 
                       style={{ height: `${fillLevel}%` }}>
                  </div>
                  {/* เพิ่มตากลมๆ น่ารักๆ ให้แก้ว */}
                  {isFilled && (
                    <>
                      <motion.div 
                        className="absolute left-1.5 top-2 w-1 h-1 bg-white rounded-full" 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div 
                        className="absolute right-1.5 top-3 w-0.5 h-0.5 bg-white rounded-full"
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </>
                  )}
                </motion.div>
              );
            })}
            {totalGlasses > 8 && (
              <motion.div 
                className="flex items-end mb-1"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-sm text-[hsl(var(--muted-foreground))]">+{totalGlasses - 8}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress Bar ที่น่ารักขึ้น */}
        <div className="space-y-2 relative">
          <div className="h-5 bg-[hsl(var(--muted))/0.3] rounded-full p-1 shadow-inner overflow-hidden">
            <motion.div 
              className={`h-full rounded-full bg-[hsl(var(--primary))]`}
              initial={{ width: '0%' }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          <AnimatePresence>
            {showAchievement && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-md rounded-2xl"
              >
                <motion.div 
                  className="bg-[hsl(var(--card))] p-5 rounded-xl shadow-lg text-center border-2 border-[hsl(var(--primary))]"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ 
                    y: { duration: 1.5, repeat: Infinity, repeatType: 'mirror' },
                  }}
                >
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-4xl mb-2 mx-auto"
                    >
                      🎉
                    </motion.div>
                    
                    {/* เพิ่มเอฟเฟกต์รัศมี */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-10 h-10 rounded-full bg-[hsl(var(--primary))/30]"
                      />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-[hsl(var(--foreground))] mt-2">{t.achievement}</h3>
                  
                  <div className="mt-3 flex justify-center gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ 
                          duration: 1,
                          delay: i * 0.2,
                          repeat: Infinity
                        }}
                        className="text-lg"
                      >
                        💧
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ข้อความแรงจูงใจ - ทำให้น่ารักขึ้น */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={progressStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center bg-[hsl(var(--primary))/0.1] rounded-lg p-2"
          >
            <div className="flex items-center justify-center gap-2 text-sm">
              <motion.span 
                className="text-lg"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                {getProgressEmoji()}
              </motion.span>
              
              <span className={cn(
                "font-medium", 
                progressStatus === 'complete' ? textColor : 'text-[hsl(var(--foreground))]'
              )}>
                {getProgressMessage()}
              </span>
              
              {progressStatus === 'complete' && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ปุ่มเพิ่มน้ำตามปริมาณที่กำหนดไว้ล่วงหน้า - น่ารักขึ้น */}
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 flex items-center gap-1">
            <span className="relative">
              {t.quickAdd}
              <motion.span 
                className="absolute -right-4 -top-1 text-[8px]"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                💧
              </motion.span>
            </span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {presetAmounts.map((amount, idx) => (
              <motion.div
                key={amount.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddWater(amount.value)}
                  className={cn(
                    "w-full flex flex-row items-center justify-center py-1.5",
                    "text-xs",
                    "border-[hsl(var(--border))]",
                    "bg-[hsl(var(--background))]",
                    "hover:bg-[hsl(var(--accent))]",
                    "hover:text-[hsl(var(--accent-foreground))]",
                    "shadow-sm",
                    "transition-all"
                  )}
                >
                  <motion.span 
                    className="text-lg mr-2"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, delay: idx * 0.5, repeat: Infinity, repeatType: 'reverse' }}
                  >
                    {amount.label}
                  </motion.span>
                  <span>{amount.value}ml</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ส่วนกำหนดปริมาณแบบกำหนดเอง - น่ารักขึ้น */}
        <div className="bg-[hsl(var(--primary))/0.1] rounded-xl p-3 flex items-center space-x-2">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleDecrement}
              className="rounded-full border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </motion.div>
          
          <div className="flex-1 px-3 py-2 border rounded-lg text-center bg-[hsl(var(--background))] backdrop-blur-sm border-[hsl(var(--border))] shadow-inner">
            <motion.span
              key={customAmount}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono"
            >
              {customAmount} ml
            </motion.span>
          </div>
          
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleIncrement}
              className="rounded-full border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="rounded-full overflow-hidden"
          >
            <Button 
              onClick={() => handleAddWater(customAmount)}
              className="flex items-center px-4 py-2 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.9] rounded-full text-[hsl(var(--primary-foreground))] border-none"
            >
              <Droplet className="h-4 w-4 mr-1" />
              {t.add}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* เอฟเฟกต์พื้นหลัง */}
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[hsl(var(--primary))/0.1] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 -left-20 w-40 h-40 bg-[hsl(var(--primary))/0.1] rounded-full blur-3xl pointer-events-none" />
    </Card>
  );
} 