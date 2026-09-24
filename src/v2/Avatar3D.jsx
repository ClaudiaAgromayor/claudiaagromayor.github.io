import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment, Lightformer } from '@react-three/drei'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js'
import * as THREE from 'three'
import { AVATAR_URL } from '../data/chapters'

/* Her avatar floating in the dark, rising into view as the section scrolls.
   Until a real model is set (AVATAR_URL in src/data/chapters.js) a faceless
   figure stands in, arms open like someone floating in zero gravity. */

const suit = new THREE.MeshPhysicalMaterial({ color: '#E9ECF3', roughness: 0.42, clearcoat: 0.3, sheen: 0.6, sheenColor: '#C9D3FF' })

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

function StandIn() {
  const mc = useMemo(() => {
    const ISO = 80, SUB = 12, SIZE = 2.2
    const m = new MarchingCubes(72, suit, false, false, 40000)
    m.isolation = ISO
    m.reset()
    BALLS.forEach(({ p, r }) => {
      const rc = r / SIZE
      m.addBall(0.5 + p.x / SIZE, 0.5 + p.y / SIZE, 0.5 + p.z / SIZE, rc * rc * (ISO + SUB) * 0.42, SUB)
    })
    m.update()
    m.scale.setScalar(SIZE / 2)
    return m
  }, [])
  return <primitive object={mc} />
}

function Model({ url }) {
  const { scene, animations } = useGLTF(url)
  const ref = useRef()
  const obj = useMemo(() => {
    const s = scene.clone(true)
    const box = new THREE.Box3().setFromObject(s)
    const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3())
    const k = 1.9 / size.y
    s.scale.setScalar(k)
    s.position.set(-c.x * k, -c.y * k, -c.z * k)
    s.traverse((o) => { if (o.isMesh) { o.castShadow = true } })
    return s
  }, [scene])
  const { actions, names } = useAnimations(animations, ref)
  useEffect(() => { if (names[0]) actions[names[0]]?.reset().fadeIn(0.5).play() }, [actions, names])
  return <group ref={ref}><primitive object={obj} /></group>
}

export default function Avatar3D({ progress, reduced }) {
  const g = useRef()
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const p = progress.current
    // rises from below the frame into the middle, then keeps floating
    const rise = THREE.MathUtils.smoothstep(p, 0.05, 0.6)
    const end = THREE.MathUtils.smoothstep(p, 0.66, 0.95) // make room for the contact details
    const y = THREE.MathUtils.lerp(-3.4, -0.1, rise) + end * 0.45 + (reduced ? 0 : Math.sin(t * 0.8) * 0.08)
    g.current.position.y = THREE.MathUtils.damp(g.current.position.y, y, 6, dt)
    g.current.rotation.y = (reduced ? 0 : Math.sin(t * 0.25) * 0.35) + p * 0.6
    g.current.rotation.z = -0.18 + (reduced ? 0 : Math.sin(t * 0.5) * 0.06)
    g.current.rotation.x = reduced ? 0 : 0.12 + Math.sin(t * 0.4) * 0.05
    const s = THREE.MathUtils.lerp(1, 1.2, rise) * (1 - end * 0.2)
    g.current.scale.setScalar(s)
  })
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[2, 4, 5]} intensity={2.4} />
      <directionalLight position={[-4, 1, -2]} intensity={1.6} color="#7F95FF" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} position={[0, 5, 3]} scale={[8, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="ring" intensity={1.5} position={[-4, 0, 2]} scale={3} color="#9DB0FF" />
      </Environment>
      <group ref={g} position={[0, -3.4, 0]}>
        {AVATAR_URL ? <Model url={AVATAR_URL} /> : <StandIn />}
      </group>
    </>
  )
}
