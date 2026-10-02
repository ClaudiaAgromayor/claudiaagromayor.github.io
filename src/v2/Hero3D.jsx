import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

/* A pile of things from her life — gymnastics apparatus, a basketball, a surfboard,
   maths symbols, engineering parts, a molecule, a tooth — that drifts together,
   swirls around the cursor and bursts on click. Pointing at one tells its story. */

// What each object stands for (shown under the scene when you point at it)
export const LABELS = {
  hoop: ['Hoop', 'Rhythmic gymnastics — ten years, fifth in the world in 2013'],
  gball: ['Ball', 'Rhythmic gymnastics — competing nationally at twelve'],
  club: ['Clubs', 'Rhythmic gymnastics — discipline under pressure'],
  basketball: ['Basketball', 'French university championship with CentraleSupélec'],
  surfboard: ['Surfboard', 'Surf trips to Normandy and Brittany'],
  sigma: ['Σ', 'Statistics and machine learning — CentraleSupélec and ICAI'],
  pi: ['π', 'Maths competitions since primary school'],
  integral: ['∫', 'Calculus, first year of engineering at ICAI'],
  gear: ['Gear', 'Industrial engineering — ICAI, Madrid'],
  bolt: ['Bolt', 'Electrical engineering — power systems and wind farms'],
  molecule: ['Molecule', 'Drug discovery at the scale of billions — IRIC, Montréal'],
  tooth: ['Tooth', '3D segmentation of root canals — my current research'],
  cap: ['Cap', 'Three degrees: ICAI, CentraleSupélec and Paris Dauphine'],
}

/* ── materials ── */
const MATS = {
  cobalt: new THREE.MeshPhysicalMaterial({ color: '#2340D8', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 }),
  soft: new THREE.MeshPhysicalMaterial({ color: '#4F63E8', roughness: 0.75, sheen: 1, sheenColor: '#AFC0FF' }),
  white: new THREE.MeshStandardMaterial({ color: '#E8EAF1', roughness: 0.5 }),
  black: new THREE.MeshPhysicalMaterial({ color: '#0B0C11', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
}
const basketballMat = (() => {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256
  const x = c.getContext('2d')
  x.fillStyle = '#E8762B'; x.fillRect(0, 0, 512, 256)
  x.strokeStyle = '#1A0E08'; x.lineWidth = 7
  x.beginPath(); x.moveTo(0, 128); x.lineTo(512, 128); x.stroke()
  for (const u of [128, 384]) { x.beginPath(); x.moveTo(u, 0); x.lineTo(u, 256); x.stroke() }
  for (const off of [0, 256]) {
    x.beginPath()
    for (let u = 0; u <= 256; u += 4) x.lineTo(off + u, 128 + Math.sin((u / 256) * Math.PI) * 90 * (off ? -1 : 1))
    x.stroke()
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.65, clearcoat: 0.2 })
})()

/* ── shapes ── */
const extrude = (shape, depth = 0.14, bevel = 0.035) => {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 24 })
  g.center()
  return g
}
const poly = (pts) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)))

function clubGeometry() {
  const pts = [
    [0, -0.62], [0.07, -0.6], [0.1, -0.52], [0.16, -0.3], [0.19, -0.08], [0.16, 0.12],
    [0.08, 0.3], [0.05, 0.45], [0.055, 0.56], [0.07, 0.6], [0.055, 0.64], [0, 0.65],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  return new THREE.LatheGeometry(pts, 48)
}
function gearGeometry() {
  const s = new THREE.Shape(), teeth = 10, w = (Math.PI * 2) / teeth, r1 = 0.34, r2 = 0.45
  for (let k = 0; k < teeth; k++) {
    const a = k * w
    for (const [r, f] of [[r1, 0], [r2, 0.15], [r2, 0.45], [r1, 0.6]]) {
      const x = Math.cos(a + f * w) * r, y = Math.sin(a + f * w) * r
      k === 0 && f === 0 ? s.moveTo(x, y) : s.lineTo(x, y)
    }
  }
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.13, 0, Math.PI * 2, true)
  s.holes.push(hole)
  return extrude(s, 0.16, 0.025)
}
function toothGeometry() {
  // the sticker's tooth outline, flipped so the roots point down
  const k = 0.011, P = (x, y) => [x * k, -y * k]
  const s = new THREE.Shape()
  const c = (a, b, d) => s.bezierCurveTo(...P(...a), ...P(...b), ...P(...d))
  s.moveTo(...P(-34, -24))
  c([-34, -46], [-12, -46], [0, -36]); c([12, -46], [34, -46], [34, -24])
  c([34, -4], [26, 6], [22, 24]); c([18, 44], [6, 44], [4, 26])
  c([2, 14], [-2, 14], [-4, 26]); c([-6, 44], [-18, 44], [-22, 24])
  c([-26, 6], [-34, -4], [-34, -24])
  return extrude(s, 0.26, 0.06)
}
function integralGeometry() {
  const curve = new THREE.CatmullRomCurve3([
    [0.2, 0.42], [0.1, 0.5], [0.02, 0.42], [0, 0.1], [0, -0.1], [-0.02, -0.42], [-0.1, -0.5], [-0.2, -0.42],
  ].map(([x, y]) => new THREE.Vector3(x, y, 0)))
  return new THREE.TubeGeometry(curve, 64, 0.055, 16, false)
}

const GEO = {
  hoop: new THREE.TorusGeometry(0.5, 0.07, 24, 72),
  gball: new THREE.SphereGeometry(0.36, 48, 32),
  club: clubGeometry(),
  basketball: new THREE.SphereGeometry(0.4, 48, 32),
  surfboard: (() => { const g = new THREE.SphereGeometry(0.5, 40, 24); g.scale(0.5, 0.1, 1.55); return g })(),
  sigma: extrude(poly([[-0.3, 0.4], [0.3, 0.4], [0.3, 0.28], [-0.1, 0.28], [0.1, 0], [-0.1, -0.28], [0.3, -0.28], [0.3, -0.4], [-0.3, -0.4], [-0.3, -0.33], [-0.05, 0], [-0.3, 0.33]])),
  pi: extrude(poly([[-0.38, 0.32], [0.4, 0.32], [0.4, 0.2], [0.22, 0.2], [0.22, -0.4], [0.1, -0.4], [0.1, 0.2], [-0.1, 0.2], [-0.16, -0.4], [-0.28, -0.4], [-0.22, 0.2], [-0.38, 0.2]])),
  integral: integralGeometry(),
  gear: gearGeometry(),
  bolt: extrude(poly([[8, -54], [-30, 6], [-4, 6], [-12, 54], [32, -10], [6, -10]].map(([x, y]) => [x * 0.009, -y * 0.009]))),
  tooth: toothGeometry(),
}
const RADIUS = { hoop: 0.56, gball: 0.36, club: 0.42, basketball: 0.4, surfboard: 0.6, sigma: 0.45, pi: 0.45, integral: 0.45, gear: 0.45, bolt: 0.45, molecule: 0.5, tooth: 0.42, cap: 0.46 }

// a molecule: three atoms bonded to a central one
const ATOMS = [[0, 0, 0, 0.16, 'cobalt'], [0.34, 0.22, 0, 0.12, 'white'], [-0.32, 0.2, 0.1, 0.13, 'white'], [0.04, -0.38, -0.06, 0.11, 'black']]
const sphere = new THREE.SphereGeometry(1, 32, 24), stick = new THREE.CylinderGeometry(0.035, 0.035, 1, 12)
function Molecule() {
  return (
    <group>
      {ATOMS.slice(1).map(([x, y, z], i) => {
        const v = new THREE.Vector3(x, y, z), len = v.length()
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize())
        return <mesh key={i} geometry={stick} material={MATS.white} position={v.clone().multiplyScalar(0.5)} quaternion={q} scale={[1, len, 1]} />
      })}
      {ATOMS.map(([x, y, z, r, m], i) => <mesh key={i} geometry={sphere} material={MATS[m]} position={[x, y, z]} scale={r} />)}
    </group>
  )
}
function Cap() {
  return (
    <group rotation={[0.2, 0.5, 0]}>
      <mesh material={MATS.black} position={[0, 0.06, 0]} rotation={[0, Math.PI / 4, 0]}><boxGeometry args={[0.72, 0.04, 0.72]} /></mesh>
      <mesh material={MATS.black} position={[0, -0.08, 0]}><cylinderGeometry args={[0.24, 0.26, 0.22, 32]} /></mesh>
      <mesh material={MATS.cobalt} position={[0.26, -0.06, 0.1]}><sphereGeometry args={[0.04, 16, 12]} /></mesh>
      <mesh material={MATS.cobalt} position={[0.26, -0.18, 0.1]}><cylinderGeometry args={[0.015, 0.015, 0.24, 8]} /></mesh>
    </group>
  )
}

function Shape({ kind, mat }) {
  if (kind === 'molecule') return <Molecule />
  if (kind === 'cap') return <Cap />
  const material = kind === 'basketball' ? basketballMat : kind === 'tooth' ? MATS.white : mat
  return <mesh geometry={GEO[kind]} material={material} />
}

// how many of each, and the colours they cycle through
const MIX = [
  ['hoop', 3, ['cobalt', 'soft', 'white']], ['gball', 2, ['cobalt', 'white']], ['club', 3, ['black', 'white']],
  ['basketball', 2], ['surfboard', 1, ['white']], ['sigma', 2, ['white', 'cobalt']],
  ['pi', 2, ['cobalt', 'white']], ['integral', 2, ['black', 'white']], ['gear', 2, ['white', 'black']],
  ['bolt', 2, ['cobalt', 'white']], ['molecule', 2], ['tooth', 2], ['cap', 1],
]
const rand = (a, b) => a + Math.random() * (b - a)

export default function Hero3D({ reduced, burst, pointerIn, onHover }) {
  const { viewport } = useThree()
  const bodies = useMemo(() => {
    const list = MIX.flatMap(([kind, n, mats]) => Array.from({ length: n }, (_, i) => ({ kind, mat: MATS[(mats || ['white'])[i % (mats || ['white']).length]] })))
    return list.sort(() => Math.random() - 0.5).map((o) => ({
      ...o, r: RADIUS[o.kind],
      p: new THREE.Vector3(rand(-7, 7), rand(-3.5, 3.5), rand(-1.5, 1.5)),
      v: new THREE.Vector3(),
      rot: new THREE.Euler(rand(0, 6), rand(0, 6), rand(0, 6)),
      spin: new THREE.Vector3(rand(-0.4, 0.4), rand(-0.4, 0.4), rand(-0.4, 0.4)),
      scale: rand(1.05, 1.4),
    }))
  }, [])
  const refs = useRef([])
  const mouse = useRef(new THREE.Vector3(99, 99, 0))
  const d = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 30)
    const { pointer } = state
    mouse.current.set(pointer.x * viewport.width / 2, pointer.y * viewport.height / 2, 0)
    const b = burst.current
    burst.current = Math.max(0, b - dt * 2)

    for (const o of bodies) {
      // soft pull towards a wide, flat pile in the middle of the card
      d.set(-o.p.x * 0.3, -o.p.y * 0.85, -o.p.z * 1.4)
      o.v.addScaledVector(d, dt * 2.2)
      // near the cursor they get caught in a swirl, like a ribbon being twirled
      d.subVectors(o.p, mouse.current); d.z *= 0.3
      const dist = d.length(), R = 2.6
      if (pointerIn.current && dist < R) {
        const f = (1 - dist / R) * dt
        o.v.x += -d.y * 9 * f + d.x * 4 * f
        o.v.y += d.x * 9 * f + d.y * 4 * f
        o.v.z += Math.sin(o.p.x * 3) * 2 * f
      }
      // a click sends everything outwards
      if (b > 0) o.v.addScaledVector(o.p.clone().normalize(), b * 30 * dt)
      o.v.multiplyScalar(Math.pow(0.12, dt))
      o.p.addScaledVector(o.v, dt)
    }
    // keep them from overlapping
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], c = bodies[j]
        d.subVectors(a.p, c.p)
        const min = (a.r * a.scale + c.r * c.scale) * 1.02, len = d.length()
        if (len > 0 && len < min) {
          d.multiplyScalar((min - len) / len * 0.5)
          a.p.add(d); c.p.sub(d)
        }
      }
    }
    bodies.forEach((o, i) => {
      const m = refs.current[i]
      if (!m) return
      m.position.copy(o.p)
      if (!reduced) {
        o.rot.x += (o.spin.x + o.v.y * 0.4) * dt
        o.rot.y += (o.spin.y + o.v.x * 0.4) * dt
        o.rot.z += o.spin.z * dt
      }
      m.rotation.copy(o.rot)
    })
  })

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 6]} intensity={2.2} />
      <directionalLight position={[-6, -2, 3]} intensity={0.8} color="#8FA2FF" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 6, 4]} scale={[12, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2} position={[-6, 1, 3]} scale={[2, 8, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={2} position={[6, 1, 3]} scale={[2, 8, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1.2} position={[0, 0, 8]} scale={4} color="#B9C6FF" />
      </Environment>
      {bodies.map((o, i) => (
        <group key={i} ref={(m) => (refs.current[i] = m)} scale={o.scale}
          onPointerOver={(e) => { e.stopPropagation(); onHover(o.kind) }}
          onPointerOut={() => onHover(null)}>
          <Shape kind={o.kind} mat={o.mat} />
        </group>
      ))}
    </>
  )
}
