import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useHeroCamera, dotTexture } from './heroCamera'

/* A flow field, drawn exactly like the scan that was here before: the same dots, the
   same band of light travelling up through it, the same push when the pointer goes in.

   Every point has a home on a stack of rings, an abstract form with no figure in it.
   A coherence value cycles: at its peak each point sits on its ring and the form
   stands there; as it falls the points let go and drift along an invisible current,
   until the form gathers again further round the turn. Noise, structure, noise. */

const CAM_POS = [0, -0.2, 6.6], CAM_TARGET = [0, -0.28, 0]
const K = 4.6, OY = 0.21, Y0 = -0.45, SPAN = 0.665, LEVELS = 92, AROUND = 300
const GAIN = 4.6 / 3.2          // the form is larger than the original, so the dots grow with it
const Y_LOW = Y0 * K + OY
const CYCLE = 14                // seconds for form → drift → form

/* The profile of the form: a smooth curve with no meaning in it, widest across the
   middle and tapering at both ends, so the rings read as one body rather than a tube. */
function radius(t) {            // t runs 0 at the top to 1 at the foot
  return 0.055
    + 0.085 * Math.sin(Math.PI * t)
    + 0.028 * Math.sin(Math.PI * t * 2.4 + 0.4)
    + 0.015 * Math.sin(Math.PI * t * 4.1)
}

function buildForm() {
  const home = [], nrm = [], seed = []
  for (let li = 0; li < LEVELS; li++) {
    const t = (li + 0.5) / LEVELS
    const y = Y0 + (1 - t) * SPAN
    const r = radius(t)
    for (let ai = 0; ai < AROUND; ai++) {
      const th = (ai + (li % 2) * 0.5) / AROUND * Math.PI * 2
      home.push(Math.sin(th) * r * K, y * K + OY, Math.cos(th) * r * K)
      nrm.push(Math.sin(th), 0, Math.cos(th))
      seed.push(Math.random())
    }
  }
  return { home: new Float32Array(home), nrm: new Float32Array(nrm), seed: new Float32Array(seed) }
}

const vertexShader = /* glsl */ `
  attribute float aSeed; attribute vec3 aNormal;
  uniform float uScan, uPx, uLow, uGain;
  varying float vS, vSeed, vL, vA;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    vec3 n = normalize(normalMatrix * aNormal);
    vL = .18 + .82 * max(dot(n, normalize(vec3(.45, .55, 1.))), 0.) + pow(1. - abs(n.z), 3.) * .5;
    vS = 1. - smoothstep(0., .05, abs(position.y - uScan));
    vSeed = aSeed;
    vA = smoothstep(uLow, uLow + .9, position.y) * (.12 + .88 * smoothstep(-.25, .35, n.z));
    gl_PointSize = (1.6 + aSeed * .8 + vS * 1.8) * uPx * uGain * (6.6 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`
const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  varying float vS, vSeed, vL, vA;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    vec3 c = mix(vec3(.2, .34, 1.), vec3(.84, .89, 1.), clamp(vL * .75 + vSeed * .15, 0., 1.));
    gl_FragColor = vec4(c + vS * vec3(.25, .3, .4), a * vA * (.12 + vL * .62 + vS * .3));
  }`

export default function HeroScan({ reduced, pointerIn }) {
  useHeroCamera(CAM_POS, CAM_TARGET, 30)
  const g = useRef()

  const { geo, mat, home, vel, seed, n } = useMemo(() => {
    const form = buildForm()
    const n = form.seed.length
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(form.home.slice(), 3))
    geo.setAttribute('aNormal', new THREE.BufferAttribute(form.nrm, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(form.seed, 1))
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader, fragmentShader,
      uniforms: {
        uScan: { value: -9 }, uPx: { value: 1 }, uMap: { value: dotTexture },
        uLow: { value: Y_LOW }, uGain: { value: GAIN },
      },
    })
    return { geo, mat, home: form.home, vel: new Float32Array(n * 3), seed: form.seed, n }
  }, [])

  const tools = useMemo(() => ({
    ray: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit: new THREE.Vector3(),
  }), [])

  useFrame(({ clock, pointer, camera, size, gl }, delta) => {
    const t = clock.elapsedTime, inside = pointerIn.current
    g.current.rotation.y = reduced ? 0 : t * 0.1
    mat.uniforms.uScan.value = reduced ? -9 : Y_LOW + ((t * 0.22) % 1.4) * (SPAN * K)
    mat.uniforms.uPx.value = gl.getPixelRatio() * size.height / 900

    // the form holds for most of the cycle and only lets go for a few seconds, and even
    // then not completely: a hero that is pure dust when someone lands on it says nothing
    const wave = Math.sin((t % CYCLE) / CYCLE * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5
    const c = reduced ? 1 : THREE.MathUtils.smootherstep(wave, 0.1, 0.58)
    const loose = (1 - c) * 0.72

    let active = false
    if (inside) {
      tools.ray.setFromCamera(pointer, camera)
      if (tools.ray.ray.intersectPlane(tools.plane, tools.hit)) {
        g.current.updateMatrixWorld(); g.current.worldToLocal(tools.hit); active = true
      }
    }

    const cur = geo.attributes.position.array, k = Math.min(delta, 1 / 30), R = 0.42
    const { x: hx, y: hy } = tools.hit
    const flow = t * 0.35
    for (let i = 0; i < n; i++) {
      const j = i * 3
      const x = cur[j], y = cur[j + 1], z = cur[j + 2]
      // back to its ring: hard while the form holds, barely at all once it lets go
      const pull = 3 + 24 * c * c
      let ax = (home[j] - x) * pull, ay = (home[j + 1] - y) * pull, az = (home[j + 2] - z) * pull
      if (loose > 0.002) {
        // the current: three sines crossed, so the drift curls instead of sliding one way
        const s = seed[i] * 6.283
        const fx = Math.sin(y * 1.1 + flow + s) + Math.cos(z * 0.9 - flow * 0.7)
        const fy = Math.sin(z * 1.3 - flow * 0.8) + Math.cos(x + flow * 0.6 + s)
        const fz = Math.sin(x * 1.2 + flow * 0.9) + Math.cos(y * 0.8 - flow + s)
        const w = loose * 7.5
        ax += fx * w; ay += fy * w * 0.6; az += fz * w
        // and a weak hold on the whole cloud, so nothing drifts off for good
        ax -= x * loose * 4.2; ay -= (y - OY) * loose * 2.2; az -= z * loose * 4.2
      }
      if (active) {
        const dx = x - hx, dy = y - hy, d = Math.hypot(dx, dy)
        if (d < R && d > 1e-4) { const f = (1 - d / R) ** 2 * 60 / d; ax += dx * f; ay += dy * f }
      }
      vel[j] = (vel[j] + ax * k) * 0.9
      vel[j + 1] = (vel[j + 1] + ay * k) * 0.9
      vel[j + 2] = (vel[j + 2] + az * k) * 0.9
      cur[j] += vel[j] * k; cur[j + 1] += vel[j + 1] * k; cur[j + 2] += vel[j + 2] * k
    }
    geo.attributes.position.needsUpdate = true
  })

  return <group ref={g}><points geometry={geo} material={mat} frustumCulled={false} /></group>
}
