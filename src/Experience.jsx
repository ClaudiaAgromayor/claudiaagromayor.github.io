import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { CHAPTERS, AREAS, AVATAR_URL } from './data/chapters'

const N = CHAPTERS.length
const CENTER_Y = 0.1       // height the camera looks at
const STEP = 0.95          // radians the camera travels around the centre per chapter
const FRONT = Math.PI / 2
const RING = 2.25          // distance of the photos from the centre

// Scroll position → "chapter coordinate" c: -1 = intro, 0..N-1 = chapters, N = outro
export const offsetToC = (o) => o * (N + 1) - 1
export const cToOffset = (c) => (c + 1) / (N + 1)
export const maxScroll = () => document.documentElement.scrollHeight - innerHeight

/* ── a rhythmic-gymnastics ribbon: her life line, growing as the story goes on ── */
const TURNS = 2.6
const SEGS = 900
function ribbonPath(t, time, v = new THREE.Vector3()) {
  const a = t * TURNS * Math.PI * 2 + time * 0.12
  const r = 0.35 + 0.75 * Math.sin(Math.PI * Math.min(1, t * 1.15)) + 0.12 * Math.sin(t * 17 + time * 0.8)
  return v.set(Math.cos(a) * r, -1.0 + 2.5 * t + 0.08 * Math.sin(t * 11 + time), Math.sin(a) * r)
}
const silk = new THREE.MeshPhysicalMaterial({
  color: '#A6C0F2', roughness: 0.3, metalness: 0.05, sheen: 1, sheenColor: '#FFFFFF', sheenRoughness: 0.35,
  clearcoat: 0.4, clearcoatRoughness: 0.3, side: THREE.DoubleSide,
})

function Ribbon({ reduced }) {
  // built once: the shape is static, the whole ribbon turns and floats gently
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array((SEGS + 1) * 2 * 3)
    const idx = []
    for (let i = 0; i < SEGS; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) }
    const time = 0
    const p = new THREE.Vector3(), q = new THREE.Vector3(), tan = new THREE.Vector3(), side = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i <= SEGS; i++) {
      const t = i / SEGS
      ribbonPath(t, time, p); ribbonPath(Math.min(1, t + 0.002), time, q)
      tan.subVectors(q, p).normalize()
      // the band twists slowly along its length, like silk in the air
      const tw = t * 9 + time * 0.5
      side.crossVectors(tan, up).normalize().multiplyScalar(Math.cos(tw)).addScaledVector(up, Math.sin(tw) * 0.9)
      side.addScaledVector(tan, -side.dot(tan)).normalize()
      const w = 0.11 * Math.sin(Math.PI * Math.min(1, t * 1.02 + 0.02)) + 0.02
      pos.set([p.x - side.x * w, p.y - side.y * w, p.z - side.z * w, p.x + side.x * w, p.y + side.y * w, p.z + side.z * w], i * 6)
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [])
  const ref = useRef()
  useFrame(({ clock }) => {
    if (reduced) return
    const t = clock.elapsedTime
    ref.current.rotation.y = t * 0.08
    ref.current.position.y = Math.sin(t * 0.5) * 0.05
  })
  return <mesh ref={ref} geometry={geo} material={silk} frustumCulled={false} />
}

/* Optional: a 3D model of her, if one is set in data/chapters.js */
const porcelain = new THREE.MeshPhysicalMaterial({ color: '#F4F7FC', roughness: 0.3, clearcoat: 0.6 })
function Avatar({ url }) {
  const { scene } = useGLTF(url)
  const obj = useMemo(() => {
    const s = scene.clone(true)
    const box = new THREE.Box3().setFromObject(s)
    const size = box.getSize(new THREE.Vector3())
    s.scale.setScalar(1.8 / size.y)
    box.setFromObject(s)
    s.position.set(-(box.min.x + box.max.x) / 2, -box.min.y - 1.2, -(box.min.z + box.max.z) / 2)
    s.traverse((o) => { if (o.isMesh) o.material = porcelain })
    return s
  }, [scene])
  return <primitive object={obj} />
}

/* ── photos floating around ───────────────────────────────── */
const DEEP = new THREE.Color('#15305F'), PALE = new THREE.Color('#E6EDF8')
const cardMat = () => new THREE.ShaderMaterial({
  transparent: true, side: THREE.DoubleSide, depthWrite: false,
  uniforms: { uMap: { value: null }, uColor: { value: 0 }, uOpacity: { value: 0 }, uDeep: { value: DEEP }, uPale: { value: PALE } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; vec3 p = position; p.z -= p.x * p.x * .12; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }',
  fragmentShader: `uniform sampler2D uMap; uniform float uColor, uOpacity; uniform vec3 uDeep, uPale; varying vec2 vUv;
    void main(){
      vec3 c = texture2D(uMap, gl_FrontFacing ? vUv : vec2(1. - vUv.x, vUv.y)).rgb;
      float g = dot(c, vec3(.299, .587, .114));
      vec3 duo = mix(uDeep, uPale, smoothstep(.05, .95, g)); // blue-tinted black & white
      gl_FragColor = vec4(mix(duo, c, uColor), uOpacity);
      #include <colorspace_fragment>
    }`,
})

// A quiet placeholder for chapters that have no photo yet: an empty frame with the year
function placeholder(ch) {
  const c = document.createElement('canvas'); c.width = 900; c.height = 600
  const x = c.getContext('2d')
  const g = x.createLinearGradient(0, 0, 900, 600); g.addColorStop(0, '#D6E1F2'); g.addColorStop(1, '#B9C9E4')
  x.fillStyle = g; x.fillRect(0, 0, 900, 600)
  x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 2; x.strokeRect(36, 36, 828, 528)
  x.fillStyle = 'rgba(21,48,95,.75)'; x.textAlign = 'center'
  x.font = '600 64px Fraunces, Georgia, serif'; x.fillText(String(ch.year), 450, 320)
  x.font = '600 20px Figtree, Arial, sans-serif'; x.fillStyle = 'rgba(21,48,95,.5)'
  x.fillText(AREAS[ch.area].name.toUpperCase(), 450, 366)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

const loader = new THREE.TextureLoader()
// the chapter's main photo sits on the ring, extra photos float near it
const CARDS = CHAPTERS.flatMap((ch, i) => {
  const photos = [ch.img, ...(ch.photos || [])].filter(Boolean)
  const a = FRONT + i * STEP
  const main = { i, main: true, src: photos[0], a, r: RING, y: CENTER_Y + ((i % 3) - 1) * 0.08, w: ch.img ? 1.2 : 0.9 }
  const extras = photos.slice(1).map((src, k) => ({
    i, main: false, src, a: a + (k % 2 ? 0.62 : -0.62) + k * 0.08, r: RING + 0.9, y: CENTER_Y + 0.8 - (k % 3) * 0.75, w: 0.95,
  }))
  return [main, ...extras]
})

function Card({ card, onSelect }) {
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
    const near = Math.abs(rig.c - card.i)
    const act = card.main ? THREE.MathUtils.clamp(1 - near, 0, 1) : 0
    const vis = THREE.MathUtils.clamp(2.6 - near * 0.55, 0, 1) * THREE.MathUtils.clamp(rig.c + 1, 0, 1) // hidden on the intro
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

/* ── scene ─────────────────────────────────────────────────── */
// The scene is drawn in two layers so her name can sit between them:
//   back  — the ribbon, softly blurred (CSS)      front — the photos, sharp
// The back layer drives the camera; the front layer copies it every frame.
const rig = { c: -1, pos: new THREE.Vector3(0, CENTER_Y + 0.25, 6.8), look: new THREE.Vector3(0, CENTER_Y, 0), shift: 1 }

function useSnap(reduced) {
  // Settle on a chapter once scrolling stops — always in the direction the
  // visitor was moving, so a small scroll never bounces back.
  useEffect(() => {
    let timer, last = scrollY, dir = 0, lastInput = 0
    const onInput = () => { lastInput = performance.now() }
    const onScroll = () => {
      const d = scrollY - last
      if (Math.abs(d) > 0.5) dir = Math.sign(d)
      last = scrollY
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (performance.now() - lastInput < 400) return onScroll()
        const max = maxScroll()
        if (max <= 0) return
        const c = offsetToC(scrollY / max)
        const to = dir > 0 ? Math.ceil(c - 0.08) : dir < 0 ? Math.floor(c + 0.08) : Math.round(c)
        const top = cToOffset(THREE.MathUtils.clamp(to, -1, N)) * max
        if (Math.abs(top - scrollY) > 2) scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
      }, 420)
    }
    const inputs = ['wheel', 'touchmove', 'keydown']
    addEventListener('scroll', onScroll, { passive: true })
    inputs.forEach((e) => addEventListener(e, onInput, { passive: true }))
    return () => {
      clearTimeout(timer)
      removeEventListener('scroll', onScroll)
      inputs.forEach((e) => removeEventListener(e, onInput))
    }
  }, [reduced])
}

function applyCamera(camera, size) {
  camera.position.copy(rig.pos)
  camera.lookAt(rig.look)
  const { width: w, height: h } = size
  camera.setViewOffset(w, h, -w * 0.16 * rig.shift, 0, w, h)
}

export function BackScene({ onActive, onProgress, reduced }) {
  const offset = useRef(0)
  const lastActive = useRef(null)
  const lastC = useRef(-9)
  useSnap(reduced)

  useFrame((st, dt) => {
    const max = maxScroll()
    const target = max > 0 ? THREE.MathUtils.clamp(scrollY / max, 0, 1) : 0
    offset.current = reduced ? target : THREE.MathUtils.damp(offset.current, target, 4.5, dt)
    const c = offsetToC(offset.current)
    rig.c = c

    const act = THREE.MathUtils.clamp(Math.round(c), -1, N)
    if (act !== lastActive.current) { lastActive.current = act; onActive(act) }
    if (Math.abs(c - lastC.current) > 0.002) { lastC.current = c; onProgress(c) }

    // the camera circles the ribbon; on the intro it stands back
    const intro = THREE.MathUtils.clamp(-c, 0, 1), outro = THREE.MathUtils.clamp(c - (N - 1), 0, 1)
    const ang = FRONT + THREE.MathUtils.clamp(c, 0, N - 1) * STEP + outro * 0.6
    const dist = 5.6 + intro * 1.2 + outro * 1.4
    const y = CENTER_Y + 0.25 + outro * 0.5 + (reduced ? 0 : Math.sin(st.clock.elapsedTime * 0.25) * 0.04)
    const k = reduced ? 1 : 1 - Math.exp(-3 * dt)
    rig.pos.lerp(new THREE.Vector3(Math.cos(ang) * dist, y, Math.sin(ang) * dist), k)
    rig.look.lerp(new THREE.Vector3(0, CENTER_Y, 0), k)
    // on the intro and outro screens the text sits on the left: slide the scene right
    rig.shift = THREE.MathUtils.damp(rig.shift, st.size.width > 760 ? Math.max(intro, outro) : 0, 4, dt)
    applyCamera(st.camera, st.size)
  })

  return (
    <>
      <hemisphereLight args={['#FFFFFF', '#C9D6EA', 1.4]} />
      <directionalLight position={[3, 5, 4]} intensity={2} color="#FFFFFF" />
      <directionalLight position={[-4, 1, -3]} intensity={1.2} color="#8FAEE8" />
      {!AVATAR_URL && <Ribbon reduced={reduced} />}
    </>
  )
}

export function FrontScene({ onSelect }) {
  useFrame((st) => applyCamera(st.camera, st.size))
  return (
    <>
      {AVATAR_URL && (
        <>
          <hemisphereLight args={['#FFFFFF', '#C9D6EA', 1.4]} />
          <directionalLight position={[3, 5, 4]} intensity={2} />
          <Avatar url={AVATAR_URL} />
        </>
      )}
      {CARDS.map((card, k) => <Card key={k} card={card} onSelect={onSelect} />)}
    </>
  )
}
