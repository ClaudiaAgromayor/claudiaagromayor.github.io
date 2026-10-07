import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* Shared by the two hero views (portrait scan and globe). */

// Frames the piece in the card. With `shift`, it sits beside her name: to the right on
// wide cards, above it on narrow ones. Without it, the piece is centred and her name
// reads on top of it. On tall, narrow screens the camera steps back so it still fits.
export function useHeroCamera(position, target, fov, shift = true) {
  const { camera, size } = useThree()
  useLayoutEffect(() => {
    const { width: w, height: h } = size
    const aspect = w / h, wide = w > 760
    // on a phone the piece sits in a band of its own, between the tabs and her name
    const k = Math.max(1, 1 / (aspect * (wide ? 1.35 : 1.05)))
    const t = new THREE.Vector3(...target)
    camera.fov = fov
    camera.position.set(...position).sub(t).multiplyScalar(k).add(t)
    camera.lookAt(t)
    if (!shift) camera.clearViewOffset()
    else if (wide) camera.setViewOffset(w, h, -w * 0.2, 0, w, h)
    else camera.setViewOffset(w, h, 0, h * 0.17, w, h)
    camera.updateProjectionMatrix()
    return () => { camera.clearViewOffset(); camera.updateProjectionMatrix() }
  }, [camera, size, position, target, fov, shift])
}

// A soft round dot for point clouds
export const dotTexture = (() => {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas'); c.width = c.height = 64
  const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
})()
