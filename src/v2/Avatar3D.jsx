import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment, Lightformer } from '@react-three/drei'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'
import { AVATAR_URL } from '../data/chapters'

/* Her avatar. Until a real model is set (AVATAR_URL in src/data/chapters.js)
   a faceless figure stands in, arms open like someone floating in zero gravity. */

export const suit = new THREE.MeshPhysicalMaterial({ color: '#E9ECF3', roughness: 0.42, clearcoat: 0.3, sheen: 0.6, sheenColor: '#C9D3FF' })
const smooth = (x, a, b) => THREE.MathUtils.smoothstep(x, a, b)

// bones in world units, figure ~1.9 tall, centred on its waist
const BONES = [
  [[-0.1, -0.06, 0], [-0.2, -0.5, 0.14], 0.08], [[-0.2, -0.5, 0.14], [-0.17, -0.95, 0.02], 0.068], // left leg, knee forward
  [[0.1, -0.06, 0], [0.22, -0.46, -0.06], 0.08], [[0.22, -0.46, -0.06], [0.3, -0.84, -0.26], 0.068], // right leg, drifting back
  [[0, -0.05, 0], [0, 0.02, 0], 0.14],                                                              // hips
  [[0, 0.05, 0], [0, 0.42, 0.02], 0.13],                                                            // torso
  [[-0.16, 0.42, 0.02], [0.16, 0.42, 0.02], 0.075],                                                 // shoulders
  [[0, 0.5, 0.02], [0, 0.58, 0.04], 0.055],                                                         // neck
  [[0, 0.71, 0.07], [0, 0.74, 0.08], 0.115],                                                        // head, tilted up
  [[-0.2, 0.42, 0.02], [-0.46, 0.24, 0.14], 0.055], [[-0.46, 0.24, 0.14], [-0.64, 0.46, 0.26], 0.048], // arms: elbows down, hands up
  [[0.2, 0.42, 0.02], [0.47, 0.27, 0.1], 0.055], [[0.47, 0.27, 0.1], [0.68, 0.5, 0.18], 0.048],
]
const BALLS = BONES.flatMap(([a, b, r]) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b)
  const n = Math.max(1, Math.ceil(A.distanceTo(B) / (r * 0.7)))
  return Array.from({ length: n + 1 }, (_, k) => ({ p: A.clone().lerp(B, k / n), r }))
})

function StandIn({ material = suit }) {
  const mc = useMemo(() => {
    const ISO = 80, SUB = 12, SIZE = 2.2
    const m = new MarchingCubes(72, material, false, false, 40000)
    m.isolation = ISO
    m.reset()
    BALLS.forEach(({ p, r }) => {
      const rc = r / SIZE
      m.addBall(0.5 + p.x / SIZE, 0.5 + p.y / SIZE, 0.5 + p.z / SIZE, rc * rc * (ISO + SUB) * 0.42, SUB)
    })
    m.update()
    m.scale.setScalar(SIZE / 2)
    return m
  }, [material])
  return <primitive object={mc} />
}

function Model({ url, material }) {
  const { scene, animations } = useGLTF(url)
  const ref = useRef()
  const obj = useMemo(() => {
    const s = cloneSkinned(scene)
    const box = new THREE.Box3().setFromObject(s)
    const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3())
    const k = 1.9 / size.y
    s.scale.setScalar(k)
    s.position.set(-c.x * k, -c.y * k, -c.z * k)
    if (material) s.traverse((o) => { if (o.isMesh) o.material = material })
    return s
  }, [scene, material])
  const { actions, names } = useAnimations(animations, ref)
  useEffect(() => { if (names[0]) actions[names[0]]?.reset().fadeIn(0.5).play() }, [actions, names])
  return <group ref={ref}><primitive object={obj} /></group>
}

/** The figure itself: her model if there is one, the stand-in otherwise. */
export function Figure({ material }) {
  return AVATAR_URL ? <Model url={AVATAR_URL} material={material} /> : <StandIn material={material} />
}

export function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[2, 4, 5]} intensity={2.4} />
      <directionalLight position={[-4, 1, -2]} intensity={1.6} color="#7F95FF" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} position={[0, 5, 3]} scale={[8, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="ring" intensity={1.5} position={[-4, 0, 2]} scale={3} color="#9DB0FF" />
      </Environment>
    </>
  )
}

/* ── the data tunnel she dives into (blue, made of light) ── */
const TL = 44, TH = 2.3
function useTunnelMesh(seed) {
  return useMemo(() => {
    const n = 520
    const geo = new THREE.BoxGeometry(1, 1, 1)
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    const mesh = new THREE.InstancedMesh(geo, mat, n)
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color()
    const palette = ['#2340D8', '#3E66FF', '#7FD8FF', '#B9E6FF', '#FFFFFF']
    let r = seed
    const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < n; i++) {
      const wall = Math.floor(rnd() * 4), along = (rnd() * 2 - 1) * TH, out = TH + rnd() * 0.9
      const z = -rnd() * TL, len = 0.2 + rnd() * rnd() * 4
      const across = 0.02 + rnd() * rnd() * 0.9, thick = 0.02 + rnd() * 0.05
      if (wall < 2) { p.set(along, wall ? out : -out, z); s.set(across, thick, len) } else { p.set(wall === 2 ? out : -out, along, z); s.set(thick, across, len) }
      m.compose(p, q, s); mesh.setMatrixAt(i, m)
      c.set(palette[Math.floor(rnd() * rnd() * palette.length)]).multiplyScalar(0.35 + rnd() * 0.9)
      mesh.setColorAt(i, c)
    }
    return mesh
  }, [seed])
}

function Tunnel({ progress, reduced }) {
  const group = useRef()
  const a = useTunnelMesh(11), b = useTunnelMesh(29)
  const sparks = useMemo(() => {
    const n = 500, pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) pos.set([(Math.random() * 2 - 1) * TH * 1.1, (Math.random() * 2 - 1) * TH * 1.1, -Math.random() * TL * 2], i * 3)
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return new THREE.Points(g, new THREE.PointsMaterial({ color: '#BFE6FF', size: 0.035, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }))
  }, [])
  const travel = useRef(0)
  useFrame(({ clock }, dt) => {
    const p = progress.current
    const k = smooth(p, 0.48, 0.62) * (1 - smooth(p, 0.94, 1))
    a.material.opacity = b.material.opacity = k
    sparks.material.opacity = k * 0.9
    group.current.visible = k > 0.001
    // speed comes from scrolling, plus a gentle drift of its own
    travel.current = p * 70 + (reduced ? 0 : clock.elapsedTime * 1.5)
    group.current.position.z = travel.current % TL
    group.current.rotation.z = reduced ? 0 : Math.sin(clock.elapsedTime * 0.2) * 0.05
  })
  return (
    <group ref={group}>
      <primitive object={a} />
      <primitive object={b} position={[0, 0, -TL]} />
      <primitive object={sparks} />
    </group>
  )
}

const ghost = new THREE.MeshBasicMaterial({ color: '#8FC9FF', transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })

/** Finale: she rises into view, then dives into a tunnel of data. */
export default function Avatar3D({ progress, reduced }) {
  const g = useRef(), ghosts = useRef()
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const p = progress.current
    const rise = smooth(p, 0.04, 0.4)
    const dive = smooth(p, 0.5, 0.95)
    const bob = reduced ? 0 : Math.sin(t * 0.8) * 0.08
    const y = THREE.MathUtils.lerp(-3.4, -0.1, rise) + dive * 0.2 + bob
    const z = -dive * 7
    g.current.position.y = THREE.MathUtils.damp(g.current.position.y, y, 6, dt)
    g.current.position.z = THREE.MathUtils.damp(g.current.position.z, z, 6, dt)
    g.current.rotation.y = (reduced ? 0 : Math.sin(t * 0.25) * 0.35) + p * 0.6
    g.current.rotation.z = -0.18 + (reduced ? 0 : Math.sin(t * 0.5) * 0.06) - dive * 0.5
    g.current.rotation.x = (reduced ? 0 : 0.12 + Math.sin(t * 0.4) * 0.05) + dive * 0.9
    g.current.scale.setScalar(THREE.MathUtils.lerp(1, 1.2, rise))
    // two translucent echoes of her drift inside the tunnel
    const e = smooth(p, 0.6, 0.75) * (1 - smooth(p, 0.93, 1))
    ghosts.current.visible = e > 0.01
    ghosts.current.children.forEach((c, i) => {
      c.position.set(i ? 1.3 : -1.4, (i ? -0.6 : 0.9) + Math.sin(t * 0.6 + i) * 0.15, -5 - i * 3 + p * 3)
      c.rotation.set(t * 0.2 + i, t * 0.15, i ? 1.2 : -0.6)
    })
    ghost.opacity = 0.2 * e
  })
  return (
    <>
      <StudioLights />
      <fog attach="fog" args={['#04050A', 6, 30]} />
      <Tunnel progress={progress} reduced={reduced} />
      <group ref={g} position={[0, -3.4, 0]}><Figure /></group>
      <group ref={ghosts}>
        <group scale={0.8}><Figure material={ghost} /></group>
        <group scale={0.7}><Figure material={ghost} /></group>
      </group>
    </>
  )
}

/** A floating figure for smaller scenes (the tablet, the call to action). */
export function Floating({ reduced, sway = 1 }) {
  const g = useRef()
  useFrame(({ clock, pointer }) => {
    const t = reduced ? 0 : clock.elapsedTime
    g.current.position.y = Math.sin(t * 0.7) * 0.08
    g.current.rotation.y = Math.sin(t * 0.3) * 0.3 * sway + pointer.x * 0.35
    g.current.rotation.x = 0.08 - pointer.y * 0.12
    g.current.rotation.z = -0.12 + Math.sin(t * 0.5) * 0.05
  })
  return <group ref={g}><Figure /></group>
}
