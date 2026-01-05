import "./globals.css"
import type { Metadata } from "next"
import { Caveat } from 'next/font/google'

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-hand'
})

export const metadata: Metadata = {
  title: "Atelier Kaira",
  description: "Wardrobe for your softer days.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={caveat.variable}>
      <body>{children}</body>
    </html>
  )
}
