import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import Experience, { cToOffset } from './Experience'
import { AREAS, CHAPTERS, PROFILE } from './data/chapters'

const N = CHAPTERS.length
const pad = (n) => String(n).padStart(2, '0')
const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const areaStyle = (a) => ({ '--c': AREAS[a].color })

export default function App() {
  const elRef = useRef(null)
  const [active, setActive] = useState(-1)
  const [story, setStory] = useState(null) // chapter index shown in the side panel
  const [list, setList] = useState(false)
  const [copied, setCopied] = useState(false)

  const goTo = useCallback((c) => {
    const el = elRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    el.scrollTo({ top: cToOffset(Math.max(-1, Math.min(N, c))) * max, behavior: reduced ? 'auto' : 'smooth' })
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

  return (
    <>
      <div className={`stage${story !== null ? ' shift' : ''}`}>
        <Canvas camera={{ fov: 38, position: [0, 0.6, 4], near: 0.1, far: 40 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <ScrollControls pages={N + 2} damping={0.25}>
              <Experience elRef={elRef} onActive={setActive} onSelect={openStory} reduced={reduced} />
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>

      <header className="hud top">
        <button type="button" className="brand" onClick={() => { setList(false); setStory(null); goTo(-1) }}>
          <b>{PROFILE.name}</b><span className="mono">{PROFILE.role}</span>
        </button>
        <nav className="mono" aria-label="Main">
          <button type="button" aria-current={!list} onClick={() => { setList(false); setStory(null) }}>Journey</button>
          <button type="button" aria-current={list} onClick={() => setList(true)}>Index</button>
          <button type="button" className="talk" onClick={() => { setList(false); setStory(null); goTo(N) }}>Let’s talk</button>
        </nav>
      </header>

      <nav className={`hud index${ch ? '' : ' hide'}`} aria-label="Chapters">
        {CHAPTERS.map((c, i) => (
          <button key={i} type="button" style={areaStyle(c.area)} className={i === active ? 'on' : ''} onClick={() => goTo(i)}>
            <span className="n mono">{c.year}</span><span>{c.title}</span>
          </button>
        ))}
      </nav>

      <section className={`statement${active === -1 ? '' : ' hide'}`}>
        <p className="mono eyebrow">{PROFILE.name} — {PROFILE.role}</p>
        <h1>{PROFILE.intro}<br /><em>{PROFILE.introEm}</em></h1>
        <p className="sub">{PROFILE.sub}</p>
        <div className="scrollhint mono"><i />Scroll to begin</div>
      </section>

      <section className={`statement outro${active === N ? '' : ' hide'}`}>
        <p className="mono eyebrow">Chapter {pad(N + 1)}</p>
        <h1>The next chapter<br /><em>is still unwritten.</em></h1>
        <p className="sub">{PROFILE.next}</p>
        <div className="contact mono">
          <span className="mail">{PROFILE.email}</span>
          <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
          <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a href={PROFILE.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </section>

      <div className={`hud caption${ch && story === null ? '' : ' hide'}`} aria-live="polite">
        {ch && (
          <div key={active} className="fade" style={areaStyle(ch.area)}>
            <div className="meta mono"><i />{AREAS[ch.area].name}<span>{ch.date}</span></div>
            <h2>{ch.title}</h2>
            <p>{ch.line}</p>
            <button type="button" className="open mono" onClick={() => openStory(active)}>Read the story</button>
          </div>
        )}
      </div>

      <div className="hud bottom mono">
        <div className="legend">
          {Object.entries(AREAS).map(([k, a]) => <span key={k} style={areaStyle(k)}><i />{a.name}</span>)}
        </div>
        <div className="ruler" aria-hidden="true">
          {CHAPTERS.map((c, i) => <span key={i} style={areaStyle(c.area)} className={i === active ? 'on' : i < active ? 'past' : ''} onClick={() => goTo(i)} />)}
        </div>
        <div className="count"><b>{ch ? pad(active + 1) : active >= N ? pad(N) : '00'}</b> / {pad(N)}</div>
      </div>

      <aside className={`panel${story !== null ? ' open' : ''}`} aria-hidden={story === null} aria-label="Chapter story">
        {story !== null && <Story i={story} onClose={() => setStory(null)} onGo={openStory} onEnd={() => { setStory(null); goTo(N) }} />}
      </aside>

      {list && (
        <section className="list" aria-label="All chapters">
          <div className="inner">
            <div className="head mono"><span>{N} chapters</span><button type="button" onClick={() => setList(false)}>Back to the journey ✕</button></div>
            <h1>Everything, in order.</h1>
            {CHAPTERS.map((c, i) => (
              <button key={i} type="button" className="row" style={areaStyle(c.area)} onClick={() => openStory(i)}>
                <span className="mono">{c.year}</span><span className="t">{c.title}</span>
                <span className="mono"><i />{AREAS[c.area].name}</span><span className="mono">{c.place}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function Story({ i, onClose, onGo, onEnd }) {
  const c = CHAPTERS[i], a = AREAS[c.area], prev = CHAPTERS[i - 1], next = CHAPTERS[i + 1]
  const ref = useRef(null)
  useEffect(() => { ref.current?.scrollTo(0, 0) }, [i])
  return (
    <div className="inner" ref={ref} style={{ '--c': a.color }}>
      <div className="head mono"><span>Chapter {pad(i + 1)} / {pad(N)}</span><button type="button" onClick={onClose}>Close ✕</button></div>
      <div className="meta mono"><i />{a.name}<span>{c.date}</span><span>{c.place}</span></div>
      <h1>{c.title}</h1>
      <p className="lede">{c.line}</p>
      {c.img && <img className="photo" src={c.img} alt={c.title} loading="lazy" />}
      <div className="beat"><h3 className="mono">What I did</h3><ul>{c.facts.map((f, k) => <li key={k}>{f}</li>)}</ul></div>
      <div className="beat"><h3 className="mono">What I took</h3><p className="took">{c.took}</p></div>
      {c.link && <a className="src mono" href={c.link} target="_blank" rel="noreferrer">Read the news (Spanish) ↗</a>}
      <div className="pnav mono">
        {prev ? <button type="button" onClick={() => onGo(i - 1)}>← {prev.title}</button> : <span />}
        {next ? <button type="button" onClick={() => onGo(i + 1)}>{next.title} →</button> : <button type="button" onClick={onEnd}>Let’s talk →</button>}
      </div>
    </div>
  )
}
