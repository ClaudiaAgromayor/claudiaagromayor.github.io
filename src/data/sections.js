/* The site in sections, in her order. `keys` are entry keys from ./entries.js
   weight 'major' carries the page; 'minor' sections are deliberately compact. */
import { ENTRIES } from './entries.js'

export const SECTIONS = [
  { id: 'experience', title: 'Experience', weight: 'major', keys: ['iric', 'aws', 'altex', 'forum'] },
  { id: 'research', title: 'Research & Engineering', weight: 'major', keys: ['tooth', 'ibm', 'federated'] },
  { id: 'projects', title: 'Projects', weight: 'major', keys: ['angryrobot', 'caffy'] },
  { id: 'education', title: 'Education', weight: 'major', keys: ['master', 'centrale', 'dauphine'] },
  { id: 'recognition', title: 'Recognition', weight: 'minor', keys: ['iberdrola'] },
  { id: 'earlier', title: 'Earlier Experience & Early Achievements', weight: 'minor', keys: ['ices', 'camp', 'casvi', 'gymnastics', 'maths'] },
].map((s) => ({ ...s, items: s.keys.map((k) => ENTRIES.find((e) => e.key === k)).filter(Boolean) }))

/* The same entries on one line of time, newest first, each remembering the
   section it lives in so the timeline can send you there. */
export const CHRONO = [...ENTRIES]
  .filter((e) => e.start)
  .sort((a, b) => b.start - a.start)
  .map((e) => ({ ...e, section: SECTIONS.find((s) => s.keys.includes(e.key))?.id }))
