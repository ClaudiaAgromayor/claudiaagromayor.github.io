import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useHeroCamera, dotTexture } from './heroCamera'

/* The world in dots, with the places she has lived, studied and worked,
   joined in the order she got there. Drag to spin it; point at a city to read it. */

export const PLACES = [
  { name: 'Madrid', lat: 40.42, lon: -3.7, years: '2003 – now', what: 'Home. ICAI, Altex Asset Management, Amazon Web Services and the root-canal research with Universidad Complutense.' },
  { name: 'Paris', lat: 48.86, lon: 2.35, years: '2023 – 2025', what: 'CentraleSupélec, Paris Dauphine, the IBM France Lab project and treasurer of Forum CentraleSupélec.' },
  { name: 'Montréal', lat: 45.5, lon: -73.57, years: '2026', what: 'Machine-learning research intern at IRIC, Université de Montréal.' },
  { name: 'Wisconsin', lat: 45.3, lon: -92.38, years: '2022', what: 'Camp counsellor and lifeguard at Lake Wapogasset, my first summer working far from home.', left: true },
]
const ROUTE = [[0, 3], [0, 1], [1, 2]] // Madrid → Wisconsin, Madrid → Paris, Paris → Montréal

// rough continents as [lon, lat] outlines; enough for a dotted globe
const LAND = [
  [[-168,66],[-162,70],[-140,70],[-125,70],[-95,72],[-80,73],[-65,62],[-56,52],[-66,45],[-70,42],[-76,35],[-81,31],[-80,25],[-82,27],[-84,30],[-90,29],[-97,26],[-97,21],[-92,18],[-88,15],[-83,9],[-79,8],[-78,9],[-84,13],[-87,13],[-92,15],[-96,16],[-105,20],[-110,23],[-115,30],[-117,33],[-121,35],[-124,40],[-124,46],[-128,50],[-135,57],[-145,60],[-152,58],[-158,57],[-165,60]],
  [[-73,78],[-60,82],[-30,83],[-20,75],[-22,70],[-40,65],[-45,60],[-52,64],[-58,70]],
  [[-80,9],[-75,11],[-62,11],[-52,5],[-35,-5],[-38,-13],[-41,-22],[-48,-26],[-53,-34],[-58,-38],[-63,-41],[-66,-46],[-68,-52],[-72,-54],[-75,-48],[-73,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0],[-77,4]],
  [[-10,36],[-9,43],[-2,44],[-5,48],[-2,49],[2,51],[5,53],[8,54],[8,57],[5,59],[5,62],[10,64],[15,68],[20,70],[28,71],[40,68],[45,67],[60,68],[60,55],[50,47],[40,45],[30,45],[28,41],[26,38],[22,37],[20,40],[18,40],[16,38],[12,38],[13,42],[10,44],[6,43],[3,43],[-1,37],[-6,36]],
  [[-6,50],[2,51],[1,53],[-2,56],[-3,58],[-6,58],[-5,55],[-3,54],[-5,52]],
  [[-10,52],[-6,52],[-6,55],[-8,55]],
  [[-17,21],[-17,15],[-15,11],[-8,5],[-3,5],[5,6],[9,4],[10,-1],[13,-6],[12,-17],[15,-27],[18,-34],[22,-34],[28,-33],[33,-27],[35,-22],[40,-15],[40,-10],[39,-5],[43,0],[51,11],[44,11],[43,13],[39,17],[35,24],[33,31],[25,32],[20,32],[11,33],[10,37],[0,36],[-6,36],[-10,30],[-13,27]],
  [[28,41],[40,41],[44,37],[36,36],[34,31],[39,29],[43,13],[52,16],[59,22],[57,26],[61,25],[67,24],[70,21],[73,17],[77,8],[80,10],[80,16],[87,22],[92,22],[94,17],[98,16],[98,8],[103,1],[104,10],[109,12],[106,20],[110,21],[117,24],[122,30],[121,37],[118,39],[122,40],[126,38],[129,35],[130,42],[135,44],[141,52],[140,60],[155,59],[163,61],[178,66],[180,70],[140,72],[113,73],[105,78],[90,76],[70,73],[60,69],[60,55],[50,47],[40,45],[30,45]],
  [[130,31],[135,34],[140,35],[142,40],[141,45],[140,42],[136,36],[132,34]],
  [[109,1],[117,7],[119,1],[116,-4],[110,-3]], [[95,5],[106,-6],[104,-5],[96,2]], [[131,-1],[141,-3],[150,-10],[141,-9]],
  [[113,-22],[114,-34],[118,-35],[124,-33],[132,-31],[138,-35],[141,-38],[147,-38],[150,-37],[153,-28],[153,-25],[146,-19],[142,-11],[141,-17],[136,-12],[130,-11],[126,-14],[122,-18]],
  [[44,-12],[50,-15],[47,-25],[44,-23]], [[167,-46],[174,-41],[178,-38],[173,-35],[170,-44]],
]
function inPoly(lon, lat, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
const R = 1.55
const toVec = (lat, lon, r = R) => {
  const la = THREE.MathUtils.degToRad(lat), lo = THREE.MathUtils.degToRad(lon)
  return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo))
}
const CAM_POS = [0, 0, 8.4], CAM_TARGET = [0, 0, 0]

const atmosphere = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float k = pow(max(dot(vN, vV), 0.), 5.); gl_FragColor = vec4(vec3(.24,.4,1.)*k*1.1, k); }',
})

export default function HeroGlobe({ reduced, onPlace }) {
  useHeroCamera(CAM_POS, CAM_TARGET, 32)
  const g = useRef(), labels = useRef([]), sprites = useRef([]), pulses = useRef([])
  const drag = useRef({ down: false, dx: 0, dy: 0, x: 0, y: 0 }), hovered = useRef(null)
  const { gl } = useThree()

  const land = useMemo(() => {
    const N = 42000, pos = []
    for (let i = 0; i < N; i++) {
      const y = 1 - 2 * (i + 0.5) / N, r = Math.sqrt(1 - y * y), phi = i * Math.PI * (3 - Math.sqrt(5))
      const x = Math.cos(phi) * r, z = Math.sin(phi) * r
      const lat = THREE.MathUtils.radToDeg(Math.asin(y)), lon = THREE.MathUtils.radToDeg(Math.atan2(x, z))
      if (lat < -70 || LAND.some((p) => inPoly(lon, lat, p))) pos.push(x * R, y * R, z * R)
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    return geo
  }, [])
  const places = useMemo(() => PLACES.map((p) => toVec(p.lat, p.lon, R * 1.01)), [])
  const arcs = useMemo(() => ROUTE.map(([a, b], k) => {
    const A = toVec(PLACES[a].lat, PLACES[a].lon).normalize(), B = toVec(PLACES[b].lat, PLACES[b].lon).normalize()
    const ang = A.angleTo(B), pts = []
    for (let i = 0; i <= 80; i++) {
      const t = i / 80
      const v = A.clone().multiplyScalar(Math.sin((1 - t) * ang) / Math.sin(ang)).add(B.clone().multiplyScalar(Math.sin(t * ang) / Math.sin(ang)))
      pts.push(v.normalize().multiplyScalar(R * (1 + (0.08 + 0.32 * ang / Math.PI) * Math.sin(Math.PI * t))))
    }
    return { pts, geo: new THREE.BufferGeometry().setFromPoints(pts), off: k * 0.33 }
  }), [])

  // drag to spin
  useEffect(() => {
    const el = gl.domElement, d = drag.current
    const down = (e) => { d.down = true; d.x = e.clientX; d.y = e.clientY; el.setPointerCapture?.(e.pointerId) }
    const move = (e) => { if (!d.down) return; d.dx += e.clientX - d.x; d.dy += e.clientY - d.y; d.x = e.clientX; d.y = e.clientY }
    const up = () => { d.down = false }
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); addEventListener('pointerup', up)
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); removeEventListener('pointerup', up) }
  }, [gl])
  useEffect(() => () => onPlace(null), [onPlace])
  // start over the Atlantic, tilted so the northern cities face us
  useLayoutEffect(() => { g.current.rotation.set(0.55, THREE.MathUtils.degToRad(40), 0) }, [])

  const tmp = useMemo(() => new THREE.Vector3(), []), toCam = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ clock, camera, pointer, size }, delta) => {
    const t = clock.elapsedTime, d = drag.current, grp = g.current
    if (d.down || d.dx || d.dy) {
      grp.rotation.y += d.dx * 0.006
      grp.rotation.x = THREE.MathUtils.clamp(grp.rotation.x + d.dy * 0.004, -0.4, 0.9)
      d.dx = d.dy = 0
    } else if (!reduced) grp.rotation.y += delta * 0.05
    arcs.forEach((a, i) => {
      const u = (reduced ? 0.5 : (t * 0.22 + a.off) % 1) * (a.pts.length - 1), j = Math.floor(u)
      pulses.current[i]?.position.copy(a.pts[j]).lerp(a.pts[Math.min(j + 1, a.pts.length - 1)], u - j)
    })
    grp.updateMatrixWorld()
    // which cities face us, and which one the pointer is on
    const px = (pointer.x + 1) / 2 * size.width, py = (1 - pointer.y) / 2 * size.height
    let best = null, bd = 34
    places.forEach((v, i) => {
      tmp.copy(v).applyMatrix4(grp.matrixWorld)
      const facing = tmp.clone().normalize().dot(toCam.copy(camera.position).sub(tmp).normalize())
      const s = sprites.current[i]
      if (s?.dot && s.halo) { s.dot.visible = s.halo.visible = facing > 0.05; s.halo.scale.setScalar(0.32 + (reduced ? 0 : Math.sin(t * 2.4 + i) * 0.06)) }
      if (labels.current[i]) labels.current[i].style.opacity = facing > 0.15 ? 1 : 0
      tmp.project(camera)
      const dist = Math.hypot((tmp.x + 1) / 2 * size.width - px, (1 - tmp.y) / 2 * size.height - py)
      if (facing > 0.15 && dist < bd) { bd = dist; best = i }
    })
    if (best !== hovered.current) { hovered.current = best; onPlace(best === null ? null : PLACES[best]) }
  })

  return (
    <group ref={g}>
      <points geometry={land}>
        <pointsMaterial map={dotTexture} color="#9DB2FF" size={0.036} transparent depthWrite={false} opacity={0.9} />
      </points>
      <mesh><sphereGeometry args={[R * 0.985, 64, 48]} /><meshBasicMaterial color="#070912" /></mesh>
      <mesh scale={1.12 / 0.985} material={atmosphere}><sphereGeometry args={[R * 0.985, 64, 48]} /></mesh>
      {arcs.map((a, i) => (
        <group key={i}>
          <line geometry={a.geo}><lineBasicMaterial color="#3E66FF" transparent opacity={0.7} /></line>
          <sprite ref={(s) => { pulses.current[i] = s }} scale={0.07}>
            <spriteMaterial map={dotTexture} color="#CFE0FF" depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </group>
      ))}
      {places.map((v, i) => (
        <group key={PLACES[i].name} position={v}>
          <sprite ref={(s) => { sprites.current[i] = { ...sprites.current[i], dot: s } }} scale={0.11}>
            <spriteMaterial map={dotTexture} color="#FFFFFF" depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <sprite ref={(s) => { sprites.current[i] = { ...sprites.current[i], halo: s } }}>
            <spriteMaterial map={dotTexture} color="#3E66FF" transparent depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <Html ref={(el) => { labels.current[i] = el }} zIndexRange={[2, 0]} pointerEvents="none"><span className={`place${PLACES[i].left ? ' left' : ''}`}>{PLACES[i].name}</span></Html>
        </group>
      ))}
    </group>
  )
}
