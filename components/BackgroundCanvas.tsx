"use client"

import { useEffect, useRef, useState, useCallback } from 'react'

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

// Context for sharing renderer handle between components
import { createContext, useContext } from 'react'
const RendererContext = createContext<RendererHandle | null>(null)

export function useRenderer() {
  return useContext(RendererContext)
}

export default function BackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [rendererHandle, setRendererHandle] = useState<RendererHandle | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // WebGL2 support check
  const supportsWebGL2 = useCallback(() => {
    try {
      const canvas = document.createElement('canvas')
      return !!canvas.getContext('webgl2')
    } catch {
      return false
    }
  }, [])

  // Initialize WebGPU renderer
  const initWebGPU = useCallback(async (root: HTMLDivElement) => {
    try {
      const mod = await import('@/renderers/webgpu-example-attractors')
      const handle = await mod.start(root)
      return handle
    } catch (error) {
      console.warn('WebGPU initialization failed:', error)
      return null
    }
  }, [])

  // Initialize WebGL renderer
  const initWebGL = useCallback(async (root: HTMLDivElement) => {
    try {
      const mod = await import('@/renderers/webgl-gpgpu-attractors')
      const handle = await mod.start(root)
      return handle
    } catch (error) {
      console.warn('WebGL initialization failed:', error)
      return null
    }
  }, [])

  // Initialize renderer with fallback
  const initializeRenderer = useCallback(async () => {
    const root = containerRef.current
    if (!root || isInitialized) return

    let handle: RendererHandle | null = null

    // Try WebGPU first
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
      handle = await initWebGPU(root)
    }

    // Fallback to WebGL
    if (!handle && supportsWebGL2()) {
      handle = await initWebGL(root)
    }

    if (handle) {
      setRendererHandle(handle)
      setIsInitialized(true)
      setErrorMsg(null)
    } else {
      setErrorMsg('GPU not available — falling back disabled')
    }
  }, [initWebGPU, initWebGL, supportsWebGL2, isInitialized])

  // Setup GSAP animations
  const setupGSAPAnimations = useCallback(async (handle: RendererHandle) => {
    try {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      // Section-based parameter tweens
      const sectionParams = {
        home: { spinStrength: 2.5, maxSpeed: 8, colorA: '#5900ff', colorB: '#ffa575' },
        about: { spinStrength: 1.2, maxSpeed: 6, colorA: '#3bb3fb', colorB: '#0e6f4f' },
        skills: { spinStrength: 1.8, maxSpeed: 7, colorA: '#ff8a00', colorB: '#3bb3fb' },
        projects: { spinStrength: 3.0, maxSpeed: 9, colorA: '#ffaa55', colorB: '#6da8ff' },
        experience: { spinStrength: 1.6, maxSpeed: 6.5, colorA: '#86ffd1', colorB: '#59a1ff' },
        contact: { spinStrength: 2.2, maxSpeed: 7.5, colorA: '#ff7a7a', colorB: '#ffd27a' }
      }

      // Create scroll-triggered animations
      Object.entries(sectionParams).forEach(([sectionId, params]) => {
        ScrollTrigger.create({
          trigger: `#${sectionId}`,
          start: 'top center',
          onEnter: () => handle.setParams?.(params),
          onEnterBack: () => handle.setParams?.(params),
        })
      })

      // Mouse movement reactivity
      const handleMouseMove = (e: MouseEvent) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1
        const ny = (e.clientY / window.innerHeight) * 2 - 1
        const spinStrength = 1.5 + Math.abs(nx) * 2.5 + Math.abs(ny) * 0.5
        handle.setParams?.({ spinStrength })
      }

      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      
      // Return cleanup function
      return () => window.removeEventListener('mousemove', handleMouseMove)
    } catch (error) {
      console.warn('GSAP initialization failed:', error)
      return () => {}
    }
  }, [])

  // Main initialization effect
  useEffect(() => {
    let gsapCleanup: (() => void) | undefined

    const init = async () => {
      await initializeRenderer()
    }

    init()

    return () => {
      gsapCleanup?.()
    }
  }, [initializeRenderer])

  // Setup GSAP when renderer is ready
  useEffect(() => {
    if (!rendererHandle) return

    let cleanup: (() => void) | undefined

    const setup = async () => {
      cleanup = await setupGSAPAnimations(rendererHandle)
    }

    setup()

    return () => {
      cleanup?.()
    }
  }, [rendererHandle, setupGSAPAnimations])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rendererHandle) {
        try {
          rendererHandle.stop()
        } catch (error) {
          console.warn('Error during renderer cleanup:', error)
        }
      }
    }
  }, [rendererHandle])

  return (
    <RendererContext.Provider value={rendererHandle}>
      <div 
        ref={containerRef} 
        className="pointer-events-none fixed inset-0 z-10"
        aria-hidden="true"
      />
      {errorMsg && (
        <div className="fixed left-3 bottom-3 z-30 rounded-md border border-white/10 bg-black/60 px-3 py-1 text-xs">
          {errorMsg}
        </div>
      )}
    </RendererContext.Provider>
  )
}

export function BackgroundControls() {
  const rendererHandle = useRenderer()
  const [isPaused, setIsPaused] = useState(false)

  const handlePause = useCallback(() => {
    if (rendererHandle?.pause) {
      rendererHandle.pause()
      setIsPaused(true)
    }
  }, [rendererHandle])

  const handleResume = useCallback(() => {
    if (rendererHandle?.resume) {
      rendererHandle.resume()
      setIsPaused(false)
    }
  }, [rendererHandle])

  const handleStop = useCallback(() => {
    if (rendererHandle?.stop) {
      rendererHandle.stop()
    }
  }, [rendererHandle])

  if (!rendererHandle) return null

  return (
    <div className="fixed right-3 bottom-3 z-30 flex gap-2 rounded-full bg-black/40 p-1 text-xs backdrop-blur-sm">
      <button 
        onClick={isPaused ? handleResume : handlePause}
        className="rounded-full px-2 py-1 hover:bg-white/10 transition-colors"
        aria-label={isPaused ? 'Resume animation' : 'Pause animation'}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </button>
      <button 
        onClick={handleStop}
        className="rounded-full px-2 py-1 hover:bg-white/10 transition-colors"
        aria-label="Stop animation"
      >
        Stop
      </button>
      <div className="hidden md:block rounded-full px-2 py-1 opacity-80">{rendererHandle.backend.toUpperCase()} · DPR {Math.min(window.devicePixelRatio || 1, 2)}</div>
    </div>
  )
}


