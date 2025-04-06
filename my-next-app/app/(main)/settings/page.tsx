"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

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
    syncWaitMessage: "Please wait about {minutes} minutes",
    totalMacros: "Total",
    macroPercentageWarning: "The sum of macro percentages must be exactly 100%. Your current total is {total}%.",
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
    syncWaitMessage: "โปรดรอประมาณ {minutes} นาที",
    totalMacros: "รวม",
    macroPercentageWarning: "ผลรวมของสารอาหารต้องเท่ากับ 100% พอดี ปัจจุบันผลรวมคือ {total}%",
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
    syncWaitMessage: "約{minutes}分お待ちください",
    totalMacros: "合計",
    macroPercentageWarning: "マクロ栄養素の合計は100%である必要があります。現在の合計は{total}%です。",
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
    syncWaitMessage: "请等待约{minutes}分钟",
    totalMacros: "总计",
    macroPercentageWarning: "宏量营养素百分比总和必须恰好为100%。当前总和为{total}%。",
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
  
  // เพิ่ม state สำหรับเก็บค่า percentages โดยตรง
  const [proteinPercentage, setProteinPercentage] = useState<number>(
    // ตั้งค่าเริ่มต้นจากการคำนวณ
    Math.round((goals.protein * 4 / ((goals.protein * 4) + (goals.fat * 9) + (goals.carbs * 4))) * 100) || 30
  );
  const [fatPercentage, setFatPercentage] = useState<number>(
    Math.round((goals.fat * 9 / ((goals.protein * 4) + (goals.fat * 9) + (goals.carbs * 4))) * 100) || 30
  );
  const [carbsPercentage, setCarbsPercentage] = useState<number>(
    Math.round((goals.carbs * 4 / ((goals.protein * 4) + (goals.fat * 9) + (goals.carbs * 4))) * 100) || 40
  );
  
  // เพิ่ม state เพื่อเก็บค่าเริ่มต้น
  const [initialSettings, setInitialSettings] = useState({
    calories: goals.calories,
    protein: goals.protein,
    fat: goals.fat,
    carbs: goals.carbs,
    water: goals.water,
    weight: goals.weight || 70,
    proteinPercentage: Math.round((goals.protein * 4 / ((goals.protein * 4) + (goals.fat * 9) + (goals.carbs * 4))) * 100) || 30,
    fatPercentage: Math.round((goals.fat * 9 / ((goals.protein * 4) + (goals.fat * 9) + (goals.carbs * 4))) * 100) || 30,
    carbsPercentage: Math.round((goals.carbs * 4 / ((goals.protein * 4) + (goals.fat * 9) + (goals.carbs * 4))) * 100) || 40
  });
  
  // เพิ่ม state เพื่อติดตามการเปลี่ยนแปลง
  const [hasChanges, setHasChanges] = useState(false);
  
  // เพิ่ม state สำหรับแสดงข้อความ validation
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // แก้ไขฟังก์ชัน refreshData ให้อัพเดทเวลาซิงค์ล่าสุด
  const refreshData = useCallback(async () => {
    // ตั้ง state เพื่อแสดงว่ากำลังโหลดข้อมูล
    setSyncAnimating(true);
    setIsSyncing(true);
    
    try {
      // ดึงข้อมูลโภชนาการล่าสุดจาก API
      await syncData();
      
      // อัพเดทค่าจาก goals ที่ได้จาก store
      setDailyCalories(goals.calories);
      setProteinGrams(goals.protein);
      setFatGrams(goals.fat);
      setCarbsGrams(goals.carbs);
      setWaterGoal(goals.water);
      setWeightGoal(goals.weight || 70);
      
      // อัพเดทค่า percentages
      const totalCalories = (goals.protein * 4) + (goals.fat * 9) + (goals.carbs * 4);
      setProteinPercentage(Math.round((goals.protein * 4 / totalCalories) * 100) || 30);
      setFatPercentage(Math.round((goals.fat * 9 / totalCalories) * 100) || 30);
      setCarbsPercentage(Math.round((goals.carbs * 4 / totalCalories) * 100) || 40);
      
      // อัพเดทค่าเริ่มต้นให้ตรงกับค่าปัจจุบัน
      setInitialSettings({
        calories: goals.calories,
        protein: goals.protein,
        fat: goals.fat,
        carbs: goals.carbs,
        water: goals.water,
        weight: goals.weight || 70,
        proteinPercentage: Math.round((goals.protein * 4 / totalCalories) * 100) || 30,
        fatPercentage: Math.round((goals.fat * 9 / totalCalories) * 100) || 30,
        carbsPercentage: Math.round((goals.carbs * 4 / totalCalories) * 100) || 40
      });
      
      // อัพเดทเวลาซิงค์ล่าสุด - บันทึกเวลาปัจจุบัน
      const syncTime = new Date().toISOString();
      localStorage.setItem('last-sync-time', syncTime);
      setLastSyncTime(syncTime);
      
      // รีเซ็ต hasChanges เนื่องจากเพิ่งโหลดข้อมูลใหม่
      setHasChanges(false);
      
      // แสดง toast ว่าข้อมูลได้รับการอัพเดทแล้ว
      toast({
        title: locale === 'en' ? 'Data Updated' : 
              locale === 'th' ? 'อัปเดตข้อมูลแล้ว' : 
              locale === 'ja' ? 'データが更新されました' : '数据已更新',
        description: locale === 'en' ? 'Settings have been refreshed' : 
                    locale === 'th' ? 'ข้อมูลการตั้งค่าได้รับการรีเฟรชแล้ว' : 
                    locale === 'ja' ? '設定が更新されました' : '设置已刷新',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      
      // แสดง toast แจ้งเตือนเมื่อรีเฟรชล้มเหลว
      toast({
        title: locale === 'en' ? 'Refresh Failed' : 
               locale === 'th' ? 'รีเฟรชข้อมูลล้มเหลว' : 
               locale === 'ja' ? '更新に失敗しました' : '刷新失败',
        variant: "destructive",
        duration: 3000
      });
    } finally {
      // ไม่ว่าจะสำเร็จหรือไม่ ก็ต้องคืนค่าสถานะ
      setSyncAnimating(false);
      setIsSyncing(false);
    }
  }, [goals, syncData, locale]);

  // ใช้ useEffect สำหรับการโหลดข้อมูลเริ่มต้น และจัดการการ refresh
  useEffect(() => {
    // โหลดข้อมูลเวลาซิงค์ล่าสุด
    const storedSyncTime = localStorage.getItem('last-sync-time');
    setLastSyncTime(storedSyncTime);
    
    // เพิ่มการตรวจจับเมื่อหน้าถูก refresh หรือกลับมาที่หน้านี้
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // เมื่อกลับมาที่แอพ ให้ตรวจสอบว่ามีการอัพเดทข้อมูลหรือไม่
        const currentSyncTime = localStorage.getItem('last-sync-time');
        if (currentSyncTime !== lastSyncTime) {
          // ถ้าเวลาซิงค์เปลี่ยนไป แสดงว่ามีการอัพเดทข้อมูล
          refreshData();
        }
      }
    };
    
    const handleWindowFocus = () => {
      // เมื่อหน้าต่างได้รับโฟกัส ให้ตรวจสอบว่ามีการอัพเดทข้อมูลหรือไม่
      const currentSyncTime = localStorage.getItem('last-sync-time');
      if (currentSyncTime !== lastSyncTime) {
        // ถ้าเวลาซิงค์เปลี่ยนไป แสดงว่ามีการอัพเดทข้อมูล
        refreshData();
      }
    };
    
    // ตรวจจับการ refresh หน้า
    const handleBeforeUnload = () => {
      sessionStorage.setItem('settings-refreshed', 'true');
    };
    
    // ตรวจสอบว่าเพิ่งมีการ refresh หน้าหรือไม่
    const wasRefreshed = sessionStorage.getItem('settings-refreshed') === 'true';
    if (wasRefreshed) {
      // ถ้าเพิ่ง refresh มา ให้โหลดข้อมูลทั้งหมดใหม่
      refreshData();
      // ลบ flag
      sessionStorage.removeItem('settings-refreshed');
    }
    
    // เพิ่ม event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      // cleanup event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [lastSyncTime, refreshData]);

  // ใช้ useEffect เพื่อตรวจจับการเปลี่ยนแปลงใน goals และอัพเดทค่าในฟอร์ม
  useEffect(() => {
    // อัพเดทค่าเมื่อ goals เปลี่ยนแปลง (เช่น หลังจากการซิงค์ข้อมูล)
    setDailyCalories(goals.calories);
    setProteinGrams(goals.protein);
    setFatGrams(goals.fat);
    setCarbsGrams(goals.carbs);
    setWaterGoal(goals.water);
    setWeightGoal(goals.weight || 70);
    
    // อัพเดทค่า percentages
    const totalCalories = (goals.protein * 4) + (goals.fat * 9) + (goals.carbs * 4);
    if (totalCalories > 0) {
      setProteinPercentage(Math.round((goals.protein * 4 / totalCalories) * 100));
      setFatPercentage(Math.round((goals.fat * 9 / totalCalories) * 100));
      setCarbsPercentage(Math.round((goals.carbs * 4 / totalCalories) * 100));
    }
    
    // อัพเดทค่าเริ่มต้น
    setInitialSettings({
      calories: goals.calories,
      protein: goals.protein,
      fat: goals.fat,
      carbs: goals.carbs,
      water: goals.water,
      weight: goals.weight || 70,
      proteinPercentage: Math.round((goals.protein * 4 / totalCalories) * 100) || 30,
      fatPercentage: Math.round((goals.fat * 9 / totalCalories) * 100) || 30,
      carbsPercentage: Math.round((goals.carbs * 4 / totalCalories) * 100) || 40
    });
  }, [goals]);

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
  
  // ฟังก์ชันสำหรับซิงค์ข้อมูลแบบ manual ให้เรียกใช้ refreshData
  const handleSyncData = async () => {
    // ตรวจสอบว่าปุ่มกำลังอยู่ใน cooldown หรือไม่
    if (isSyncOnCooldown() || !canSync()) {
      console.log('[Manual Sync] Sync is on cooldown');
      return;
    }
    
    // เรียกใช้ refreshData เพื่อดำเนินการทั้งหมด
    refreshData();
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
  
  // แก้ไขฟังก์ชันสำหรับการปรับค่า percentages
  const handleProteinChange = (value: number) => {
    // ค่าที่ได้จะไม่มีผลกระทบต่อค่าอื่น
    setProteinPercentage(value);
    setProteinGrams(Math.round((dailyCalories * value / 100) / 4));
  };
  
  const handleFatChange = (value: number) => {
    // ค่าที่ได้จะไม่มีผลกระทบต่อค่าอื่น
    setFatPercentage(value);
    setFatGrams(Math.round((dailyCalories * value / 100) / 9));
  };
  
  const handleCarbsChange = (value: number) => {
    // ค่าที่ได้จะไม่มีผลกระทบต่อค่าอื่น
    setCarbsPercentage(value);
    setCarbsGrams(Math.round((dailyCalories * value / 100) / 4));
  };
  
  // แก้ไข useEffect สำหรับการอัพเดท grams เมื่อ calories เปลี่ยน
  useEffect(() => {
    // ใช้ค่า percentages จาก state โดยตรง โดยไม่คำนวณย้อนกลับ
    setProteinGrams(Math.round((dailyCalories * proteinPercentage / 100) / 4));
    setFatGrams(Math.round((dailyCalories * fatPercentage / 100) / 9));
    setCarbsGrams(Math.round((dailyCalories * carbsPercentage / 100) / 4));
  }, [dailyCalories, proteinPercentage, fatPercentage, carbsPercentage]);
  
  // ตรวจสอบการเปลี่ยนแปลงเมื่อค่าต่างๆ มีการอัพเดท
  useEffect(() => {
    const currentSettings = {
      calories: dailyCalories,
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbsGrams,
      water: waterGoal,
      weight: weightGoal,
      proteinPercentage,
      fatPercentage,
      carbsPercentage
    };
    
    // เช็คค่าที่เปลี่ยนแปลง
    const settingsChanged = 
      currentSettings.calories !== initialSettings.calories ||
      currentSettings.protein !== initialSettings.protein ||
      currentSettings.fat !== initialSettings.fat ||
      currentSettings.carbs !== initialSettings.carbs ||
      currentSettings.water !== initialSettings.water ||
      currentSettings.weight !== initialSettings.weight ||
      currentSettings.proteinPercentage !== initialSettings.proteinPercentage ||
      currentSettings.fatPercentage !== initialSettings.fatPercentage ||
      currentSettings.carbsPercentage !== initialSettings.carbsPercentage;
    
    setHasChanges(settingsChanged);
  }, [dailyCalories, proteinGrams, fatGrams, carbsGrams, waterGoal, weightGoal, proteinPercentage, fatPercentage, carbsPercentage, initialSettings]);
  
  // ฟังก์ชันสำหรับรีเซ็ตค่ากลับไปเป็นค่าเริ่มต้น
  const resetSettings = () => {
    setDailyCalories(initialSettings.calories);
    setProteinGrams(initialSettings.protein);
    setFatGrams(initialSettings.fat);
    setCarbsGrams(initialSettings.carbs);
    setWaterGoal(initialSettings.water);
    setWeightGoal(initialSettings.weight);
    setProteinPercentage(initialSettings.proteinPercentage);
    setFatPercentage(initialSettings.fatPercentage);
    setCarbsPercentage(initialSettings.carbsPercentage);
    
    // รีเซ็ตสถานะของ Save กลับเป็น false
    setIsSaved(false);
  };
  
  // เพิ่มการตรวจสอบ percentages ในการเปลี่ยนแปลงค่า
  useEffect(() => {
    const totalPercentage = proteinPercentage + fatPercentage + carbsPercentage;
    
    if (totalPercentage !== 100) {
      // ถ้าผลรวมไม่เท่ากับ 100% (ไม่ยอมรับความคลาดเคลื่อนเลย)
      setValidationMessage(
        locale === 'en' ? `Total macros must be exactly 100%. Current: ${totalPercentage}%` :
        locale === 'th' ? `สารอาหารรวมต้องเท่ากับ 100% พอดี ปัจจุบัน: ${totalPercentage}%` :
        locale === 'ja' ? `マクロの合計は必ず100%である必要があります。現在: ${totalPercentage}%` :
        `宏量营养素总和必须恰好为100%。当前: ${totalPercentage}%`
      );
    } else {
      setValidationMessage(null);
    }
  }, [proteinPercentage, fatPercentage, carbsPercentage, locale]);
  
  // แก้ไขฟังก์ชัน handleSave เพื่อตรวจสอบค่าที่เข้มงวดขึ้น
  const handleSave = async () => {
    try {
      // ตรวจสอบว่า percentages รวมเท่ากับ 100% พอดีเท่านั้น
      const totalPercentage = proteinPercentage + fatPercentage + carbsPercentage;
      if (totalPercentage !== 100) {
        // แสดง toast เตือนว่าผลรวมต้องเท่ากับ 100%
        toast({
          title: locale === 'en' ? 'Cannot Save Settings' : 
                 locale === 'th' ? 'ไม่สามารถบันทึกการตั้งค่า' : 
                 locale === 'ja' ? '設定を保存できません' : '无法保存设置',
          description: locale === 'en' ? 'Total macros must be exactly 100%' : 
                       locale === 'th' ? 'สารอาหารรวมต้องเท่ากับ 100% พอดี' : 
                       locale === 'ja' ? 'マクロの合計は必ず100%である必要があります' : '宏量营养素总和必须恰好为100%',
          variant: "destructive",
          duration: 5000
        });
        return; // ไม่บันทึกถ้าผลรวมไม่ถูกต้อง
      }
      
      // แสดงสถานะกำลังบันทึก
      setSaveStatus('saving');
      
      // แสดง toast กำลังบันทึกข้อมูล
      toast({
        title: locale === 'en' ? 'Saving...' : 
               locale === 'th' ? 'กำลังบันทึก...' : 
               locale === 'ja' ? '保存中...' : '保存中...',
        duration: 3000
      });
      
    const updatedGoals = {
      calories: dailyCalories,
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbsGrams,
      water: waterGoal,
      weight: weightGoal
    };
    
      // บันทึกข้อมูล
    await updateGoals(updatedGoals);
    
      // อัพเดทค่าเริ่มต้นให้เป็นค่าปัจจุบัน
      setInitialSettings({
        calories: dailyCalories,
        protein: proteinGrams,
        fat: fatGrams,
        carbs: carbsGrams,
        water: waterGoal,
        weight: weightGoal,
        proteinPercentage,
        fatPercentage,
        carbsPercentage
      });
      
      // แสดง toast บันทึกสำเร็จ
      toast({
        title: locale === 'en' ? 'Saved Successfully' : 
               locale === 'th' ? 'บันทึกข้อมูลสำเร็จ' : 
               locale === 'ja' ? '保存に成功しました' : '保存成功',
        description: locale === 'en' ? 'Your settings have been saved to database' : 
                     locale === 'th' ? 'การตั้งค่าของคุณถูกบันทึกลงฐานข้อมูลแล้ว' : 
                     locale === 'ja' ? '設定がデータベースに保存されました' : '您的设置已保存到数据库',
        duration: 3000
      });
      
      // Set saved state และรีเซ็ต hasChanges
    setIsSaved(true);
      setHasChanges(false);
      setSaveStatus('success');
    
    // Hide the saved message after 2 seconds
    setTimeout(() => {
      setIsSaved(false);
        setSaveStatus('idle');
    }, 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      
      // แสดง toast แจ้งเตือนกรณีเกิดข้อผิดพลาด
      toast({
        title: locale === 'en' ? 'Save Failed' : 
               locale === 'th' ? 'บันทึกข้อมูลล้มเหลว' : 
               locale === 'ja' ? '保存に失敗しました' : '保存失败',
        description: locale === 'en' ? 'An error occurred while saving your settings' : 
                     locale === 'th' ? 'เกิดข้อผิดพลาดขณะบันทึกการตั้งค่าของคุณ' : 
                     locale === 'ja' ? '設定の保存中にエラーが発生しました' : '保存设置时发生错误',
        variant: "destructive",
        duration: 5000
      });
      setSaveStatus('error');
    }
  };
  
  return (
    <PullToRefresh onRefresh={refreshData}>
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
                
                {validationMessage && (
                  <div className="text-red-500 text-sm mt-2 font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {validationMessage}
                  </div>
                )}
                
                {saveStatus === 'error' && (
                  <div className="text-red-500 text-sm mt-2 font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {locale === 'en' ? 'Save failed. Please try again.' : 
                     locale === 'th' ? 'บันทึกล้มเหลว โปรดลองอีกครั้ง' : 
                     locale === 'ja' ? '保存に失敗しました。もう一度お試しください。' : 
                     '保存失败，请重试。'}
                  </div>
                )}
                
                {saveStatus === 'success' && (
                  <div className="text-green-500 text-sm mt-2 font-medium flex items-center">
                    <Check className="h-4 w-4 mr-1 flex-shrink-0" />
                    {locale === 'en' ? 'Settings saved successfully!' : 
                     locale === 'th' ? 'บันทึกการตั้งค่าสำเร็จ!' : 
                     locale === 'ja' ? '設定が正常に保存されました！' : 
                     '设置保存成功！'}
                  </div>
                )}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>{t.macroDistribution}</Label>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">{t.totalMacros}: {proteinPercentage + fatPercentage + carbsPercentage}%</span>
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
                        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
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
        
        {/* Fixed Action Buttons */}
        {hasChanges && (
          <div className="fixed bottom-28 left-0 right-0 flex justify-between px-4 z-50">
            <Button 
              variant="outline"
              onClick={resetSettings}
              className="shadow-md bg-[hsl(var(--background))]"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> 
                Reset
    </motion.div>
            </Button>
            
            <Button 
              onClick={handleSave}
              disabled={validationMessage !== null || saveStatus === 'saving'}
              variant="outline"
              className={`shadow-md ${
                validationMessage !== null 
                  ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]" 
                  : "bg-[hsl(var(--background))]"
              }`}
            >
              {isSaved ? (
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" /> {t.saved}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" /> {t.save}
                </motion.div>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </PullToRefresh>
  );
} 