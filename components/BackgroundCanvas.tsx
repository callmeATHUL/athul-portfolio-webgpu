"use client"

import { useEffect, useRef } from 'react'

type RendererHandle = {
  backend: 'webgpu' | 'webgl'
  stop: () => void
  pause?: () => void
  resume?: () => void
  reset?: () => void
  setParams?: (p: Partial<{
    spinStrength: number
    damping: number
    maxSpeed: number
    pointSize: number
    colorA: string
    colorB: string
  }>) => void
}

export default function BackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let handle: RendererHandle | null = null
    let cleanup: (() => void) | null = null

    const supportsWebGL2 = () => {
      try {
        const c = document.createElement('canvas')
        return !!c.getContext('webgl2')
      } catch {
        return false
      }
    }

    async function initWebGPU(root: HTMLDivElement) {
      const mod = await import('@/renderers/webgpu-example-attractors')
      handle = await mod.start(root)
      // @ts-ignore
      ;(window as any).__bgHandle = handle
      return handle
    }

    async function initWebGL(root: HTMLDivElement) {
      const mod = await import('@/renderers/webgl-gpgpu-attractors')
      handle = await mod.start(root)
      // @ts-ignore
      ;(window as any).__bgHandle = handle
      return handle
    }

    const init = async () => {
      const root = containerRef.current
      if (!root) return
      try {
        if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
          await initWebGPU(root)
        } else if (supportsWebGL2()) {
          await initWebGL(root)
        }
      } catch {
        // ignore
      }

      // GSAP-driven reactive tweaks
      try {
        const { gsap } = await import('gsap')
        const ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger
        gsap.registerPlugin(ScrollTrigger)

        const tweenParams = (sectionId: string, p: Partial<NonNullable<Parameters<NonNullable<RendererHandle['setParams']>>[0]>>) => {
          ScrollTrigger.create({
            trigger: `#${sectionId}`,
            start: 'top center',
            onEnter: () => handle?.setParams?.(p),
            onEnterBack: () => handle?.setParams?.(p),
          })
        }

        tweenParams('home', { spinStrength: 2.5, maxSpeed: 8, colorA: '#5900ff', colorB: '#ffa575' })
        tweenParams('about', { spinStrength: 1.2, maxSpeed: 6, colorA: '#3bb3fb', colorB: '#0e6f4f' })
        tweenParams('skills', { spinStrength: 1.8, maxSpeed: 7, colorA: '#ff8a00', colorB: '#3bb3fb' })
        tweenParams('projects', { spinStrength: 3.0, maxSpeed: 9, colorA: '#ffaa55', colorB: '#6da8ff' })
        tweenParams('experience', { spinStrength: 1.6, maxSpeed: 6.5, colorA: '#86ffd1', colorB: '#59a1ff' })
        tweenParams('contact', { spinStrength: 2.2, maxSpeed: 7.5, colorA: '#ff7a7a', colorB: '#ffd27a' })

        const onMove = (e: MouseEvent) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1
          const ny = (e.clientY / window.innerHeight) * 2 - 1
          const s = 1.5 + Math.abs(nx) * 2.5 + Math.abs(ny) * 0.5
          handle?.setParams?.({ spinStrength: s })
        }
        window.addEventListener('mousemove', onMove)
        cleanup = () => window.removeEventListener('mousemove', onMove)
      } catch {
        // gsap optional
      }
    }

    init()
    return () => {
      try {
        cleanup?.()
        handle?.stop()
      } catch {}
      // @ts-ignore
      ;(window as any).__bgHandle = null
    }
  }, [])

  return <div ref={containerRef} className="pointer-events-none fixed inset-0 -z-10" />
}

export function BackgroundControls() {
  const ref = useRef<RendererHandle | null>(null)
  // Access the handle from BackgroundCanvas via a simple window bridge
  useEffect(() => {
    // @ts-ignore
    ref.current = (window.__bgHandle as RendererHandle | null) || null
  })
  const onStop = () => ref.current?.stop?.()
  const onPause = () => ref.current?.pause?.()
  const onStart = () => ref.current?.resume?.()
  return (
    <div className="fixed right-3 bottom-3 z-10 flex gap-2 rounded-full bg-black/40 p-1 text-xs backdrop-blur-sm">
      <button onClick={onPause} className="rounded-full px-2 py-1">Pause</button>
      <button onClick={onStart} className="rounded-full px-2 py-1">Resume</button>
      <button onClick={onStop} className="rounded-full px-2 py-1">Stop</button>
    </div>
  )
}


