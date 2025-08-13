import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Space_Grotesk, Bebas_Neue, Poppins } from "next/font/google";
import "./globals.css";
import BackgroundCanvas, {
  BackgroundControls,
} from "@/components/BackgroundCanvas";

export const metadata: Metadata = {
  title: "Syntax Mind — Portfolio",
  description: "WebGPU/3D UI • Secure APIs • Automation",
  icons: {
    icon: "/placeholder-logo.png",
    shortcut: "/placeholder-logo.png",
    apple: "/placeholder-logo.png",
  },
  other: {
    'color-scheme': 'dark',
    'viewport': 'width=device-width, initial-scale=1, viewport-fit=cover',
  }
};

const Display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});
const HeroDisplay = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hero",
});
const PoppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

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
    <html
      lang="en"
      className={`${Display.variable} ${HeroDisplay.variable} ${PoppinsFont.variable}`}
    >
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData as any),
          }}
        />
      </head>
      <body className="main-body text-black antialiased selection:bg-white/10 selection:text-white">
        <BackgroundCanvas />
        <div className="relative">{children}</div>
        <BackgroundControls />
      </body>
    </html>
  );
}
