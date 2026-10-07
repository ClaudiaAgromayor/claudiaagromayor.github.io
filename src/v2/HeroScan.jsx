import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useHeroCamera, dotTexture } from './heroCamera'

/* A landscape of points: a sheet rolling like dunes, or like waves seen from above.

   It stands still. The only thing that moves on its own is a band of light rolling
   through it from the back, which is light rather than motion. Put the pointer in and
   the points there scatter, then fly back to where they belong and settle. */

const CAM_POS = [0, 0.1, 7.4], CAM_TARGET = [0, -0.1, 0]
const R = 1.5                   // the scale the sheet is built to
const SIDE = 168                // points across the grid, so SIDE² in all
const MAX_SPEED = 0.6           // world units a second on the way back
const TURN = 1.6                // how sharply a point turns towards where it is heading

/* The height of the sheet at a point: three sines crossed, so the ridges run at angles
   to each other and no row repeats the one before it. */
const height = (x, z) => (
  Math.sin(x * 1.1) * 0.26 + Math.sin(z * 1.5 + 1.2) * 0.2 + Math.sin((x + z) * 0.75) * 0.16
) * R

function buildTerrain() {
  const n = SIDE * SIDE
  const home = new Float32Array(n * 3), seed = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const gx = (i % SIDE) / (SIDE - 1) - 0.5, gz = Math.floor(i / SIDE) / (SIDE - 1) - 0.5
    const x = gx * R * 5.2, z = gz * R * 3.4
    home[i * 3] = x
    home[i * 3 + 1] = height(x, z) - R * 0.1
    home[i * 3 + 2] = z
    seed[i] = Math.random()
  }
  return { home, seed, n }
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

export default function HeroScan({ reduced, pointerIn }) {
  useHeroCamera(CAM_POS, CAM_TARGET, 30, false)   // centred: her name reads on top of it
  const g = useRef()

  const { geo, mat, home, vel, seed, n } = useMemo(() => {
    const { home, seed, n } = buildTerrain()
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(home.slice(), 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader, fragmentShader,
      uniforms: { uScan: { value: -9 }, uPx: { value: 1 }, uMap: { value: dotTexture } },
    })
    return { geo, mat, home, vel: new Float32Array(n * 3), seed, n }
  }, [])

  // the camera looks along the sheet, almost at eye level, so the pointer is met on an
  // upright plane through the middle of it. A ground plane would be nearly edge-on and
  // the ray would land somewhere out in the distance.
  const tools = useMemo(() => ({
    ray: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit: new THREE.Vector3(),
  }), [])
  const disturbed = useRef(false)

  useFrame(({ clock, pointer, camera, size, gl }, delta) => {
    const t = clock.elapsedTime
    mat.uniforms.uPx.value = gl.getPixelRatio() * size.height / 900
    // one slow pass of light every twenty seconds, from the back of the sheet to the front
    mat.uniforms.uScan.value = reduced ? -99 : -R * 2.2 + ((t / 20) % 1) * R * 4.4

    let active = false
    if (pointerIn.current) {
      // the pointer meets the sheet on its own plane, so the dip follows the ground
      tools.ray.setFromCamera(pointer, camera)
      if (tools.ray.ray.intersectPlane(tools.plane, tools.hit)) {
        g.current.updateMatrixWorld(); g.current.worldToLocal(tools.hit); active = true
      }
    }
    // with nothing touching it and every point home, there is nothing to compute
    if (!active && !disturbed.current) return

    const cur = geo.attributes.position.array, k = Math.min(delta, 1 / 30), REACH = 0.85
    const { x: hx, y: hy } = tools.hit
    let moving = false
    for (let i = 0; i < n; i++) {
      const j = i * 3
      const x = cur[j], y = cur[j + 1], z = cur[j + 2]
      const dx = home[j] - x, dy = home[j + 1] - y, dz = home[j + 2] - z
      const dist = Math.hypot(dx, dy, dz)

      // heading home, easing off as it arrives so it settles instead of overshooting
      const speed = MAX_SPEED * Math.min(1, dist / 0.25)
      let wx = 0, wy = 0, wz = 0
      if (dist > 1e-4) { const s = speed / dist; wx = dx * s; wy = dy * s; wz = dz * s }

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
      cur[j] += vel[j] * k; cur[j + 1] += vel[j + 1] * k; cur[j + 2] += vel[j + 2] * k
      if (!moving && (dist > 0.004 || Math.abs(vel[j]) + Math.abs(vel[j + 1]) + Math.abs(vel[j + 2]) > 0.01)) moving = true
    }
    disturbed.current = moving
    geo.attributes.position.needsUpdate = true
  })

  return <group ref={g}><points geometry={geo} material={mat} frustumCulled={false} /></group>
}
