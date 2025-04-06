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
import { Save, LogOut, User, Check, Droplet, CupSoda, AlertCircle, Cloud, RefreshCw, Loader2, Scale, Trash, Trash2, Minus, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow, formatRelative } from 'date-fns';
import { th, ja, zhCN } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { ThemeButton } from "@/components/ui/theme-button";
import { ComputerIcon, SunIcon, MoonIcon, Cookie, Candy, Leaf, Heart, Disc } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
    resetSync: "Reset Sync History",
    syncResetConfirm: "This will reset all sync history. Your device will be treated as a new device. Continue?",
    connectionStatus: "Connection Status",
    online: "Online",
    offline: "Offline",
    syncTip: "Sync regularly to keep your data up to date across all devices.",
    appVersion: "App Version",
    checkForUpdates: "Check for updates",
    system: "System",
    light: "Light",
    dark: "Dark",
    chocolate: "Chocolate",
    sweet: "Sweet",
    broccoli: "Broccoli",
    blueberry: "Blueberry",
    watermelon: "Watermelon",
    honey: "Honey",
    dataManagement: "Data Management",
    clearTodayData: "Clear Today's Food Data",
    clearTodayDataConfirm: "This will remove all food entries for today. Water intake and other health data will be preserved. Continue?",
    clearTodayDataSuccess: "Today's food data has been cleared",
    cancel: "Cancel",
    confirm: "Confirm",
    syncTooFrequent: "You're syncing too frequently",
    syncWaitMessage: "Please wait about {minutes} minutes"
  },
  th: {
    settings: "ตั้งค่า",
    account: "บัญชี",
    profile: "โปรไฟล์",
    signOut: "ออกจากระบบ",
    appearance: "ธีมและการแสดงผล",
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
    resetSync: "รีเซ็ตประวัติการซิงค์",
    syncResetConfirm: "การรีเซ็ตจะล้างประวัติการซิงค์ทั้งหมด อุปกรณ์ของคุณจะถูกถือว่าเป็นอุปกรณ์ใหม่ ดำเนินการต่อ?",
    connectionStatus: "สถานะการเชื่อมต่อ",
    online: "ออนไลน์",
    offline: "ออฟไลน์",
    syncTip: "ซิงค์ข้อมูลเป็นประจำเพื่อให้ข้อมูลของคุณอัปเดตบนทุกอุปกรณ์",
    appVersion: "เวอร์ชั่นแอพ",
    checkForUpdates: "ตรวจสอบการอัพเดท",
    system: "อัตโนมัติ (ตามระบบ)",
    light: "โหมดสว่าง",
    dark: "โหมดมืด",
    chocolate: "ธีมช็อกโกแลต",
    sweet: "ธีมหวาน",
    broccoli: "ธีมบร็อคโคลี่",
    blueberry: "ธีมบลูเบอร์รี่",
    watermelon: "ธีมแตงโม",
    honey: "ธีมน้ำผึ้ง",
    dataManagement: "จัดการข้อมูล",
    clearTodayData: "ล้างข้อมูลอาหารของวันนี้",
    clearTodayDataConfirm: "การดำเนินการนี้จะลบข้อมูลอาหารทั้งหมดของวันนี้ ข้อมูลการดื่มน้ำและข้อมูลสุขภาพอื่นๆ จะยังคงอยู่ ต้องการดำเนินการต่อหรือไม่?",
    clearTodayDataSuccess: "ล้างข้อมูลอาหารของวันนี้เรียบร้อยแล้ว",
    cancel: "ยกเลิก",
    confirm: "ยืนยัน",
    syncTooFrequent: "คุณรีเฟรชข้อมูลบ่อยเกินไป",
    syncWaitMessage: "โปรดรอประมาณ {minutes} นาที"
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
    resetSync: "同期履歴をリセット",
    syncResetConfirm: "これにより、すべての同期履歴がリセットされます。お使いのデバイスは新しいデバイスとして扱われます。続行しますか？",
    connectionStatus: "接続状態",
    online: "オンライン",
    offline: "オフライン",
    syncTip: "定期的に同期して、すべてのデバイスでデータを最新の状態に保ちます。",
    appVersion: "アプリバージョン",
    checkForUpdates: "アップデートを確認",
    system: "システム",
    light: "ライトモード",
    dark: "ダークモード",
    chocolate: "チョコレート",
    sweet: "スイート",
    broccoli: "ブロッコリー",
    blueberry: "ブルーベリー",
    watermelon: "スイカ",
    honey: "ハニー",
    dataManagement: "データ管理",
    clearTodayData: "今日の食事データを消去",
    clearTodayDataConfirm: "これにより、今日の食事エントリーがすべて削除されます。水分摂取量やその他の健康データは保持されます。続行しますか？",
    clearTodayDataSuccess: "今日の食事データが消去されました",
    cancel: "キャンセル",
    confirm: "確認",
    syncTooFrequent: "同期が頻繁すぎます",
    syncWaitMessage: "約{minutes}分お待ちください"
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
    resetSync: "重置同步历史",
    syncResetConfirm: "这将重置所有同步历史记录。您的设备将被视为新设备。是否继续？",
    connectionStatus: "连接状态",
    online: "在线",
    offline: "离线",
    syncTip: "定期同步以保持所有设备上的数据更新。",
    appVersion: "应用版本",
    checkForUpdates: "检查更新",
    system: "系统",
    light: "亮色",
    dark: "暗色",
    chocolate: "巧克力",
    sweet: "甜味",
    broccoli: "西兰花",
    blueberry: "蓝莓",
    watermelon: "西瓜",
    honey: "蜂蜜",
    dataManagement: "数据管理",
    clearTodayData: "清除今天的食物数据",
    clearTodayDataConfirm: "这将删除今天的所有食物条目。饮水量和其他健康数据将保留。继续吗？",
    clearTodayDataSuccess: "今天的食物数据已清除",
    cancel: "取消",
    confirm: "确认",
    syncTooFrequent: "同步频率过高",
    syncWaitMessage: "请等待约{minutes}分钟"
  },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  const { goals, updateGoals, syncData, isLoading: isSyncingFromStore, canSync, isSyncOnCooldown, clearTodayData } = useNutritionStore();
  
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
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [tooManySyncs, setTooManySyncs] = useState(false);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);
  
  // State for confirmation dialog
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  
  // โหลดเวลาซิงค์ล่าสุด
  useEffect(() => {
    // เนื่องจาก getLastSyncTime ไม่มีใน API ของ store จึงใช้ localStorage แทน
    const storedSyncTime = localStorage.getItem('last-sync-time');
    setLastSyncTime(storedSyncTime);
  }, []);

  // เพิ่ม effect สำหรับติดตามเวลา cooldown ที่เหลือ
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isSyncOnCooldown()) {
      // ถ้ากำลังอยู่ใน cooldown ให้อัพเดทเวลาทุกวินาที
      setCooldownSeconds(5);
      
      intervalId = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCooldownSeconds(0);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSyncOnCooldown, isSyncing]);

  // ตรวจสอบการซิงค์ที่บ่อยเกินไป
  useEffect(() => {
    const checkSyncCooldown = () => {
      try {
        // ตรวจสอบว่ามี cooldown-until หรือไม่
        const cooldownUntil = localStorage.getItem('sync-cooldown-until');
        
        if (cooldownUntil) {
          const endTime = parseInt(cooldownUntil, 10);
          const now = Date.now();
          
          if (endTime > now) {
            // ยังอยู่ในช่วง cooldown
            setTooManySyncs(true);
            
            // คำนวณเวลาที่เหลือเป็นนาที
            const remainingMs = endTime - now;
            setCooldownMinutes(Math.ceil(remainingMs / 60000));
            
            return true;
          } else {
            // หมดเวลา cooldown แล้ว
            setTooManySyncs(false);
            localStorage.removeItem('sync-cooldown-until');
          }
        } else {
          setTooManySyncs(false);
        }
      } catch (error) {
        console.error('Error checking sync cooldown:', error);
      }
      return false;
    };

    // ตรวจสอบทันทีเมื่อโหลดหรือเรนเดอร์ใหม่
    checkSyncCooldown();
    
    // ตั้งเวลาเพื่ออัพเดทเวลาที่เหลือทุก 5 วินาที
    const intervalId = setInterval(() => {
      if (checkSyncCooldown()) {
        // อัพเดทเวลาที่เหลือ
        const currentTime = Date.now();
        const cooldownEndTime = parseInt(localStorage.getItem('sync-cooldown-until') || '0', 10);
        
        if (cooldownEndTime <= currentTime) {
          // หมดเวลา cooldown แล้ว
          setTooManySyncs(false);
          setCooldownMinutes(0);
          clearInterval(intervalId);
        } else {
          // อัพเดทเวลาที่เหลือ
          const timeLeft = Math.ceil((cooldownEndTime - currentTime) / 60000);
          setCooldownMinutes(timeLeft);
        }
      }
    }, 5000); // อัพเดททุก 5 วินาที
    
    return () => {
      clearInterval(intervalId);
    };
  }, [lastSyncTime, isSyncing]);

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
    // ตรวจสอบว่าปุ่มกำลังอยู่ใน cooldown หรือไม่
    if (isSyncOnCooldown() || !canSync()) {
      console.log('[Manual Sync] Sync is on cooldown');
      return;
    }
    
    setSyncAnimating(true);
    setIsSyncing(true);
    
    try {
      await syncData();
      
      // อัพเดทเวลาซิงค์ล่าสุด
      const syncTime = new Date().toISOString();
      localStorage.setItem('last-sync-time', syncTime);
      setLastSyncTime(syncTime);
      
      // แสดง toast เมื่อซิงค์ข้อมูลสำเร็จ
      toast({
        title: locale === 'en' ? 'Data Updated' : 
              locale === 'th' ? 'อัปเดตข้อมูลแล้ว' : 
              locale === 'ja' ? 'データが更新されました' : '数据已更新',
        description: locale === 'en' ? 'Your data has been refreshed' : 
                    locale === 'th' ? 'ข้อมูลของคุณได้รับการรีเฟรชแล้ว' : 
                    locale === 'ja' ? 'データが更新されました' : '您的数据已刷新',
        duration: 2000
      });
      
      // คงสถานะ "Complete" ไว้สักครู่
      setTimeout(() => {
        setSyncAnimating(false);
        setIsSyncing(false);
      }, 1500);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncAnimating(false);
      setIsSyncing(false);
      
      // แสดง toast แจ้งเตือนเมื่อซิงค์ข้อมูลล้มเหลว
      toast({
        title: locale === 'en' ? 'Refresh Failed' : 
               locale === 'th' ? 'รีเฟรชข้อมูลล้มเหลว' : 
               locale === 'ja' ? '更新に失敗しました' : '刷新失败',
        description: locale === 'en' ? 'Please try again later' : 
                     locale === 'th' ? 'กรุณาลองใหม่ภายหลัง' : 
                     locale === 'ja' ? '後でもう一度お試しください' : '请稍后再试',
        duration: 4000
      });
    }
  };
  
  // ฟังก์ชันสำหรับรีเซ็ตประวัติการซิงค์
  const handleResetSync = () => {
    if (confirm(t.syncResetConfirm)) {
      localStorage.removeItem('last-sync-time');
      setLastSyncTime(null);
    }
  };
  
  // ฟังก์ชันสำหรับล้างข้อมูลอาหารของวันนี้
  const handleClearTodayData = () => {
    // แสดง dialog ยืนยัน
    setShowClearDataConfirm(true);
  };
  
  // ฟังก์ชันที่ทำงานเมื่อยืนยันการล้างข้อมูล
  const confirmClearTodayData = () => {
    clearTodayData(); // เรียกใช้ฟังก์ชันล้างข้อมูลจาก store
    setShowClearDataConfirm(false); // ปิด dialog
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
      className="max-w-md mx-auto min-h-screen pb-32"
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
              
              {/* แสดงสถานะการเชื่อมต่อ */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <span>{t.connectionStatus}:</span>
                </div>
                <span 
                  className={navigator.onLine ? "text-green-500" : "text-red-500"}
                >
                  {navigator.onLine ? t.online : t.offline}
                </span>
              </div>
              
              {/* แสดงปุ่มซิงค์ข้อมูล */}
              <Button 
                onClick={handleSyncData}
                disabled={isSyncing || syncAnimating || !navigator.onLine || isSyncOnCooldown() || !canSync() || tooManySyncs}
                className="w-full"
              >
                {syncAnimating ? (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 animate-pulse" />
                    <span>{t.syncComplete}</span>
                  </div>
                ) : tooManySyncs ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{t.syncTooFrequent}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>{t.syncNow}</span>
                  </div>
                )}
              </Button>
              
              {/* แสดงข้อความเตือนเมื่อซิงค์บ่อยเกินไป */}
              {tooManySyncs && (
                <div className="text-sm text-red-500 mt-1">
                  {t.syncWaitMessage.replace('{minutes}', cooldownMinutes.toString())}
                </div>
              )}
              
              {/* คำแนะนำเพิ่มเติม */}
              <div className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                <p>{t.syncTip}</p>
              </div>
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
            <div className="space-y-3">
              <Label className="block mb-2">{t.theme}</Label>
              <div className="flex justify-center mb-2">
                <ThemeToggle />
              </div>
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
      
      {/* Data Management Section */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t.dataManagement}</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col space-y-4">
              {/* ปุ่มล้างข้อมูลอาหารของวันนี้ */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20
                }}
              >
                <Button 
                  onClick={handleClearTodayData}
                  variant="outline"
                  className="w-full border-red-400/20 bg-red-400/10 hover:bg-red-400/20 text-red-500 relative overflow-hidden group transition-all duration-300 hover:shadow-md hover:shadow-red-300/20"
                >
                  <div className="absolute inset-0 w-0 bg-red-500/10 transition-all duration-300 group-hover:w-full" />
                  <div className="flex items-center gap-2 relative z-10">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ 
                        repeat: Infinity, 
                        repeatType: "mirror",
                        duration: 2,
                        ease: "easeInOut",
                        repeatDelay: 1
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.div>
                    <span>{t.clearTodayData}</span>
                  </div>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Confirmation Dialog for Clearing Today's Data */}
      {showClearDataConfirm && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-[hsl(var(--background))] rounded-lg p-6 max-w-[320px] shadow-lg border border-red-500/20"
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0], 
                  scale: [1, 1.1, 1.1, 1.1, 1.1, 1]
                }}
                transition={{ duration: 1.5, delay: 0.2 }}
              >
                <Trash2 className="h-5 w-5 text-red-500" />
              </motion.div>
              <h3 className="text-lg font-semibold">{t.clearTodayData}</h3>
            </div>
            
            <p className="text-[hsl(var(--muted-foreground))] mb-4">
              {t.clearTodayDataConfirm}
            </p>
            
            <div className="flex justify-end gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" onClick={() => setShowClearDataConfirm(false)}>
                  {t.cancel}
                </Button>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="destructive" 
                  onClick={confirmClearTodayData} 
                  className="bg-red-500 hover:bg-red-600"
                >
                  {t.confirm}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
} 