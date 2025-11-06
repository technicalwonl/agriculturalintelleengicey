"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { Globe } from "lucide-react"
import type { LanguageCode } from "@/lib/language-translations"

export function LanguageSwitcher() {
  const { language, setLanguage, translate } = useLanguage()
  const [showMenu, setShowMenu] = useState(false)

  const languages: { code: LanguageCode; name: string }[] = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "mr", name: "मराठी" },
    { code: "ta", name: "தமிழ்" },
    { code: "te", name: "తెలుగు" },
    { code: "kn", name: "ಕನ್ನಡ" },
    { code: "pa", name: "ਪੰਜਾਬੀ" },
  ]

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2">
        <Globe className="w-4 h-4" />
        <span>{languages.find((l) => l.code === language)?.name || "English"}</span>
      </Button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-1 bg-background border rounded-lg shadow-lg p-2 z-50 min-w-40">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setLanguage(lang.code)
                setShowMenu(false)
              }}
              className="w-full justify-start text-sm"
            >
              {lang.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
