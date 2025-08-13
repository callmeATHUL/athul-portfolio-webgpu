// Exact adaptation of three.js example: webgpu_tsl_compute_attractors_particles.html
// Reference: https://threejs.org/examples/webgpu_tsl_compute_attractors_particles.html

import * as THREE_NS from 'three/webgpu'
import * as tsl from 'three/tsl'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// Removed TransformControls/GUI for clean background

export type RendererHandle = {
  backend: 'webgpu'
  stop: () => void
  pause?: () => void
  resume?: () => void
  reset?: () => void
  setHelpersVisible?: (visible: boolean) => void
  setParams?: (p: Partial<{
    spinStrength: number
    damping: number
    maxSpeed: number
    pointSize: number
    colorA: string
    colorB: string
    seed: number
    spreadX: number
    spreadY: number
    spreadZ: number
    velocityScale: number
    photoInitials: string
    photoSize: number
    photoVisible: boolean
  }>) => void
}

export async function start(container: HTMLDivElement): Promise<RendererHandle> {
  const THREE: any = THREE_NS as any
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 100)
  camera.position.set(3, 5, 8)

  const renderer: any = new (THREE as any).WebGPURenderer({ antialias: true, alpha: true })
  // Ensure transparent clear for overlay use-cases
  ;(renderer as any).setClearAlpha?.(0)
  renderer.setClearColor('#000000')
  container.appendChild(renderer.domElement)
  Object.assign(renderer.domElement.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    background: 'transparent',
  })
  // Ensure canvas fills container precisely to avoid 1px gaps on some DPR/zoom combos
  Object.assign(renderer.domElement.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%'
  })

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.minDistance = 0.1
  controls.maxDistance = 50

  scene.add(new THREE.AmbientLight('#ffffff', 0.5))
  const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5)
  directionalLight.position.set(4, 2, 0)
  scene.add(directionalLight)

  const setSize = () => {
    const rect = container.getBoundingClientRect()
    const w = Math.ceil(rect.width)
    const h = Math.ceil(rect.height)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    camera.aspect = Math.max(1, w) / Math.max(1, h)
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
  }
  setSize()
  const ro = new ResizeObserver(setSize)
  ro.observe(container)

  // Attractors (exact same structure)
  const attractorsPositions = tsl.uniformArray([
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(1, 0, -0.5),
    new THREE.Vector3(0, 0.5, 1),
  ])
  const attractorsRotationAxes = tsl.uniformArray([
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(1, 0, -0.5).normalize(),
  ])
  const attractorsLength = tsl.uniform(attractorsPositions.array.length, 'uint')
  const attractors: any[] = []

  // Particles and compute
  const count = Math.pow(2, 18)
  const material: any = new (THREE as any).SpriteNodeMaterial({
    blending: (THREE as any).AdditiveBlending,
    depthWrite: false,
  })

  const attractorMass = tsl.uniform(Number(`1e${7}`))
  const particleGlobalMass = tsl.uniform(Number(`1e${4}`))
  const timeScale = tsl.uniform(1)
  const spinningStrength = tsl.uniform(2.75)
  const maxSpeed = tsl.uniform(8)
  const gravityConstant = 6.67e-11
  const velocityDamping = tsl.uniform(0.1)
  const scale = tsl.uniform(0.008)
  const boundHalfExtent = tsl.uniform(8)
  const colorA = tsl.uniform(tsl.color('#5900ff'))
  const colorB = tsl.uniform(tsl.color('#ffa575'))

  // Initial state uniforms
  const seedUniform = tsl.uniform(0)
  const spreadUniform = tsl.uniform(tsl.vec3(5, 0.2, 5))
  const initVelocityScale = tsl.uniform(0.05)

  const positionBuffer = tsl.instancedArray(count, 'vec3')
  const velocityBuffer = tsl.instancedArray(count, 'vec3')

  const sphericalToVec3 = tsl.Fn(([phi, theta]: any) => {
    const sinPhiRadius = tsl.sin(phi)
    return tsl.vec3(sinPhiRadius.mul(tsl.sin(theta)), tsl.cos(phi), sinPhiRadius.mul(tsl.cos(theta)))
  })

  const init = tsl.Fn(() => {
    const position = positionBuffer.element(tsl.instanceIndex)
    const velocity = velocityBuffer.element(tsl.instanceIndex)
    const basePosition = tsl
      .vec3(
        tsl.hash(tsl.instanceIndex.add(seedUniform.toInt() as any)),
        tsl.hash(tsl.instanceIndex.add((seedUniform.add(1234) as any).toInt() as any)),
        tsl.hash(tsl.instanceIndex.add((seedUniform.add(5678) as any).toInt() as any)),
      )
      .sub(0.5)
      .mul(spreadUniform)
    position.assign(basePosition)
    const phi = tsl.hash(tsl.instanceIndex.add((seedUniform.add(91011) as any).toInt() as any)).mul(tsl.PI).mul(2)
    const theta = tsl.hash(tsl.instanceIndex.add((seedUniform.add(121314) as any).toInt() as any)).mul(tsl.PI)
    const baseVelocity = sphericalToVec3(phi, theta).mul(initVelocityScale)
    velocity.assign(baseVelocity)
  })
  const initCompute = (init() as any).compute(count)

  const particleMassMultiplier = (tsl
    .hash(tsl.instanceIndex.add(tsl.uint(Math.random() * 0xffffff)))
    .remap(0.25, 1) as any).toVar()
  const particleMass = (particleMassMultiplier.mul(particleGlobalMass) as any).toVar()

  const update = tsl.Fn(() => {
    const delta = tsl.float(1 / 60).mul(timeScale).toVar()
    const position = positionBuffer.element(tsl.instanceIndex)
    const velocity = velocityBuffer.element(tsl.instanceIndex)
    const force = tsl.vec3(0).toVar()

    tsl.Loop(attractorsLength, ({ i }: any) => {
      const attractorPosition = attractorsPositions.element(i)
      const attractorRotationAxis = attractorsRotationAxes.element(i)
      const toAttractor = attractorPosition.sub(position)
      const distance = toAttractor.length()
      const direction = toAttractor.normalize()
      const gravityStrength = attractorMass.mul(particleMass).mul(gravityConstant).div(distance.pow(2)).toVar()
      const gravityForce = direction.mul(gravityStrength)
      force.addAssign(gravityForce)
      const spinningForce = attractorRotationAxis.mul(gravityStrength).mul(spinningStrength)
      const spinningVelocity = spinningForce.cross(toAttractor)
      force.addAssign(spinningVelocity)
    })

    velocity.addAssign(force.mul(delta))
    const speed = velocity.length()
    tsl.If(speed.greaterThan(maxSpeed), () => {
      velocity.assign(velocity.normalize().mul(maxSpeed))
    })
    velocity.mulAssign(velocityDamping.oneMinus())
    position.addAssign(velocity.mul(delta))
    const halfHalfExtent = (boundHalfExtent.div(2) as any).toVar()
    position.assign(tsl.mod(position.add(halfHalfExtent), boundHalfExtent).sub(halfHalfExtent))
  })
  const updateCompute = (update() as any).compute(count)

  material.positionNode = (positionBuffer as any).toAttribute()
  material.colorNode = (tsl.Fn(() => {
    const vel = (velocityBuffer as any).toAttribute()
    const speed = vel.length()
    const colorMix = (speed as any).div(maxSpeed).smoothstep(0, 0.5)
    const finalColor = tsl.mix(colorA, colorB, colorMix)
    return tsl.vec4(finalColor, 1)
  })() as any)
  material.scaleNode = (particleMassMultiplier as any).mul(scale)

  const geometry = new THREE.PlaneGeometry(1, 1)
  const mesh = new (THREE as any).InstancedMesh(geometry, material, count)
  scene.add(mesh)

  // Optional photo sprite (2D image via CanvasTexture placeholder)
  let photoSprite: any | null = null
  const createInitialsTexture = (initials: string) => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#0b0f14'
    ctx.fillRect(0, 0, size, size)
    const grd = ctx.createLinearGradient(0, 0, size, size)
    grd.addColorStop(0, '#7c3aed')
    grd.addColorStop(1, '#22d3ee')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0b0f14'
    ctx.globalAlpha = 0.08
    ctx.fillRect(0, 0, size, size)
    ctx.globalAlpha = 1
    ctx.fillStyle = '#e6f0f6'
    ctx.font = 'bold 110px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initials || 'AP', size / 2, size / 2)
    const tex = new (THREE as any).CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }

  const ensurePhotoSprite = (initials: string, size: number, visible: boolean) => {
    if (!visible) {
      if (photoSprite && scene) {
        scene.remove(photoSprite)
        ;(photoSprite.material as any)?.map?.dispose?.()
        ;(photoSprite.material as any)?.dispose?.()
        photoSprite = null
      }
      return
    }
    const texture = createInitialsTexture(initials)
    const materialSprite = new (THREE as any).SpriteMaterial({ map: texture, transparent: true, depthTest: false })
    const sprite = new (THREE as any).Sprite(materialSprite)
    sprite.scale.set(size, size, 1)
    sprite.position.set(-2.2, 0.9, 0)
    sprite.renderOrder = 1
    if (photoSprite) {
      scene.remove(photoSprite)
    }
    photoSprite = sprite
    scene.add(photoSprite)
  }

  // GUI removed in full-screen aesthetic

  renderer.computeAsync(initCompute)
  let paused = false
  const loop = () => {
    if (paused) return
    controls.update()
    renderer.compute(updateCompute)
    renderer.render(scene, camera)
  }
  renderer.setAnimationLoop(loop)

  const reset = () => {
    ;(renderer as any).computeAsync(initCompute)
  }

  const setHelpersVisible = (_visible: boolean) => {}

  const setParams: RendererHandle['setParams'] = (p) => {
    if (!p) return
    if (p.spinStrength !== undefined) (spinningStrength as any).value = p.spinStrength
    if (p.damping !== undefined) (velocityDamping as any).value = Math.max(0, Math.min(0.98, p.damping))
    if (p.maxSpeed !== undefined) (maxSpeed as any).value = p.maxSpeed
    if (p.pointSize !== undefined) (scale as any).value = p.pointSize * 0.005
    if (p.colorA) (colorA as any).value.set(p.colorA)
    if (p.colorB) (colorB as any).value.set(p.colorB)
    if (p.spreadX !== undefined || p.spreadY !== undefined || p.spreadZ !== undefined) {
      const x = (p.spreadX ?? (spreadUniform as any).value.x)
      const y = (p.spreadY ?? (spreadUniform as any).value.y)
      const z = (p.spreadZ ?? (spreadUniform as any).value.z)
      ;(spreadUniform as any).value.set(x, y, z)
    }
    if (p.velocityScale !== undefined) (initVelocityScale as any).value = p.velocityScale
    if (p.seed !== undefined) (seedUniform as any).value = Math.floor(p.seed)
    if (p.photoInitials !== undefined || p.photoSize !== undefined || p.photoVisible !== undefined) {
      const initials = (p.photoInitials ?? 'AP') as any
      const size = (p.photoSize ?? 1.2) as number
      const visible = (p.photoVisible ?? true) as boolean
      ensurePhotoSprite(initials as string, size, visible)
    }
    if (p.seed !== undefined || p.spreadX !== undefined || p.spreadY !== undefined || p.spreadZ !== undefined || p.velocityScale !== undefined) {
      // Re-init to apply initial state changes
      ;(renderer as any).computeAsync(initCompute)
    }
  }

  const stop = () => {
    renderer.setAnimationLoop(null)
    ro.disconnect()
    controls.dispose()
    // no GUI
    geometry.dispose()
    ;(material as any).dispose?.()
    if (photoSprite) {
      scene.remove(photoSprite)
      ;(photoSprite.material as any)?.map?.dispose?.()
      ;(photoSprite.material as any)?.dispose?.()
      photoSprite = null
    }
    scene.clear()
    renderer.dispose()
    if ((renderer as any).domElement?.parentElement === container) container.removeChild((renderer as any).domElement)
  }

  const pause = () => { paused = true }
  const resume = () => {
    if (!paused) return
    paused = false
    renderer.setAnimationLoop(loop)
  }

  return { backend: 'webgpu', stop, pause, resume, reset, setHelpersVisible, setParams }
}


