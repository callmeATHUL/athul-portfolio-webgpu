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
          scrolled ? "opacity-90" : "opacity-100"
        }`}
        style={{
          background: "rgba(255,255,255,0.05)",
          borderColor: "rgba(255,255,255,0.1)",
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
      <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center px-6 pt-24 pb-12 md:pt-32">
        <h1 className="text-center text-3xl font-semibold tracking-tight md:text-5xl">
          Java Full‑Stack Engineer • 3D UI • Automation
        </h1>
        <p className="mt-4 max-w-2xl text-center opacity-80">
          I build reliable backends, secure APIs, and modern, animated interfaces. Exploring real‑time systems, WebGPU,
          and automation that ships.
        </p>
        <div className="mt-6">
          <button
            onClick={scrollToProjects}
            className="rounded-full px-5 py-2 text-sm font-medium shadow transition-colors"
            style={{ backgroundColor: brand.orange, color: '#111' }}
            aria-label="View Projects"
          >
            View Projects
          </button>
        </div>
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
      <SectionTitle id="about-title">About</SectionTitle>
      <p className="mt-4 max-w-3xl opacity-85">
        Java Full‑Stack engineer focused on secure, scalable services and modern UI. I automate workflows end‑to‑end,
        integrate cloud‑native tooling, and craft performant 3D/interactive experiences with an eye for detail.
      </p>
      <p className="mt-3 max-w-3xl opacity-80">
        Comfortable across APIs, databases, and front‑end animations — shipping reliable features with strong
        observability and DX.
      </p>
    </section>
  )
}

function Skills() {
  const pairs: [string, string][] = [
    ["Java", "Spring Boot"],
    ["Next.js", "Tailwind"],
    ["Python", "n8n"],
    ["GSAP", "Anime.js"],
    ["Three.js", "WebGL/WebGPU"],
  ]
  return (
    <section id="skills" className="mx-auto max-w-5xl px-6 py-16 md:py-20">
      <SectionTitle id="skills-title">Skills</SectionTitle>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {pairs.map(([a, b]) => (
          <div
            key={`${a}-${b}`}
            className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
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
      <SectionTitle id="creative">Creative Highlights</SectionTitle>
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
    { title: "Realtime Analytics Kit", stack: "Next.js, tRPC, Postgres, WebSockets", status: "Active" },
    { title: "3D Product Configurator", stack: "Three.js, WebGPU, GLTF", status: "In Progress" },
    { title: "Automation Pipelines", stack: "Python, n8n, Redis", status: "Shipped" },
    { title: "Secure API Gateway", stack: "Java, Spring Boot, OAuth2", status: "Shipped" },
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
      <SectionTitle id="projects-title">Projects</SectionTitle>
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {cards.map((c) => {
          const bc = badgeColor(c.status)
          return (
            <article
              key={c.title}
              className="rounded-xl border p-5"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
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
      company: "Acme FinTech",
      title: "Senior Full‑Stack Engineer",
      period: "2023 — Present",
      bullets: [
        "Led delivery of secure payment APIs with Spring Boot and OAuth2",
        "Shipped analytics dashboard with real‑time charts and a11y focus",
        "Cut infra costs via caching, tracing, and CI optimizations",
      ],
    },
    {
      company: "Nova Systems",
      title: "Software Engineer",
      period: "2021 — 2023",
      bullets: [
        "Built workflow automation with Python/n8n across teams",
        "Implemented 3D product previews with Three.js",
        "Improved DX with templates, linters, and scaffolds",
      ],
    },
    {
      company: "StartLab",
      title: "Full‑Stack Developer",
      period: "2019 — 2021",
      bullets: [
        "Developed customer portals and internal tools",
        "Introduced component libraries and design tokens",
        "Collaborated on performance and security reviews",
      ],
    },
  ]

  return (
    <section id="experience" className="mx-auto max-w-5xl px-6 py-16 md:py-20">
      <SectionTitle id="experience-title">Experience</SectionTitle>
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
      <SectionTitle id="contact-title">Contact</SectionTitle>
      <p className="mt-4 max-w-3xl opacity-85">
        Let&apos;s build something reliable and delightful. I&apos;m open to roles and collaborations.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href="mailto:hello@example.com"
          className="rounded-full px-5 py-2 text-sm font-medium shadow transition-colors"
          style={{ backgroundColor: brand.orange, color: "#111" }}
        >
          Email Me
        </a>
        <a
          href="https://www.linkedin.com/"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border px-4 py-1.5 text-sm"
          style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)" }}
        >
          LinkedIn
        </a>
        <a
          href="https://twitter.com/"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border px-4 py-1.5 text-sm"
          style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)" }}
        >
          Twitter
        </a>
      </div>
      <p className="mt-6 text-xs opacity-60">
        Future additions: lazy routes for demos e.g., /demos/kinect, /demos/pcd (code-split when added).
      </p>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-10 pt-6">
      <div className="flex items-center justify-between text-xs opacity-60">
        <span>© {new Date().getFullYear()} Your Name</span>
        <span>Built with Next.js App Router [^3]</span>
      </div>
    </footer>
  )
}
