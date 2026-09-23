import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js'
import * as THREE from 'three'
import { CHAPTERS, AREAS, AVATAR_URL } from './data/chapters'

const N = CHAPTERS.length
const TURNS = 3.2
const FLOOR = -1.1
const STEP = 0.95        // radians the camera travels around the figure per chapter
const FRONT = Math.PI / 2 // the statue faces +z
const RING = 2.25        // distance of the photos from the figure

// Scroll position → "chapter coordinate" c: -1 = intro, 0..N-1 = chapters, N = outro
export const offsetToC = (o) => o * (N + 1) - 1
export const cToOffset = (c) => (c + 1) / (N + 1)
export const maxScroll = () => document.documentElement.scrollHeight - innerHeight

// The life line: a helix that widens and rises as time goes on
function helix(t, v = new THREE.Vector3()) {
  const a = t * TURNS * Math.PI * 2 + Math.PI / 2
  const r = 1.0 + 1.1 * t
  return v.set(Math.cos(a) * r, FLOOR + 0.15 + 2.1 * t, Math.sin(a) * r)
}
const cToT = (c) => THREE.MathUtils.clamp((c + 0.5) / N, 0, 1)

/* ── the statue ───────────────────────────────────────────── */
const statue = new THREE.MeshStandardMaterial({ color: '#DCE6DA', roughness: 0.55, metalness: 0 })

/* Abstract, faceless figure made of metaballs: a gymnast's salute, one arm raised.
   Bones are in world units (feet at y = 0, ~1.9 tall); each bone is a chain of balls. */
const BONES = [
  [[-0.09, 0.05, 0], [-0.075, 0.86, 0], 0.07], [[0.1, 0.05, 0.03], [0.075, 0.86, 0], 0.07], // legs
  [[0, 0.9, 0], [0, 0.95, 0], 0.13],                                                            // hips
  [[0, 0.98, 0], [0, 1.34, 0], 0.125],                                                          // torso
  [[-0.14, 1.33, 0], [0.14, 1.33, 0], 0.07],                                                    // shoulders
  [[0, 1.4, 0], [0, 1.5, 0], 0.05],                                                             // neck
  [[0, 1.61, 0], [0, 1.64, 0], 0.105],                                                          // head
  [[-0.17, 1.32, 0], [-0.25, 0.86, 0.03], 0.045],                                               // arm, down
  [[0.17, 1.34, 0], [0.3, 1.86, 0], 0.045],                                                     // arm, raised
]
const BALLS = BONES.flatMap(([a, b, r]) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b)
  const n = Math.max(1, Math.ceil(A.distanceTo(B) / (r * 0.7)))
  return Array.from({ length: n + 1 }, (_, k) => ({ p: A.clone().lerp(B, k / n), r }))
})
const ISO = 80, SUB = 12

function Figure() {
  const mc = useMemo(() => {
    const m = new MarchingCubes(64, statue, false, false, 30000)
    m.isolation = ISO
    m.reset()
    BALLS.forEach(({ p, r }) => {
      const rc = r / 2 // world → cube units (the cube spans 2 world units)
      m.addBall(0.5 + p.x / 2, 0.02 + p.y / 2, 0.5 + p.z / 2, rc * rc * (ISO + SUB) * 0.42, SUB)
    })
    m.update()
    return m
  }, [])
  // cube local [-1, 1] → feet at y = 0
  return <primitive object={mc} position={[0, 0.96, 0]} />
}

function Avatar({ url }) {
  const { scene } = useGLTF(url)
  const obj = useMemo(() => {
    const s = scene.clone(true)
    const box = new THREE.Box3().setFromObject(s)
    const size = box.getSize(new THREE.Vector3())
    s.scale.setScalar(1.8 / size.y)
    box.setFromObject(s)
    s.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2)
    s.traverse((o) => { if (o.isMesh) o.material = statue })
    return s
  }, [scene])
  return <primitive object={obj} />
}

/* The dark rock she stands on */
function Rock() {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 7)
    const p = g.attributes.position, v = new THREE.Vector3()
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i)
      const n = 1 + 0.16 * Math.sin(v.x * 5 + v.z * 3.1) * Math.cos(v.y * 4.3 - v.x * 2.2) + 0.035 * Math.sin(v.x * 9 + v.y * 7) * Math.sin(v.z * 8)
      let y = v.y * n
      if (y > 0.25) y = 0.25 + (y - 0.25) * 0.15 // a flat-ish top to stand on
      p.setXYZ(i, v.x * n * 1.25, y - 0.27, v.z * n)
    }
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geo} scale={[0.75, 0.9, 0.75]}>
      <meshStandardMaterial color="#2A2E2B" roughness={0.8} metalness={0.15} />
    </mesh>
  )
}

/* ── photos floating around her ───────────────────────────── */
const DEEP = new THREE.Color('#2C4231'), PALE = new THREE.Color('#C9D8C6')
const cardMat = () => new THREE.ShaderMaterial({
  transparent: true, side: THREE.DoubleSide, depthWrite: false,
  uniforms: { uMap: { value: null }, uColor: { value: 0 }, uOpacity: { value: 0 }, uDeep: { value: DEEP }, uPale: { value: PALE } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; vec3 p = position; p.z -= p.x * p.x * .12; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }',
  fragmentShader: `uniform sampler2D uMap; uniform float uColor, uOpacity; uniform vec3 uDeep, uPale; varying vec2 vUv;
    void main(){
      vec3 c = texture2D(uMap, gl_FrontFacing ? vUv : vec2(1. - vUv.x, vUv.y)).rgb;
      float g = dot(c, vec3(.299, .587, .114));
      vec3 duo = mix(uDeep, uPale, smoothstep(.05, .95, g)); // green-tinted black & white
      gl_FragColor = vec4(mix(duo, c, uColor), uOpacity);
      #include <colorspace_fragment>
    }`,
})

// A quiet placeholder for chapters that have no photo yet: an empty frame with the year
function placeholder(ch) {
  const c = document.createElement('canvas'); c.width = 900; c.height = 600
  const x = c.getContext('2d')
  const g = x.createLinearGradient(0, 0, 900, 600); g.addColorStop(0, '#A9BAA5'); g.addColorStop(1, '#8A9E87')
  x.fillStyle = g; x.fillRect(0, 0, 900, 600)
  x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = 2; x.strokeRect(36, 36, 828, 528)
  x.fillStyle = 'rgba(255,255,255,.8)'; x.textAlign = 'center'
  x.font = '600 64px Fraunces, Georgia, serif'; x.fillText(String(ch.year), 450, 320)
  x.font = '600 20px Figtree, Arial, sans-serif'; x.fillStyle = 'rgba(255,255,255,.6)'
  x.fillText(AREAS[ch.area].name.toUpperCase(), 450, 366)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

const loader = new THREE.TextureLoader()
// every photo of the story: the chapter's main photo sits on the ring, extra photos float near it
const CARDS = CHAPTERS.flatMap((ch, i) => {
  const photos = [ch.img, ...(ch.photos || [])].filter(Boolean)
  const a = FRONT + i * STEP
  const main = { i, main: true, src: photos[0], a, r: RING, y: FLOOR + 1.1 + ((i % 3) - 1) * 0.08, w: ch.img ? 1.2 : 0.9 }
  const extras = photos.slice(1).map((src, k) => ({
    i, main: false, src, a: a + (k % 2 ? 0.62 : -0.62) + k * 0.08, r: RING + 0.9, y: FLOOR + 1.9 - (k % 3) * 0.75, w: 0.95,
  }))
  return [main, ...extras]
})

function Card({ card, onSelect, state }) {
  const ref = useRef()
  const mat = useMemo(cardMat, [])
  useEffect(() => {
    const set = (tex, aspect) => { mat.uniforms.uMap.value = tex; ref.current?.scale.set(card.w, card.w / aspect, 1) }
    if (card.src) loader.load(card.src, (tex) => { tex.colorSpace = THREE.SRGBColorSpace; set(tex, tex.image.width / tex.image.height) })
    else set(placeholder(CHAPTERS[card.i]), 1.5)
  }, [card, mat])
  useEffect(() => {
    const m = ref.current
    m.position.set(Math.cos(card.a) * card.r, card.y, Math.sin(card.a) * card.r)
    m.lookAt(Math.cos(card.a) * 20, card.y, Math.sin(card.a) * 20) // face outwards, towards the camera path
  }, [card])
  useFrame((_, dt) => {
    const near = Math.abs(state.current.c - card.i)
    const act = card.main ? THREE.MathUtils.clamp(1 - near, 0, 1) : 0
    const vis = THREE.MathUtils.clamp(2.6 - near * 0.55, 0, 1) * THREE.MathUtils.clamp(state.current.c + 1, 0, 1) // hidden on the intro
    const u = mat.uniforms
    u.uColor.value = THREE.MathUtils.damp(u.uColor.value, act * 0.95, 5, dt)
    u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, (card.main ? 0.55 + 0.45 * act : 0.75) * vis, 5, dt)
    const inner = ref.current.children[0]
    inner.scale.setScalar(THREE.MathUtils.damp(inner.scale.x, card.main ? 0.62 + 0.38 * act : 1, 5, dt))
  })
  return (
    <group ref={ref}>
      <mesh material={mat} onClick={(e) => { e.stopPropagation(); onSelect(card.i) }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
        <planeGeometry args={[1, 1, 24, 1]} />
      </mesh>
    </group>
  )
}

/* ── the life line: a faint ribbon of light ───────────────── */
const ribbonMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  uniforms: { uProgress: { value: 0 }, uTime: { value: 0 } },
  vertexShader: `attribute float aT; attribute float aSide; varying float vT; varying float vSide;
    void main(){ vT = aT; vSide = aSide; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: `uniform float uProgress, uTime; varying float vT; varying float vSide;
    void main(){
      if (vT > uProgress) discard;
      float edge = 1. - abs(vSide);
      float a = (smoothstep(.75, 1., edge) * .7 + pow(edge, 3.) * .25) * (.35 + .65 * smoothstep(uProgress - .3, uProgress, vT));
      a *= .8 + .2 * sin(vT * 140. - uTime * 2.);
      gl_FragColor = vec4(vec3(.93, .97, .9) * a, a);
    }`,
})
function useRibbonGeometry() {
  return useMemo(() => {
    const n = 1400, W = 0.03
    const pos = new Float32Array((n + 1) * 6), at = new Float32Array((n + 1) * 2), side = new Float32Array((n + 1) * 2), idx = []
    const p = new THREE.Vector3(), q = new THREE.Vector3(), tan = new THREE.Vector3(), rad = new THREE.Vector3(), nrm = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i <= n; i++) {
      const t = i / n
      helix(t, p); helix(Math.min(1, t + 0.001), q); tan.subVectors(q, p).normalize()
      rad.set(p.x, 0, p.z).normalize()
      const tw = t * TURNS * Math.PI * 1.5
      nrm.copy(up).multiplyScalar(Math.cos(tw)).addScaledVector(rad, Math.sin(tw))
      nrm.addScaledVector(tan, -nrm.dot(tan)).normalize()
      for (let k = 0; k < 2; k++) {
        const sgn = k ? 1 : -1, o = i * 2 + k
        pos[o * 3] = p.x + nrm.x * W * sgn; pos[o * 3 + 1] = p.y + nrm.y * W * sgn; pos[o * 3 + 2] = p.z + nrm.z * W * sgn
        at[o] = t; side[o] = sgn
      }
      if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aT', new THREE.BufferAttribute(at, 1))
    g.setAttribute('aSide', new THREE.BufferAttribute(side, 1))
    g.setIndex(idx)
    return g
  }, [])
}

/* ── scene ─────────────────────────────────────────────────── */
export default function Experience({ onActive, onProgress, onSelect, reduced }) {
  const offset = useRef(0)
  const state = useRef({ c: -1 })
  const look = useRef(new THREE.Vector3(0, FLOOR + 1, 0))
  const lastActive = useRef(null)
  const lastProg = useRef(-1)
  const ribbonGeo = useRibbonGeometry()

  // Settle on a chapter once scrolling stops — always in the direction the
  // visitor was moving, so a small scroll never bounces back.
  useEffect(() => {
    let timer, last = scrollY, dir = 0
    const onScroll = () => {
      const d = scrollY - last
      if (Math.abs(d) > 0.5) dir = Math.sign(d)
      last = scrollY
      clearTimeout(timer)
      timer = setTimeout(() => {
        const max = maxScroll()
        if (max <= 0) return
        const c = offsetToC(scrollY / max)
        const to = dir > 0 ? Math.ceil(c - 0.08) : dir < 0 ? Math.floor(c + 0.08) : Math.round(c)
        const top = cToOffset(THREE.MathUtils.clamp(to, -1, N)) * max
        if (Math.abs(top - scrollY) > 2) scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
      }, 260)
    }
    addEventListener('scroll', onScroll, { passive: true })
    return () => { clearTimeout(timer); removeEventListener('scroll', onScroll) }
  }, [reduced])

  useFrame((st, dt) => {
    const max = maxScroll()
    const target = max > 0 ? THREE.MathUtils.clamp(scrollY / max, 0, 1) : 0
    offset.current = reduced ? target : THREE.MathUtils.damp(offset.current, target, 4.5, dt)
    const c = offsetToC(offset.current)
    state.current.c = c
    const time = st.clock.elapsedTime

    const act = THREE.MathUtils.clamp(Math.round(c), -1, N)
    if (act !== lastActive.current) { lastActive.current = act; onActive(act) }
    const prog = Math.round(THREE.MathUtils.clamp(c / (N - 1), 0, 1) * 200) / 200
    if (prog !== lastProg.current) { lastProg.current = prog; onProgress(prog) }

    ribbonMat.uniforms.uProgress.value = cToT(c)
    ribbonMat.uniforms.uTime.value = reduced ? 0 : time

    // the camera circles her; on the intro it stands back, low, looking up at the statue
    const intro = THREE.MathUtils.clamp(-c, 0, 1), outro = THREE.MathUtils.clamp(c - (N - 1), 0, 1)
    const ang = FRONT + THREE.MathUtils.clamp(c, 0, N - 1) * STEP + outro * 0.6
    const dist = 5.6 + intro * 1.6 + outro * 1.2
    const y = FLOOR + 1.2 - intro * 0.2 + outro * 0.4 + (reduced ? 0 : Math.sin(time * 0.25) * 0.04)
    const want = new THREE.Vector3(Math.cos(ang) * dist, y, Math.sin(ang) * dist)
    const k = reduced ? 1 : 1 - Math.exp(-3 * dt)
    st.camera.position.lerp(want, k)
    look.current.lerp(new THREE.Vector3(0, FLOOR + 0.85 + intro * 0.1, 0), k)
    st.camera.lookAt(look.current)
  })

  return (
    <>
      <hemisphereLight args={['#EEF4EA', '#23302A', 1.3]} />
      <directionalLight position={[2, 4, 5]} intensity={1.6} color="#FFFFFF" />
      <directionalLight position={[-4, 2, -3]} intensity={1.1} color="#BFE0C6" />

      <group position={[0, FLOOR, 0]}>
        {AVATAR_URL ? <Avatar url={AVATAR_URL} /> : <Figure />}
        <Rock />
      </group>

      <mesh geometry={ribbonGeo} material={ribbonMat} frustumCulled={false} />

      {CARDS.map((card, k) => <Card key={k} card={card} onSelect={onSelect} state={state} />)}
    </>
  )
}
