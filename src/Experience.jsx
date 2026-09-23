import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, Line, Sparkles, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { CHAPTERS, AREAS, AVATAR_URL, AVATAR_CLAY } from './data/chapters'

const N = CHAPTERS.length
const TURNS = 3.2
const FLOOR = -1.25
const SEG = 1400
const RAD = 8

// Scroll position → "chapter coordinate" c: -1 = intro, 0..N-1 = chapters, N = outro
export const offsetToC = (o) => o * (N + 1) - 1
export const cToOffset = (c) => (c + 1) / (N + 1)

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

const areaColor = (i) => new THREE.Color(AREAS[CHAPTERS[THREE.MathUtils.clamp(i, 0, N - 1)].area].color)
function colorAt(t) {
  const k = THREE.MathUtils.clamp(t * N - 0.5, 0, N - 1)
  const i = Math.floor(k)
  return areaColor(i).lerp(areaColor(i + 1), k - i)
}

function glowTexture() {
  const s = 128, c = document.createElement('canvas')
  c.width = c.height = s
  const x = c.getContext('2d')
  const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,.45)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.fillRect(0, 0, s, s)
  return new THREE.CanvasTexture(c)
}

const clay = new THREE.MeshStandardMaterial({ color: '#D8D2C8', roughness: 0.62, metalness: 0 })

/* Placeholder figure until a real avatar is set in data/chapters.js */
function Mannequin() {
  const body = useMemo(() => {
    const pts = [
      [0.001, 0], [0.13, 0], [0.14, 0.03], [0.1, 0.1], [0.085, 0.5], [0.1, 0.78],
      [0.15, 0.95], [0.19, 1.15], [0.2, 1.27], [0.15, 1.38], [0.07, 1.46], [0.05, 1.52], [0.001, 1.53],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 64)
  }, [])
  return (
    <group>
      <mesh geometry={body} material={clay} castShadow />
      <mesh position={[0, 1.67, 0]} material={clay} castShadow>
        <sphereGeometry args={[0.12, 48, 48]} />
      </mesh>
    </group>
  )
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
    s.traverse((o) => { if (o.isMesh) { if (AVATAR_CLAY) o.material = clay; o.castShadow = true } })
    return s
  }, [scene])
  return <primitive object={obj} />
}

export default function Experience({ elRef, onActive, onSelect, reduced }) {
  const scroll = useScroll()
  const figure = useRef()
  const tube = useRef()
  const head = useRef()
  const nodes = useRef([])
  const halos = useRef([])
  const look = useRef(new THREE.Vector3(0, 0, 0))
  const lastActive = useRef(null)
  const glow = useMemo(glowTexture, [])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  const tubeGeo = useMemo(() => {
    const g = new THREE.TubeGeometry(new HelixCurve(), SEG, 0.014, RAD, false)
    const col = new Float32Array(g.attributes.position.count * 3)
    for (let j = 0; j <= SEG; j++) {
      const c = colorAt(j / SEG)
      for (let i = 0; i <= RAD; i++) c.toArray(col, (j * (RAD + 1) + i) * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    g.setDrawRange(0, 0)
    return g
  }, [])
  const ghost = useMemo(() => Array.from({ length: 500 }, (_, k) => helix(k / 499, new THREE.Vector3())), [])
  const rings = useMemo(() => [0.7, 1.2, 1.7, 2.2, 2.7, 3.2].map((r) =>
    Array.from({ length: 129 }, (_, k) => { const a = (k / 128) * Math.PI * 2; return [Math.cos(a) * r, FLOOR, Math.sin(a) * r] })), [])
  const nodePos = useMemo(() => CHAPTERS.map((_, i) => helix(chapterT(i), new THREE.Vector3())), [])

  // expose the scroll container and snap to the nearest chapter when scrolling stops
  useEffect(() => {
    const el = scroll.el
    elRef.current = el
    let timer
    const snap = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const max = el.scrollHeight - el.clientHeight
        if (max <= 0) return
        const c = Math.round(offsetToC(el.scrollTop / max))
        const to = cToOffset(c) * max
        if (Math.abs(to - el.scrollTop) > 2) el.scrollTo({ top: to, behavior: reduced ? 'auto' : 'smooth' })
      }, 200)
    }
    el.addEventListener('scroll', snap, { passive: true })
    return () => { clearTimeout(timer); el.removeEventListener('scroll', snap) }
  }, [scroll.el, elRef, reduced])

  useFrame((state, dt) => {
    const c = offsetToC(scroll.offset)
    const g = THREE.MathUtils.clamp((c + 1) / (N + 1), 0, 1)
    const t = cToT(c)
    const time = state.clock.elapsedTime

    const act = THREE.MathUtils.clamp(Math.round(c), -1, N)
    if (act !== lastActive.current) { lastActive.current = act; onActive(act) }

    // the figure grows with the story
    const s = 0.38 + 1.07 * (1 - Math.pow(1 - g, 2))
    figure.current.scale.setScalar(s * (reduced ? 1 : 1 + Math.sin(time * 1.2) * 0.004))
    figure.current.rotation.y = -g * Math.PI * 1.5

    // the line draws itself up to "now"
    tubeGeo.setDrawRange(0, Math.floor(t * SEG) * RAD * 6)
    helix(t, tmp)
    head.current.position.copy(tmp)
    head.current.visible = c > -0.6

    nodes.current.forEach((m, i) => {
      if (!m) return
      const reached = i <= c + 0.02
      const isA = i === act
      const k = reached ? (isA ? 1.9 : 1.15) : 0.6
      m.scale.setScalar(THREE.MathUtils.damp(m.scale.x, k, 6, dt))
      m.material.color.set(reached ? AREAS[CHAPTERS[i].area].color : '#4A4E57')
      const h = halos.current[i]
      h.material.opacity = THREE.MathUtils.damp(h.material.opacity, isA ? 0.9 : reached ? 0.35 : 0, 6, dt)
      h.scale.setScalar((isA ? 0.55 : 0.32) * (isA && !reduced ? 1 + Math.sin(time * 3) * 0.1 : 1))
    })

    // camera orbits so the current point of the line faces us
    const ang = Math.atan2(tmp.z, tmp.x) + 0.6
    const dist = 3.7 + 2.4 * g
    const want = new THREE.Vector3(Math.cos(ang) * dist, tmp.y * 0.55 + 0.55 + 0.35 * g, Math.sin(ang) * dist)
    const k = reduced ? 1 : 1 - Math.exp(-3 * dt)
    state.camera.position.lerp(want, k)
    look.current.lerp(new THREE.Vector3(tmp.x * 0.3, FLOOR + 1.5 * s * 0.8 * 0.6 + tmp.y * 0.25, tmp.z * 0.3), k)
    state.camera.lookAt(look.current)
  })

  return (
    <>
      <color attach="background" args={['#0A0B0D']} />
      <fog attach="fog" args={['#0A0B0D', 6, 14]} />
      <hemisphereLight args={['#bfc6d6', '#0A0B0D', 0.5]} />
      <directionalLight position={[3, 5, 3]} intensity={1.8} color="#FFF1E2" />
      <directionalLight position={[-4, 1.5, -3]} intensity={1.1} color="#5FB3A5" />
      <directionalLight position={[4, 0.5, -3]} intensity={0.9} color="#9D90E0" />

      <group ref={figure} position={[0, FLOOR, 0]}>
        {AVATAR_URL ? <Avatar url={AVATAR_URL} /> : <Mannequin />}
      </group>

      {/* floor: faint concentric rings, like a sundial */}
      {rings.map((pts, i) => <Line key={i} points={pts} color="#ECEAE4" transparent opacity={0.05} lineWidth={1} />)}

      <Line points={ghost} color="#ECEAE4" transparent opacity={0.12} lineWidth={1} dashed dashSize={0.04} gapSize={0.08} />
      <mesh ref={tube} geometry={tubeGeo}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>

      {nodePos.map((p, i) => (
        <group key={i} position={p}>
          <mesh
            ref={(m) => (nodes.current[i] = m)}
            onClick={(e) => { e.stopPropagation(); onSelect(i) }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = '')}
          >
            <sphereGeometry args={[0.045, 24, 24]} />
            <meshBasicMaterial toneMapped={false} />
          </mesh>
          <sprite ref={(h) => (halos.current[i] = h)}>
            <spriteMaterial map={glow} color={AREAS[CHAPTERS[i].area].color} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </group>
      ))}

      <sprite ref={head} scale={0.35}>
        <spriteMaterial map={glow} color="#FFF6EA" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      <Sparkles count={160} scale={[9, 5, 9]} size={1.4} speed={reduced ? 0 : 0.15} opacity={0.35} color="#ECEAE4" />
    </>
  )
}
