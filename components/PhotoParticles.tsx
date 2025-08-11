"use client"

import { useEffect, useRef } from 'react'

export default function PhotoParticles({ src = "/placeholder-user.jpg" }: { src?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })!

    let raf = 0
    let w = canvas.clientWidth
    let h = canvas.clientHeight
    const setSize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.floor(w * Math.min(window.devicePixelRatio || 1, 2))
      canvas.height = Math.floor(h * Math.min(window.devicePixelRatio || 1, 2))
      ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0)
    }
    const ro = new ResizeObserver(setSize)
    ro.observe(canvas)
    setSize()

    type P = { x: number; y: number; vx: number; vy: number; c: string; r: number }
    const particles: P[] = []

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = src
    img.onload = () => {
      const temp = document.createElement('canvas')
      const tctx = temp.getContext('2d')!
      const size = 64
      temp.width = size
      temp.height = size
      tctx.drawImage(img, 0, 0, size, size)
      const data = tctx.getImageData(0, 0, size, size).data
      for (let y = 0; y < size; y += 2) {
        for (let x = 0; x < size; x += 2) {
          const i = (y * size + x) * 4
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
          if (a < 100) continue
          const cx = (x / size - 0.5) * 180
          const cy = (y / size - 0.5) * 180
          particles.push({ x: w * 0.5 + cx, y: h * 0.5 + cy, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2, c: `rgba(${r},${g},${b},0.9)`, r: 1.2 })
        }
      }
    }

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.vx += (Math.random() - 0.5) * 0.02
        p.vy += (Math.random() - 0.5) * 0.02
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.99
        p.vy *= 0.99
        ctx.fillStyle = p.c
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [src])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
}


