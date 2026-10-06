/* The site in sections, in the order she wants them read.
   `keys` are entry keys from ./entries.js */
import { ENTRIES } from './entries.js'

export const SECTIONS = [
  { id: 'work', title: 'Selected Work', keys: ['iric', 'aws', 'tooth', 'ibm', 'federated'] },
  { id: 'experience', title: 'Experience', keys: ['altex', 'forum', 'ices'] },
  { id: 'education', title: 'Education', keys: ['master', 'centrale', 'dauphine'] },
  { id: 'projects', title: 'Research & Technical Projects', keys: ['angryrobot', 'caffy'] },
  { id: 'recognition', title: 'Recognition', keys: ['iberdrola'] },
  { id: 'earlier', title: 'Earlier Experience', keys: ['camp'] },
  { id: 'early', title: 'Early Achievements', keys: ['casvi', 'gymnastics', 'maths'] },
].map((s) => ({ ...s, items: s.keys.map((k) => ENTRIES.find((e) => e.key === k)).filter(Boolean) }))
