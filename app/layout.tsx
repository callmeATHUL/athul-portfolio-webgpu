import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import BackgroundCanvas, { BackgroundControls } from '@/components/BackgroundCanvas'

export const metadata: Metadata = {
  title: 'Syntax Mind — Portfolio',
  description: 'WebGPU/3D UI • Secure APIs • Automation',
  icons: {
    icon: '/placeholder-logo.png',
    shortcut: '/placeholder-logo.png',
    apple: '/placeholder-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-black">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="bg-black text-white">
        <BackgroundCanvas />
        <BackgroundControls />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
