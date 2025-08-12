import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export type RendererHandle = {
  backend: 'webgl'
  stop: () => void
  pause?: () => void
  resume?: () => void
  reset?: () => void
  setHelpersVisible?: (visible: boolean) => void
  setParams?: (p: Partial<{ spinStrength: number; damping: number; maxSpeed: number; pointSize: number; colorA: string; colorB: string }>) => void
}

export async function start(container: HTMLDivElement): Promise<RendererHandle> {
  const rect = container.getBoundingClientRect()
  const width = Math.ceil(rect.width)
  const height = Math.ceil(rect.height)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setClearAlpha(0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height, false)
  container.appendChild(renderer.domElement)
  Object.assign(renderer.domElement.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    background: 'transparent',
  })
  Object.assign(renderer.domElement.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%'
  })

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, Math.max(1, width) / Math.max(1, height), 0.1, 100)
  camera.position.set(0, 0, 6)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const dir = new THREE.DirectionalLight(0xffffff, 1)
  dir.position.set(3, 3, 3)
  scene.add(dir)

  // Helpers removed for clean full-screen visual

  // Particle resolution: N = side*side
  const side = 512 // 262,144 particles; lower to 256 if needed
  const count = side * side

  const gpgpu = new GPUComputationRenderer(side, side, renderer)

  const pos0 = gpgpu.createTexture()
  const vel0 = gpgpu.createTexture()

  const posArray = pos0.image.data as Float32Array
  const velArray = vel0.image.data as Float32Array
  const rand = (min: number, max: number) => Math.random() * (max - min) + min
  for (let i = 0; i < count; i++) {
    const i4 = i * 4
    const theta = rand(0, Math.PI * 2)
    const phi = Math.acos(rand(-1, 1))
    const r = 1.2 + rand(-0.3, 0.3)
    posArray[i4 + 0] = r * Math.sin(phi) * Math.cos(theta)
    posArray[i4 + 1] = r * Math.sin(phi) * Math.sin(theta)
    posArray[i4 + 2] = r * Math.cos(phi)
    posArray[i4 + 3] = 1
    velArray[i4 + 0] = rand(-0.02, 0.02)
    velArray[i4 + 1] = rand(-0.02, 0.02)
    velArray[i4 + 2] = rand(-0.02, 0.02)
    velArray[i4 + 3] = 0
  }

  const positionVariable = gpgpu.addVariable('texturePosition', positionFragmentShader, pos0)
  const velocityVariable = gpgpu.addVariable('textureVelocity', velocityFragmentShader, vel0)

  gpgpu.setVariableDependencies(positionVariable, [positionVariable, velocityVariable])
  gpgpu.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable])

  // uniforms
  ;(positionVariable.material.uniforms as any).delta = { value: 1 / 60 }
  ;(positionVariable.material.uniforms as any).bounds = { value: 8 }

  ;(velocityVariable.material.uniforms as any).delta = { value: 1 / 60 }
  ;(velocityVariable.material.uniforms as any).damping = { value: 0.9 }
  ;(velocityVariable.material.uniforms as any).attractA = { value: new THREE.Vector3(-1, 0, 0) }
  ;(velocityVariable.material.uniforms as any).attractB = { value: new THREE.Vector3(1, 0, -0.5) }
  ;(velocityVariable.material.uniforms as any).attractC = { value: new THREE.Vector3(0, 0.5, 1) }
  ;(velocityVariable.material.uniforms as any).spinStrength = { value: 2.75 }
  ;(velocityVariable.material.uniforms as any).maxSpeed = { value: 8.0 }

  const initOk = gpgpu.init()
  if (initOk !== null) {
    throw new Error(initOk)
  }

  // Render geometry sampling GPGPU textures
  const geom = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const uvs = new Float32Array(count * 2)
  let p = 0
  let u = 0
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      positions[p++] = 0
      positions[p++] = 0
      positions[p++] = 0
      uvs[u++] = x / (side - 1)
      uvs[u++] = y / (side - 1)
    }
  }
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      texturePosition: { value: gpgpu.getCurrentRenderTarget(positionVariable).texture },
      textureVelocity: { value: gpgpu.getCurrentRenderTarget(velocityVariable).texture },
      pointSize: { value: 1.6 },
      maxSpeed: { value: 8.0 },
      colorA: { value: new THREE.Color('#5900ff') },
      colorB: { value: new THREE.Color('#ffa575') },
      damping: { value: (velocityVariable.material.uniforms as any).damping.value },
      spinStrength: { value: (velocityVariable.material.uniforms as any).spinStrength.value },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      uniform sampler2D texturePosition;
      uniform float pointSize;
      void main() {
        vUv = uv;
        vec3 pos = texture2D(texturePosition, uv).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = pointSize;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D textureVelocity;
      uniform float maxSpeed;
      uniform vec3 colorA;
      uniform vec3 colorB;
      uniform float damping;
      uniform float spinStrength;
      varying vec2 vUv;
      void main() {
        vec3 vel = texture2D(textureVelocity, vUv).xyz;
        float speed = length(vel);
        float t = smoothstep(0.0, 0.5, speed / maxSpeed);
        vec3 col = mix(colorA, colorB, t);
        float d = length(gl_PointCoord - 0.5);
        float alpha = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  })

  const points = new THREE.Points(geom, material)
  scene.add(points)

  const onResize = () => {
    const r = container.getBoundingClientRect()
    const w = Math.ceil(r.width)
    const h = Math.ceil(r.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h, false)
    camera.aspect = Math.max(1, w) / Math.max(1, h)
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(onResize)
  ro.observe(container)

  let raf = 0
  let paused = false
  const tick = () => {
    if (paused) return
    gpgpu.compute()
    material.uniforms.texturePosition.value = gpgpu.getCurrentRenderTarget(positionVariable).texture
    material.uniforms.textureVelocity.value = gpgpu.getCurrentRenderTarget(velocityVariable).texture
    controls.update()
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  tick()

  const reset = () => {
    const dtPosition = gpgpu.createTexture()
    const dtVelocity = gpgpu.createTexture()
    // Reuse the same init as initial
    const posArray = dtPosition.image.data as Float32Array
    const velArray = dtVelocity.image.data as Float32Array
    const rand = (min: number, max: number) => Math.random() * (max - min) + min
    for (let i = 0; i < count; i++) {
      const i4 = i * 4
      const theta = rand(0, Math.PI * 2)
      const phi = Math.acos(rand(-1, 1))
      const r = 1.2 + rand(-0.3, 0.3)
      posArray[i4 + 0] = r * Math.sin(phi) * Math.cos(theta)
      posArray[i4 + 1] = r * Math.sin(phi) * Math.sin(theta)
      posArray[i4 + 2] = r * Math.cos(phi)
      posArray[i4 + 3] = 1
      velArray[i4 + 0] = rand(-0.02, 0.02)
      velArray[i4 + 1] = rand(-0.02, 0.02)
      velArray[i4 + 2] = rand(-0.02, 0.02)
      velArray[i4 + 3] = 0
    }
    gpgpu.renderTexture(dtPosition, (positionVariable as any).renderTargets[0])
    gpgpu.renderTexture(dtPosition, (positionVariable as any).renderTargets[1])
    gpgpu.renderTexture(dtVelocity, (velocityVariable as any).renderTargets[0])
    gpgpu.renderTexture(dtVelocity, (velocityVariable as any).renderTargets[1])
  }

  const setHelpersVisible = (_visible: boolean) => {}

  const setParams: RendererHandle['setParams'] = (p) => {
    if (!p) return
    if (p.maxSpeed !== undefined) material.uniforms.maxSpeed.value = p.maxSpeed
    if (p.pointSize !== undefined) material.uniforms.pointSize.value = p.pointSize
    if (p.colorA) material.uniforms.colorA.value.set(p.colorA)
    if (p.colorB) material.uniforms.colorB.value.set(p.colorB)
    if (p.damping !== undefined) (velocityVariable.material.uniforms as any).damping.value = Math.max(0, Math.min(0.98, p.damping))
    if (p.spinStrength !== undefined) (velocityVariable.material.uniforms as any).spinStrength.value = p.spinStrength
  }

  const stop = () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    controls.dispose()
    renderer.dispose()
    geom.dispose()
    ;(material as any).dispose?.()
    if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement)
  }

  const pause = () => {
    paused = true
    cancelAnimationFrame(raf)
  }
  const resume = () => {
    if (!paused) return
    paused = false
    tick()
  }

  return { backend: 'webgl', stop, pause, resume, reset, setHelpersVisible, setParams }
}

// Compute shaders
const positionFragmentShader = /* glsl */ `
  uniform float delta;
  uniform float bounds;
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec3 vel = texture2D(textureVelocity, uv).xyz;
    pos.xyz += vel * delta;
    float halfB = bounds * 0.5;
    pos.xyz = mod(pos.xyz + halfB, bounds) - halfB; // wrap
    gl_FragColor = pos;
  }
`

const velocityFragmentShader = /* glsl */ `
  uniform float delta;
  uniform float damping;
  uniform vec3 attractA;
  uniform vec3 attractB;
  uniform vec3 attractC;
  uniform float spinStrength;
  uniform float maxSpeed;
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;
    vec3 force = vec3(0.0);
    vec3 targets[3];
    targets[0] = attractA; targets[1] = attractB; targets[2] = attractC;
    for (int i = 0; i < 3; i++) {
      vec3 toT = targets[i] - pos;
      float dist = max(0.1, length(toT));
      vec3 dir = toT / dist;
      float g = 6.67e-11 * 1.0 * 1.0 / (dist * dist);
      vec3 gravity = dir * g * 1.0e7; // scaled
      force += gravity;
      vec3 spinAxis = normalize(vec3(i==2?1.0:0.0, 1.0, i==1?-0.5:0.0));
      vec3 spinning = cross(spinAxis * g * spinStrength, toT);
      force += spinning;
    }
    vel += force * delta;
    float speed = length(vel);
    if (speed > maxSpeed) vel = normalize(vel) * maxSpeed;
    vel *= (1.0 - damping);
    gl_FragColor = vec4(vel, 0.0);
  }
`


