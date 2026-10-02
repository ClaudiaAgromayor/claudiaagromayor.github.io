import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* A rhythmic-gymnastics ribbon spiralling upwards: her stand-in until she has a 3D avatar.
   ~2.5 units tall, centred on the origin. */

const TURNS = 2.6, SEGS = 700
function ribbonPath(t, v) {
  const a = t * TURNS * Math.PI * 2
  const r = 0.35 + 0.75 * Math.sin(Math.PI * Math.min(1, t * 1.15)) + 0.12 * Math.sin(t * 17)
  return v.set(Math.cos(a) * r, -1.25 + 2.5 * t + 0.08 * Math.sin(t * 11), Math.sin(a) * r)
}

let shared = null
function ribbonGeometry() {
  if (shared) return shared
  const pos = new Float32Array((SEGS + 1) * 6), idx = []
  for (let i = 0; i < SEGS; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) }
  const p = new THREE.Vector3(), q = new THREE.Vector3(), tan = new THREE.Vector3(), side = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0)
  for (let i = 0; i <= SEGS; i++) {
    const t = i / SEGS
    ribbonPath(t, p); ribbonPath(Math.min(1, t + 0.002), q)
    tan.subVectors(q, p).normalize()
    // the band twists slowly along its length, like silk in the air
    const tw = t * 9
    side.crossVectors(tan, up).normalize().multiplyScalar(Math.cos(tw)).addScaledVector(up, Math.sin(tw) * 0.9)
    side.addScaledVector(tan, -side.dot(tan)).normalize()
    const w = 0.11 * Math.sin(Math.PI * Math.min(1, t * 1.02 + 0.02)) + 0.02
    pos.set([p.x - side.x * w, p.y - side.y * w, p.z - side.z * w, p.x + side.x * w, p.y + side.y * w, p.z + side.z * w], i * 6)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  shared = g
  return g
}

export const silk = (color) => new THREE.MeshPhysicalMaterial({
  color, roughness: 0.3, metalness: 0.05, sheen: 1, sheenColor: '#FFFFFF', sheenRoughness: 0.35,
  clearcoat: 0.5, clearcoatRoughness: 0.25, side: THREE.DoubleSide,
})

export default function Ribbon({ color = '#A6C0F2', material, reduced }) {
  const mat = useMemo(() => material || silk(color), [material, color])
  const ref = useRef()
  useFrame(({ clock }) => { if (!reduced) ref.current.rotation.y = clock.elapsedTime * 0.15 })
  return <mesh ref={ref} geometry={ribbonGeometry()} material={mat} />
}
