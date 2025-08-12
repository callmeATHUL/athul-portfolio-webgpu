/**
 * Install & Run
 * 1) npx create-next-app@latest my-portfolio --ts
 * 2) cd my-portfolio
 * 3) Install deps used here:
 *    npm i three@^0.165.0 lil-gui
 * 4) Replace app/page.tsx with this file
 * 5) npm run dev
 *
 * Note:
 * - WebGPU is required for the hero. In Chrome/Edge, enable "WebGPU" if needed (chrome://flags).
 * - This page uses the App Router (app/ directory) in Next.js with TypeScript. [^3]
 */

/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import type React from "react"
import { useCallback, useMemo, useEffect, useState } from "react"

/**
 * Brand tokens
 */
const brand = {
  bg: "#0a0f12",
  fg: "#e6f0f6",
  green: "#0e6f4f",
  blue: "#3bb3fb",
  orange: "#ff8a00",
}

/**
 * Optional animation stubs (do not bloat initial bundle)
 * TODO: Uncomment and use when adding animations
 *
 * // import { gsap } from "gsap"
 * // import anime from "animejs"
 */
export async function loadGsap() {
  // TODO: use in your animation hooks:
  // const { gsap } = await import("gsap")
  // return gsap
  return (await import("gsap")).gsap
}
export async function loadAnime() {
  // TODO: use in your animation hooks:
  // const anime = (await import("animejs")).default
  // return anime
  return (await import("animejs")).default
}

/**
 * Types
 */
type NavItem = {
  id: string
  label: string
}

/**
 * Page
 */
export default function Page() {
  const navItems = useMemo<NavItem[]>(
    () => [
      { id: "home", label: "Home" },
      { id: "about", label: "About" },
      { id: "skills", label: "Skills" },
      { id: "projects", label: "Projects" },
      { id: "experience", label: "Experience" },
      { id: "contact", label: "Contact" },
    ],
    [],
  )

  // Side dots active state on scroll
  useEffect(() => {
    const sectionIds = ['home', 'about', 'skills', 'projects', 'experience', 'contact']
    const dots = Array.from(document.querySelectorAll<HTMLAnchorElement>('.side-dots .dot'))
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2
      let active = 0
      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i])
        if (el && mid >= el.offsetTop) active = i
      }
      dots.forEach((d, i) => d.classList.toggle('active', i === active))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main
      style={{
        backgroundColor: 'transparent',
        color: brand.fg,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      }}
      className="min-h-screen"
    >
      {/* Ambient animated gradient background */}
      <div className="bg-anim" aria-hidden="true" />
      {/* Side nav dots */}
      <div className="side-dots" aria-hidden="true">
        <a href="#home" className="dot active" />
        <a href="#projects" className="dot" />
        <a href="#skills" className="dot" />
        <a href="#contact" className="dot" />
      </div>
      {/* Vertical socials */}
      <div className="social-vert" aria-hidden="true">
        <a href="https://github.com/callmeATHUL" target="_blank" rel="noreferrer">GITHUB</a>
        <a href="https://www.linkedin.com/in/callmepk/" target="_blank" rel="noreferrer">LINKEDIN</a>
      </div>
      {/* Status widget */}
      <div
        className="glass-card hidden lg:block fixed right-4 top-1/2 z-30 -translate-y-1/2 p-4 rounded-2xl"
        aria-hidden="true"
        style={{ minWidth: 220 }}
      >
        <div className="mb-3 text-[0.7rem] uppercase tracking-[0.2em] text-cyan-300">Status</div>
        <div className="mb-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2">
          <span className="h-2 w-2 rounded-full" style={{ background: '#00ff88', boxShadow: '0 0 10px #00ff88' }} />
          <span className="text-sm">Open to collab</span>
        </div>
        <div className="mb-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2">
          <span className="h-2 w-2 rounded-full" style={{ background: '#ffd60a', boxShadow: '0 0 10px #ffd60a' }} />
          <span className="text-sm">Email ↗</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2">
          <span className="h-2 w-2 rounded-full" style={{ background: '#ff006e', boxShadow: '0 0 10px #ff006e' }} />
          <span className="text-sm">WebGPU Ready</span>
        </div>
      </div>
      {/* Corners */}
      <div className="corner-accent tr" aria-hidden="true" />
      <div className="corner-accent bl" aria-hidden="true" />
      <Nav items={navItems} />
      <HeroAttractors />
      <About />
      <Skills />
      <CreativeHighlights />
      <Projects />
      <Experience />
      <Contact />
      <Footer />
    </main>
  )
}

/**
 * Sticky glass navigation
 */
function Nav({ items }: { items: NavItem[] }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav className="sticky top-4 z-50 flex w-full justify-center px-4">
      <div
        className={`flex items-center gap-3 rounded-full border px-5 py-2 backdrop-blur-md transition-opacity ${
          scrolled ? "opacity-95" : "opacity-100"
        }`}
        style={{
          background: "rgba(255,255,255,0.08)",
          borderColor: "rgba(255,255,255,0.2)",
        }}
        aria-label="Primary"
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="text-sm hover:opacity-100 opacity-80 transition-opacity"
            style={{ color: brand.fg }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

/**
 * Hero Section
 */
function HeroAttractors() {
  const scrollToProjects = useCallback(() => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <section id="home" className="relative min-h-screen">
      <div className="absolute inset-0 -z-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(1000px 500px at 50% 25%, rgba(59,179,251,0.12) 0%, rgba(255,138,0,0.06) 35%, rgba(10,15,18,0) 70%)',
          }}
        />
      </div>
      <div className="mx-auto grid min-h-[70vh] max-w-6xl grid-cols-1 items-center gap-6 px-6 pt-24 pb-12 md:grid-cols-[220px_1fr_220px] md:pt-32">
        <aside className="hidden md:flex flex-col gap-6 opacity-85">
          <div className="text-xs uppercase hero-kicker">Profile</div>
          <div className="hero-stat text-sm">Riyadh, SA</div>
          <div className="hero-stat text-sm">3+ yrs exp</div>
          <div className="hero-stat text-sm">APIs • 3D UI • Automation</div>
        </aside>
        <div className="text-center md:text-left">
          <div className="hero-kicker uppercase">JAVA FULLSTACK • PRODUCTION SUPPORT</div>
          <h1 className="font-hero text-glow text-center md:text-left text-5xl md:text-7xl tracking-[0.18em]">
            ATHUL P SUDHEER
          </h1>
          <p className="mt-3 max-w-2xl opacity-95 md:text-base text-sm" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
            Al Rajhi Bank — Riyadh, Saudi Arabia (On‑site). Full‑stack apps, secure APIs, <span className="whitespace-nowrap">3D modern UI</span>, and workflow automation.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 md:justify-start">
            <button onClick={scrollToProjects} className="neon-btn rounded-full px-6 py-2 text-sm font-semibold shadow">View Projects</button>
            <span className="play-cta" aria-label="Play"></span>
            <a href="#contact" className="rounded-full border px-6 py-2 text-sm" style={{borderColor:'rgba(255,255,255,.2)', background:'rgba(0,0,0,.35)'}}>Contact</a>
          </div>
        </div>
        <aside className="hidden md:flex flex-col items-end gap-6 opacity-85">
          <div className="text-xs uppercase hero-kicker">Status</div>
          <div className="hero-stat text-sm">Open to collab</div>
          <div className="hero-stat text-sm">Email ↗</div>
        </aside>
      </div>
    </section>
  )
}

/**
 * Sections
 */
function SectionTitle({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="text-2xl font-semibold tracking-tight md:text-3xl">
      {children}
    </h2>
  )
}

function About() {
  return (
    <section id="about" className="relative mx-auto max-w-5xl px-6 py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl" />
      <SectionTitle id="about-title"><span className="section-title font-display text-gradient">About</span></SectionTitle>
      <p className="mt-4 max-w-3xl opacity-95" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
        Java Full Stack Developer with 3+ years in IT banking systems, automation, and frontend development. I build secure,
        scalable systems with modern UI/UX. Hands‑on with internal banking flows, REST/SOAP APIs, and deployment pipelines.
        Strong interest in cybersecurity and automation, with practical exposure in high‑stakes environments such as SAMA and
        Riyadh Bank.
      </p>
    </section>
  )
}

function Skills() {
  const pairs: [string, string][] = [
    ["Java", "Spring Boot"],
    ["Spring MVC", "Hibernate"],
    ["REST APIs", "SOAP"],
    ["Next.js", "TailwindCSS"],
    ["Three.js", "WebGPU/WebGL"],
    ["Python", "n8n"],
    ["SQL", "Tomcat/Maven"],
    ["Node.js", "Nginx"],
  ]
  return (
    <section id="skills" className="mx-auto max-w-5xl px-6 py-16 md:py-20">
      <div className="section-scrim" aria-hidden="true" />
      <SectionTitle id="skills-title"><span className="section-title font-display text-gradient">Skills</span></SectionTitle>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {pairs.map(([a, b]) => (
          <div
            key={`${a}-${b}`}
            className="flex items-center justify-between rounded-lg px-4 py-3 text-sm glass-card"
          >
            <span className="opacity-90">{a}</span>
            <span className="opacity-70">/ {b}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function CreativeHighlights() {
  const highlights = [
    {
      title: 'Procedural Motion',
      desc: 'GPU-driven particle fields with parametric flows and color grading.',
    },
    {
      title: 'Micro-interactions',
      desc: 'GSAP/Anime-powered UI motion with focus on a11y and clarity.',
    },
    {
      title: 'Realtime Systems',
      desc: 'Streaming telemetry, websockets, and observability baked-in.',
    },
    {
      title: 'Secure APIs',
      desc: 'Spring Boot/OAuth2 hardened endpoints and gateways.',
    },
  ]
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <SectionTitle id="creative"><span className="section-title font-display text-gradient">Creative Highlights</span></SectionTitle>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {highlights.map((h) => (
          <div
            key={h.title}
            className="rounded-xl border p-5"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
          >
            <div className="text-lg font-semibold">{h.title}</div>
            <div className="mt-1 text-sm opacity-80">{h.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

type ProjectCard = {
  title: string
  stack: string
  status: "Active" | "Shipped" | "In Progress"
}
function Projects() {
  const cards: ProjectCard[] = [
    { title: "Scroll‑based Portfolio", stack: "Next.js, TailwindCSS, Framer Motion", status: "Active" },
    { title: "n8n Automation Workflows", stack: "n8n, Node.js, Webhooks", status: "Active" },
    { title: "Open‑Source UI Systems", stack: "shadcn/ui, TailwindCSS, TS/React", status: "In Progress" },
    { title: "Security Explorations", stack: "Java/Python, Burp Suite, Secure APIs", status: "In Progress" },
  ]

  const badgeColor = (s: ProjectCard["status"]) => {
    switch (s) {
      case "Active":
        return { bg: "rgba(59,179,251,0.18)", color: brand.blue, border: "rgba(59,179,251,0.35)" } // blue
      case "Shipped":
        return { bg: "rgba(14,111,79,0.18)", color: brand.green, border: "rgba(14,111,79,0.35)" } // green
      case "In Progress":
        return { bg: "rgba(255,138,0,0.18)", color: brand.orange, border: "rgba(255,138,0,0.4)" } // orange
      default:
        return { bg: "rgba(255,255,255,0.08)", color: brand.fg, border: "rgba(255,255,255,0.15)" }
    }
  }

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <SectionTitle id="projects-title"><span className="section-title font-display text-gradient">Projects</span></SectionTitle>
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {cards.map((c) => {
          const bc = badgeColor(c.status)
          return (
            <article
              key={c.title}
              className="rounded-xl p-5 glass-card"
            >
              <header className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">{c.title}</h3>
                <span
                  className="rounded-full border px-2 py-0.5 text-xs"
                  style={{ backgroundColor: bc.bg, color: bc.color, borderColor: bc.border }}
                >
                  {c.status}
                </span>
              </header>
              <p className="mt-2 text-sm opacity-80">{c.stack}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Experience() {
  const roles = [
    {
      company: "Al Rajhi Bank",
      title: "B2B L3 Technical Production Support",
      period: "Riyadh, Saudi Arabia — On‑site",
      bullets: [
        "Managed critical incident resolution and deployment support across internal banking platforms",
        "Part of implementation for deploying core systems at SAMA and Riyadh Bank",
        "Root‑cause analysis, release validation, and integration with business users",
      ],
    },
    {
      company: "Java Full Stack Developer",
      title: "Backend & Frontend Engineer",
      period: "3+ years",
      bullets: [
        "Spring Boot, Hibernate, REST/SOAP for secure, scalable services",
        "Front‑end with HTML/CSS/JS, TailwindCSS, Next.js; modular UI design",
        "Automation with Python and n8n; observability and DX improvements",
      ],
    },
  ]

  return (
    <section id="experience" className="mx-auto max-w-5xl px-6 py-16 md:py-20">
      <SectionTitle id="experience-title"><span className="section-title font-display text-gradient">Experience</span></SectionTitle>
      <div className="mt-6 space-y-8">
        {roles.map((r, i) => (
          <div key={i} className="relative pl-6">
            <div
              className="absolute left-0 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full"
              style={{ backgroundColor: i === 0 ? brand.blue : i === 1 ? brand.green : brand.orange }}
              aria-hidden="true"
            />
            <div className="text-sm opacity-75">{r.period}</div>
            <div className="mt-1 text-lg font-semibold">
              {r.title} • <span className="opacity-90">{r.company}</span>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-85">
              {r.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-16 md:py-20">
      <SectionTitle id="contact-title"><span className="section-title font-display text-gradient">Contact</span></SectionTitle>
      <p className="mt-4 max-w-3xl opacity-95" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
        Let&apos;s build something reliable and delightful. Open to roles and collaborations.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href="mailto:athulpsudheer05@gmail.com"
          className="rounded-full px-5 py-2 text-sm font-medium shadow transition-colors"
          style={{ backgroundColor: brand.orange, color: "#111" }}
        >
          Email
        </a>
        <a
          href="https://www.linkedin.com/in/callmepk/"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border px-4 py-1.5 text-sm"
          style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.35)" }}
        >
          LinkedIn
        </a>
        <a
          href="https://github.com/callmeATHUL"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border px-4 py-1.5 text-sm"
          style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.35)" }}
        >
          GitHub
        </a>
      </div>
      <p className="mt-6 text-xs opacity-60">
        More: repositories at github.com/callmeATHUL and details on LinkedIn.
      </p>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-10 pt-6">
      <div className="flex items-center justify-between text-xs opacity-60">
        <span>© {new Date().getFullYear()} ATHUL P SUDHEER</span>
        <span>Built with Next.js App Router [^3]</span>
      </div>
    </footer>
  )
}
