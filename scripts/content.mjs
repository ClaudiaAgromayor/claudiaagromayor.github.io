/* Writes content.html: everything written on the site, in one page you can read,
   print or copy into a CV. Run it with `npm run content`. */
import { writeFileSync } from 'node:fs'
import { PROFILE } from '../src/data/chapters.js'
import { ACTS } from '../src/data/acts.js'

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
const out = []

out.push(`<!doctype html>
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
  @media print { body { padding: 0 } h2 { page-break-after: avoid } h3 { page-break-after: avoid } }
</style></head><body>`)

out.push(`<h1>${esc(PROFILE.name)}</h1>`)
out.push(`<p class="meta">${esc(PROFILE.role)} · ${esc(PROFILE.places)}</p>`)
out.push(`<p class="meta">${esc(PROFILE.email)} · <a href="${PROFILE.linkedin}">LinkedIn</a> · <a href="${PROFILE.github}">GitHub</a></p>`)
out.push(`<p>${esc(PROFILE.next)}</p>`)

for (const a of ACTS) {
  out.push(`<h2>Chapter ${esc(a.n)}. ${esc(a.title)}</h2>`)
  out.push(`<p class="meta">${esc(a.years)}</p>`)
  out.push(`<p>${esc(a.text)}</p>`)
  for (const c of a.items) {
    out.push(`<h3>${esc(c.title)}</h3>`)
    out.push(`<p class="meta">${esc(c.date)} · ${esc(c.place)}</p>`)
    out.push(`<p class="lead">${esc(c.line)}</p>`)
    out.push(`<ul>${c.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`)
    if (c.links?.length) {
      out.push(`<p class="links">${c.links.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}</p>`)
    }
  }
}
out.push('</body></html>')

writeFileSync('content.html', out.join('\n'), 'utf8')
const words = out.join(' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
console.log(`content.html written: ${ACTS.length} chapters, ${ACTS.reduce((n, a) => n + a.items.length, 0)} moments, about ${words} words`)
