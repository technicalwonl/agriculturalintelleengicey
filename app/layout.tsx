import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { LanguageProvider } from "@/lib/language-context"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Agricultural Intelligence Platform",
  description: "Comprehensive agricultural intelligence and analytics platform",
  generator: "Next.js",
  applicationName: "AgriIntel Platform",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AgriIntel",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#ffffff",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geist.className} font-sans antialiased min-h-screen flex flex-col`}>
        <LanguageProvider>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
