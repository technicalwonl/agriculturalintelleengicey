"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { translations, type LanguageCode } from "@/lib/language-translations"
import { safeLocalStorage } from "./storage"

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  translate: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load saved language on mount (client-side only)
    if (typeof window !== 'undefined') {
      const saved = safeLocalStorage.getItem("language") as LanguageCode;
      if (saved && translations[saved]) {
        setLanguageState(saved);
      }
      setMounted(true);
    }
  }, [])

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    safeLocalStorage.setItem("language", lang);
  }

  const translate = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, translate }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
