import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import dynamic from 'next/dynamic'

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
  const BackgroundCanvas = dynamic(() => import('@/components/BackgroundCanvas').then(m => m.default), { ssr: false })
  const BackgroundControls = dynamic(() => import('@/components/BackgroundCanvas').then(m => m.BackgroundControls), { ssr: false })
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <BackgroundCanvas />
        <BackgroundControls />
        {children}
      </body>
    </html>
  )
}
