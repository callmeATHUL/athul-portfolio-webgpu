"use client"

import { useEffect, useRef, useState } from "react"

export default function AttractorsExamplePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="mx-auto max-w-6xl px-6 py-6">
        <h1 className="text-xl font-semibold">WebGPU TSL Compute Attractors (three.js)</h1>
        <p className="mt-2 opacity-75">
          Adapted from the official three.js example. Requires a WebGPU-capable browser.
        </p>
      </header>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-black/50">
          <DemoCanvas />
        </div>
      </section>
    </main>
  )
}

function DemoCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let dispose: (() => void) | undefined

    ;(async () => {
      try {
        // Dynamic imports to avoid SSR issues and keep initial bundle slim
        const [THREE_WEBGPU, TSL, { OrbitControls }, { TransformControls }, { GUI }] = await Promise.all([
          import("three/webgpu") as any,
          import("three/tsl") as any,
          import("three/examples/jsm/controls/OrbitControls.js") as any,
          import("three/examples/jsm/controls/TransformControls.js") as any,
          import("three/examples/jsm/libs/lil-gui.module.min.js") as any,
        ])

        const THREE = THREE_WEBGPU
        const {
          float,
          If,
          PI,
          color,
          cos,
          instanceIndex,
          Loop,
          mix,
          mod,
          sin,
          instancedArray,
          Fn,
          uint,
          uniform,
          uniformArray,
          hash,
          vec3,
          vec4,
        } = TSL

        const root = containerRef.current!
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 100)
        camera.position.set(3, 5, 8)

        const renderer: any = new THREE.WebGPURenderer({ antialias: true, alpha: true })
        renderer.setClearColor("#000000")
        root.appendChild(renderer.domElement)
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

        scene.add(new THREE.AmbientLight("#ffffff", 0.5))
        const dir = new THREE.DirectionalLight("#ffffff", 1.5)
        dir.position.set(4, 2, 0)
        scene.add(dir)

        const setSize = () => {
          const rect = root.getBoundingClientRect()
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
        ro.observe(root)

        // Attractors setup
        const attractorsPositions = uniformArray([
          new THREE.Vector3(-1, 0, 0),
          new THREE.Vector3(1, 0, -0.5),
          new THREE.Vector3(0, 0.5, 1),
        ])
        const attractorsRotationAxes = uniformArray([
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(1, 0, -0.5).normalize(),
        ])
        const attractorsLength = uniform(attractorsPositions.array.length, "uint")
        const attractors: any[] = []

        const helpersRingGeometry = new THREE.RingGeometry(1, 1.02, 32, 1, 0, Math.PI * 1.5)
        const helpersArrowGeometry = new THREE.ConeGeometry(0.1, 0.4, 12, 1, false)
        const helpersMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })

        for (let i = 0; i < attractorsPositions.array.length; i++) {
          const attractor: any = {}
          attractor.position = attractorsPositions.array[i]
          attractor.orientation = attractorsRotationAxes.array[i]
          attractor.reference = new THREE.Object3D()
          attractor.reference.position.copy(attractor.position)
          attractor.reference.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), attractor.orientation)
          scene.add(attractor.reference)

          attractor.helper = new THREE.Group()
          attractor.helper.scale.setScalar(0.325)
          attractor.reference.add(attractor.helper)

          attractor.ring = new THREE.Mesh(helpersRingGeometry, helpersMaterial)
          attractor.ring.rotation.x = -Math.PI * 0.5
          attractor.helper.add(attractor.ring)

          attractor.arrow = new THREE.Mesh(helpersArrowGeometry, helpersMaterial)
          attractor.arrow.position.x = 1
          attractor.arrow.position.z = 0.2
          attractor.arrow.rotation.x = Math.PI * 0.5
          attractor.helper.add(attractor.arrow)

          attractor.controls = new TransformControls(camera, renderer.domElement)
          attractor.controls.mode = "rotate"
          attractor.controls.size = 0.5
          attractor.controls.attach(attractor.reference)
          attractor.controls.visible = true
          attractor.controls.enabled = attractor.controls.visible
          scene.add(attractor.controls.getHelper())

          attractor.controls.addEventListener("dragging-changed", (event: any) => {
            controls.enabled = !event.value
          })

          attractor.controls.addEventListener("change", () => {
            attractor.position.copy(attractor.reference.position)
            attractor.orientation.copy(new THREE.Vector3(0, 1, 0).applyQuaternion(attractor.reference.quaternion))
          })

          attractors.push(attractor)
        }

        // Particles and compute (TSL)
        const count = Math.pow(2, 18)
        const material: any = new (THREE as any).SpriteNodeMaterial({ blending: THREE.AdditiveBlending, depthWrite: false })

        const attractorMass = uniform(Number(`1e${7}`))
        const particleGlobalMass = uniform(Number(`1e${4}`))
        const timeScale = uniform(1)
        const spinningStrength = uniform(2.75)
        const maxSpeed = uniform(8)
        const gravityConstant = 6.67e-11
        const velocityDamping = uniform(0.1)
        const scale = uniform(0.008)
        const boundHalfExtent = uniform(8)
        const colorA = uniform(color("#5900ff"))
        const colorB = uniform(color("#ffa575"))

        const positionBuffer = instancedArray(count, "vec3")
        const velocityBuffer = instancedArray(count, "vec3")

        const sphericalToVec3 = Fn(([phi, theta]: any) => {
          const sinPhiRadius = sin(phi)
          return vec3(sinPhiRadius.mul(sin(theta)), cos(phi), sinPhiRadius.mul(cos(theta)))
        })

        const init = Fn(() => {
          const position = positionBuffer.element(instanceIndex)
          const velocity = velocityBuffer.element(instanceIndex)
          const basePosition = vec3(
            hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
            hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
            hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
          )
            .sub(0.5)
            .mul(vec3(5, 0.2, 5))
          position.assign(basePosition)
          const phi = hash(instanceIndex.add(uint(Math.random() * 0xffffff))).mul(PI).mul(2)
          const theta = hash(instanceIndex.add(uint(Math.random() * 0xffffff))).mul(PI)
          const baseVelocity = sphericalToVec3(phi, theta).mul(0.05)
          velocity.assign(baseVelocity)
        })
        const initCompute = (init() as any).compute(count)

        const particleMassMultiplier = (hash(instanceIndex.add(uint(Math.random() * 0xffffff))).remap(0.25, 1) as any).toVar()
        const particleMass = (particleMassMultiplier.mul(particleGlobalMass) as any).toVar()

        const update = Fn(() => {
          // fixed delta for consistent results
          const delta = float(1 / 60).mul(timeScale).toVar()
          const position = positionBuffer.element(instanceIndex)
          const velocity = velocityBuffer.element(instanceIndex)

          const force = vec3(0).toVar()

          Loop(attractorsLength, ({ i }: any) => {
            const attractorPosition = attractorsPositions.element(i)
            const attractorRotationAxis = attractorsRotationAxes.element(i)
            const toAttractor = attractorPosition.sub(position)
            const distance = toAttractor.length()
            const direction = toAttractor.normalize()
            const gravityStrength = attractorMass
              .mul(particleMass)
              .mul(gravityConstant)
              .div(distance.pow(2))
              .toVar()
            const gravityForce = direction.mul(gravityStrength)
            force.addAssign(gravityForce)
            const spinningForce = attractorRotationAxis.mul(gravityStrength).mul(spinningStrength)
            const spinningVelocity = spinningForce.cross(toAttractor)
            force.addAssign(spinningVelocity)
          })

          velocity.addAssign(force.mul(delta))
          const speed = velocity.length()
          If(speed.greaterThan(maxSpeed), () => {
            velocity.assign(velocity.normalize().mul(maxSpeed))
          })
          velocity.mulAssign(velocityDamping.oneMinus())

          position.addAssign(velocity.mul(delta))
          const halfHalfExtent = (boundHalfExtent.div(2) as any).toVar()
          position.assign(mod(position.add(halfHalfExtent), boundHalfExtent).sub(halfHalfExtent))
        })
        const updateCompute = (update() as any).compute(count)

        // Material nodes
        material.positionNode = (positionBuffer as any).toAttribute()
        material.colorNode = (Fn(() => {
          const vel = (velocityBuffer as any).toAttribute()
          const speed = vel.length()
          const colorMix = (speed as any).div(maxSpeed).smoothstep(0, 0.5)
          const finalColor = mix(colorA, colorB, colorMix)
          return vec4(finalColor, 1)
        })() as any)
        material.scaleNode = (particleMassMultiplier as any).mul(scale)

        const geometry = new THREE.PlaneGeometry(1, 1)
        const mesh = new (THREE as any).InstancedMesh(geometry, material, count)
        scene.add(mesh)

        // GUI controls
        const gui = new GUI()
        gui.add({ attractorMassExponent: attractorMass.value.toString().length - 1 }, "attractorMassExponent", 1, 10, 1).onChange(
          (value: number) => (attractorMass.value = Number(`1e${value}`)),
        )
        gui
          .add({ particleGlobalMassExponent: particleGlobalMass.value.toString().length - 1 }, "particleGlobalMassExponent", 1, 10, 1)
          .onChange((value: number) => (particleGlobalMass.value = Number(`1e${value}`)))
        gui.add(maxSpeed, "value", 0, 10, 0.01).name("maxSpeed")
        gui.add(velocityDamping, "value", 0, 0.1, 0.001).name("velocityDamping")
        gui.add(spinningStrength, "value", 0, 10, 0.01).name("spinningStrength")
        gui.add(scale, "value", 0, 0.1, 0.001).name("scale")
        gui.add(boundHalfExtent, "value", 0, 20, 0.01).name("boundHalfExtent")
        gui.addColor({ color: colorA.value.getHexString(THREE.SRGBColorSpace) }, "color")
          .name("colorA")
          .onChange((value: string) => colorA.value.set(value))
        gui.addColor({ color: colorB.value.getHexString(THREE.SRGBColorSpace) }, "color")
          .name("colorB")
          .onChange((value: string) => colorB.value.set(value))
        gui
          .add({ controlsMode: attractors[0].controls.mode }, "controlsMode")
          .options(["translate", "rotate", "none"]) // example uses rotate by default
          .onChange((value: string) => {
            for (const attractor of attractors) {
              if (value === "none") {
                attractor.controls.visible = false
                attractor.controls.enabled = false
              } else {
                attractor.controls.visible = true
                attractor.controls.enabled = true
                attractor.controls.mode = value
              }
            }
          })
        gui
          .add({ helperVisible: attractors[0].helper.visible }, "helperVisible")
          .onChange((value: boolean) => {
            for (const attractor of attractors) attractor.helper.visible = value
          })
        gui.add({ reset: () => renderer.computeAsync(initCompute) }, "reset")

        renderer.computeAsync(initCompute)

        // Animation loop
        renderer.setAnimationLoop(() => {
          controls.update()
          renderer.compute(updateCompute)
          renderer.render(scene, camera)
        })

        dispose = () => {
          try {
            renderer.setAnimationLoop(null)
            ro.disconnect()
            controls.dispose()
            gui.destroy?.()
            geometry.dispose()
            ;(material as any).dispose?.()
            scene.clear()
            renderer.dispose()
            if (renderer.domElement?.parentElement === root) root.removeChild(renderer.domElement)
          } catch {}
        }
      } catch (e: any) {
        setError(e?.message || "Failed to initialize WebGPU example.")
      }
    })()

    return () => {
      try {
        dispose?.()
      } catch {}
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0">
      {error && (
        <div className="absolute inset-0 grid place-items-center text-center text-sm opacity-80">
          {error}
        </div>
      )}
    </div>
  )
}


