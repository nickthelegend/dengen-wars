import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { StyledComponentsRegistry } from "./registry"
import { ClientProviders } from "../components/ClientProviders"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Degen League",
  description: "Battle and trade in the ultimate Degen League arena",
  generator: "v0.app",
  icons: {
    icon: "/wolf-removebg-preview.png",
    shortcut: "/wolf-removebg-preview.png",
    apple: "/wolf-removebg-preview.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
html {
  font-family: ${inter.style.fontFamily};
  --font-inter: ${inter.variable};
  --font-space-grotesk: ${spaceGrotesk.variable};
}
        `}</style>
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
            radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(15, 15, 15, 0.95) 100%)
          `,
            backdropFilter: "blur(20px)",
            zIndex: -1,
          }}
        />
        <StyledComponentsRegistry>
          <ClientProviders>{children}</ClientProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
