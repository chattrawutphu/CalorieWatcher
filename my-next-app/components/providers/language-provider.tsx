"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Locale = "en" | "th" | "ja" | "zh";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export const LanguageProvider = ({ 
  children, 
  defaultLocale = "en" 
}: LanguageProviderProps) => {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // Set the HTML lang attribute
    document.documentElement.lang = locale;
    
    // You could also store the preference in localStorage
    localStorage.setItem("language", locale);
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}; 