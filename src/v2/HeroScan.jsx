import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import * as THREE from 'three'
import { AVATAR } from './avatar'
import { useHeroCamera, dotTexture } from './heroCamera'

/* Her own portrait, scanned into points: horizontal rings of dots that scatter when the
   pointer passes through and find their way back.

   The points come from her photo (public/img/portrait-scan.png, a cut-out made from
   /img/me.jpg). Each row of the photo becomes a ring: the dots sit on a half-cylinder
   as wide as her silhouette on that row, so the shape is hers and it turns like a solid.
   Colour and brightness come from the photo itself, pulled towards the site's blue.
   Once she has a 3D avatar, AVATAR (./avatar.js) takes over and we scan that instead. */

const PHOTO = '/img/portrait-scan.png'
const CAM_POS = [0, -0.2, 6.1], CAM_TARGET = [0, -0.28, 0]
const HEIGHT = 2.75, TOP_Y = 1.15           // the scan spans TOP_Y down to TOP_Y - HEIGHT
const Y_LOW = TOP_Y - HEIGHT
const ROW_STEP = 1.5, COL_STEP = 1.1          // in photo pixels
const LEVELS = 66, AROUND = 230             // only used for the avatar version

/* ── her photo, read into rings of points ── */
function scanPhoto(image) {
  const c = document.createElement('canvas')
  c.width = image.width; c.height = image.height
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(image, 0, 0)
  const { data, width: W, height: H } = ctx.getImageData(0, 0, c.width, c.height)
  const at = (x, y) => (y * W + x) * 4
  const scale = HEIGHT / H                   // photo pixels to world units

  // how wide she is on each row, and where its centre sits
  const rows = []
  for (let y = 0; y < H; y++) {
    let lo = -1, hi = -1
    for (let x = 0; x < W; x++) if (data[at(x, y) + 3] > 128) { if (lo < 0) lo = x; hi = x }
    rows.push(lo < 0 ? null : { lo, hi, mid: (lo + hi) / 2, half: (hi - lo) / 2 })
  }
  // the head is the narrowest part near the top: use it to set how far the scan bulges forward
  const tops = rows.filter((r, i) => r && i < H * 0.45).map((r) => r.half).sort((a, b) => a - b)
  const headHalf = tops[Math.floor(tops.length * 0.5)] || W * 0.2
  const maxDepth = headHalf * 1.05

  // spread the photo's tones over the full range, and sharpen them, so her face reads
  // as something other than a flat patch once it is only dots
  const lumAt = new Float32Array(W * H)
  const sorted = []
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = at(x, y)
    if (data[i + 3] < 128) continue
    const l = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
    lumAt[y * W + x] = l
    sorted.push(l)
  }
  sorted.sort((a, b) => a - b)
  const lo = sorted[Math.floor(sorted.length * 0.04)] ?? 0
  const hi = sorted[Math.floor(sorted.length * 0.97)] ?? 1
  const norm = (x, y) => {
    // local contrast: how much brighter than its neighbourhood
    let sum = 0, cnt = 0
    for (let dy = -3; dy <= 3; dy += 3) for (let dx = -3; dx <= 3; dx += 3) {
      const nx = x + dx, ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      if (data[at(nx, ny) + 3] < 128) continue
      sum += lumAt[ny * W + nx]; cnt++
    }
    const l = lumAt[y * W + x], base = cnt ? sum / cnt : l
    const v = (l + (l - base) * 1.35 - lo) / Math.max(0.01, hi - lo)
    // her face is evenly lit, so without an S-curve the eyes and mouth sit only a
    // little under the cheeks and vanish once this is only dots
    const c = 0.46 + (v - 0.5) * 1.8
    return Math.min(1, Math.max(0, c))
  }

  const pos = [], nrm = [], col = [], lum = []
  const push = (x, y, z, nx, ny, nz, r, g, b, l) => {
    pos.push(x, y, z); nrm.push(nx, ny, nz); col.push(r, g, b); lum.push(l)
  }
  for (let yf = 0; yf < H; yf += ROW_STEP) {
    const y = Math.round(yf)
    const row = rows[y]
    if (!row) continue
    const depth = Math.min(row.half, maxDepth)
    for (let x = row.lo; x <= row.hi; x += COL_STEP) {
      const xi = Math.round(x), i = at(xi, y)
      if (data[i + 3] < 128) continue
      const u = (x - row.mid) / Math.max(row.half, 1)         // -1 .. 1 across the row
      const k = Math.sqrt(Math.max(0, 1 - u * u))
      const z = depth * k
      const wx = (x - W / 2) * scale, wy = TOP_Y - y * scale
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255
      const l = norm(xi, y)
      // the surface normal of that half-cylinder, so the light reads as volume
      const nx = u, nz = k, nl = Math.hypot(nx, nz) || 1
      push(wx, wy, z * scale, nx / nl, 0, nz / nl, r, g, b, l)
    }
  }
  return {
    pos: new Float32Array(pos), nrm: new Float32Array(nrm),
    col: new Float32Array(col), lum: new Float32Array(lum),
  }
}

/* ── her 3D avatar, once she has one: same look, sampled off the model ── */
function scanModel(root) {
  root.updateMatrixWorld(true)
  const meshes = []
  root.traverse((o) => { if (o.isMesh && o.geometry?.attributes?.position) meshes.push(o) })
  const box = new THREE.Box3().setFromObject(root)
  const h = box.max.y - box.min.y, cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2
  const bustH = h > 1 ? h * 0.27 : h          // a full figure (in metres) is cropped to head and shoulders
  const yLow = box.max.y - bustH, step = bustH / LEVELS, s = HEIGHT / bustH
  const area = (g) => {
    const p = g.attributes.position, idx = g.index, n = idx ? idx.count : p.count
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
    let sum = 0
    for (let i = 0; i < n; i += 3) {
      a.fromBufferAttribute(p, idx ? idx.getX(i) : i)
      b.fromBufferAttribute(p, idx ? idx.getX(i + 1) : i + 1)
      c.fromBufferAttribute(p, idx ? idx.getX(i + 2) : i + 2)
      sum += b.sub(a).cross(c.sub(a)).length() / 2
    }
    return sum
  }
  const areas = meshes.map((m) => area(m.geometry)), total = areas.reduce((x, y) => x + y, 0) || 1
  const pos = [], nrm = [], p = new THREE.Vector3(), q = new THREE.Vector3(), nm = new THREE.Matrix3()
  meshes.forEach((m, i) => {
    const sampler = new MeshSurfaceSampler(m).build(), count = Math.round(260000 * areas[i] / total)
    nm.getNormalMatrix(m.matrixWorld)
    for (let k = 0; k < count; k++) {
      sampler.sample(p, q)
      p.applyMatrix4(m.matrixWorld)
      if (p.y < yLow || Math.abs(p.x - cx) > bustH * 0.8) continue
      const f = (p.y - yLow) / step, ring = Math.floor(f)
      if (Math.abs(f - ring - 0.5) > 0.08) continue       // snap to scan rings
      q.applyMatrix3(nm).normalize()
      pos.push((p.x - cx) * s, Y_LOW + (ring + 0.5) * step * s, (p.z - cz) * s)
      nrm.push(q.x, q.y, q.z)
    }
  })
  const n = pos.length / 3, keep = Math.min(1, 16000 / Math.max(n, 1))
  const P = [], N = [], C = [], L = []
  for (let i = 0; i < n; i++) if (Math.random() < keep) {
    P.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
    N.push(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2])
    C.push(0.72, 0.78, 1); L.push(0.8)
  }
  return { pos: new Float32Array(P), nrm: new Float32Array(N), col: new Float32Array(C), lum: new Float32Array(L) }
}

const vertexShader = /* glsl */ `
  attribute float aSeed; attribute float aLum; attribute vec3 aNormal; attribute vec3 aTone;
  uniform float uScan, uPx, uLow, uShade;
  varying float vS, vSeed, vL, vA, vLum; varying vec3 vTone;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    vec3 n = normalize(normalMatrix * aNormal);
    float lit = .2 + .8 * max(dot(n, normalize(vec3(.4, .5, 1.))), 0.) + pow(1. - abs(n.z), 3.) * .35;
    vL = mix(1., lit, uShade);
    vS = 1. - smoothstep(0., .05, abs(position.y - uScan));
    vSeed = aSeed; vLum = aLum; vTone = aTone;
    vA = smoothstep(uLow, uLow + .3, position.y) * mix(1., .45 + .55 * smoothstep(-.4, .3, n.z), uShade);
    gl_PointSize = mix(.7 + aSeed * .25 + aLum * 1.9, 1.3 + aSeed * .5 + aLum * .9, uShade) * (1. + vS * .5) * uPx * (6.1 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`
const fragmentShader = /* glsl */ `
  uniform sampler2D uMap; uniform float uShade;
  varying float vS, vSeed, vL, vA, vLum; varying vec3 vTone;
  void main() {
    // the photo version needs solid dots: a soft one spreads its colour over the gaps
    // between rows and the whole face turns grey
    float d = length(gl_PointCoord - .5);
    float a = mix(1. - smoothstep(.32, .5, d), texture2D(uMap, gl_PointCoord).a, uShade);
    // her own colours, pulled most of the way towards the cobalt and white of the site
    vec3 cool = mix(vec3(.17, .3, .95), vec3(.86, .91, 1.), clamp(vLum * 1.35, 0., 1.));
    vec3 c = mix(cool, vTone, .3) + vS * vec3(.2, .25, .35);
    float bright = mix(.1 + vLum * 1.05, .12 + vLum * 1.25, uShade);
    gl_FragColor = vec4(c, a * vA * bright * (.55 + vL * .45 + vS * .3));
  }`

function Cloud({ data, reduced, pointerIn, shade = 1 }) {
  const g = useRef()
  const { geo, home, vel, seed, n } = useMemo(() => {
    const n = data.pos.length / 3, seed = new Float32Array(n).map(() => Math.random())
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(data.pos.slice(), 3))
    geo.setAttribute('aNormal', new THREE.BufferAttribute(data.nrm, 3))
    geo.setAttribute('aTone', new THREE.BufferAttribute(data.col, 3))
    geo.setAttribute('aLum', new THREE.BufferAttribute(data.lum, 1))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return { geo, home: data.pos, vel: new Float32Array(n * 3), seed, n }
  }, [data])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexShader, fragmentShader,
    blending: shade ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uScan: { value: -9 }, uPx: { value: 1 }, uMap: { value: dotTexture }, uLow: { value: Y_LOW }, uShade: { value: shade } },
  }), [shade])
  const tools = useMemo(() => ({
    ray: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit: new THREE.Vector3(),
  }), [])

  useFrame(({ clock, pointer, camera, size, gl }, delta) => {
    const t = clock.elapsedTime, inside = pointerIn.current
    // she turns a little, and follows the pointer: a relief, so keep the angle gentle
    g.current.rotation.y = (reduced ? 0 : Math.sin(t * 0.26) * 0.12) + (inside ? pointer.x * 0.16 : 0)
    mat.uniforms.uScan.value = reduced ? -9 : Y_LOW + ((t * 0.2) % 1.45) * HEIGHT
    mat.uniforms.uPx.value = gl.getPixelRatio() * size.height / 900
    let active = false
    if (inside) {
      tools.ray.setFromCamera(pointer, camera)
      if (tools.ray.ray.intersectPlane(tools.plane, tools.hit)) {
        g.current.updateMatrixWorld(); g.current.worldToLocal(tools.hit); active = true
      }
    }
    const cur = geo.attributes.position.array, k = Math.min(delta, 1 / 30), R = 0.26
    const { x: hx, y: hy } = tools.hit
    for (let i = 0; i < n; i++) {
      const j = i * 3
      let ax = (home[j] - cur[j]) * 20, ay = (home[j + 1] - cur[j + 1]) * 20, az = (home[j + 2] - cur[j + 2]) * 20
      if (active) {
        const dx = cur[j] - hx, dy = cur[j + 1] - hy, d = Math.hypot(dx, dy)
        if (d < R && d > 1e-4) {
          const f = (1 - d / R) ** 2 * 70 / d
          ax += dx * f; ay += dy * f; az += (seed[i] - 0.3) * 50 * (1 - d / R)
        }
      }
      vel[j] = (vel[j] + ax * k) * 0.9; vel[j + 1] = (vel[j + 1] + ay * k) * 0.9; vel[j + 2] = (vel[j + 2] + az * k) * 0.9
      cur[j] += vel[j] * k; cur[j + 1] += vel[j + 1] * k; cur[j + 2] += vel[j + 2] * k
    }
    geo.attributes.position.needsUpdate = true
  })
  return <group ref={g}><points geometry={geo} material={mat} frustumCulled={false} /></group>
}

function FromAvatar({ url, ...props }) {
  const { scene } = useGLTF(url)
  return <Cloud data={useMemo(() => scanModel(scene), [scene])} {...props} />
}

function FromPhoto(props) {
  const tex = useTexture(PHOTO)
  return <Cloud data={useMemo(() => scanPhoto(tex.image), [tex])} shade={0} {...props} />
}

export default function HeroScan({ reduced, pointerIn }) {
  useHeroCamera(CAM_POS, CAM_TARGET, 30)
  return AVATAR
    ? <FromAvatar url={AVATAR} reduced={reduced} pointerIn={pointerIn} />
    : <FromPhoto reduced={reduced} pointerIn={pointerIn} />
}
