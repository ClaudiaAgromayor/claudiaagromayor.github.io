/* The site in sections, in her order. `keys` are entry keys from ./entries.js
   weight 'major' carries the page; 'minor' sections are deliberately compact. */
import { ENTRIES } from './entries.js'

export const SECTIONS = [
  { id: 'experience', title: 'Experience', weight: 'major', keys: ['iric', 'aws', 'altex', 'forum', 'ices'] },
  { id: 'research', title: 'Selected Research & Technical Work', weight: 'major', keys: ['tooth', 'ibm', 'federated'] },
  { id: 'projects', title: 'Selected Projects', weight: 'major', keys: ['angryrobot', 'caffy'] },
  { id: 'education', title: 'Education', weight: 'major', keys: ['master', 'centrale', 'dauphine'] },
  { id: 'recognition', title: 'Recognition', weight: 'minor', keys: ['iberdrola'] },
  { id: 'earlier', title: 'Earlier Experience & Early Achievements', weight: 'minor', keys: ['camp', 'casvi', 'gymnastics', 'maths'] },
].map((s) => ({ ...s, items: s.keys.map((k) => ENTRIES.find((e) => e.key === k)).filter(Boolean) }))
