import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useHeroCamera, dotTexture } from './heroCamera'

/* A landscape of points: a sheet rolling like dunes, or like waves seen from above.

   The sheet itself moves, slowly. Each point keeps its own place on it and rides the
   swell, so nothing drifts off and gathers again. A band of light rolls through from
   the back. Put the pointer in and the points there lift and spill aside, then fly
   back to the surface and settle. */

const CAM_POS = [0, 0.1, 7.4], CAM_TARGET = [0, -0.1, 0]
const R = 1.5                   // the scale the sheet is built to
const SIDE = 168                // points across the grid, so SIDE² in all
const SPAN_X = R * 5.2, SPAN_Z = R * 3.4
const MAX_SPEED = 0.6           // world units a second on the way back
const TURN = 1.6                // how sharply a point turns towards where it is heading

/* The height of the sheet: three crossed sines, two of them travelling, so the ridges
   roll without ever repeating. They are split into per-row and per-column tables below,
   because evaluating them per point every frame would cost more than the rest of the
   animation put together. */
const gx = (i) => (i / (SIDE - 1) - 0.5) * SPAN_X
const gz = (i) => (i / (SIDE - 1) - 0.5) * SPAN_Z

export default function HeroScan({ reduced, pointerIn }) {
  useHeroCamera(CAM_POS, CAM_TARGET, 30, false)   // centred: her name reads on top of it
  const g = useRef()

  const { geo, mat, pos, vel, seed, tables, n } = useMemo(() => {
    const n = SIDE * SIDE
    const pos = new Float32Array(n * 3), seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = gx(i % SIDE)
      pos[i * 3 + 2] = gz(Math.floor(i / SIDE))
      seed[i] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader, fragmentShader,
      uniforms: { uScan: { value: -9 }, uPx: { value: 1 }, uMap: { value: dotTexture } },
    })
    // the two tables that never change: the diagonal ridge's z half
    const sz = new Float32Array(SIDE), cz = new Float32Array(SIDE)
    for (let i = 0; i < SIDE; i++) { sz[i] = Math.sin(gz(i) * 0.75); cz[i] = Math.cos(gz(i) * 0.75) }
    const tables = { a: new Float32Array(SIDE), b: new Float32Array(SIDE), s: new Float32Array(SIDE), c: new Float32Array(SIDE), sz, cz }
    return { geo, mat, pos, vel: new Float32Array(n * 3), seed, tables, n }
  }, [])

  // the camera looks along the sheet, almost at eye level, so the pointer is met on an
  // upright plane through the middle of it. A ground plane would be nearly edge-on and
  // the ray would land somewhere out in the distance.
  const tools = useMemo(() => ({
    ray: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit: new THREE.Vector3(),
  }), [])
  const disturbed = useRef(false)

  useFrame(({ clock, pointer, camera, size, gl }, delta) => {
    const t = reduced ? 0 : clock.elapsedTime
    mat.uniforms.uPx.value = gl.getPixelRatio() * size.height / 900
    // one slow pass of light every twenty seconds, from the back of the sheet to the front
    mat.uniforms.uScan.value = reduced ? -99 : -R * 2.2 + ((clock.elapsedTime / 20) % 1) * R * 4.4

    // this frame's swell, as four rows of numbers instead of three sines per point
    const { a, b, s, c, sz, cz } = tables
    const ph = -t * 0.1
    for (let i = 0; i < SIDE; i++) {
      const x = gx(i), z = gz(i)
      a[i] = Math.sin(x * 1.1 + t * 0.18) * 0.26
      b[i] = Math.sin(z * 1.5 + 1.2 + t * 0.13) * 0.2
      s[i] = Math.sin(x * 0.75 + ph) * 0.16
      c[i] = Math.cos(x * 0.75 + ph) * 0.16
    }
    const restY = (ix, iz) => (a[ix] + b[iz] + s[ix] * cz[iz] + c[ix] * sz[iz]) * R - R * 0.1

    let active = false
    if (pointerIn.current) {
      tools.ray.setFromCamera(pointer, camera)
      if (tools.ray.ray.intersectPlane(tools.plane, tools.hit)) {
        g.current.updateMatrixWorld(); g.current.worldToLocal(tools.hit); active = true
      }
    }

    // at rest the points simply ride the surface; the springs only wake up once something
    // has knocked them off it
    if (!active && !disturbed.current) {
      for (let i = 0; i < n; i++) pos[i * 3 + 1] = restY(i % SIDE, (i / SIDE) | 0)
      geo.attributes.position.needsUpdate = true
      return
    }

    const k = Math.min(delta, 1 / 30), REACH = 0.85
    const { x: hx, y: hy } = tools.hit
    let moving = false
    for (let i = 0; i < n; i++) {
      const j = i * 3
      const ix = i % SIDE, iz = (i / SIDE) | 0
      const hxr = gx(ix), hzr = gz(iz), hyr = restY(ix, iz)
      const x = pos[j], y = pos[j + 1], z = pos[j + 2]
      const dx = hxr - x, dy = hyr - y, dz = hzr - z
      const dist = Math.hypot(dx, dy, dz)

      // heading back to its place on the surface, easing off as it arrives
      const speed = MAX_SPEED * Math.min(1, dist / 0.25)
      let wx = 0, wy = 0, wz = 0
      if (dist > 1e-4) { const sp = speed / dist; wx = dx * sp; wy = dy * sp; wz = dz * sp }

      if (active) {
        // everything the pointer passes over lifts and spills aside, across the depth of
        // the sheet, like a finger drawn through it
        const px = x - hx, py = y - hy, d = Math.hypot(px, py * 0.6)
        if (d < REACH) {
          const f = (1 - d / REACH) ** 2
          const sp = d > 1e-4 ? f * 1.9 / d : 0
          wx += px * sp
          wy += f * (1.1 + seed[i] * 1.6)
          wz += (seed[i] - 0.5) * f * 1.4
        }
      }

      vel[j] += (wx - vel[j]) * TURN * k
      vel[j + 1] += (wy - vel[j + 1]) * TURN * k
      vel[j + 2] += (wz - vel[j + 2]) * TURN * k
      pos[j] += vel[j] * k; pos[j + 1] += vel[j + 1] * k; pos[j + 2] += vel[j + 2] * k
      if (!moving && (dist > 0.006 || Math.abs(vel[j]) + Math.abs(vel[j + 2]) > 0.012)) moving = true
    }
    disturbed.current = moving
    geo.attributes.position.needsUpdate = true
  })

  return <group ref={g}><points geometry={geo} material={mat} frustumCulled={false} /></group>
}

const vertexShader = /* glsl */ `
  attribute float aSeed;
  uniform float uScan, uPx;
  varying float vS, vSeed, vFar;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    // the band rolls through the sheet from the back, so it reads as a wave coming in
    vS = 1. - smoothstep(0., .34, abs(position.z - uScan));
    vSeed = aSeed;
    vFar = smoothstep(-2.6, -.2, position.z);     // the far edge dissolves into the dark
    gl_PointSize = (2.3 + aSeed * 1.1 + vS * 2.2) * uPx * (7.4 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`
const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  varying float vS, vSeed, vFar;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    vec3 c = mix(vec3(.2, .34, 1.), vec3(.84, .89, 1.), clamp(vSeed * .5 + vS, 0., 1.));
    gl_FragColor = vec4(c, a * (.2 + vFar * .5 + vS * .45));
  }`
