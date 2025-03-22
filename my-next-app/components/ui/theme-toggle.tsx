"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "./button";
import { CandyCane, Cookie, SunIcon, Candy, Leaf, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useLanguage } from "../providers/language-provider";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { locale } = useLanguage();
  
  // Translations for theme options
  const translations = {
    en: { light: "Light", dark: "Dark", system: "System", toggleTheme: "Toggle theme", chocolate: "Chocolate", sweet: "Sweet", broccoli: "Broccoli", blueberry: "Blueberry" },
    th: { light: "สว่าง", dark: "มืด", system: "ระบบ", toggleTheme: "สลับธีม", chocolate: "ช็อกโกแลต", sweet: "หวาน", broccoli: "บร็อคโคลี่", blueberry: "บลูเบอร์รี่" },
    ja: { light: "ライト", dark: "ダーク", system: "システム", toggleTheme: "テーマを切り替える", chocolate: "チョコレート", sweet: "スイート", broccoli: "ブロッコリー", blueberry: "ブルーベリー" },
    zh: { light: "明亮", dark: "暗黑", system: "系统", toggleTheme: "切换主题", chocolate: "巧克力", sweet: "甜蜜", broccoli: "西兰花", blueberry: "蓝莓" }
  };
  
  const t = translations[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0 chocolate:rotate-90 chocolate:scale-0 sweet:rotate-90 sweet:scale-0 broccoli:rotate-90 broccoli:scale-0 blueberry:rotate-90 blueberry:scale-0" />
          <Cookie className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-90 dark:scale-0 chocolate:rotate-0 chocolate:scale-100 sweet:rotate-90 sweet:scale-0 broccoli:rotate-90 broccoli:scale-0 blueberry:rotate-90 blueberry:scale-0" />
          <CandyCane className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 chocolate:rotate-90 chocolate:scale-0 sweet:rotate-90 sweet:scale-0 broccoli:rotate-90 broccoli:scale-0 blueberry:rotate-90 blueberry:scale-0" />
          <Candy className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-90 dark:scale-0 chocolate:rotate-90 chocolate:scale-0 sweet:rotate-0 sweet:scale-100 broccoli:rotate-90 broccoli:scale-0 blueberry:rotate-90 blueberry:scale-0" />
          <Leaf className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-90 dark:scale-0 chocolate:rotate-90 chocolate:scale-0 sweet:rotate-90 sweet:scale-0 broccoli:rotate-0 broccoli:scale-100 blueberry:rotate-90 blueberry:scale-0" />
          <Heart className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-90 dark:scale-0 chocolate:rotate-90 chocolate:scale-0 sweet:rotate-90 sweet:scale-0 broccoli:rotate-90 broccoli:scale-0 blueberry:rotate-0 blueberry:scale-100" />
          <span className="sr-only">{t.toggleTheme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {t.light}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {t.dark}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("chocolate")}>
          {t.chocolate}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("sweet")}>
          {t.sweet}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("broccoli")}>
          {t.broccoli}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("blueberry")}>
          {t.blueberry}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {t.system}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 