import { Suspense, useCallback, useEffect, useId, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Lenis from 'lenis'
import HeroScan from './HeroScan'
import HeroGlobe from './HeroGlobe'
import Avatar3D from './Avatar3D'
import { AVATAR } from './avatar'
import { PROFILE, BEYOND, CURRENTLY } from '../data/entries'
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
          <button type="button" className="pill dark" onClick={() => go('contact')}>LET’S TALK <i className="dot" /></button>
          <button type="button" className="pill" onClick={() => setMenu(true)} aria-expanded={menu}>MENU <i className="dots" /></button>
        </div>
      </header>

      <main id="top">
        <Hero />
        <Intro onStory={() => go('story')} />
        <Story go={go} onZoom={(list, i) => setZoom({ list, i })} />
        <Beyond onZoom={(list, i) => setZoom({ list, i })} />
        <Currently />
        <Finale />
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
          <p className="hero-title">{PROFILE.title}</p>
          <p className="hero-role">{PROFILE.field} · {PROFILE.places}</p>
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
      <p className="eyebrow reveal">Who I am</p>
      <figure className="intro-photo reveal"><img src="/img/me-cut.png" alt="Claudia Agromayor" loading="lazy" /></figure>
      <div className="intro-copy reveal">
        <p>{PROFILE.intro}</p>
        <p>{PROFILE.now}</p>
        <p className="intro-punch">{PROFILE.next}</p>
        <button type="button" className="pill ghost" onClick={onStory}><i className="dot" /> SEE MY WORK</button>
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
  const entries = SECTIONS.reduce((n, sec) => n + sec.items.length, 0)
  return (
    <section className="tale" id="story" ref={wrap}>
      <div className="tale-head">
        <h2 className="big reveal">Work &amp;<br />Research</h2>
        <p className="caps reveal">{entries} entries. Open any one to read it in full.</p>
      </div>
      <ol className="contents reveal">
        {SECTIONS.map((sec) => (
          <li key={sec.id}>
            <button type="button" onClick={() => go(sec.id)}>
              <span className="ct-t">{sec.title}</span>
              <span className="ct-y">{sec.items.length}</span>
            </button>
          </li>
        ))}
      </ol>

      {SECTIONS.map((sec) => (
        <article className="act" id={sec.id} key={sec.id}>
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

/* The two closing sections: what she does outside the work, and what she is after */
function Beyond({ onZoom }) {
  return (
    <section className="aside" id="beyond">
      <h2 className="aside-title reveal">{BEYOND.title}</h2>
      <div className="aside-copy reveal">
        {BEYOND.paragraphs.map((t, k) => <p key={k}>{t}</p>)}
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

function Currently() {
  return (
    <section className="aside" id="currently">
      <h2 className="aside-title reveal">{CURRENTLY.title}</h2>
      <div className="aside-copy reveal">
        <p className="caps aside-tags">{CURRENTLY.tags}</p>
        {CURRENTLY.paragraphs.map((t, k) => <p key={k}>{t}</p>)}
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
    <li className="moment reveal" data-open={open}>
      <button type="button" className="m-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span className="m-year">{c.year}</span>
        <span className="m-title">{c.title}<small>{c.line}</small></span>
        <span className="m-plus" aria-hidden="true" />
      </button>
      <div className="m-more" id={id}><div className="m-body">
        <p className="m-role">{c.role}</p>
        <p className="m-meta">{c.date} · {c.place}</p>
        <Facts items={c.facts} />
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
