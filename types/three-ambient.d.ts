// Ambient declarations for Three.js experimental submodules
declare module 'three/webgpu' {
  // Re-export core three.js types so TS can resolve classes like Scene, Vector3, etc.
  export * from 'three'
  export const WebGPURenderer: any
}

declare module 'three/tsl' {
  export const float: any
  export const If: any
  export const PI: any
  export const color: any
  export const cos: any
  export const instanceIndex: any
  export const Loop: any
  export const mix: any
  export const mod: any
  export const sin: any
  export const instancedArray: any
  export const Fn: any
  export const uint: any
  export const uniform: any
  export const uniformArray: any
  export const hash: any
  export const vec3: any
  export const vec4: any
  export const SpriteNodeMaterial: any
}

declare module 'three/examples/jsm/controls/OrbitControls.js' {
  export const OrbitControls: any
}

declare module 'three/examples/jsm/controls/TransformControls.js' {
  export const TransformControls: any
}

declare module 'three/examples/jsm/libs/lil-gui.module.min.js' {
  export const GUI: any
}

