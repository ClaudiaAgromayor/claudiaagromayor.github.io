import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment, Lightformer } from '@react-three/drei'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'
import { AVATAR } from './avatar'

/* Her 3D avatar (set in ./avatar.js). Nothing is drawn until she adds one. */

const smooth = (x, a, b) => THREE.MathUtils.smoothstep(x, a, b)

function Model({ url }) {
  const { scene, animations } = useGLTF(url)
  const ref = useRef()
  const obj = useMemo(() => {
    const s = cloneSkinned(scene)
    const box = new THREE.Box3().setFromObject(s)
    const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3())
    const k = 1.9 / size.y
    s.scale.setScalar(k)
    s.position.set(-c.x * k, -c.y * k, -c.z * k)
    return s
  }, [scene])
  const { actions, names } = useAnimations(animations, ref)
  // if the model comes with an animation (e.g. floating, from Mixamo), play it
  useEffect(() => { if (names[0]) actions[names[0]]?.reset().fadeIn(0.5).play() }, [actions, names])
  return <group ref={ref}><primitive object={obj} /></group>
}

export function Figure() {
  return AVATAR ? <Model url={AVATAR} /> : null
}

export function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[2, 4, 5]} intensity={2.4} />
      <directionalLight position={[-4, 1, -2]} intensity={1.6} color="#7F95FF" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} position={[0, 5, 3]} scale={[8, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="ring" intensity={1.5} position={[-4, 0, 2]} scale={3} color="#9DB0FF" />
      </Environment>
    </>
  )
}

/** Finale: as the text fades, she rises from below into the middle of the halo and floats there. */
export default function Avatar3D({ progress, reduced }) {
  const g = useRef()
  useFrame(({ clock }, dt) => {
    const t = reduced ? 0 : clock.elapsedTime
    const rise = smooth(progress.current, 0.28, 0.62)
    const lift = smooth(progress.current, 0.66, 0.85)
    const y = THREE.MathUtils.lerp(-3.6, -0.1, rise) + lift * 0.45 + Math.sin(t * 0.8) * 0.08
    g.current.position.y = THREE.MathUtils.damp(g.current.position.y, y, 6, dt)
    g.current.rotation.y = Math.sin(t * 0.25) * 0.35
    g.current.rotation.z = Math.sin(t * 0.5) * 0.06
    g.current.rotation.x = 0.08 + Math.sin(t * 0.4) * 0.04
    g.current.scale.setScalar(THREE.MathUtils.lerp(1, 1.2, rise) * (1 - lift * 0.18))
  })
  return (
    <>
      <StudioLights />
      <group ref={g} position={[0, -3.6, 0]}><Figure /></group>
    </>
  )
}

/** A floating avatar for the tablet and the call to action. */
export function Floating({ reduced }) {
  const g = useRef()
  useFrame(({ clock, pointer }) => {
    const t = reduced ? 0 : clock.elapsedTime
    g.current.position.y = Math.sin(t * 0.7) * 0.08
    g.current.rotation.y = Math.sin(t * 0.3) * 0.3 + pointer.x * 0.35
    g.current.rotation.x = 0.08 - pointer.y * 0.12
    g.current.rotation.z = Math.sin(t * 0.5) * 0.05
  })
  return <group ref={g}><Figure /></group>
}
