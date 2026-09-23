import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, useGLTF } from '@react-three/drei'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js'
import * as THREE from 'three'
import { CHAPTERS, AREAS, HOME_SHADE, AVATAR_URL } from './data/chapters'

const N = CHAPTERS.length
const TURNS = 3.2
const FLOOR = -1.25
export const BG = '#1F2A24'
const WHITE = new THREE.Color('#FFFFFF')
const LIGHT = '#F1E8D2'         // the life line: warm paper light

// Scroll position → "chapter coordinate" c: -1 = intro, 0..N-1 = chapters, N = outro
export const offsetToC = (o) => o * (N + 1) - 1
export const cToOffset = (c) => (c + 1) / (N + 1)
export const maxScroll = () => document.documentElement.scrollHeight - innerHeight

// The life line: a helix that widens and rises as time goes on
function helix(t, v = new THREE.Vector3()) {
  const a = t * TURNS * Math.PI * 2 + Math.PI / 2
  const r = 1.15 + 1.35 * t
  return v.set(Math.cos(a) * r, -1.05 + 2.6 * t, Math.sin(a) * r)
}
const cToT = (c) => THREE.MathUtils.clamp((c + 0.5) / N, 0, 1)


function canvasTex(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size
  draw(c.getContext('2d'), size)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}
// grain for a carved-stone surface
const grain = canvasTex(256, (x, s) => {
  const img = x.createImageData(s, s)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 150 + Math.random() * 105
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255
  }
  x.putImageData(img, 0, 0)
})
grain.repeat.set(6, 6)
const soft = canvasTex(128, (x, s) => {
  const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, s, s)
})

const stone = new THREE.MeshStandardMaterial({ color: '#CFC9BC', roughness: 0.96, metalness: 0, bumpMap: grain, bumpScale: 1.6 })

/* Abstract, faceless figure made of metaballs: a gymnast's salute, one arm raised.
   Bones are in world units (feet at y = 0, ~1.9 tall); each bone is a chain of balls. */
const BONES = [
  [[-0.09, 0.05, 0], [-0.075, 0.86, 0], 0.07], [[0.1, 0.05, 0.03], [0.075, 0.86, 0], 0.07], // legs
  [[0, 0.9, 0], [0, 0.95, 0], 0.13],                                                            // hips
  [[0, 0.98, 0], [0, 1.34, 0], 0.125],                                                          // torso
  [[-0.14, 1.33, 0], [0.14, 1.33, 0], 0.07],                                                    // shoulders
  [[0, 1.4, 0], [0, 1.5, 0], 0.05],                                                             // neck
  [[0, 1.61, 0], [0, 1.64, 0], 0.105],                                                          // head
  [[-0.17, 1.32, 0], [-0.25, 0.86, 0.03], 0.045],                                               // arm, down
  [[0.17, 1.34, 0], [0.3, 1.86, 0], 0.045],                                                     // arm, raised
]
const BALLS = BONES.flatMap(([a, b, r]) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b)
  const n = Math.max(1, Math.ceil(A.distanceTo(B) / (r * 0.7)))
  return Array.from({ length: n + 1 }, (_, k) => ({ p: A.clone().lerp(B, k / n), r }))
})
const ISO = 80, SUB = 12

function Figure({ reduced }) {
  const mc = useMemo(() => {
    const m = new MarchingCubes(56, stone, false, false, 20000)
    m.isolation = ISO
    return m
  }, [])
  const build = (time) => {
    mc.reset()
    BALLS.forEach(({ p, r }, i) => {
      const w = reduced ? 0 : Math.sin(time * 0.8 + i * 0.7) * 0.002
      const rc = r / 2 // world → cube units (the cube spans 2 world units)
      mc.addBall(0.5 + p.x / 2 + w, 0.02 + p.y / 2, 0.5 + p.z / 2 - w, rc * rc * (ISO + SUB) * 0.42, SUB)
    })
    mc.update()
  }
  useMemo(() => build(0), []) // eslint-disable-line
  useFrame(({ clock }) => { if (!reduced) build(clock.elapsedTime) })
  // cube local [-1, 1] → feet at y = 0
  return <primitive object={mc} position={[0, 0.96, 0]} />
}

function Avatar({ url }) {
  const { scene } = useGLTF(url)
  const obj = useMemo(() => {
    const s = scene.clone(true)
    const box = new THREE.Box3().setFromObject(s)
    const size = box.getSize(new THREE.Vector3())
    s.scale.setScalar(1.8 / size.y)
    box.setFromObject(s)
    s.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2)
    s.traverse((o) => { if (o.isMesh) o.material = stone })
    return s
  }, [scene])
  return <primitive object={obj} />
}

/* The rock she stands on */
function Rock() {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.42, 6)
    const p = g.attributes.position, v = new THREE.Vector3()
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i)
      const n = 1 + 0.07 * Math.sin(v.x * 9 + v.z * 6) * Math.cos(v.y * 7 - v.x * 4)
      p.setXYZ(i, v.x * n, Math.min(v.y * n * 0.35, 0.015), v.z * n)
    }
    g.computeVertexNormals()
    return g
  }, [])
  return <mesh geometry={geo} material={stone} position={[0, -0.02, 0]} />
}

// Background colours for every stop: intro, each chapter, outro
const SHADES = [HOME_SHADE, ...CHAPTERS.map((c) => c.shade || AREAS[c.area].shade), HOME_SHADE]
  .map((p) => p.map((h) => new THREE.Color(h)))

const NOISE = `
  vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy)); vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }`

/* Full-screen animated gradient, in the spirit of shadergradient: soft warped colour fields + film grain */
const backdrop = new THREE.ShaderMaterial({
  depthTest: false, depthWrite: false,
  uniforms: {
    uTime: { value: 0 }, uAspect: { value: 1 },
    uA: { value: SHADES[0][0].clone() }, uB: { value: SHADES[0][1].clone() }, uC: { value: SHADES[0][2].clone() },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.); }',
  fragmentShader: NOISE + `
    uniform float uTime, uAspect; uniform vec3 uA, uB, uC; varying vec2 vUv;
    void main(){
      vec2 p = (vUv - .5) * vec2(uAspect, 1.);
      float t = uTime * .045;
      vec2 w = p + .35 * vec2(snoise(p * 1.1 + t), snoise(p * 1.1 - t + 4.));
      float f1 = snoise(w * .9 + vec2(t * .8, -t)) * .5 + .5;
      float f2 = snoise(w * 1.7 - vec2(t, t * .6) + 9.) * .5 + .5;
      vec3 col = mix(uA, uB, smoothstep(.15, .85, f1));
      col = mix(col, uC, smoothstep(.62, .98, f2) * .5);
      col *= 1. - .35 * smoothstep(.35, 1.1, length(p * vec2(.8, 1.)));   // vignette
      col = mix(col, uA, smoothstep(.3, .95, abs(p.x / uAspect * 2.)) * .45); // calmer behind the text, both sides
      float grain = fract(sin(dot(vUv * 1000. + uTime, vec2(12.9898, 78.233))) * 43758.5453);
      col += (grain - .5) * .045;
      gl_FragColor = vec4(col, 1.);
      #include <colorspace_fragment>
    }`,
})

/* The life line as a ribbon of light: a bright core, a soft twisting band and a slow shimmer */
const ribbonMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  uniforms: { uProgress: { value: 0 }, uTime: { value: 0 }, uColor: { value: new THREE.Color('#F4E6CC') } },
  vertexShader: `attribute float aT; attribute float aSide; varying float vT; varying float vSide;
    void main(){ vT = aT; vSide = aSide; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: `uniform float uProgress, uTime; uniform vec3 uColor; varying float vT; varying float vSide;
    void main(){
      if (vT > uProgress) discard;
      float edge = 1. - abs(vSide);
      float core = smoothstep(.82, 1., edge);
      float band = pow(edge, 2.2) * .35;
      float age = smoothstep(uProgress - .35, uProgress, vT);                 // brighter near "now"
      float shimmer = .75 + .25 * sin(vT * 180. - uTime * 2.2);
      float tip = smoothstep(uProgress - .004, uProgress, vT);                 // soft end
      float a = (core * (.55 + .45 * age) + band * (.4 + .6 * age) * shimmer) * (1. - tip * .6);
      gl_FragColor = vec4(uColor * a, a);
    }`,
})
function useRibbonGeometry() {
  return useMemo(() => {
    const n = 1600, W = 0.09
    const pos = new Float32Array((n + 1) * 2 * 3), at = new Float32Array((n + 1) * 2), side = new Float32Array((n + 1) * 2)
    const idx = []
    const p = new THREE.Vector3(), q = new THREE.Vector3(), tan = new THREE.Vector3(), rad = new THREE.Vector3(), nrm = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i <= n; i++) {
      const t = i / n
      helix(t, p); helix(Math.min(1, t + 0.001), q); tan.subVectors(q, p).normalize()
      rad.set(p.x, 0, p.z).normalize()
      const tw = t * TURNS * Math.PI * 1.5 // a slow twist along the way
      nrm.copy(up).multiplyScalar(Math.cos(tw)).addScaledVector(rad, Math.sin(tw))
      nrm.addScaledVector(tan, -nrm.dot(tan)).normalize()
      const w = W * (0.6 + 0.4 * t)
      for (let k = 0; k < 2; k++) {
        const sgn = k ? 1 : -1, o = i * 2 + k
        pos[o * 3] = p.x + nrm.x * w * sgn; pos[o * 3 + 1] = p.y + nrm.y * w * sgn; pos[o * 3 + 2] = p.z + nrm.z * w * sgn
        at[o] = t; side[o] = sgn
      }
      if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aT', new THREE.BufferAttribute(at, 1))
    g.setAttribute('aSide', new THREE.BufferAttribute(side, 1))
    g.setIndex(idx)
    return g
  }, [])
}

/* Specks of light drifting along the part of the line already lived */
const dustMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uProgress: { value: 0 }, uTime: { value: 0 }, uPx: { value: 1 } },
  vertexShader: `attribute float aT; attribute vec3 aOff; attribute float aSeed; uniform float uTime, uPx; varying float vA; varying float vT;
    void main(){
      vT = aT;
      vec3 p = position + aOff * (1. + .5 * sin(uTime * .6 + aSeed * 6.28));
      p.y += sin(uTime * .8 + aSeed * 20.) * .03;
      vec4 mv = modelViewMatrix * vec4(p, 1.);
      vA = .35 + .65 * (.5 + .5 * sin(uTime * 2. + aSeed * 40.));
      gl_PointSize = (2. + aSeed * 3.) * uPx * (3.5 / -mv.z);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `uniform float uProgress; varying float vA; varying float vT;
    void main(){
      if (vT > uProgress) discard;
      float d = length(gl_PointCoord - .5); if (d > .5) discard;
      float a = smoothstep(.5, 0., d) * vA * .8;
      gl_FragColor = vec4(vec3(1., .95, .86) * a, a);
    }`,
})
function useDustGeometry() {
  return useMemo(() => {
    const n = 900, pos = new Float32Array(n * 3), off = new Float32Array(n * 3), at = new Float32Array(n), seed = new Float32Array(n), v = new THREE.Vector3()
    for (let i = 0; i < n; i++) {
      const t = Math.random(); helix(t, v)
      pos.set([v.x, v.y, v.z], i * 3)
      off.set([(Math.random() - 0.5) * 0.22, (Math.random() - 0.5) * 0.22, (Math.random() - 0.5) * 0.22], i * 3)
      at[i] = t; seed[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aOff', new THREE.BufferAttribute(off, 3))
    g.setAttribute('aT', new THREE.BufferAttribute(at, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [])
}

export default function Experience({ onActive, reduced }) {
  const offset = useRef(0)
  const figure = useRef()
  const head = useRef()
  const look = useRef(new THREE.Vector3(0, 0, 0))
  const shift = useRef(1)
  const lastActive = useRef(null)
  const tmp = useMemo(() => new THREE.Vector3(), [])

  const ribbonGeo = useRibbonGeometry()
  const dustGeo = useDustGeometry()
  const key = useRef()
  const rim = useRef()
  const ghost = useMemo(() => Array.from({ length: 500 }, (_, k) => helix(k / 499, new THREE.Vector3())), [])

  // Settle on a chapter once scrolling stops — always in the direction the
  // visitor was moving, so a small scroll never bounces back.
  useEffect(() => {
    let timer, last = scrollY, dir = 0
    const onScroll = () => {
      const d = scrollY - last
      if (Math.abs(d) > 0.5) dir = Math.sign(d)
      last = scrollY
      clearTimeout(timer)
      timer = setTimeout(() => {
        const max = maxScroll()
        if (max <= 0) return
        const c = offsetToC(scrollY / max)
        const to = dir > 0 ? Math.ceil(c - 0.08) : dir < 0 ? Math.floor(c + 0.08) : Math.round(c)
        const top = cToOffset(THREE.MathUtils.clamp(to, -1, N)) * max
        if (Math.abs(top - scrollY) > 2) scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
      }, 260)
    }
    addEventListener('scroll', onScroll, { passive: true })
    return () => { clearTimeout(timer); removeEventListener('scroll', onScroll) }
  }, [reduced])

  useFrame((state, dt) => {
    // native page scroll, eased
    const max = maxScroll()
    const target = max > 0 ? THREE.MathUtils.clamp(scrollY / max, 0, 1) : 0
    offset.current = reduced ? target : THREE.MathUtils.damp(offset.current, target, 5, dt)
    const c = offsetToC(offset.current)
    const g = THREE.MathUtils.clamp((c + 1) / (N + 1), 0, 1)
    const t = cToT(c)
    const time = state.clock.elapsedTime

    const act = THREE.MathUtils.clamp(Math.round(c), -1, N)
    if (act !== lastActive.current) { lastActive.current = act; onActive(act) }

    // the figure grows with the story
    const s = 0.38 + 1.07 * (1 - Math.pow(1 - g, 2))
    figure.current.scale.setScalar(s)
    figure.current.rotation.y = -g * Math.PI * 1.5 + (reduced ? 0 : Math.sin(time * 0.3) * 0.05)

    // the ribbon of light draws itself up to "now"
    ribbonMat.uniforms.uProgress.value = t
    ribbonMat.uniforms.uTime.value = time
    dustMat.uniforms.uProgress.value = t
    dustMat.uniforms.uTime.value = reduced ? 0 : time
    dustMat.uniforms.uPx.value = state.viewport.dpr * (state.size.height / 900) * 1.6
    helix(t, tmp)

    // every stop has its own colours: blend towards them as we arrive
    const k0 = THREE.MathUtils.clamp(c + 1, 0, N + 1), i0 = Math.floor(k0), i1 = Math.min(i0 + 1, N + 1), f = k0 - i0
    const u = backdrop.uniforms
    ;['uA', 'uB', 'uC'].forEach((name, j) => u[name].value.copy(SHADES[i0][j]).lerp(SHADES[i1][j], f))
    u.uTime.value = reduced ? 0 : time
    u.uAspect.value = state.size.width / state.size.height
    rim.current.color.copy(u.uC.value)
    key.current.color.copy(u.uB.value).lerp(WHITE, 0.6)
    head.current.position.copy(tmp)
    head.current.visible = c > -0.6
    head.current.material.opacity = reduced ? 0.9 : 0.7 + Math.sin(time * 2) * 0.2

    // camera orbits so the current point of the line faces us
    const ang = Math.atan2(tmp.z, tmp.x) + 0.45
    const dist = 4.6 + 2.8 * g
    const want = new THREE.Vector3(Math.cos(ang) * dist, tmp.y * 0.5 + 0.35 + 0.35 * g, Math.sin(ang) * dist)
    const k = reduced ? 1 : 1 - Math.exp(-2.5 * dt)
    state.camera.position.lerp(want, k)
    look.current.lerp(new THREE.Vector3(tmp.x * 0.3, FLOOR + 0.72 * s + tmp.y * 0.25, tmp.z * 0.3), k)
    state.camera.lookAt(look.current)

    // on the intro and outro screens the big type sits on the left: slide the scene right
    const side = THREE.MathUtils.clamp(Math.max(-c, c - (N - 1)), 0, 1)
    shift.current = THREE.MathUtils.damp(shift.current, state.size.width > 760 ? side : 0, 4, dt)
    const { width: w, height: h } = state.size
    state.camera.setViewOffset(w, h, -w * 0.2 * shift.current, 0, w, h)
  })

  return (
    <>
      <mesh material={backdrop} frustumCulled={false} renderOrder={-1000}>
        <planeGeometry args={[2, 2]} />
      </mesh>

      <hemisphereLight args={['#FFFFFF', '#3A3A3A', 0.9]} />
      <directionalLight ref={key} position={[-4, 3, 3]} intensity={2.4} />
      <directionalLight ref={rim} position={[3, 2, -4]} intensity={1.8} />

      <group ref={figure} position={[0, FLOOR, 0]}>
        {AVATAR_URL ? <Avatar url={AVATAR_URL} /> : <Figure reduced={reduced} />}
        <Rock />
      </group>

      <Line points={ghost} color={LIGHT} transparent opacity={0.12} lineWidth={1} dashed dashSize={0.015} gapSize={0.08} />
      <mesh geometry={ribbonGeo} material={ribbonMat} frustumCulled={false} />
      <points geometry={dustGeo} material={dustMat} frustumCulled={false} />
      {/* the present: a soft glow at the tip of the line */}
      <sprite ref={head} scale={0.5}>
        <spriteMaterial map={soft} color="#FFEBCB" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </>
  )
}
