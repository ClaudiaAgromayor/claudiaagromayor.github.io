// Her own 3D avatar for the hero. Export it as .glb, put it in /public, and set:
//   export const AVATAR = '/avatar.glb'
// HeroScan then samples that model into scan rings instead of the stand-in figure.
// Anything works: the scan only uses the surface, so a simple avatar is enough.
// (v1 has its own setting, AVATAR_URL in src/data/chapters.js, so it stays as it is.)
export const AVATAR = null
