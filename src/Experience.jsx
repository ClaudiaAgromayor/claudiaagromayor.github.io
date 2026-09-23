import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, useGLTF, Sparkles } from '@react-three/drei'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js'
import * as THREE from 'three'
import { CHAPTERS, AVATAR_URL } from './data/chapters'

const N = CHAPTERS.length
const TURNS = 3.2
const FLOOR = -1.25
const SEG = 1400
export const BG = '#34423A'     // fog / horizon: deep moss
const SKY_TOP = '#5E6E63'
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

class HelixCurve extends THREE.Curve {
  getPoint(t, target = new THREE.Vector3()) { return helix(t, target) }
}

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

/* Rolling hills that rise away from a still pool in the middle */
function Land() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(60, 60, 220, 220)
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z)
      const hills = Math.sin(x * 0.35) * Math.cos(z * 0.28) * 1.1 + Math.sin((x + z) * 0.17 + 1.3) * 1.6 + Math.sin(x * 0.9 - z * 0.7) * 0.25
      const rise = THREE.MathUtils.smoothstep(r, 5, 18)
      p.setY(i, -0.02 + (hills + 1.2) * rise * 0.7)
    }
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geo} position={[0, FLOOR, 0]}>
      <meshStandardMaterial color="#4B5E50" roughness={1} />
    </mesh>
  )
}

const sky = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color(SKY_TOP) }, bottom: { value: new THREE.Color(BG) } },
  vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader: `uniform vec3 top, bottom; varying vec3 vP;
    void main(){
      float h = smoothstep(-.05, .6, normalize(vP).y);
      gl_FragColor = vec4(mix(bottom, top, h), 1.);
      #include <colorspace_fragment>
    }`,
})

/* Slow drifting wisps of mist */
function Mist({ reduced }) {
  const wisps = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    a: (i / 16) * Math.PI * 2 + Math.random(), r: 3 + Math.random() * 6, y: FLOOR + 0.2 + Math.random() * 1.2,
    s: 4 + Math.random() * 6, o: 0.06 + Math.random() * 0.08, v: 0.01 + Math.random() * 0.02,
  })), [])
  const refs = useRef([])
  useFrame(({ clock }) => {
    if (reduced) return
    const t = clock.elapsedTime
    wisps.forEach((w, i) => { const m = refs.current[i]; if (m) m.position.set(Math.cos(w.a + t * w.v) * w.r, w.y, Math.sin(w.a + t * w.v) * w.r) })
  })
  return wisps.map((w, i) => (
    <sprite key={i} ref={(m) => (refs.current[i] = m)} position={[Math.cos(w.a) * w.r, w.y, Math.sin(w.a) * w.r]} scale={[w.s, w.s * 0.45, 1]}>
      <spriteMaterial map={soft} color="#C9D2C6" transparent opacity={w.o} depthWrite={false} />
    </sprite>
  ))
}

export default function Experience({ onActive, reduced }) {
  const offset = useRef(0)
  const figure = useRef()
  const head = useRef()
  const look = useRef(new THREE.Vector3(0, 0, 0))
  const shift = useRef(1)
  const lastActive = useRef(null)
  const tmp = useMemo(() => new THREE.Vector3(), [])

  const tubeGeo = useMemo(() => {
    const g = new THREE.TubeGeometry(new HelixCurve(), SEG, 0.006, 6, false)
    g.setDrawRange(0, 0)
    return g
  }, [])
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

    // the line of light draws itself up to "now"
    tubeGeo.setDrawRange(0, Math.floor(t * SEG) * 6 * 6)
    helix(t, tmp)
    head.current.position.copy(tmp)
    head.current.visible = c > -0.6
    head.current.material.opacity = reduced ? 0.9 : 0.75 + Math.sin(time * 2) * 0.15

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
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 5, 24]} />
      <mesh material={sky}><sphereGeometry args={[30, 32, 16]} /></mesh>

      <hemisphereLight args={['#B4C4B7', '#3A4A3F', 1.3]} />
      <directionalLight position={[-4, 2.6, 2.5]} intensity={2.6} color="#FFD7A3" />
      <directionalLight position={[3, 3, -4]} intensity={0.6} color="#BFD3C8" />

      <Land />

      <group ref={figure} position={[0, FLOOR, 0]}>
        {AVATAR_URL ? <Avatar url={AVATAR_URL} /> : <Figure reduced={reduced} />}
        <Rock />
      </group>

      <Line points={ghost} color={LIGHT} transparent opacity={0.14} lineWidth={1} dashed dashSize={0.02} gapSize={0.07} />
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial color={LIGHT} toneMapped={false} />
      </mesh>
      {/* the present: a soft glow at the tip of the line */}
      <sprite ref={head} scale={0.32}>
        <spriteMaterial map={soft} color="#FFE9C4" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      <Mist reduced={reduced} />
      <Sparkles count={70} scale={[10, 4, 10]} position={[0, 0, 0]} size={1.3} speed={reduced ? 0 : 0.12} opacity={0.45} color="#EDE4CC" />
    </>
  )
}
