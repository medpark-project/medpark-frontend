import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

import { Inter, Source_Serif_4 as V0_Font_Source_Serif_4 } from "next/font/google"

import { GeistSans as V0_Font_Geist } from "geist/font/sans"
import { GeistMono as V0_Font_Geist_Mono } from "geist/font/mono"
// Initialize fonts
const _geist = V0_Font_Geist
const _geistMono = V0_Font_Geist_Mono
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"], variable: '--v0-font-source-serif-4' })
const _v0_fontVariables = `${_geist.variable} ${_geistMono.variable} ${_sourceSerif_4.variable}`

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "MedPark - Hospital Parking Management System",
  description:
    "Professional hospital parking management system for operators and patients. Streamline vehicle entries, exits, and payments with MedPark.",
  keywords: ["hospital parking", "parking management", "medical parking", "vehicle management"],
  authors: [{ name: "MedPark Systems" }],
  generator: "v0.app",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "MedPark - Hospital Parking Management",
    description: "Professional hospital parking management system",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} ${_v0_fontVariables}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
