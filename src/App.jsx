import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Experience, { cToOffset, maxScroll } from './Experience'
import { AREAS, CHAPTERS, PROFILE } from './data/chapters'

const N = CHAPTERS.length
const pad = (n) => String(n).padStart(2, '0')
const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const FIRST = PROFILE.born, LAST = CHAPTERS[N - 1].year
// where we are on the timeline, in years: from her birth to the last chapter
function yearAt(c) {
  if (c <= 0) return FIRST + (CHAPTERS[0].year - FIRST) * THREE_CLAMP(c + 1)
  const i = Math.min(Math.floor(c), N - 1), f = Math.min(c - i, 1)
  return CHAPTERS[i].year + ((CHAPTERS[Math.min(i + 1, N - 1)].year - CHAPTERS[i].year) * f)
}
const THREE_CLAMP = (x) => Math.max(0, Math.min(1, x))

export default function App() {
  const [active, setActive] = useState(-1)
  const [cpos, setCpos] = useState(-1)
  const progress = THREE_CLAMP((yearAt(cpos) - FIRST) / (LAST - FIRST))
  const [story, setStory] = useState(null) // chapter index shown in the side panel
  const [list, setList] = useState(false)
  const [copied, setCopied] = useState(false)

  const goTo = useCallback((c) => {
    scrollTo({ top: cToOffset(Math.max(-1, Math.min(N, c))) * maxScroll(), behavior: reduced ? 'auto' : 'smooth' })
  }, [])
  const openStory = useCallback((i) => { setList(false); setStory(i); goTo(i) }, [goTo])

  // keep the side panel in sync when the visitor keeps scrolling
  useEffect(() => { if (story !== null && active >= 0 && active < N && active !== story) setStory(active) }, [active]) // eslint-disable-line

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setStory(null); setList(false); return }
      if (list) return
      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); goTo(active + 1) }
      if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(active - 1) }
      if (e.key === 'Enter' && active >= 0 && active < N && e.target === document.body) openStory(active)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [active, list, goTo, openStory])

  const copy = () => navigator.clipboard?.writeText(PROFILE.email).then(() => setCopied(true), () => {})
  const ch = active >= 0 && active < N ? CHAPTERS[active] : null
  const [first, ...rest] = PROFILE.name.split(' ')

  return (
    <>
      {/* the name sits behind the statue, like a watermark */}
      <div className={`watermark${active === -1 ? '' : ' hide'}`} aria-hidden="true">
        <span>{first}</span><span>{rest.join(' ')}</span>
      </div>

      <div className="stage">
        <Canvas camera={{ fov: 32, position: [0, 0, 6], near: 0.1, far: 50 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}>
            <Experience onActive={setActive} onProgress={setCpos} onSelect={openStory} reduced={reduced} />
          </Suspense>
        </Canvas>
      </div>
      {/* the page's real height: one screen per chapter, plus intro and outro */}
      <div className="track" style={{ height: `${(N + 2) * 100}vh` }} aria-hidden="true" />

      <header className="hud top">
        <button type="button" className="logo" onClick={() => { setList(false); setStory(null); goTo(-1) }}>
          {first}<br />{rest.join(' ')}
        </button>
        <div className={`timeline${active === -1 ? ' hide' : ''}`} aria-hidden="true">
          <span>{FIRST}</span><i><b style={{ transform: `scaleX(${progress})` }} /></i><span>{LAST}</span>
        </div>
        <nav aria-label="Main">
          <button type="button" onClick={() => setList(true)}>Index</button>
          <button type="button" onClick={() => { setList(false); setStory(null); goTo(N) }}>Contact</button>
        </nav>
      </header>

      <section className={`intro${active === -1 ? '' : ' hide'}`}>
        <i className="dash" />
        <p className="role">{PROFILE.role}</p>
        <p className="places">{PROFILE.places}</p>
        <p className="lead">{PROFILE.intro} {PROFILE.introEm} {PROFILE.sub}</p>
        <button type="button" className="explore" onClick={() => goTo(0)}>Explore</button>
      </section>

      <div className={`hud chapter${ch && story === null ? '' : ' hide'}`} aria-live="polite">
        {ch && (
          <div key={active} className="rise">
            <p className="kicker">{AREAS[ch.area].name} · {ch.date}</p>
            <h2>{ch.title}</h2>
            <button type="button" className="more" onClick={() => openStory(active)}>Read the story</button>
          </div>
        )}
      </div>

      <div className={`hud yearmark${ch ? '' : ' hide'}`} aria-hidden="true">
        {ch && <div key={active} className="rise"><b>{ch.year}</b></div>}
      </div>

      <section className={`outro${active === N ? '' : ' hide'}`}>
        <p className="kicker">What comes next</p>
        <h2>The next chapter is still unwritten.</h2>
        <p className="lead">{PROFILE.next}</p>
        <div className="contact">
          <span className="mail">{PROFILE.email}</span>
          <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
          <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={PROFILE.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </section>

      <aside className={`panel${story !== null ? ' open' : ''}`} aria-hidden={story === null} aria-label="Chapter story">
        {story !== null && <Story i={story} onClose={() => setStory(null)} onGo={openStory} onEnd={() => { setStory(null); goTo(N) }} />}
      </aside>

      {list && (
        <section className="list" aria-label="All chapters">
          <div className="inner">
            <div className="head"><span>{N} chapters</span><button type="button" onClick={() => setList(false)}>Close</button></div>
            {CHAPTERS.map((c, i) => (
              <button key={i} type="button" className="row" onClick={() => openStory(i)}>
                <span className="y">{c.year}</span><span className="t">{c.title}</span><span className="a">{AREAS[c.area].name}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function Story({ i, onClose, onGo, onEnd }) {
  const c = CHAPTERS[i], prev = CHAPTERS[i - 1], next = CHAPTERS[i + 1]
  const ref = useRef(null)
  useEffect(() => { ref.current?.scrollTo(0, 0) }, [i])
  return (
    <div className="inner" ref={ref}>
      <div className="head"><span>{pad(i + 1)} / {pad(N)}</span><button type="button" onClick={onClose}>Close</button></div>
      <p className="kicker">{AREAS[c.area].name} · {c.date} · {c.place}</p>
      <h1>{c.title}</h1>
      <p className="lede">{c.line}</p>
      {[c.img, ...(c.photos || [])].filter(Boolean).map((src, k) => <img key={k} className="photo" src={src} alt="" loading="lazy" />)}
      <h3>What I did</h3>
      <ul>{c.facts.map((f, k) => <li key={k}>{f}</li>)}</ul>
      <h3>What I took</h3>
      <p className="took">{c.took}</p>
      {c.link && <a className="src" href={c.link} target="_blank" rel="noreferrer">Read the news (Spanish)</a>}
      <div className="pnav">
        {prev ? <button type="button" onClick={() => onGo(i - 1)}>← {prev.title}</button> : <span />}
        {next ? <button type="button" onClick={() => onGo(i + 1)}>{next.title} →</button> : <button type="button" onClick={onEnd}>Contact →</button>}
      </div>
    </div>
  )
}
