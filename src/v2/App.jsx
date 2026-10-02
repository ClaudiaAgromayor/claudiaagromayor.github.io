import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Lenis from 'lenis'
import Hero3D from './Hero3D'
import Avatar3D, { Floating, StudioLights } from './Avatar3D'
import Device3D from './Device3D'
import { STICKERS, LAYOUT } from './Stickers'
import { AREAS, CHAPTERS, PROFILE } from '../data/chapters'

const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp01 = (x) => Math.max(0, Math.min(1, x))
const pad = (n) => String(n).padStart(2, '0')

// Selected work: the headline number of each project. Titles must match src/data/chapters.js.
const WORK = [
  { title: 'IRIC, Université de Montréal', metric: '1.04M', label: 'candidates from billions screened', tags: ['Research', 'ML', 'HPC'], tone: 'ink', art: 'dots' },
  { title: 'Amazon Web Services', metric: '75→85%', label: 'first-attempt accuracy', tags: ['Industry', 'GenAI', 'Cloud'], tone: 'cobalt', art: 'rings' },
  { title: 'LLMs that follow rules', metric: '46→91%', label: 'exact match', tags: ['Research', 'LLM', 'RAG'], tone: 'paper', art: 'lines' },
  { title: 'Learning without sharing data', metric: '15', label: 'clients, zero data shared', tags: ['Thesis', 'Federated learning'], tone: 'soft', art: 'orbit' },
  { title: 'First place in 48 hours', metric: '1st', label: 'Smart Industry Hackathon', tags: ['Hackathon', 'NLP', 'FastAPI'], tone: 'ink', art: 'rings' },
  { title: 'Seeing inside a tooth', metric: '<1%', label: 'positive voxels', tags: ['Research', 'Medical imaging', '3D'], tone: 'paper', art: 'dots' },
  { title: 'Altex Asset Management', metric: '15%', label: 'annualised returns', tags: ['Industry', 'Quant', 'Time series'], tone: 'cobalt', art: 'lines' },
  { title: 'Treasurer of France’s largest student forum', metric: '€1.4M', label: 'revenue, 3,500 students', tags: ['Leadership', 'Finance'], tone: 'soft', art: 'rings' },
  { title: 'From 0 to 1,000 on TikTok', metric: '1,000', label: 'followers in month one', tags: ['Marketing', 'Social media'], tone: 'ink', art: 'orbit' },
  { title: 'Fifth in the world', tags: ['Sport', 'Gymnastics'], tone: 'photo' },
].map((w) => ({ ...w, ch: CHAPTERS.find((c) => c.title === w.title) })).filter((w) => w.ch)

const USED = Object.keys(AREAS).filter((k) => CHAPTERS.some((c) => c.area === k))

/* ── smooth scrolling ──────────────────────────────────────── */
let lenis = null
function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.6 })
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
}

/* ── scroll-driven helpers ─────────────────────────────────── */
// progress of an element through the viewport: 0 when its top enters, 1 when its bottom leaves
function passProgress(el) {
  const r = el.getBoundingClientRect(), vh = innerHeight
  return clamp01((vh - r.top) / (r.height + vh))
}
// progress through a tall section with a sticky inner: 0 at its top, 1 when its end reaches the bottom
function stickyProgress(el) {
  const r = el.getBoundingClientRect()
  return clamp01(-r.top / Math.max(1, r.height - innerHeight))
}
function useScrub(ref, fn) {
  useEffect(() => {
    let raf
    const tick = () => { if (ref.current) fn(ref.current); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ref, fn])
}
function useInView(ref, margin = '200px') {
  const [v, setV] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: margin })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [ref, margin])
  return v
}

/* ── a thick 3D-looking tube that draws itself as you scroll ── */
function Tube({ d, from, to, className }) {
  const wrap = useRef(null), main = useRef(null), shine = useRef(null)
  const id = useRef('t' + Math.random().toString(36).slice(2)).current
  const draw = useCallback((el) => {
    const p = reduced ? 1 : clamp01((passProgress(el) - 0.08) / 0.55)
    for (const path of [main.current, shine.current]) {
      const len = path.getTotalLength()
      path.style.strokeDasharray = len
      path.style.strokeDashoffset = len * (1 - p)
    }
  }, [])
  useScrub(wrap, draw)
  return (
    <svg ref={wrap} className={`tube ${className || ''}`} viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} /><stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <path ref={main} d={d} fill="none" stroke={`url(#${id})`} strokeWidth="38" strokeLinecap="round" />
      <path ref={shine} d={d} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="8" strokeLinecap="round" transform="translate(-6 -8)" />
    </svg>
  )
}

/* ── page ──────────────────────────────────────────────────── */
export default function App() {
  const [menu, setMenu] = useState(false)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    if (reduced) return
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })
    let id
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); lenis.destroy(); lenis = null }
  }, [])
  useEffect(() => { if (lenis) (menu || open) ? lenis.stop() : lenis.start() }, [menu, open])

  // text and rows rise into place as they enter the screen
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { rootMargin: '0px 0px -8% 0px' })
    const scan = () => document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setMenu(false); setOpen(null) } }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])
  const go = (id) => { setMenu(false); scrollToId(id) }

  return (
    <>
      <a className="logo" href="#top" onClick={(e) => { e.preventDefault(); go('top') }} aria-label="Claudia Agromayor, back to top">CLAUDIA AGROMAYOR</a>
      <header className="bar">
        <span />
        <div className="actions">
          <button type="button" className="pill dark" onClick={() => go('contact')}>LET’S TALK <i className="dot" /></button>
          <button type="button" className="pill" onClick={() => setMenu(true)} aria-expanded={menu}>MENU <i className="dots" /></button>
        </div>
      </header>

      <main id="top">
        <Hero />
        <Intro onJourney={() => go('journey')} />
        <StoryCard onJourney={() => go('journey')} />
        <Work onOpen={setOpen} />
        <Journey />
        <Statement />
        <Finale />
        <Together />
      </main>

      <footer className="foot">
        <span>© {new Date().getFullYear()} Claudia Agromayor</span>
        <a href="/">Version 1</a>
        <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a href={PROFILE.github} target="_blank" rel="noreferrer">GitHub</a>
      </footer>

      {menu && <Menu onClose={() => setMenu(false)} go={go} />}
      {open && <Detail w={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function Hero() {
  const card = useRef(null)
  const live = useInView(card)
  return (
    <section className="hero">
      <p className="lede">
        Double master’s student in Industrial Engineering &amp; Computer Science, building machine-learning systems that hold up in the real world.
      </p>
      <div className="card hero-card" ref={card}>
        <Canvas camera={{ position: [0, 0, 10], fov: 35 }} dpr={[1, 1.75]} frameloop={live ? 'always' : 'never'} gl={{ antialias: true }}>
          <color attach="background" args={['#101218']} />
          <Suspense fallback={null}><Hero3D reduced={reduced} /></Suspense>
        </Canvas>
      </div>
      <Pluses label="SCROLL TO EXPLORE" />
    </section>
  )
}

function Pluses({ label, n = 4 }) {
  return (
    <div className="pluses" aria-hidden={!label}>
      {Array.from({ length: n + 1 }, (_, i) => (
        i === Math.floor(n / 2) && label ? <span key={i} className="plus-label">{label}</span> : <span key={i} className="plus">+</span>
      ))}
    </div>
  )
}

function Intro({ onJourney }) {
  return (
    <section className="intro">
      <Tube className="t1" from="#4B63FF" to="#1B2FC8" d="M 520 -40 C 620 120 640 260 560 380 C 470 520 120 470 90 640 C 60 800 330 860 470 760 C 600 670 560 520 420 520" />
      <h2 className="big reveal"><span className="indent">Curious by Nature,</span><br />Persistent by Choice</h2>
      <div className="intro-copy reveal">
        <p>
          I combine engineering, machine learning and economics to build systems that work outside the notebook —
          from federated learning and LLM pipelines to drug discovery at the scale of billions.
        </p>
        <button type="button" className="pill ghost" onClick={onJourney}><i className="dot" /> MY JOURNEY</button>
      </div>
    </section>
  )
}

function StoryCard({ onJourney }) {
  const wrap = useRef(null), left = useRef(null), right = useRef(null), img = useRef(null)
  const move = useCallback((el) => {
    const p = reduced ? 1 : clamp01((passProgress(el) - 0.1) / 0.4)
    const off = (1 - p) * 38
    left.current.style.transform = `translateX(${-off}vw)`
    right.current.style.transform = `translateX(${off}vw)`
    img.current.style.transform = `scale(${1.25 - 0.2 * p})`
  }, [])
  useScrub(wrap, move)
  return (
    <section className="story" ref={wrap}>
      <Pluses n={4} />
      <button type="button" className="card story-card" onClick={onJourney} aria-label="My story: open the journey">
        <img ref={img} src="/img/gimnasia-2013.jpg" alt="" />
        <span className="story-words">
          <span ref={left}>MY</span>
          <span className="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg></span>
          <span ref={right}>STORY</span>
        </span>
      </button>
      <Pluses n={4} />
    </section>
  )
}

/* Selected work: one project per line, image and text alternating sides */
function Work({ onOpen }) {
  return (
    <section className="work" id="work">
      <div className="work-head">
        <h2 className="big reveal">Selected Work</h2>
        <p className="caps reveal">A selection of research and engineering projects — from HPC pipelines to LLM systems.</p>
      </div>
      <div className="rows">
        {WORK.map((w, i) => (
          <button key={w.title} type="button" className="wrow reveal" onClick={() => onOpen(w)}>
            <span className={`card art ${w.tone}`}>
              {w.tone === 'photo'
                ? <img src={w.ch.img} alt="" loading="lazy" />
                : <>
                    <Pattern kind={w.art} />
                    <span className="metric"><b>{w.metric}</b><small>{w.label}</small></span>
                  </>}
            </span>
            <span className="wtext">
              <span className="widx">{pad(i + 1)} / {pad(WORK.length)}</span>
              <span className="tags">{w.tags.join(' • ').toUpperCase()}</span>
              <span className="title"><i className="arrow" aria-hidden="true">→</i>{w.title}</span>
              <span className="wline">{w.ch.line}</span>
              <span className="wmeta">{w.ch.date} · {w.ch.place}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function Pattern({ kind }) {
  if (kind === 'rings') return (
    <svg className="pattern" viewBox="0 0 400 250" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx="320" cy="40" r={30 + i * 34} />)}
    </svg>
  )
  if (kind === 'lines') return (
    <svg className="pattern" viewBox="0 0 400 250" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M ${-60 + i * 24} 260 L ${80 + i * 24} -10`} />)}
    </svg>
  )
  if (kind === 'orbit') return (
    <svg className="pattern" viewBox="0 0 400 250" aria-hidden="true">
      <circle cx="290" cy="125" r="70" />
      {Array.from({ length: 15 }, (_, i) => {
        const a = (i / 15) * Math.PI * 2
        return <circle key={i} className="fill" cx={290 + Math.cos(a) * 70} cy={125 + Math.sin(a) * 70} r="6" />
      })}
    </svg>
  )
  return (
    <svg className="pattern" viewBox="0 0 400 250" aria-hidden="true">
      {Array.from({ length: 12 * 8 }, (_, i) => <circle key={i} className="fill" cx={20 + (i % 12) * 33} cy={18 + Math.floor(i / 12) * 31} r={1.6 + ((i * 7) % 5) * 0.5} />)}
    </svg>
  )
}

/* The journey: a numbered outline, one line per chapter, one image per line */
function Journey() {
  const [area, setArea] = useState('all')
  const [open, setOpen] = useState(null)
  const list = useRef(null), fill = useRef(null)
  const scrub = useCallback((el) => {
    const r = el.getBoundingClientRect()
    fill.current.style.transform = `scaleY(${clamp01((innerHeight * 0.55 - r.top) / r.height)})`
  }, [])
  useScrub(list, scrub)
  const rows = CHAPTERS.map((c, i) => ({ ...c, n: i + 1 })).filter((c) => area === 'all' || c.area === area)
  return (
    <section className="journey" id="journey">
      <div className="work-head">
        <h2 className="big reveal">The Journey</h2>
        <p className="caps reveal">{CHAPTERS.length} chapters, from {PROFILE.born} to today — sport, study, work and research. Open any line.</p>
      </div>
      <div className="chips" role="group" aria-label="Filter by category">
        {['all', ...USED].map((k) => (
          <button key={k} type="button" aria-pressed={area === k} onClick={() => { setArea(k); setOpen(null) }}>
            {k === 'all' ? 'All' : AREAS[k].name}
          </button>
        ))}
      </div>
      <ol className="jlist" ref={list}>
        <i className="rail" aria-hidden="true"><b ref={fill} /></i>
        {rows.map((c) => {
          const isOpen = open === c.n
          return (
            <li key={c.n} className={`jrow reveal${isOpen ? ' open' : ''}`}>
              <button type="button" className="jline" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : c.n)}>
                <span className="jn">{pad(c.n)}</span>
                <span className="jy">{c.year}</span>
                <span className="jt"><b>{c.title}</b><small>{c.line}</small></span>
                <span className="ja">{AREAS[c.area].name}</span>
                <Thumb c={c} />
              </button>
              <div className="jmore"><div>
                <p className="jmeta">{c.date} · {c.place}</p>
                <ul>{c.facts.map((f, k) => <li key={k}>{f}</li>)}</ul>
                <p className="jtook">{c.took}</p>
                {c.link && <a className="src" href={c.link} target="_blank" rel="noreferrer">Read the news (Spanish) ↗</a>}
              </div></div>
            </li>
          )
        })}
        {area === 'all' && (
          <li className="jrow next reveal">
            <button type="button" className="jline" onClick={() => scrollToId('contact')}>
              <span className="jn">{pad(CHAPTERS.length + 1)}</span>
              <span className="jy">2027</span>
              <span className="jt"><b>The next chapter</b><small>{PROFILE.next}</small></span>
              <span className="ja">Coming soon</span>
              <span className="thumb soon"><b>?</b></span>
            </button>
          </li>
        )}
      </ol>
    </section>
  )
}

function Thumb({ c }) {
  if (c.img) return <span className="thumb"><img src={c.img} alt="" loading="lazy" /></span>
  return <span className={`thumb gen ${c.area}`}><b>{c.year}</b></span>
}

function Statement() {
  const tablet = useRef(null)
  const live = useInView(tablet)
  return (
    <section className="statement">
      <Tube className="t2" from="#7FD8FF" to="#2E6BFF" d="M 1500 520 C 1200 420 1000 520 980 300 C 960 80 1180 -20 1260 120 C 1330 250 1180 460 820 470 C 520 480 380 380 330 220" />
      <h2 className="big reveal">Where Curiosity<br />Becomes Research<br />That Matters</h2>
      <div className="device-row">
        <div className="tablet reveal" ref={tablet}>
          <div className="screen">
            <Canvas camera={{ position: [0, 0.2, 5.4], fov: 34 }} dpr={[1, 1.75]} frameloop={live ? 'always' : 'never'} gl={{ antialias: true }}>
              <Suspense fallback={null}><Device3D reduced={reduced} /></Suspense>
            </Canvas>
          </div>
        </div>
        <div className="statement-copy reveal">
          <p>I like problems that sit between disciplines: a trading strategy that needs honest validation, a set of factories that cannot share their data, a molecule library too large to screen by hand.</p>
          <p>Gymnastics taught me that precision is trained. Engineering taught me to measure it. Research taught me to question the measurement.</p>
        </div>
      </div>
    </section>
  )
}

/* The dark part: she rises into view, then dives into a tunnel of data */
function Finale() {
  const wrap = useRef(null), text = useRef(null), dive = useRef(null), halo = useRef(null)
  const progress = useRef(0)
  const live = useInView(wrap, '0px')
  const scrub = useCallback((el) => {
    const p = stickyProgress(el)
    progress.current = p
    text.current.style.opacity = 1 - clamp01((p - 0.38) / 0.14)
    text.current.style.transform = `translateY(${-clamp01((p - 0.38) / 0.3) * 60}px)`
    const d = clamp01((p - 0.64) / 0.08) * (1 - clamp01((p - 0.9) / 0.08))
    dive.current.style.opacity = d
    dive.current.style.transform = `scale(${0.94 + d * 0.06})`
    halo.current.style.opacity = 1 - clamp01((p - 0.45) / 0.15)
    halo.current.style.transform = `translate(-50%, -50%) scale(${0.85 + p * 0.5})`
  }, [])
  useScrub(wrap, scrub)
  return (
    <section className="finale" ref={wrap}>
      <div className="dusk" aria-hidden="true" />
      <div className="finale-stick">
        <div className="halo" ref={halo} aria-hidden="true" />
        <div className="finale-canvas">
          <Canvas camera={{ position: [0, 0, 6], fov: 35 }} dpr={[1, 1.75]} frameloop={live ? 'always' : 'never'} gl={{ antialias: true, alpha: true }}>
            <Suspense fallback={null}><Avatar3D progress={progress} reduced={reduced} /></Suspense>
          </Canvas>
        </div>
        <h2 className="finale-text" ref={text}>The next chapter<br />is still<br />unwritten</h2>
        <p className="dive-text" ref={dive}>Every chapter is new data.<br /><span>The model keeps learning.</span></p>
      </div>
    </section>
  )
}

/* Call to action: her avatar, the things she loves, and how to reach her */
function Together() {
  const wrap = useRef(null)
  const live = useInView(wrap)
  const [copied, setCopied] = useState(false)
  const copy = () => navigator.clipboard?.writeText(PROFILE.email).then(() => setCopied(true), () => {})
  const onMove = (e) => {
    const r = wrap.current.getBoundingClientRect()
    wrap.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
    wrap.current.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
  }
  return (
    <section className="together" id="contact" ref={wrap} onPointerMove={onMove}>
      <div className="together-canvas" aria-hidden="true">
        <Canvas camera={{ position: [0, 0, 5], fov: 35 }} dpr={[1, 1.75]} frameloop={live ? 'always' : 'never'} gl={{ antialias: true, alpha: true }}>
          <StudioLights />
          <Suspense fallback={null}><group position={[0, -0.35, 0]} scale={1.25}><Floating reduced={reduced} sway={0.5} /></group></Suspense>
        </Canvas>
      </div>
      <div className="stickers" aria-hidden="true">
        {LAYOUT.map(([k, x, y, rot, depth], i) => (
          <span key={k} className="sticker" style={{ left: `${x}%`, top: `${y}%`, '--r': `${rot}deg`, '--d': depth, '--i': i }}>{STICKERS[k]}</span>
        ))}
      </div>
      <div className="together-text">
        <p className="caps">Got a hard problem worth solving?</p>
        <h2>Let’s work<br />together!</h2>
        <p className="caps muted">{PROFILE.next}</p>
        <div className="contact-row">
          <span className="mail">{PROFILE.email}</span>
          <button type="button" className="pill light" onClick={copy}>{copied ? 'COPIED' : 'COPY EMAIL'}</button>
          <a className="pill outline" href={PROFILE.linkedin} target="_blank" rel="noreferrer">LINKEDIN</a>
          <a className="pill outline" href={PROFILE.github} target="_blank" rel="noreferrer">GITHUB</a>
        </div>
      </div>
    </section>
  )
}

function Menu({ onClose, go }) {
  return (
    <div className="menu" role="dialog" aria-modal="true" aria-label="Menu" data-lenis-prevent>
      <button type="button" className="pill menu-close" onClick={onClose}>CLOSE</button>
      <nav>
        <button type="button" onClick={() => go('top')}>Home</button>
        <button type="button" onClick={() => go('work')}>Work</button>
        <button type="button" onClick={() => go('journey')}>Journey</button>
        <button type="button" onClick={() => go('contact')}>Contact</button>
      </nav>
      <p className="caps">{PROFILE.places}</p>
    </div>
  )
}

function Detail({ w, onClose }) {
  const c = w.ch
  return (
    <div className="detail" role="dialog" aria-modal="true" aria-label={c.title} onClick={onClose}>
      <article className="detail-card" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pill menu-close" onClick={onClose}>CLOSE</button>
        <p className="tags">{w.tags.join(' • ').toUpperCase()} — {c.date} · {c.place}</p>
        <h3>{c.title}</h3>
        <p className="detail-line">{c.line}</p>
        {c.img && <img src={c.img} alt="" />}
        <ul>{c.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
        <p className="detail-took">{c.took}</p>
        {c.link && <a className="src" href={c.link} target="_blank" rel="noreferrer">Read the news (Spanish) ↗</a>}
      </article>
    </div>
  )
}
