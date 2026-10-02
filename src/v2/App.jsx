import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Lenis from 'lenis'
import Hero3D, { LABELS } from './Hero3D'
import Avatar3D, { Floating, StudioLights } from './Avatar3D'
import { AVATAR } from './avatar'
import Device3D from './Device3D'
import { STICKERS, LAYOUT } from './Stickers'
import { AREAS, CHAPTERS, PROFILE } from '../data/chapters'

const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp01 = (x) => Math.max(0, Math.min(1, x))

/* ── the story, in five chapters ───────────────────────────────
   Each chapter opens with a short paragraph, then its moments in order.
   `moments` are chapter titles from src/data/chapters.js. */
const ACTS = [
  {
    n: 'I', title: 'Roots', years: '2003 – 2015',
    text: 'I grew up in Madrid between two languages, in a family that stretches across Europe, Asia and the Americas. Two things arrived early: a gymnastics mat and a maths problem. One taught me discipline under pressure; the other, that a hard problem is the best kind of game.',
    moments: ['Born between two cultures', 'Fifth in the world', 'Maths as a game'],
  },
  {
    n: 'II', title: 'Taking off', years: '2018 – 2022',
    text: 'I chose engineering because it was hard. Around the same time I found my first job — and pitched an idea nobody had asked for, from the most junior seat in the room. Then I spent a summer alone in Wisconsin, in charge of twelve girls and a lake.',
    moments: ['From 0 to 1,000 on TikTok', 'Top of the class', 'Engineering at ICAI', 'A summer at Lake Wapogasset'],
  },
  {
    n: 'III', title: 'Paris', years: '2023 – 2025',
    text: 'Selected as one of two ICAI students for the double degree with CentraleSupélec, I moved to Paris without the usual prépa and in a new language. There I found what drives me — using data to understand real systems — while running the finances of France’s largest student forum.',
    moments: ['Paris, without a prépa', 'Basketball, rowing and surf', 'Treasurer of France’s largest student forum', 'Altex Asset Management', 'A third degree, in economics'],
  },
  {
    n: 'IV', title: 'Building with AI', years: '2025',
    text: '2025 was the year models met people: language models that have to follow business rules, factories that learn together without sharing their data, an AI system that AWS teams use every day — and a hackathon won in 48 hours.',
    moments: ['LLMs that follow rules', 'Learning without sharing data', 'Amazon Web Services', 'A double master’s in engineering and AI', 'First place in 48 hours'],
  },
  {
    n: 'V', title: 'Science', years: '2025 – 2026',
    text: 'Then biology caught me. Predicting how drugs act, segmenting root canals in 3D, screening billions of molecules in Montréal: different problems, one question — can you trust a model when getting it wrong really matters?',
    moments: ['Predicting drug effects', 'Seeing inside a tooth', 'IRIC, Université de Montréal'],
  },
].map((a) => ({ ...a, items: a.moments.map((t) => CHAPTERS.find((c) => c.title === t)).filter(Boolean) }))
const MOMENTS = ACTS.reduce((n, a) => n + a.items.length, 0)

// Moments with a headline number get it as their picture until there is a photo
const METRICS = {
  'IRIC, Université de Montréal': { metric: '1.04M', label: 'candidates from billions screened', tone: 'ink', art: 'dots' },
  'Amazon Web Services': { metric: '75→85%', label: 'first-attempt accuracy', tone: 'cobalt', art: 'rings' },
  'LLMs that follow rules': { metric: '46→91%', label: 'exact match', tone: 'paper', art: 'lines' },
  'Learning without sharing data': { metric: '15', label: 'clients, zero data shared', tone: 'soft', art: 'orbit' },
  'First place in 48 hours': { metric: '1st', label: 'Smart Industry Hackathon', tone: 'ink', art: 'rings' },
  'Seeing inside a tooth': { metric: '<1%', label: 'positive voxels', tone: 'paper', art: 'dots' },
  'Altex Asset Management': { metric: '15%', label: 'annualised returns', tone: 'cobalt', art: 'lines' },
  'Treasurer of France’s largest student forum': { metric: '€1.4M', label: 'revenue, 3,500 students', tone: 'soft', art: 'rings' },
  'From 0 to 1,000 on TikTok': { metric: '1,000', label: 'followers in month one', tone: 'ink', art: 'orbit' },
  'Predicting drug effects': { metric: 'RF · GBM · SVM', label: 'multimodal ensembles', tone: 'soft', art: 'dots' },
  'Paris, without a prépa': { metric: '9.2/10', label: 'GPA, last two years', tone: 'paper', art: 'lines' },
}

/* ── smooth scrolling ──────────────────────────────────────── */
let lenis = null
function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.6, offset: -20 })
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
}

/* ── scroll-driven helpers ─────────────────────────────────── */
function passProgress(el) {
  const r = el.getBoundingClientRect(), vh = innerHeight
  return clamp01((vh - r.top) / (r.height + vh))
}
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

  useEffect(() => {
    if (reduced) return
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })
    let id
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); lenis.destroy(); lenis = null }
  }, [])
  useEffect(() => { if (lenis) menu ? lenis.stop() : lenis.start() }, [menu])

  // text and moments rise into place as they enter the screen
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { rootMargin: '0px 0px -8% 0px' })
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenu(false) }
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
        <Intro onStory={() => go('story')} />
        <StoryCard onStory={() => go('story')} />
        <Story go={go} />
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
    </>
  )
}

function Hero() {
  const card = useRef(null), burst = useRef(0), pointerIn = useRef(false)
  const live = useInView(card)
  const [hover, setHover] = useState(null)
  const onHover = useCallback((k) => setHover(k), [])
  const label = hover && LABELS[hover]
  return (
    <section className="hero">
      <p className="lede">
        Double master’s student in Industrial Engineering &amp; Computer Science, building machine-learning systems that hold up in the real world.
      </p>
      <div className={`card hero-card${hover ? ' pointing' : ''}`} ref={card} onPointerDown={() => { burst.current = 1 }}
        onPointerEnter={() => { pointerIn.current = true }} onPointerLeave={() => { pointerIn.current = false; setHover(null) }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 35 }} dpr={[1, 1.75]} frameloop={live ? 'always' : 'never'} gl={{ antialias: true }}>
          <color attach="background" args={['#101218']} />
          <Suspense fallback={null}><Hero3D reduced={reduced} burst={burst} pointerIn={pointerIn} onHover={onHover} /></Suspense>
        </Canvas>
        <p className="hero-label" aria-live="polite">
          {label ? <><b>{label[0]}</b>{label[1]}</> : <>Every object here is part of my story — <b className="soft">point at one</b></>}
        </p>
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

function Intro({ onStory }) {
  return (
    <section className="intro">
      <Tube className="t1" from="#4B63FF" to="#1B2FC8" d="M 520 -40 C 620 120 640 260 560 380 C 470 520 120 470 90 640 C 60 800 330 860 470 760 C 600 670 560 520 420 520" />
      <h2 className="big reveal"><span className="indent">Curious by Nature,</span><br />Persistent by Choice</h2>
      <div className="intro-copy reveal">
        <p>
          I combine engineering, machine learning and economics to build systems that work outside the notebook —
          from federated learning and LLM pipelines to drug discovery at the scale of billions.
        </p>
        <button type="button" className="pill ghost" onClick={onStory}><i className="dot" /> READ MY STORY</button>
      </div>
    </section>
  )
}

function StoryCard({ onStory }) {
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
      <button type="button" className="card story-card" onClick={onStory} aria-label="My story: start reading">
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

/* The story: a contents page, then each chapter with its moments */
function Story({ go }) {
  const wrap = useRef(null)
  const [cur, setCur] = useState(-1)
  const curRef = useRef(-1)
  // which chapter is crossing the middle of the screen
  const track = useCallback((el) => {
    const mid = innerHeight * 0.5
    let c = -1
    el.querySelectorAll('.act').forEach((a, i) => { const r = a.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) c = i })
    if (c !== curRef.current) { curRef.current = c; setCur(c) }
  }, [])
  useScrub(wrap, track)
  return (
    <section className="tale" id="story" ref={wrap}>
      <div className="tale-head">
        <h2 className="big reveal">In Five<br />Chapters</h2>
        <p className="caps reveal">{MOMENTS} moments, from {PROFILE.born} to today. Read it in order — or jump to any chapter.</p>
      </div>
      <ol className="contents reveal">
        {ACTS.map((a, i) => (
          <li key={a.n}>
            <button type="button" onClick={() => go(`act-${i}`)}>
              <span className="ct-n">Chapter {a.n}</span>
              <span className="ct-t">{a.title}</span>
              <span className="ct-y">{a.years}</span>
            </button>
          </li>
        ))}
      </ol>

      {ACTS.map((a, i) => (
        <article className="act" id={`act-${i}`} key={a.n}>
          <header className="act-side">
            <p className="act-n reveal">Chapter {a.n} <span>/ V</span></p>
            <h2 className="reveal">{a.title}</h2>
            <p className="act-years reveal">{a.years}</p>
            <p className="act-text reveal">{a.text}</p>
          </header>
          <div className="act-moments">
            {a.items.map((c) => <Moment key={c.title} c={c} />)}
          </div>
        </article>
      ))}

      <nav className={`chapter-nav${cur >= 0 ? '' : ' hide'}`} aria-label="Chapters">
        <span className="cn-label">Chapter {ACTS[Math.max(cur, 0)].n} · {ACTS[Math.max(cur, 0)].title}</span>
        <span className="cn-dots">
          {ACTS.map((a, i) => (
            <button key={a.n} type="button" className={i === cur ? 'on' : ''} onClick={() => go(`act-${i}`)} aria-label={`Chapter ${a.n}: ${a.title}`} />
          ))}
        </span>
      </nav>
    </section>
  )
}

function Moment({ c }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="moment reveal" data-open={open}>
      <Visual c={c} />
      <p className="m-meta">{c.date} · {c.place} · {AREAS[c.area].name}</p>
      <h3>{c.title}</h3>
      <p className="m-line">{c.line}</p>
      <p className="m-took">“{c.took}”</p>
      <button type="button" className="m-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Less' : 'What I did'}</button>
      <div className="m-more"><div>
        <ul>{c.facts.map((f, k) => <li key={k}>{f}</li>)}</ul>
        {c.link && <a className="src" href={c.link} target="_blank" rel="noreferrer">Read the news (Spanish) ↗</a>}
      </div></div>
    </div>
  )
}

function Visual({ c }) {
  const m = METRICS[c.title]
  if (c.img) return <div className="visual art photo"><img src={c.img} alt="" loading="lazy" /></div>
  if (m) return (
    <div className={`visual art ${m.tone}`}>
      <Pattern kind={m.art} />
      <span className="metric"><b>{m.metric}</b><small>{m.label}</small></span>
    </div>
  )
  return <div className={`visual gen ${c.area}`}><b>{c.year}</b><small>{AREAS[c.area].name}</small></div>
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
          <p>Looking back, the thread is the same in every chapter: problems that sit between disciplines — a trading strategy that needs honest validation, factories that cannot share their data, a molecule library too large to screen by hand.</p>
          <p>Gymnastics taught me that precision is trained. Engineering taught me to measure it. Research taught me to question the measurement.</p>
        </div>
      </div>
    </section>
  )
}

/* The dark part: the text, then (once she has one) her avatar rises into the halo */
function Finale() {
  const wrap = useRef(null), text = useRef(null), halo = useRef(null)
  const progress = useRef(0)
  const live = useInView(wrap, '0px')
  const scrub = useCallback((el) => {
    const p = stickyProgress(el)
    progress.current = p
    if (AVATAR) { // the text makes way for her
      text.current.style.opacity = 1 - clamp01((p - 0.3) / 0.18)
      text.current.style.transform = `translateY(${-clamp01((p - 0.3) / 0.3) * 60}px)`
    }
    halo.current.style.transform = `translate(-50%, -50%) scale(${0.85 + p * 0.3})`
  }, [])
  useScrub(wrap, scrub)
  return (
    <section className="finale" ref={wrap}>
      <div className="dusk" aria-hidden="true" />
      <div className="finale-stick">
        <div className="halo" ref={halo} aria-hidden="true" />
        {AVATAR && (
          <div className="finale-canvas">
            <Canvas camera={{ position: [0, 0, 6], fov: 35 }} dpr={[1, 1.75]} frameloop={live ? 'always' : 'never'} gl={{ antialias: true, alpha: true }}>
              <Suspense fallback={null}><Avatar3D progress={progress} reduced={reduced} /></Suspense>
            </Canvas>
          </div>
        )}
        <h2 className="finale-text" ref={text}>The next chapter<br />is still<br />unwritten</h2>
      </div>
    </section>
  )
}

/* Call to action: the things she loves, and how to reach her */
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
      {AVATAR && (
        <div className="together-canvas" aria-hidden="true">
          <Canvas camera={{ position: [0, 0, 5], fov: 35 }} dpr={[1, 1.75]} frameloop={live ? 'always' : 'never'} gl={{ antialias: true, alpha: true }}>
            <StudioLights />
            <Suspense fallback={null}><group position={[0, -0.35, 0]} scale={1.25}><Floating reduced={reduced} /></group></Suspense>
          </Canvas>
        </div>
      )}
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
        <button type="button" onClick={() => go('story')}>My story</button>
        <button type="button" onClick={() => go('contact')}>Contact</button>
      </nav>
      <ol className="menu-acts">
        {ACTS.map((a, i) => (
          <li key={a.n}><button type="button" onClick={() => go(`act-${i}`)}><span>{a.n}</span>{a.title}</button></li>
        ))}
      </ol>
    </div>
  )
}
