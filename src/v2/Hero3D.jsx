import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

/* A pile of rhythmic-gymnastics apparatus — hoops, balls and clubs — that
   drifts together, moves out of the way of the cursor and bursts on click. */

const MATS = {
  cobalt: new THREE.MeshPhysicalMaterial({ color: '#2340D8', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 }),
  soft: new THREE.MeshPhysicalMaterial({ color: '#4F63E8', roughness: 0.75, sheen: 1, sheenColor: '#AFC0FF' }),
  white: new THREE.MeshStandardMaterial({ color: '#E8EAF1', roughness: 0.55 }),
  black: new THREE.MeshPhysicalMaterial({ color: '#0B0C11', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
}
const MAT_ORDER = ['cobalt', 'white', 'black', 'soft', 'cobalt', 'black', 'white']

function clubGeometry() {
  const pts = [
    [0, -0.62], [0.07, -0.6], [0.1, -0.52], [0.16, -0.3], [0.19, -0.08], [0.16, 0.12],
    [0.08, 0.3], [0.05, 0.45], [0.055, 0.56], [0.07, 0.6], [0.055, 0.64], [0, 0.65],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  return new THREE.LatheGeometry(pts, 48)
}
const GEOS = {
  hoop: [new THREE.TorusGeometry(0.5, 0.075, 24, 72), 0.56],
  ball: [new THREE.SphereGeometry(0.38, 48, 32), 0.38],
  club: [clubGeometry(), 0.42],
}
const KINDS = ['hoop', 'ball', 'club', 'hoop', 'ball', 'club', 'ball']

const rand = (a, b) => a + Math.random() * (b - a)

export default function Hero3D({ reduced }) {
  const { viewport } = useThree()
  const bodies = useMemo(() => Array.from({ length: 42 }, (_, i) => {
    const kind = KINDS[i % KINDS.length]
    return {
      kind, mat: MATS[MAT_ORDER[i % MAT_ORDER.length]], r: GEOS[kind][1],
      p: new THREE.Vector3(rand(-7, 7), rand(-3.5, 3.5), rand(-1.5, 1.5)),
      v: new THREE.Vector3(),
      rot: new THREE.Euler(rand(0, 6), rand(0, 6), rand(0, 6)),
      spin: new THREE.Vector3(rand(-0.4, 0.4), rand(-0.4, 0.4), rand(-0.4, 0.4)),
      scale: rand(1.05, 1.55),
    }
  }), [])
  const refs = useRef([])
  const mouse = useRef(new THREE.Vector3(99, 99, 0))
  const burst = useRef(0)
  const d = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 30)
    const { pointer } = state
    // pointer on the z = 0 plane (camera looks straight down -z)
    mouse.current.set(pointer.x * viewport.width / 2, pointer.y * viewport.height / 2, 0)
    const b = burst.current
    burst.current = Math.max(0, b - dt * 2)

    for (const o of bodies) {
      // soft pull towards a wide, flat pile in the middle of the card
      d.set(-o.p.x * 0.35, -o.p.y * 0.9, -o.p.z * 1.4)
      o.v.addScaledVector(d, dt * 2.2)
      // push away from the cursor
      d.subVectors(o.p, mouse.current); d.z *= 0.3
      const dist = d.length(), R = 2.1
      if (dist < R) o.v.addScaledVector(d.normalize(), (1 - dist / R) * 26 * dt)
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
        const min = (a.r * a.scale + c.r * c.scale) * 0.92, len = d.length()
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
      <mesh visible={false} scale={[40, 40, 1]} onPointerDown={() => { burst.current = 1 }}>
        <planeGeometry />
      </mesh>
      {bodies.map((o, i) => (
        <mesh key={i} ref={(m) => (refs.current[i] = m)} geometry={GEOS[o.kind][0]} material={o.mat} scale={o.scale} />
      ))}
    </>
  )
}
