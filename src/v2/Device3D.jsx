import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Floating, StudioLights } from './Avatar3D'

/* What plays inside the tablet: she floats above a blue planet, sun on the horizon. */

const planetMat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: `varying vec3 vN; varying vec3 vP; varying vec3 vView;
    void main(){ vN = normalize(normalMatrix * normal); vP = position; vec4 mv = modelViewMatrix * vec4(position, 1.); vView = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform float uTime; varying vec3 vN; varying vec3 vP; varying vec3 vView;
    float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
    float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
      return mix(mix(mix(h(i), h(i+vec3(1,0,0)), f.x), mix(h(i+vec3(0,1,0)), h(i+vec3(1,1,0)), f.x), f.y),
                 mix(mix(h(i+vec3(0,0,1)), h(i+vec3(1,0,1)), f.x), mix(h(i+vec3(0,1,1)), h(i+vec3(1,1,1)), f.x), f.y), f.z); }
    void main(){
      float fres = pow(1. - max(dot(vN, vView), 0.), 7.);
      vec3 q = vP * .12 + vec3(uTime * .01, 0., 0.);
      float land = smoothstep(.55, .62, n3(q) * .6 + n3(q * 2.3) * .4);
      float cloud = smoothstep(.5, .8, n3(q * 3. + 7.) * .6 + n3(q * 7.) * .4);
      vec3 ocean = vec3(.004, .018, .07), ground = vec3(.02, .05, .07);
      vec3 col = mix(ocean, ground, land) + cloud * .22;
      col += vec3(.3, .55, 1.) * fres * .9;
      gl_FragColor = vec4(col, 1.);
      #include <colorspace_fragment>
    }`,
})
const glowMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
  vertexShader: 'varying vec3 vN; varying vec3 vView; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.); vView = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'varying vec3 vN; varying vec3 vView; void main(){ float k = pow(max(dot(vN, vView), 0.), 6.); gl_FragColor = vec4(vec3(.35,.62,1.) * k * .9, k); }',
})

function sunTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256
  const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.08, 'rgba(255,255,255,.9)'); g.addColorStop(0.3, 'rgba(160,200,255,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
  x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2
  for (const a of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]) { x.beginPath(); x.moveTo(128 - Math.cos(a) * 120, 128 - Math.sin(a) * 120); x.lineTo(128 + Math.cos(a) * 120, 128 + Math.sin(a) * 120); x.stroke() }
  return new THREE.CanvasTexture(c)
}

export default function Device3D({ reduced }) {
  const stars = useMemo(() => {
    const n = 700, pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) pos.set([(Math.random() - 0.5) * 60, Math.random() * 25 - 3, -20 - Math.random() * 20], i * 3)
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  const sun = useMemo(sunTexture, [])
  const planet = useRef()
  useFrame(({ clock }) => {
    planetMat.uniforms.uTime.value = reduced ? 0 : clock.elapsedTime
    if (!reduced) planet.current.rotation.y = clock.elapsedTime * 0.01
  })
  return (
    <>
      <color attach="background" args={['#020309']} />
      <StudioLights />
      <points geometry={stars}><pointsMaterial color="#DDE6FF" size={0.05} sizeAttenuation transparent opacity={0.8} /></points>
      <group position={[0, -23.6, -10]} rotation={[0.25, 0, -0.08]}>
        <mesh ref={planet} material={planetMat}><sphereGeometry args={[20, 96, 96]} /></mesh>
        <mesh material={glowMat} scale={1.06}><sphereGeometry args={[20, 64, 64]} /></mesh>
      </group>
      <sprite position={[-3.4, 1.6, -6]} scale={[3.2, 3.2, 1]}>
        <spriteMaterial map={sun} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <group position={[0, 0.15, 0]} scale={1.05}><Floating reduced={reduced} /></group>
    </>
  )
}
