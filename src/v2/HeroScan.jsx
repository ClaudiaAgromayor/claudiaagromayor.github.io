import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import * as THREE from 'three'
import { AVATAR } from './avatar'
import { useHeroCamera, dotTexture } from './heroCamera'

/* Her portrait as a LiDAR-style scan: horizontal rings of points that scatter when the
   pointer passes through and find their way back. Until her avatar exists it scans a
   stand-in bust; once AVATAR is set (./avatar.js) it scans her own head and shoulders. */

const CAM_POS = [0, -0.2, 6.1], CAM_TARGET = [0, -0.28, 0]
// the bust spans y = Y0 .. Y0 + SPAN in model units, scaled by K and lifted by OY
const K = 3.2, OY = 0.2, Y0 = -0.45, SPAN = 0.665, LEVELS = 66, AROUND = 230
const Y_LOW = Y0 * K + OY

/* ── the stand-in: a smooth signed-distance bust ── */
const sdEll = (x, y, z, c, r) => {
  const a = (x - c[0]) / r[0], b = (y - c[1]) / r[1], d = (z - c[2]) / r[2]
  return (Math.sqrt(a * a + b * b + d * d) - 1) * Math.min(r[0], r[1], r[2])
}
const sdCap = (x, y, z, a, b, r) => {
  const px = x - a[0], py = y - a[1], pz = z - a[2], bx = b[0] - a[0], by = b[1] - a[1], bz = b[2] - a[2]
  const h = Math.max(0, Math.min(1, (px * bx + py * by + pz * bz) / (bx * bx + by * by + bz * bz)))
  return Math.hypot(px - bx * h, py - by * h, pz - bz * h) - r
}
const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25 }
function sdf(x, y, z) {
  let d = sdEll(x, y, z, [0, 0.1, 0], [0.078, 0.095, 0.095])                        // skull
  d = smin(d, sdEll(x, y, z, [0, 0.02, 0.026], [0.06, 0.078, 0.07]), 0.04)           // face and jaw
  d = smin(d, sdEll(x, y, z, [0, 0.045, 0.09], [0.011, 0.024, 0.018]), 0.016)        // nose
  for (const s of [-1, 1]) {
    d = smin(d, sdEll(x, y, z, [0.077 * s, 0.058, -0.004], [0.012, 0.027, 0.017]), 0.012) // ears
    d = Math.max(d, -(Math.hypot(x - 0.029 * s, y - 0.068, z - 0.094) - 0.016))    // eye sockets
  }
  const hair = Math.max(sdEll(x, y, z, [0, 0.105, -0.01], [0.084, 0.098, 0.102]), Math.min(0.088 - y, z + 0.012))
  d = smin(d, hair, 0.012)
  d = smin(d, sdEll(x, y, z, [0, -0.01, -0.07], [0.07, 0.1, 0.045]), 0.03)           // hair at the nape
  d = smin(d, sdCap(x, y, z, [0, -0.04, -0.012], [0, -0.17, -0.012], 0.046), 0.035)  // neck
  for (const s of [-1, 1]) d = smin(d, sdCap(x, y, z, [0, -0.16, -0.016], [0.15 * s, -0.222, -0.016], 0.052), 0.07) // shoulders
  d = smin(d, sdEll(x, y, z, [0, -0.31, -0.008], [0.165, 0.14, 0.095]), 0.06)        // chest
  for (const s of [-1, 1]) d = smin(d, sdCap(x, y, z, [0.165 * s, -0.235, -0.012], [0.19 * s, -0.52, -0.012], 0.05), 0.04) // upper arms
  return Math.max(d, -0.46 - y)
}

// each point is the outermost surface hit along a horizontal ray towards the axis
function scanStandIn() {
  const pos = [], nrm = [], e = 0.0015, CZ = -0.01
  for (let li = 0; li < LEVELS; li++) {
    const y = Y0 + (li + 0.5) * (SPAN / LEVELS)
    for (let ai = 0; ai < AROUND; ai++) {
      const th = (ai + (li % 2) * 0.5) / AROUND * Math.PI * 2, dx = Math.sin(th), dz = Math.cos(th)
      let r = 0.34
      while (r > 0 && sdf(dx * r, y, dz * r + CZ) > 0) r -= 0.005
      if (r <= 0) continue
      let lo = r, hi = r + 0.005
      for (let it = 0; it < 12; it++) { const m = (lo + hi) / 2; if (sdf(dx * m, y, dz * m + CZ) < 0) lo = m; else hi = m }
      const x = dx * lo, z = dz * lo + CZ
      const gx = sdf(x + e, y, z) - sdf(x - e, y, z), gy = sdf(x, y + e, z) - sdf(x, y - e, z), gz = sdf(x, y, z + e) - sdf(x, y, z - e)
      const gl = Math.hypot(gx, gy, gz) || 1
      pos.push(x * K, y * K + OY, z * K); nrm.push(gx / gl, gy / gl, gz / gl)
    }
  }
  return { pos: new Float32Array(pos), nrm: new Float32Array(nrm) }
}

// her avatar: sample its surface, keep head and shoulders, and snap the points onto scan rings
function scanModel(root) {
  root.updateMatrixWorld(true)
  const meshes = []
  root.traverse((o) => { if (o.isMesh && o.geometry?.attributes?.position) meshes.push(o) })
  const box = new THREE.Box3().setFromObject(root)
  const h = box.max.y - box.min.y, cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2
  const bustH = h > 1 ? h * 0.27 : h // a full figure (in metres) is cropped to its head and shoulders
  const yLow = box.max.y - bustH, step = bustH / LEVELS, s = (SPAN * K) / bustH
  const area = (g) => {
    const p = g.attributes.position, idx = g.index, n = idx ? idx.count : p.count
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
    let sum = 0
    for (let i = 0; i < n; i += 3) {
      a.fromBufferAttribute(p, idx ? idx.getX(i) : i); b.fromBufferAttribute(p, idx ? idx.getX(i + 1) : i + 1); c.fromBufferAttribute(p, idx ? idx.getX(i + 2) : i + 2)
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
      if (Math.abs(f - ring - 0.5) > 0.08) continue
      q.applyMatrix3(nm).normalize()
      pos.push((p.x - cx) * s, Y_LOW + (ring + 0.5) * step * s, (p.z - cz) * s); nrm.push(q.x, q.y, q.z)
    }
  })
  // keep the cloud light enough to animate
  const n = pos.length / 3, keep = Math.min(1, 16000 / Math.max(n, 1))
  const P = [], N = []
  for (let i = 0; i < n; i++) if (Math.random() < keep) { P.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); N.push(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]) }
  return { pos: new Float32Array(P), nrm: new Float32Array(N) }
}

const vertexShader = /* glsl */ `
  attribute float aSeed; attribute vec3 aNormal;
  uniform float uScan, uPx, uLow;
  varying float vS, vSeed, vL, vA;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    vec3 n = normalize(normalMatrix * aNormal);
    vL = .18 + .82 * max(dot(n, normalize(vec3(.45, .55, 1.))), 0.) + pow(1. - abs(n.z), 3.) * .5;
    vS = 1. - smoothstep(0., .05, abs(position.y - uScan));
    vSeed = aSeed;
    vA = smoothstep(uLow, uLow + .55, position.y) * (.12 + .88 * smoothstep(-.25, .35, n.z));
    gl_PointSize = (1.6 + aSeed * .8 + vS * 1.8) * uPx * (6.6 / -mv.z);
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

function Cloud({ data, reduced, pointerIn }) {
  const g = useRef()
  const { geo, home, vel, seed, n } = useMemo(() => {
    const n = data.pos.length / 3, seed = new Float32Array(n).map(() => Math.random())
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(data.pos.slice(), 3))
    geo.setAttribute('aNormal', new THREE.BufferAttribute(data.nrm, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return { geo, home: data.pos, vel: new Float32Array(n * 3), seed, n }
  }, [data])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader, fragmentShader,
    uniforms: { uScan: { value: -9 }, uPx: { value: 1 }, uMap: { value: dotTexture }, uLow: { value: Y_LOW } },
  }), [])
  const tools = useMemo(() => ({ ray: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit: new THREE.Vector3() }), [])

  useFrame(({ clock, pointer, camera, size, gl }, delta) => {
    const t = clock.elapsedTime, inside = pointerIn.current
    g.current.rotation.y = 0.45 + (reduced ? 0 : Math.sin(t * 0.3) * 0.35) + (inside ? pointer.x * 0.2 : 0)
    mat.uniforms.uScan.value = reduced ? -9 : Y_LOW + ((t * 0.22) % 1.4) * (SPAN * K)
    mat.uniforms.uPx.value = gl.getPixelRatio() * size.height / 900
    // the pointer, in the figure's own frame
    let active = false
    if (inside) {
      tools.ray.setFromCamera(pointer, camera)
      if (tools.ray.ray.intersectPlane(tools.plane, tools.hit)) { g.current.updateMatrixWorld(); g.current.worldToLocal(tools.hit); active = true }
    }
    const cur = geo.attributes.position.array, k = Math.min(delta, 1 / 30), R = 0.24, { x: hx, y: hy } = tools.hit
    for (let i = 0; i < n; i++) {
      const j = i * 3
      let ax = (home[j] - cur[j]) * 20, ay = (home[j + 1] - cur[j + 1]) * 20, az = (home[j + 2] - cur[j + 2]) * 20
      if (active) {
        const dx = cur[j] - hx, dy = cur[j + 1] - hy, d = Math.hypot(dx, dy)
        if (d < R && d > 1e-4) { const f = (1 - d / R) ** 2 * 70 / d; ax += dx * f; ay += dy * f; az += (seed[i] - 0.3) * 50 * (1 - d / R) }
      }
      vel[j] = (vel[j] + ax * k) * 0.9; vel[j + 1] = (vel[j + 1] + ay * k) * 0.9; vel[j + 2] = (vel[j + 2] + az * k) * 0.9
      cur[j] += vel[j] * k; cur[j + 1] += vel[j + 1] * k; cur[j + 2] += vel[j + 2] * k
    }
    geo.attributes.position.needsUpdate = true
  })
  return <group ref={g} rotation-y={0.45}><points geometry={geo} material={mat} frustumCulled={false} /></group>
}

function FromAvatar({ url, ...props }) {
  const { scene } = useGLTF(url)
  const data = useMemo(() => scanModel(scene), [scene])
  return <Cloud data={data} {...props} />
}

function FromStandIn(props) {
  const data = useMemo(scanStandIn, [])
  return <Cloud data={data} {...props} />
}

export default function HeroScan({ reduced, pointerIn }) {
  useHeroCamera(CAM_POS, CAM_TARGET, 30)
  return AVATAR ? <FromAvatar url={AVATAR} reduced={reduced} pointerIn={pointerIn} /> : <FromStandIn reduced={reduced} pointerIn={pointerIn} />
}
