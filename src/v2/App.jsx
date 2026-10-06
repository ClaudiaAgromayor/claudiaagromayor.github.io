import { Suspense, useCallback, useEffect, useId, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Lenis from 'lenis'
import HeroScan from './HeroScan'
import HeroGlobe from './HeroGlobe'
import Avatar3D from './Avatar3D'
import { AVATAR } from './avatar'
import { CHAPTERS, PROFILE } from '../data/chapters'

const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp01 = (x) => Math.max(0, Math.min(1, x))

/* ── the story, in five chapters ───────────────────────────────
   Each chapter opens with a short paragraph and one picture (`feature`), then its moments
   as a short list that opens on click. `moments` are chapter titles from src/data/chapters.js. */
const ACTS = [
  {
    n: 'I', title: 'Roots', years: '2003 – 2015',
    text: 'I grew up in Madrid between two languages, in a family that stretches across Europe, Asia and the Americas. Two things arrived early: a gymnastics mat and a maths problem. One taught me discipline under pressure; the other, that a hard problem is the best kind of game.',
    feature: 'Maths as a game',
    moments: ['Born between two cultures', 'Fifth in the world', 'Maths as a game'],
  },
  {
    n: 'II', title: 'Taking off', years: '2018 – 2022',
    text: 'I chose engineering because it was hard. Around the same time I found my first job, and pitched an idea nobody had asked for, from the most junior seat in the room. Then I spent a summer alone in Wisconsin, in charge of twelve girls and a lake.',
    feature: 'From 0 to 1,000 on TikTok',
    moments: ['From 0 to 1,000 on TikTok', 'Top of the class', 'Engineering at ICAI', 'A summer at Lake Wapogasset'],
  },
  {
    n: 'III', title: 'Paris', years: '2023 – 2025',
    text: 'Selected as one of two ICAI students for the double degree with CentraleSupélec, I moved to Paris without the usual prépa and in a new language. There I found what drives me, using data to understand real systems, while running the finances of France’s largest student forum.',
    feature: 'Paris, without a prépa',
    moments: ['Paris, without a prépa', 'Basketball, rowing and surf', 'Treasurer of France’s largest student forum', 'Altex Asset Management', 'A third degree, in economics'],
  },
  {
    n: 'IV', title: 'Building with AI', years: '2025',
    text: '2025 was the year models met people: language models that have to follow business rules, factories that learn together without sharing their data, an AI system that AWS teams use every day, and a hackathon won in 48 hours.',
    feature: 'Amazon Web Services',
    moments: ['LLMs that follow rules', 'Learning without sharing data', 'Amazon Web Services', 'A double master’s in engineering and AI', 'First place in 48 hours'],
  },
  {
    n: 'V', title: 'AI where it counts', years: '2026',
    text: 'Now I train models where a wrong answer has a cost. A network that segments root canals in 3D so a dentist can plan the treatment. A network that reads 43 billion molecules looking for a safer anaesthetic. Same question in both: can you trust the model where it has never been tested?',
    feature: 'IRIC, Université de Montréal',
    moments: ['Seeing inside a tooth', 'IRIC, Université de Montréal'],
  },
].map((a) => ({ ...a, items: a.moments.map((t) => CHAPTERS.find((c) => c.title === t)).filter(Boolean), lead: CHAPTERS.find((c) => c.title === a.feature) }))

// A chapter's picture: the photo of its feature moment, or else its headline number
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
        <Story go={go} />
        <Finale />
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

/* The hero, full screen: her name beside a 3D piece, her portrait as a scan or the places on a globe */
const VIEWS = [['portrait', 'Portrait'], ['places', 'Places']]
function Hero() {
  const card = useRef(null), pointerIn = useRef(false)
  const live = useInView(card)
  const [view, setView] = useState('portrait')
  const [place, setPlace] = useState(null)
  return (
    <section className="hero">
      <div className={`hero-card ${view}`} ref={card}
        onPointerEnter={() => { pointerIn.current = true }} onPointerLeave={() => { pointerIn.current = false }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 30 }} dpr={[1, 1.75]} frameloop={live ? 'always' : 'never'} gl={{ antialias: true }}>
          <color attach="background" args={['#07080D']} />
          <Suspense fallback={null}>
            {view === 'portrait' ? <HeroScan reduced={reduced} pointerIn={pointerIn} /> : <HeroGlobe reduced={reduced} onPlace={setPlace} />}
          </Suspense>
        </Canvas>
        <div className="hero-tabs" role="tablist" aria-label="Hero view">
          {VIEWS.map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => setView(k)}>{l}</button>
          ))}
        </div>
        <div className="hero-copy">
          <h1 className="hero-name">Claudia<br />Agromayor</h1>
          <p className="hero-role">Double master’s student in Industrial Engineering &amp; Computer Science</p>
        </div>
        <p className="hero-label" aria-live="polite">
          {view === 'places' && place ? <><b>{place.name} · {place.years}</b>{place.what}</> : view === 'places' ? 'Drag to spin · point at a city' : 'Move through the scan'}
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
      <h2 className="big reveal">{PROFILE.intro}<br /><span className="indent">{PROFILE.introEm}</span></h2>
      <div className="intro-copy reveal">
        <p>
          I am an engineer who works on machine learning. I like the problems that sit between fields: a model
          that has to follow rules written for people, factories that want to learn from each other without
          handing over their data, a molecule library too large to look at by hand.
        </p>
        <p>
          Three countries, three degrees and one habit: going to where the problem is, even when I have to learn
          the subject from scratch.
        </p>
        <button type="button" className="pill ghost" onClick={onStory}><i className="dot" /> READ MY STORY</button>
      </div>
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
        <p className="caps reveal">From {PROFILE.born} to today. Open any moment to read more.</p>
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
          <div className="act-main">
            {a.lead && <div className="act-feature reveal"><Visual c={a.lead} /></div>}
            <ol className="act-list">
              {a.items.map((c) => <Moment key={c.title} c={c} />)}
            </ol>
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

// One line per moment; the details open underneath
function Moment({ c }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <li className="moment reveal" data-open={open}>
      <button type="button" className="m-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span className="m-year">{c.year}</span>
        <span className="m-title">{c.title}<small>{c.line}</small></span>
        <span className="m-plus" aria-hidden="true" />
      </button>
      <div className="m-more" id={id}><div className="m-body">
        <p className="m-meta">{c.date} · {c.place}</p>
        <ul>{c.facts.map((f, k) => <li key={k}>{f}</li>)}</ul>
        {c.photos?.length > 0 && (
          <div className="m-shots">{c.photos.map((src) => <img key={src} src={src} alt="" loading="lazy" />)}</div>
        )}
        <p className="m-took">“{c.took}”</p>
        {c.link && <a className="src" href={c.link} target="_blank" rel="noreferrer">{c.linkLabel || 'Read the news (Spanish) ↗'}</a>}
      </div></div>
    </li>
  )
}

function Visual({ c }) {
  const m = METRICS[c.title]
  if (c.img) return <div className="visual art photo"><img src={c.img} alt={c.title} loading="lazy" /></div>
  if (!m) return null
  return (
    <div className={`visual art ${m.tone}`}>
      <Pattern kind={m.art} />
      <span className="metric"><b>{m.metric}</b><small>{m.label}</small></span>
    </div>
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

/* The ending, on one dark screen: the next chapter, then her avatar, then how to reach her */
function Finale() {
  const wrap = useRef(null), text = useRef(null), halo = useRef(null), contact = useRef(null)
  const progress = useRef(0)
  const live = useInView(wrap, '0px')
  const [copied, setCopied] = useState(false)
  const copy = () => navigator.clipboard?.writeText(PROFILE.email).then(() => setCopied(true), () => {})
  const scrub = useCallback((el) => {
    const p = stickyProgress(el)
    progress.current = p
    if (AVATAR) {
      // the text makes way for her
      text.current.style.opacity = 1 - clamp01((p - 0.25) / 0.15)
      text.current.style.transform = `translateY(${-clamp01((p - 0.25) / 0.3) * 60}px)`
    } else {
      // no avatar yet: the text stays and moves up to make room for the contact
      text.current.style.transform = `translateY(${-clamp01((p - 0.45) / 0.3) * 14}vh)`
    }
    const c = clamp01((p - (AVATAR ? 0.68 : 0.5)) / 0.16)
    contact.current.style.opacity = c
    contact.current.style.transform = `translateY(${(1 - c) * 30}px)`
    contact.current.style.visibility = c > 0.01 ? 'visible' : 'hidden'
    halo.current.style.transform = `translate(-50%, -50%) scale(${0.85 + p * 0.3})`
  }, [])
  useScrub(wrap, scrub)
  return (
    <section className={`finale${AVATAR ? '' : ' short'}`} ref={wrap}>
      <span id="contact" className="contact-anchor" aria-hidden="true" />
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
        <div className="finale-contact" ref={contact}>
          <p className="caps">Got a hard problem worth solving? {PROFILE.next}</p>
          <div className="contact-row">
            <span className="mail">{PROFILE.email}</span>
            <button type="button" className="pill light" onClick={copy}>{copied ? 'COPIED' : 'COPY EMAIL'}</button>
            <a className="pill outline" href={PROFILE.linkedin} target="_blank" rel="noreferrer">LINKEDIN</a>
            <a className="pill outline" href={PROFILE.github} target="_blank" rel="noreferrer">GITHUB</a>
          </div>
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
