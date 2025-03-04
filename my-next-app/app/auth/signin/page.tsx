"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { ArrowRight, ChevronDown } from "lucide-react";

// Translations
const translations = {
  en: {
    welcome: "Welcome",
    subtitle: "Track your nutrition journey",
    description: "Sign in to continue",
    googleSignIn: "Continue with Google",
    features: ["Easy Tracking", "Smart Goals", "Daily Insights"],
  },
  th: {
    welcome: "ยินดีต้อนรับ",
    subtitle: "ติดตามการทานอาหารของคุณ",
    description: "เข้าสู่ระบบเพื่อดำเนินการต่อ",
    googleSignIn: "ดำเนินการต่อด้วย Google",
    features: ["ติดตามง่าย", "เป้าหมายอัจฉริยะ", "ข้อมูลเชิงลึกรายวัน"],
  },
  ja: {
    welcome: "ようこそ",
    subtitle: "栄養摂取を追跡",
    description: "続行するにはサインイン",
    googleSignIn: "Google で続行",
    features: ["簡単な追跡", "スマートな目標", "日々のインサイト"],
  },
  zh: {
    welcome: "欢迎",
    subtitle: "追踪您的营养之旅",
    description: "登录以继续",
    googleSignIn: "使用 Google 继续",
    features: ["轻松追踪", "智能目标", "每日见解"],
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

export default function SignInPage() {
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.en;
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[hsl(var(--background))]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[hsl(var(--primary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-[hsl(var(--secondary))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-4 left-20 w-32 h-32 bg-[hsl(var(--accent))/0.4] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000" />
      </div>

      <Card className="p-6 rounded-3xl shadow-lg border-[hsl(var(--border))] backdrop-blur-sm bg-[hsl(var(--background))/0.7]">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={item} className="text-center space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              {t.welcome}
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">{t.subtitle}</p>
          </motion.div>
          
          <motion.div variants={item} className="flex justify-center">
            <div className="w-16 h-1 bg-[hsl(var(--primary))] rounded-full" />
          </motion.div>
          
          <motion.div variants={item} className="space-y-3">
            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">{t.description}</p>
            <Button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-6 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.9] transition-all shadow-md"
            >
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>{t.googleSignIn}</span>
              </div>
            </Button>
          </motion.div>
          
          <motion.div
            variants={item}
            className="pt-6 space-y-4"
          >
            <div className="flex justify-center">
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-[hsl(var(--primary))]"
              >
                <ChevronDown size={24} />
              </motion.div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              {t.features.map((feature, i) => (
                <motion.div
                  key={i}
                  className="p-2 rounded-lg bg-[hsl(var(--accent))/0.1] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm"
                  whileHover={{ y: -5, backgroundColor: "hsl(var(--accent))" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Card>
    </div>
  );
} 