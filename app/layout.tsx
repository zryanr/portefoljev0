import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
// import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
// import { ServiceWorkerRegistration } from "@/components/service-worker-registration"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Mine Investeringer - Norwegian Investment Tracker",
  description: "Track your Norwegian investments across multiple platforms in real-time",
  // manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mine Investeringer",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Mine Investeringer",
    title: "Norwegian Investment Tracker",
    description: "Track your Norwegian investments across multiple platforms in real-time",
  },
  twitter: {
    card: "summary",
    title: "Mine Investeringer",
    description: "Track your Norwegian investments across multiple platforms in real-time",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <link rel="icon" href="/icons/icon-192x192.jpg" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mine Investeringer" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#15803d" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body>
        {children}
        {/* <ServiceWorkerRegistration /> */}
        {/* <PWAInstallPrompt /> */}
      </body>
    </html>
  )
}
