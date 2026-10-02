/* Sticker-style drawings of her world: each shape is drawn twice —
   once as a thick white outline, once in colour on top. */

const INK = '#0E1016'
const C = { cobalt: '#2340D8', sky: '#7FD8FF', coral: '#FF6B5A', sun: '#FFD23F', mint: '#5ED0B5', pink: '#FF8FC7', orange: '#F28C28', cream: '#FFF6E5', red: '#E5352B', gold: '#F5B83D' }

function Sticker({ children, size = 120 }) {
  return (
    <svg viewBox="-64 -64 128 128" width={size} height={size} aria-hidden="true">
      <g className="st-out">{children}</g>
      <g className="st-in">{children}</g>
    </svg>
  )
}

const line = (w) => ({ className: 'line', style: { '--w': `${w}px` } })

export const STICKERS = {
  // a rhythmic-gymnastics hoop, taped
  hoop: (
    <Sticker>
      <circle r="40" fill="none" stroke={C.cobalt} strokeWidth="13" {...line(13)} />
      {[0, 72, 144, 216, 288].map((a) => <rect key={a} x="-4" y="-47" width="8" height="14" rx="2" fill={C.pink} stroke={INK} strokeWidth="2" transform={`rotate(${a})`} />)}
    </Sticker>
  ),
  // the ribbon on its stick
  ribbon: (
    <Sticker>
      <path d="M-44 40 L-18 10" stroke={INK} strokeWidth="5" strokeLinecap="round" {...line(5)} />
      <path d="M-18 10 C 10 -30, 30 30, 46 -8 S 20 -50, 0 -38" fill="none" stroke={C.pink} strokeWidth="11" strokeLinecap="round" {...line(11)} />
    </Sticker>
  ),
  basketball: (
    <Sticker>
      <circle r="40" fill={C.orange} stroke={INK} strokeWidth="3" />
      <path d="M-40 0 H40 M0 -40 V40 M-28 -28 C -10 -10, -10 10, -28 28 M28 -28 C 10 -10, 10 10, 28 28" fill="none" stroke={INK} strokeWidth="3" {...line(3)} />
    </Sticker>
  ),
  surfboard: (
    <Sticker>
      <g transform="rotate(35)">
        <path d="M0 -56 C 22 -30, 22 30, 0 56 C -22 30, -22 -30, 0 -56 Z" fill={C.mint} stroke={INK} strokeWidth="3" />
        <path d="M0 -50 V50" stroke={C.cream} strokeWidth="5" {...line(5)} />
      </g>
    </Sticker>
  ),
  // a molar — her current research
  tooth: (
    <Sticker>
      <path d="M-34 -24 C -34 -46, -12 -46, 0 -36 C 12 -46, 34 -46, 34 -24 C 34 -4, 26 6, 22 24 C 18 44, 6 44, 4 26 C 2 14, -2 14, -4 26 C -6 44, -18 44, -22 24 C -26 6, -34 -4, -34 -24 Z" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
      <circle cx="-11" cy="-16" r="3.5" fill={INK} /><circle cx="11" cy="-16" r="3.5" fill={INK} />
      <path d="M-7 -6 Q 0 0 7 -6" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" {...line(2.5)} />
    </Sticker>
  ),
  // a molecule — drug discovery in Montréal
  molecule: (
    <Sticker>
      <path d="M-30 20 L0 -20 L32 14 M0 -20 L4 -46" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" {...line(5)} />
      <circle cx="-30" cy="20" r="15" fill={C.sky} stroke={INK} strokeWidth="3" />
      <circle cx="0" cy="-20" r="18" fill={C.cobalt} stroke={INK} strokeWidth="3" />
      <circle cx="32" cy="14" r="13" fill={C.coral} stroke={INK} strokeWidth="3" />
      <circle cx="4" cy="-46" r="8" fill={C.sun} stroke={INK} strokeWidth="3" />
    </Sticker>
  ),
  maple: (
    <Sticker>
      <path d="M0 -50 L9 -30 L22 -36 L18 -14 L38 -22 L32 -4 L46 2 L20 16 L24 30 L4 24 L3 44 L-3 44 L-4 24 L-24 30 L-20 16 L-46 2 L-32 -4 L-38 -22 L-18 -14 L-22 -36 L-9 -30 Z" fill={C.red} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </Sticker>
  ),
  // an open book — the double degrees
  book: (
    <Sticker>
      <path d="M0 -26 C -14 -36, -36 -38, -50 -32 V 34 C -36 28, -14 30, 0 40 Z" fill={C.cream} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M0 -26 C 14 -36, 36 -38, 50 -32 V 34 C 36 28, 14 30, 0 40 Z" fill={C.sky} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M-40 -18 C -30 -22, -18 -20, -10 -16 M-40 -4 C -30 -8, -18 -6, -10 -2 M-40 10 C -30 6, -18 8, -10 12 M10 -16 C 18 -20, 30 -22, 40 -18 M10 -2 C 18 -6, 30 -8, 40 -4" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" {...line(2.5)} />
    </Sticker>
  ),
  bolt: (
    <Sticker>
      <path d="M8 -54 L-30 6 L-4 6 L-12 54 L32 -10 L6 -10 Z" fill={C.sun} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </Sticker>
  ),
  heart: (
    <Sticker>
      <path d="M0 40 C -60 0, -40 -50, 0 -22 C 40 -50, 60 0, 0 40 Z" fill={C.coral} stroke={INK} strokeWidth="3" />
      <path d="M-24 -22 C -30 -18, -32 -10, -30 -4" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" {...line(5)} />
    </Sticker>
  ),
  // first place — the hackathon, the maths gymkhana
  medal: (
    <Sticker>
      <path d="M-18 -56 L-4 -16 M18 -56 L4 -16" stroke={C.cobalt} strokeWidth="12" {...line(12)} />
      <circle cy="12" r="30" fill={C.gold} stroke={INK} strokeWidth="3" />
      <text y="24" textAnchor="middle" fontSize="34" fontWeight="700" fill={INK} fontFamily="Geist, Arial, sans-serif">1</text>
    </Sticker>
  ),
  sparkle: (
    <Sticker>
      <path d="M0 -48 C 4 -12, 12 -4, 48 0 C 12 4, 4 12, 0 48 C -4 12, -12 4, -48 0 C -12 -4, -4 -12, 0 -48 Z" fill={C.sky} stroke={INK} strokeWidth="3" />
    </Sticker>
  ),
}

// where each sticker sits around the call to action (percent of the section), its tilt and depth
export const LAYOUT = [
  ['hoop', 8, 18, -12, 1.2], ['ribbon', 22, 88, 8, 0.8], ['basketball', 82, 14, 10, 1.1], ['surfboard', 90, 58, 0, 0.9],
  ['tooth', 70, 80, -8, 1.3], ['molecule', 12, 46, 14, 0.7], ['maple', 78, 36, -14, 0.6], ['book', 30, 12, -6, 0.5],
  ['bolt', 60, 10, 12, 0.7], ['heart', 6, 82, -6, 1], ['medal', 92, 86, 8, 1.2], ['sparkle', 58, 92, 0, 0.6],
]
