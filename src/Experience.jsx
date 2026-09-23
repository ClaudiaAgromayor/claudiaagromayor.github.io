import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, useGLTF, Billboard } from '@react-three/drei'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js'
import * as THREE from 'three'
import { CHAPTERS, AREAS, AVATAR_URL } from './data/chapters'

const N = CHAPTERS.length
const TURNS = 3.2
const FLOOR = -1.25
const SEG = 1400
const RAD = 6
export const BG = '#F1F1EF'
const INK = '#141414'

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
const chapterT = (i) => (i + 0.5) / N
const cToT = (c) => THREE.MathUtils.clamp((c + 0.5) / N, 0, 1)

class HelixCurve extends THREE.Curve {
  getPoint(t, target = new THREE.Vector3()) { return helix(t, target) }
}

const pearl = new THREE.MeshStandardMaterial({ color: '#ECECE8', roughness: 0.9, metalness: 0 })

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
    const m = new MarchingCubes(56, pearl, false, false, 20000)
    m.isolation = ISO
    return m
  }, [])
  const build = (time) => {
    mc.reset()
    BALLS.forEach(({ p, r }, i) => {
      const w = reduced ? 0 : Math.sin(time * 1.6 + i * 0.7) * 0.004
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
    s.traverse((o) => { if (o.isMesh) o.material = pearl })
    return s
  }, [scene])
  return <primitive object={obj} />
}

// soft blob shadow under the figure
const shadowTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(40,48,58,.9)'); g.addColorStop(0.35, 'rgba(40,48,58,.35)'); g.addColorStop(1, 'rgba(40,48,58,0)')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
})()


export default function Experience({ onActive, onSelect, reduced }) {
  const offset = useRef(0)
  const figure = useRef()
  const head = useRef()
  const nodes = useRef([])
  const rings = useRef([])
  const look = useRef(new THREE.Vector3(0, 0, 0))
  const shift = useRef(1)
  const lastActive = useRef(null)
  const tmp = useMemo(() => new THREE.Vector3(), [])

  const tubeGeo = useMemo(() => {
    const g = new THREE.TubeGeometry(new HelixCurve(), SEG, 0.0045, RAD, false)
    g.setDrawRange(0, 0)
    return g
  }, [])
  const ghost = useMemo(() => Array.from({ length: 500 }, (_, k) => helix(k / 499, new THREE.Vector3())), [])
  const nodePos = useMemo(() => CHAPTERS.map((_, i) => helix(chapterT(i), new THREE.Vector3())), [])

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
    figure.current.rotation.y = -g * Math.PI * 1.5 + (reduced ? 0 : Math.sin(time * 0.4) * 0.08)

    // the line draws itself up to "now"
    tubeGeo.setDrawRange(0, Math.floor(t * SEG) * RAD * 6)
    helix(t, tmp)
    head.current.position.copy(tmp)
    head.current.visible = c > -0.6

    nodes.current.forEach((m, i) => {
      if (!m) return
      const reached = i <= c + 0.02
      const isA = i === act
      m.scale.setScalar(THREE.MathUtils.damp(m.scale.x, isA ? 1.5 : 1, 6, dt))
      m.material.color.set(reached ? INK : '#BDBDB8')
      const r = rings.current[i]
      r.material.opacity = THREE.MathUtils.damp(r.material.opacity, isA ? 1 : 0, 6, dt)
    })

    // camera orbits so the current point of the line faces us
    const ang = Math.atan2(tmp.z, tmp.x) + 0.45
    const dist = 4.6 + 2.8 * g
    const want = new THREE.Vector3(Math.cos(ang) * dist, tmp.y * 0.55 + 0.55 + 0.35 * g, Math.sin(ang) * dist)
    const k = reduced ? 1 : 1 - Math.exp(-3 * dt)
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
      <fog attach="fog" args={[BG, 7, 16]} />
      <hemisphereLight args={['#FFFFFF', '#DADAD5', 2.2]} />
      <directionalLight position={[3, 5, 2]} intensity={2} />

      <group ref={figure} position={[0, FLOOR, 0]}>
        {AVATAR_URL ? <Avatar url={AVATAR_URL} /> : <Figure reduced={reduced} />}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 0]} renderOrder={-1}>
          <planeGeometry args={[1.3, 1.3]} />
          <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0.3} />
        </mesh>
      </group>

      <Line points={ghost} color={INK} transparent opacity={0.12} lineWidth={1} dashed dashSize={0.02} gapSize={0.06} />
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial color={INK} />
      </mesh>

      {nodePos.map((p, i) => (
        <group key={i} position={p}>
          <mesh
            ref={(m) => (nodes.current[i] = m)}
            onClick={(e) => { e.stopPropagation(); onSelect(i) }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = '')}
          >
            <sphereGeometry args={[0.022, 16, 16]} />
            <meshBasicMaterial />
          </mesh>
          <Billboard>
            <mesh ref={(r) => (rings.current[i] = r)}>
              <ringGeometry args={[0.07, 0.075, 64]} />
              <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} />
            </mesh>
          </Billboard>
        </group>
      ))}

      <mesh ref={head}>
        <sphereGeometry args={[0.014, 16, 16]} />
        <meshBasicMaterial color={INK} />
      </mesh>
    </>
  )
}
