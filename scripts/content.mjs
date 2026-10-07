/* Writes content.txt and content.html: everything written on the site, in one file you
   can read, print or copy into a CV. Run it with `npm run content`. */
import { writeFileSync } from 'node:fs'
import { PROFILE, BEYOND, CONTACT } from '../src/data/entries.js'
import { SECTIONS } from '../src/data/sections.js'

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
const rule = (c) => c.repeat(74)
const html = []
const txt = []

html.push(`<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(PROFILE.name)} — everything on the site</title>
<style>
  :root { color-scheme: light }
  body { max-width: 46rem; margin: 0 auto; padding: 3rem 1.25rem 6rem; background: #fff; color: #16181f;
         font: 16px/1.6 Georgia, "Times New Roman", serif }
  h1 { font-size: 2.2rem; line-height: 1.1; margin: 0 0 .4rem }
  h2 { font-size: 1.5rem; margin: 3rem 0 .2rem; padding-top: 1.6rem; border-top: 2px solid #16181f }
  h3 { font-size: 1.15rem; margin: 2rem 0 .2rem }
  .meta { color: #5b6072; font-size: .85rem; margin: 0 0 .6rem }
  .lead { font-style: italic }
  ul { margin: .6rem 0 0; padding-left: 1.2rem }
  li { margin: .35rem 0 }
  a { color: #2340d8 }
  .links { font-size: .9rem; margin-top: .6rem }
  .links a { margin-right: 1rem }
  @media print { body { padding: 0 } h2, h3 { page-break-after: avoid } }
</style></head><body>`)

html.push(`<h1>${esc(PROFILE.name)}</h1>`)
html.push(`<p class="meta">${esc(PROFILE.title)}<br>${esc(PROFILE.field)}<br>${esc(PROFILE.places)}</p>`)
for (const t of PROFILE.blurb) html.push(`<p>${esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`)
html.push(`<p><strong>${esc(PROFILE.next)}</strong></p>`)
html.push(`<p class="meta">${esc(PROFILE.email)} · <a href="${PROFILE.linkedin}">LinkedIn</a> · <a href="${PROFILE.github}">GitHub</a></p>`)

txt.push(PROFILE.name.toUpperCase(), rule('='), PROFILE.title, PROFILE.field, PROFILE.places, '',
  ...PROFILE.blurb.flatMap((t) => [t.replace(/\*\*/g, ''), '']), PROFILE.next, '',
  PROFILE.email, PROFILE.linkedin, PROFILE.github)

const flat = (f) => (typeof f === 'string' ? [f] : f.list.map((t, k) => `${f.ordered ? `${k + 1}. ` : ''}${t}`))

for (const sec of SECTIONS) {
  html.push(`<h2>${esc(sec.title)}</h2>`)
  txt.push('', '', rule('='), sec.title.toUpperCase(), rule('='))

  for (const c of sec.items) {
    html.push(`<h3>${esc(c.title)} — ${esc(c.org)}</h3>`)
    html.push(`<p class="meta">${esc(c.date)} · ${esc(c.place)}</p>`)
    html.push(`<p class="lead">${esc(c.line)}</p>`)
    if (c.stats?.length) html.push(`<p class="meta">${c.stats.map((st) => `<strong>${esc(st.v)}</strong> ${esc(st.k)}`).join(' · ')}</p>`)
    if (c.facts.length) html.push(`<ul>${c.facts.flatMap(flat).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`)
    if (c.tags?.length) html.push(`<p class="meta">${esc(c.tagsLabel)}: ${c.tags.map(esc).join(' · ')}</p>`)
    if (c.links?.length) {
      html.push(`<p class="links">${c.links.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}</p>`)
    }

    txt.push('', rule('-'), `${c.title.toUpperCase()} — ${c.org}`, `${c.date} · ${c.place}`, rule('-'), '', c.line, '')
    if (c.stats?.length) { txt.push(c.stats.map((st) => `${st.v} ${st.k}`).join('   ·   '), '') }
    for (const f of c.facts.flatMap(flat)) txt.push(`  - ${f}`)
    if (c.tags?.length) txt.push(`  ${c.tagsLabel}: ${c.tags.join(' · ')}`)
    if (c.links?.length) for (const l of c.links) txt.push(`  ${l.label}: ${l.href}`)
  }
}

html.push(`<h2>${esc(BEYOND.title)}</h2>`)
txt.push('', '', rule('='), BEYOND.title.toUpperCase(), rule('='), '')
for (const t of BEYOND.paragraphs) { html.push(`<p>${esc(t)}</p>`); txt.push(t, '') }

html.push('<h2>Contact</h2>', `<p class="meta">${esc(CONTACT.tags)}</p>`, `<p>${esc(CONTACT.text)}</p>`)
html.push(`<p class="meta">${esc(PROFILE.email)} · <a href="${PROFILE.linkedin}">LinkedIn</a> · <a href="${PROFILE.github}">GitHub</a></p>`)
txt.push('', '', rule('='), 'CONTACT', rule('='), '', CONTACT.tags, '', CONTACT.text, '',
  PROFILE.email, PROFILE.linkedin, PROFILE.github)

html.push('</body></html>')

// wrap the text so it reads in Notepad, keeping the indent of a bullet on its later lines
const WIDTH = 86
function wrap(line) {
  if (line.length <= WIDTH) return line
  const prefix = (line.match(/^\s*(?:- )?/) || [''])[0]   // "  - " on a bullet, spaces otherwise
  const hang = ' '.repeat(prefix.length)                  // later lines sit under the text
  const out = []
  let cur = prefix, first = true
  for (const w of line.slice(prefix.length).split(' ')) {
    const next = first ? cur + w : `${cur} ${w}`
    if (next.length > WIDTH && !first) { out.push(cur); cur = hang + w } else cur = next
    first = false
  }
  out.push(cur)
  return out.join('\r\n')
}

writeFileSync('content.html', html.join('\n'), 'utf8')
writeFileSync('content.txt', '﻿' + txt.map(wrap).join('\r\n') + '\r\n', 'utf8')

const words = txt.join(' ').split(/\s+/).filter(Boolean).length
const entries = SECTIONS.reduce((n, sec) => n + sec.items.length, 0)
console.log(`content.txt and content.html written: ${SECTIONS.length} sections, ${entries} entries, about ${words} words`)
