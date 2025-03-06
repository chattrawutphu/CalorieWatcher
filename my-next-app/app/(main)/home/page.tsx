"use client";

import React from "react";
import { useNutritionStore } from "@/lib/store/nutrition-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, UtensilsCrossed, AppleIcon, Coffee, ArrowRight, Plus, PieChart, Sun, Moon, Cookie, Candy, Lock, Coins, Crown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/providers/language-provider";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";

// Text translations
const translations = {
  en: {
    title: "Theme Shop",
    subtitle: "Customize your experience",
    currentTheme: "Current Theme",
    applyTheme: "Apply Theme",
    free: "Free",
    coins: "coins",
    premiumTitle: "Premium Features",
    premiumDesc: "Get access to exclusive themes and features",
    upgradeNow: "Upgrade Now",
    themes: {
      light: "Light Theme",
      dark: "Dark Theme",
      chocolate: "Chocolate Theme",
      sweet: "Sweet Theme",
      broccoli: "Broccoli Theme"
    }
  },
  th: {
    title: "ร้านค้าธีม",
    subtitle: "ปรับแต่งประสบการณ์ของคุณ",
    currentTheme: "ธีมปัจจุบัน",
    applyTheme: "ใช้ธีม",
    free: "ฟรี",
    coins: "เหรียญ",
    premiumTitle: "ฟีเจอร์พรีเมียม",
    premiumDesc: "เข้าถึงธีมและฟีเจอร์พิเศษ",
    upgradeNow: "อัพเกรดเลย",
    themes: {
      light: "ธีมสว่าง",
      dark: "ธีมมืด",
      chocolate: "ธีมช็อกโกแลต",
      sweet: "ธีมหวาน",
      broccoli: "ธีมบร็อคโคลี่"
    }
  },
  ja: {
    title: "テーマショップ",
    subtitle: "体験をカスタマイズ",
    currentTheme: "現在のテーマ",
    applyTheme: "テーマを適用",
    free: "無料",
    coins: "コイン",
    premiumTitle: "プレミアム機能",
    premiumDesc: "限定テーマと機能にアクセス",
    upgradeNow: "今すぐアップグレード",
    themes: {
      light: "ライトテーマ",
      dark: "ダークテーマ",
      chocolate: "チョコレートテーマ",
      sweet: "スイートテーマ",
      broccoli: "ブロッコリーテーマ"
    }
  },
  zh: {
    title: "主题商店",
    subtitle: "自定义您的体验",
    currentTheme: "当前主题",
    applyTheme: "应用主题",
    free: "免费",
    coins: "金币",
    premiumTitle: "高级功能",
    premiumDesc: "获取独家主题和功能",
    upgradeNow: "立即升级",
    themes: {
      light: "明亮主题",
      dark: "暗黑主题",
      chocolate: "巧克力主题",
      sweet: "甜蜜主题",
      broccoli: "西兰花主题"
    }
  }
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

export default function ShopPage() {
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations];
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      name: "light",
      displayName: t.themes.light,
      icon: <Sun className="h-5 w-5" />,
      price: 0,
      colors: {
        bg: "#FFFFFF",
        text: "#020617",
        primary: "#3B82F6",
        muted: "#64748b"
      }
    },
    {
      name: "dark",
      displayName: t.themes.dark,
      icon: <Moon className="h-5 w-5" />,
      price: 0,
      colors: {
        bg: "#020617",
        text: "#FFFFFF",
        primary: "#3B82F6",
        muted: "#94a3b8"
      }
    },
    {
      name: "chocolate",
      displayName: t.themes.chocolate,
      icon: <Cookie className="h-5 w-5" />,
      price: 200,
      colors: {
        bg: "#211513",
        text: "#e8d9cf",
        primary: "#854d30",
        muted: "#8c7b6e"
      }
    },
    {
      name: "sweet",
      displayName: t.themes.sweet,
      icon: <Candy className="h-5 w-5" />,
      price: 200,
      colors: {
        bg: "#fdf2f8",
        text: "#831843",
        primary: "#ec4899",
        muted: "#9d174d"
      }
    },
    {
      name: "broccoli",
      displayName: t.themes.broccoli,
      icon: <AppleIcon className="h-5 w-5" />,
      price: 300,
      colors: {
        bg: "#f0fdf4",
        text: "#14532d",
        primary: "#16a34a",
        muted: "#15803d"
      }
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <motion.div variants={item} className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 bg-[hsl(var(--accent))] px-3 py-1.5 rounded-full text-[hsl(var(--accent-foreground))]">
          <Coins className="w-4 h-4" />
          <span className="font-semibold">1000</span>
        </div>
      </motion.div>

      {/* Current Theme Card */}
      <motion.div variants={item} className="mb-8">
        <Card className="overflow-hidden border-2 border-[hsl(var(--primary))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{t.currentTheme}</span>
              <div className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-medium">
                {themes.find(t => t.name === theme)?.displayName || t.themes.light}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="rounded-lg p-4 flex flex-col items-center justify-center gap-2 mb-4" 
              style={{ 
                backgroundColor: themes.find(t => t.name === theme)?.colors.bg || themes[0].colors.bg,
                color: themes.find(t => t.name === theme)?.colors.text || themes[0].colors.text,
                boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
              }}
            >
              <div className="flex w-full justify-between items-center px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <span className="font-medium">CalorieWatcher</span>
                <div className="p-1.5 rounded-full" style={{ backgroundColor: themes.find(t => t.name === theme)?.colors.primary || themes[0].colors.primary, color: '#fff' }}>
                  {themes.find(t => t.name === theme)?.icon || themes[0].icon}
                </div>
              </div>
              
              <div className="w-full h-6 mt-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full" style={{ backgroundColor: themes.find(t => t.name === theme)?.colors.primary || themes[0].colors.primary, width: '70%' }}></div>
              </div>
              
              <div className="w-full flex justify-between mt-2">
                <span className="text-sm">1200 kcal</span>
                <span className="text-sm" style={{ color: themes.find(t => t.name === theme)?.colors.muted || themes[0].colors.muted }}>1800 kcal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Themes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {themes.map((themeItem) => (
          <motion.div key={themeItem.name} variants={item} className="h-full">
            <Card className={`overflow-hidden transition-all h-full flex flex-col ${theme === themeItem.name ? 'border-[hsl(var(--primary))]' : ''}`}>
              <CardContent className="p-0 flex-1 flex flex-col">
                {/* Theme Preview */}
                <div 
                  className="p-4 md:p-5 flex-1"
                  style={{ 
                    backgroundColor: themeItem.colors.bg,
                    color: themeItem.colors.text,
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                        style={{ backgroundColor: themeItem.colors.primary, color: '#fff' }}>
                        {themeItem.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm md:text-base">{themeItem.displayName}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" 
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                      {themeItem.price > 0 ? (
                        <>
                          <Coins className="w-3 h-3" />
                          <span>{themeItem.price}</span>
                        </>
                      ) : (
                        <span>{t.free}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Mock UI Elements */}
                  <div className="space-y-2 mb-2">
                    <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: `${themeItem.colors.muted}40` }}></div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: `${themeItem.colors.muted}40` }}></div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-4 w-4 rounded-md" style={{ backgroundColor: themeItem.colors.primary }}></div>
                      <div className="h-4 w-12 rounded-md" style={{ backgroundColor: `${themeItem.colors.muted}40` }}></div>
                    </div>
                  </div>
                  
                  {/* Progress Bar Example */}
                  <div className="w-full h-3 rounded-full overflow-hidden mt-2" style={{ backgroundColor: `${themeItem.colors.muted}30` }}>
                    <div className="h-full rounded-full" style={{ backgroundColor: themeItem.colors.primary, width: '65%' }}></div>
                  </div>
                </div>
                
                {/* Action Section */}
                <div className="px-3 py-2 md:px-4 md:py-3 border-t border-[hsl(var(--border))] flex flex-col">
                  {theme === themeItem.name && (
                    <div className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 self-start mb-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary-foreground))]"></span>
                      {t.currentTheme}
                    </div>
                  )}
                  
                  <Button
                    className="text-xs h-8 px-3 w-full"
                    variant="default"
                    style={
                      theme !== themeItem.name ? {
                        backgroundColor: themeItem.colors.primary,
                        color: '#fff',
                        borderColor: 'transparent'
                      } : {}
                    }
                    onClick={() => setTheme(themeItem.name)}
                    disabled={theme === themeItem.name}
                  >
                    {theme === themeItem.name ? t.currentTheme : t.applyTheme}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Premium Card */}
      <motion.div variants={item} className="mt-8">
        <Card className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))/0.8] text-[hsl(var(--primary-foreground))]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="h-6 w-6" />
              <h3 className="text-lg font-bold">{t.premiumTitle}</h3>
            </div>
            <p className="mb-4 opacity-90">
              {t.premiumDesc}
            </p>
            <Button className="mt-2 bg-white text-[hsl(var(--primary))] hover:bg-white/80">
              {t.upgradeNow}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 