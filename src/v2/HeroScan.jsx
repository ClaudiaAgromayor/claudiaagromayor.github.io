import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useHeroCamera } from './heroCamera'

/* Her figure as a stack of contour rings, the way a scanner slices a body.

   Each row of her silhouette (cut out of her own photo, public/img/portrait-scan.png)
   becomes one closed ring: as wide as she is on that row, as deep as her own build.
   No face and no photograph survive it, only the outline, so it reads as a shape rather
   than a portrait. A band of light travels up through the slices, and the rings bend
   away from the pointer and settle back. */

const PHOTO = '/img/portrait-scan.png'
const CAM_POS = [0, -0.2, 6.1], CAM_TARGET = [0, -0.28, 0]
const HEIGHT = 2.9, TOP_Y = 1.18
const Y_LOW = TOP_Y - HEIGHT
const ROW_STEP = 6            // photo pixels between rings
const AROUND = 56             // points around each ring

/* ── read her outline, turn each row into a ring ── */
function scanRings(image) {
  const c = document.createElement('canvas')
  c.width = image.width; c.height = image.height
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(image, 0, 0)
  const { data, width: W, height: H } = ctx.getImageData(0, 0, c.width, c.height)
  const scale = HEIGHT / H

  const rows = []
  for (let y = 0; y < H; y++) {
    let lo = -1, hi = -1
    for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 128) { if (lo < 0) lo = x; hi = x }
    rows.push(lo < 0 ? null : { mid: (lo + hi) / 2, half: (hi - lo) / 2 })
  }
  // the head is the narrowest part up top; it sets how deep the body is, front to back
  const tops = rows.filter((r, i) => r && i < H * 0.28).map((r) => r.half).sort((a, b) => a - b)
  const headHalf = tops[Math.floor(tops.length * 0.5)] || W * 0.2

  const pos = [], side = [], along = []
  let smooth = null
  for (let yf = 0; yf < H; yf += ROW_STEP) {
    const y = Math.round(yf), row = rows[y]
    if (!row) continue
    // a little smoothing, so one stray pixel does not throw a ring out
    smooth = smooth === null ? row.half : smooth * 0.45 + row.half * 0.55
    const a = smooth * scale                                        // half width
    const b = Math.min(smooth, headHalf * 1.25) * scale * 0.58      // depth
    const cx = (row.mid - W / 2) * scale, wy = TOP_Y - y * scale
    const t = (TOP_Y - wy) / HEIGHT
    let px = cx + a, pz = 0
    for (let i = 1; i <= AROUND; i++) {
      const th = (i / AROUND) * Math.PI * 2
      const nx = cx + Math.cos(th) * a, nz = Math.sin(th) * b
      pos.push(px, wy, pz, nx, wy, nz)
      const s = Math.sign(pz + nz) || 1
      side.push(s, s); along.push(t, t)
      px = nx; pz = nz
    }
  }
  return { pos: new Float32Array(pos), side: new Float32Array(side), along: new Float32Array(along) }
}

const vertexShader = /* glsl */ `
  attribute float aSide; attribute float aAlong;
  uniform float uScan;
  varying float vFront, vScan, vAlong;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    // which way this piece of the ring faces, so the far side can fall back
    vec3 n = normalize((modelViewMatrix * vec4(0., 0., aSide, 0.)).xyz);
    vFront = smoothstep(-.7, .4, n.z);
    vScan = 1. - smoothstep(0., .09, abs(position.y - uScan));
    vAlong = aAlong;
    gl_Position = projectionMatrix * mv;
  }`
const fragmentShader = /* glsl */ `
  varying float vFront, vScan, vAlong;
  void main() {
    vec3 cool = mix(vec3(.16, .28, .95), vec3(.72, .81, 1.), vAlong);
    vec3 c = mix(cool, vec3(1.), vScan * .85);
    // dissolve at the top and the foot instead of ending on a flat ring
    float fade = smoothstep(0., .05, vAlong) * (1. - smoothstep(.84, 1., vAlong));
    gl_FragColor = vec4(c, ((.08 + .5 * vFront) + vScan * .6) * fade);
  }`

function Rings({ data, reduced, pointerIn }) {
  const g = useRef()
  const { geo, home, vel, n } = useMemo(() => {
    const n = data.pos.length / 3
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(data.pos.slice(), 3))
    geo.setAttribute('aSide', new THREE.BufferAttribute(data.side, 1))
    geo.setAttribute('aAlong', new THREE.BufferAttribute(data.along, 1))
    return { geo, home: data.pos, vel: new Float32Array(n * 3), n }
  }, [data])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader, fragmentShader, uniforms: { uScan: { value: -9 } },
  }), [])
  const tools = useMemo(() => ({
    ray: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit: new THREE.Vector3(),
  }), [])

  useFrame(({ clock, pointer, camera }, delta) => {
    const t = clock.elapsedTime, inside = pointerIn.current
    g.current.rotation.y = (reduced ? 0 : t * 0.12) + (inside ? pointer.x * 0.3 : 0)
    mat.uniforms.uScan.value = reduced ? -9 : Y_LOW + ((t * 0.14) % 1.25) * HEIGHT
    let active = false
    if (inside) {
      tools.ray.setFromCamera(pointer, camera)
      if (tools.ray.ray.intersectPlane(tools.plane, tools.hit)) {
        g.current.updateMatrixWorld(); g.current.worldToLocal(tools.hit); active = true
      }
    }
    const cur = geo.attributes.position.array, k = Math.min(delta, 1 / 30), R = 0.5
    const { x: hx, y: hy } = tools.hit
    for (let i = 0; i < n; i++) {
      const j = i * 3
      let ax = (home[j] - cur[j]) * 26, ay = (home[j + 1] - cur[j + 1]) * 26, az = (home[j + 2] - cur[j + 2]) * 26
      if (active) {
        const dx = cur[j] - hx, dy = cur[j + 1] - hy, d = Math.hypot(dx, dy)
        if (d < R && d > 1e-4) { const f = (1 - d / R) ** 2 * 55 / d; ax += dx * f; ay += dy * f }
      }
      vel[j] = (vel[j] + ax * k) * 0.88
      vel[j + 1] = (vel[j + 1] + ay * k) * 0.88
      vel[j + 2] = (vel[j + 2] + az * k) * 0.88
      cur[j] += vel[j] * k; cur[j + 1] += vel[j + 1] * k; cur[j + 2] += vel[j + 2] * k
    }
    geo.attributes.position.needsUpdate = true
  })
  return <group ref={g}><lineSegments geometry={geo} material={mat} frustumCulled={false} /></group>
}

export default function HeroScan({ reduced, pointerIn }) {
  useHeroCamera(CAM_POS, CAM_TARGET, 30)
  const tex = useTexture(PHOTO)
  const data = useMemo(() => scanRings(tex.image), [tex])
  return <Rings data={data} reduced={reduced} pointerIn={pointerIn} />
}
