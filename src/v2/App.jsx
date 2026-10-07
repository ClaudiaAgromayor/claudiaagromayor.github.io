import { Suspense, useCallback, useEffect, useId, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Lenis from 'lenis'
import HeroScan from './HeroScan'
import HeroGlobe from './HeroGlobe'
import { PROFILE, BEYOND, CONTACT } from '../data/entries'
import { SECTIONS } from '../data/sections'

const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp01 = (x) => Math.max(0, Math.min(1, x))

/* ── smooth scrolling ──────────────────────────────────────── */
let lenis = null
function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.6, offset: -20 })
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
}

/* ── scroll-driven helpers ─────────────────────────────────── */
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
  const [zoom, setZoom] = useState(null)

  useEffect(() => {
    if (reduced) return
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })
    let id
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); lenis.destroy(); lenis = null }
  }, [])
  useEffect(() => { if (lenis) (menu || zoom) ? lenis.stop() : lenis.start() }, [menu, zoom])

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
          <button type="button" className="pill dark" onClick={() => go('contact')}>GET IN TOUCH <i className="dot" /></button>
          <button type="button" className="pill" onClick={() => setMenu(true)} aria-expanded={menu}>MENU <i className="dots" /></button>
        </div>
      </header>

      <main id="top">
        <Hero />
        <Intro onWork={() => go('story')} />
        <Story go={go} onZoom={(list, i) => setZoom({ list, i })} />
        <Beyond onZoom={(list, i) => setZoom({ list, i })} />
        <Contact />
      </main>

      <footer className="foot">
        <span>© {new Date().getFullYear()} Claudia Agromayor</span>
        <a href="/">Version 1</a>
        <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a href={PROFILE.github} target="_blank" rel="noreferrer">GitHub</a>
      </footer>

      {menu && <Menu onClose={() => setMenu(false)} go={go} />}
      {zoom && <Lightbox {...zoom} onClose={() => setZoom(null)} />}
    </>
  )
}

/* The hero, full screen: her name beside a 3D piece, her portrait as a scan or the places on a globe */
const VIEWS = [['field', 'Landscape'], ['places', 'Places']]
function Hero() {
  const card = useRef(null), pointerIn = useRef(false)
  const live = useInView(card)
  const [view, setView] = useState('field')
  const [place, setPlace] = useState(null)
  return (
    <section className="hero">
      <div className={`hero-card ${view}`} ref={card}
        onPointerEnter={() => { pointerIn.current = true }} onPointerLeave={() => { pointerIn.current = false }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 30 }} dpr={[1, 1.75]} frameloop={live ? 'always' : 'never'} gl={{ antialias: true }}>
          <color attach="background" args={['#07080D']} />
          <Suspense fallback={null}>
            {view === 'field' ? <HeroScan reduced={reduced} pointerIn={pointerIn} /> : <HeroGlobe reduced={reduced} onPlace={setPlace} />}
          </Suspense>
        </Canvas>
        <div className="hero-tabs" role="tablist" aria-label="Hero view">
          {VIEWS.map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => setView(k)}>{l}</button>
          ))}
        </div>
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-copy">
          <h1 className="hero-name">Claudia<br />Agromayor</h1>
          <p className="hero-title">{PROFILE.title}</p>
          <p className="hero-role">{PROFILE.field}</p>
          <p className="hero-role">{PROFILE.places}</p>
        </div>
        <p className="hero-label" aria-live="polite">
          {view === 'places' && place ? <><b>{place.name} · {place.years}</b>{place.what}</> : view === 'places' ? 'Drag to spin · point at a city' : 'Move through the landscape'}
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

function Intro({ onWork }) {
  return (
    <section className="intro">
      <div className="intro-copy reveal">
        {PROFILE.blurb.map((t, k) => (
          <p key={k} className={k === 0 ? 'intro-lead' : undefined}><Rich text={t} /></p>
        ))}
        <p className="intro-links">
          <a href={`mailto:${PROFILE.email}`}>Email</a>
          <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={PROFILE.github} target="_blank" rel="noreferrer">GitHub</a>
        </p>
        <button type="button" className="pill ghost" onClick={onWork}><i className="dot" /> SEE MY WORK</button>
      </div>
    </section>
  )
}

/* The work, in sections: a contents list, then each section with its entries */
function Story({ go, onZoom }) {
  const wrap = useRef(null)
  const [cur, setCur] = useState(-1)
  const curRef = useRef(-1)
  // which section is crossing the middle of the screen
  const track = useCallback((el) => {
    const mid = innerHeight * 0.5
    let c = -1
    el.querySelectorAll('.act').forEach((a, i) => { const r = a.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) c = i })
    if (c !== curRef.current) { curRef.current = c; setCur(c) }
  }, [])
  useScrub(wrap, track)
  return (
    <section className="tale" id="story" ref={wrap}>
      <ol className="contents reveal">
        {SECTIONS.map((sec) => (
          <li key={sec.id}>
            <button type="button" onClick={() => go(sec.id)}>
              <span className="ct-t">{sec.title}</span>
            </button>
          </li>
        ))}
      </ol>

      {SECTIONS.map((sec) => (
        <article className={`act ${sec.weight}`} id={sec.id} key={sec.id}>
          <header className="act-side">
            <h2 className="reveal">{sec.title}</h2>
          </header>
          <ol className="act-list">
            {sec.items.map((c) => <Moment key={c.key} c={c} onZoom={onZoom} />)}
          </ol>
        </article>
      ))}

      <nav className={`chapter-nav${cur >= 0 ? '' : ' hide'}`} aria-label="Sections">
        <span className="cn-label">{SECTIONS[Math.max(cur, 0)].title}</span>
        <span className="cn-dots">
          {SECTIONS.map((sec, i) => (
            <button key={sec.id} type="button" className={i === cur ? 'on' : ''} onClick={() => go(sec.id)} aria-label={sec.title} />
          ))}
        </span>
      </nav>
    </section>
  )
}

/* Beyond engineering: one short paragraph and two pictures */
function Beyond({ onZoom }) {
  return (
    <section className="aside" id="beyond">
      <h2 className="aside-title reveal">{BEYOND.title}</h2>
      <div className="aside-copy reveal">
        <p>{BEYOND.text}</p>
        <div className="m-shots">
          {BEYOND.photos.map((src, k) => (
            <button type="button" key={src} onClick={() => onZoom(BEYOND.photos, k)} aria-label={`Open picture ${k + 1}`}>
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// One line per moment; the details open underneath
function Moment({ c, onZoom }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const shots = [c.img, ...(c.photos || [])].filter(Boolean)
  return (
    <li className={`moment reveal${c.quiet ? ' quiet' : ''}`} data-open={open}>
      <button type="button" className="m-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span className="m-year">{c.date}</span>
        <span className="m-title">
          {c.title}
          <b className="m-org">{c.org}</b>
          <small>{c.line}</small>
          {c.stats?.length > 0 && (
            <span className="m-stats">
              {c.stats.map((st) => (
                <span key={st.v} className={`m-stat${st.big ? ' big' : ''}`}><b>{st.v}</b><i>{st.k}</i></span>
              ))}
            </span>
          )}
        </span>
        <span className="m-plus" aria-hidden="true" />
      </button>
      <div className="m-more" id={id}><div className="m-body">
        {c.facts.length > 0 && <Facts items={c.facts} />}
        {c.tags?.length > 0 && (
          <div className="m-tags">
            <p className="m-tags-label">{c.tagsLabel}</p>
            <p className="m-tag-row">{c.tags.map((t) => <span key={t}>{t}</span>)}</p>
          </div>
        )}
        {shots.length > 0 && (
          <div className="m-shots">
            {shots.map((src, k) => (
              <button type="button" key={src} onClick={() => onZoom(shots, k)} aria-label={`${c.title}: open picture ${k + 1}`}>
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
        {c.video && <Demo id={c.video} poster={shots[0]} title={c.title} />}
        {c.links?.length > 0 && (
          <p className="m-links">
            {c.links.map((l) => (
              <a key={l.href} className="src" href={l.href} target="_blank" rel="noreferrer">{l.label} ↗</a>
            ))}
          </p>
        )}
      </div></div>
    </li>
  )
}

/* **Bold** inside a sentence. */
function Rich({ text }) {
  return text.split('**').map((part, k) => (k % 2 ? <b key={k}>{part}</b> : part))
}

/* Facts: plain strings are bullets, { list } nests underneath the line before it. */
function Facts({ items }) {
  return (
    <ul>
      {items.map((f, k) => (typeof f === 'string'
        ? <li key={k}>{f}</li>
        : <li key={k} className="m-nest">
            {f.ordered
              ? <ol>{f.list.map((t, j) => <li key={j}>{t}</li>)}</ol>
              : <ul>{f.list.map((t, j) => <li key={j}>{t}</li>)}</ul>}
          </li>))}
    </ul>
  )
}

/* A demo video. Nothing is requested from YouTube until the still is clicked. */
function Demo({ id, poster, title }) {
  const [playing, setPlaying] = useState(false)
  if (playing) return (
    <div className="m-video">
      <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title={`${title}: demo`}
        allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
    </div>
  )
  return (
    <button type="button" className="m-video play" onClick={() => setPlaying(true)}>
      {poster && <img src={poster} alt="" loading="lazy" />}
      <span className="m-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></span>
      <span className="m-play-label">Watch the demo</span>
    </button>
  )
}

/* The ending, on one dark screen: the next chapter, then her avatar, then how to reach her */
/* The ending: her portrait, what she is looking for, and how to reach her. */
function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = () => navigator.clipboard?.writeText(PROFILE.email).then(() => setCopied(true), () => {})
  return (
    <section className="contact" id="contact">
      <div className="dusk" aria-hidden="true" />
      <div className="halo" aria-hidden="true" />
      <figure className="contact-photo reveal"><img src="/img/me-cut.png" alt="Claudia Agromayor" loading="lazy" /></figure>
      <div className="contact-copy reveal">
        <p className="caps contact-tags">{CONTACT.tags}</p>
        <p className="contact-text">{CONTACT.text}</p>
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

/* A picture, full size. Arrow keys and the edges of the screen move through the set. */
function Lightbox({ list, i, onClose }) {
  const [at, setAt] = useState(i)
  const step = useCallback((d) => setAt((k) => (k + d + list.length) % list.length), [list.length])
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [onClose, step])
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Picture" onClick={onClose} data-lenis-prevent>
      <img src={list[at]} alt="" onClick={(e) => e.stopPropagation()} />
      {list.length > 1 && (
        <>
          <button type="button" className="lb-nav prev" aria-label="Previous picture"
            onClick={(e) => { e.stopPropagation(); step(-1) }}>‹</button>
          <button type="button" className="lb-nav next" aria-label="Next picture"
            onClick={(e) => { e.stopPropagation(); step(1) }}>›</button>
          <span className="lb-count">{at + 1} / {list.length}</span>
        </>
      )}
      <button type="button" className="pill light lb-close" onClick={onClose}>CLOSE</button>
    </div>
  )
}

function Menu({ onClose, go }) {
  return (
    <div className="menu" role="dialog" aria-modal="true" aria-label="Menu" data-lenis-prevent>
      <button type="button" className="pill menu-close" onClick={onClose}>CLOSE</button>
      <nav>
        <button type="button" onClick={() => go('top')}>Home</button>
        <button type="button" onClick={() => go('story')}>My work</button>
        <button type="button" onClick={() => go('contact')}>Contact</button>
      </nav>
      <ol className="menu-acts">
        {SECTIONS.map((sec) => (
          <li key={sec.id}><button type="button" onClick={() => go(sec.id)}>{sec.title}</button></li>
        ))}
      </ol>
    </div>
  )
}
