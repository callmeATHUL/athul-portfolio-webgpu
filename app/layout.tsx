import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Space_Grotesk, Bebas_Neue } from 'next/font/google'
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

const Display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })
const HeroDisplay = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-hero' })

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Athul P Sudheer',
  jobTitle: 'Java Full Stack Developer',
  knowsAbout: ['WebGPU', 'Three.js', 'Spring Boot', 'APIs', 'Automation'],
  worksFor: { '@type': 'Organization', name: 'Al Rajhi Bank' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark bg-black ${Display.variable} ${HeroDisplay.variable}`}>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData as any) }}
        />
      </head>
      <body className="bg-black text-white">
        <BackgroundCanvas />
        <BackgroundControls />
        <div className="relative z-20">
          {children}
        </div>
      </body>
    </html>
  )
}
