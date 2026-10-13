export type Pt = { x: number; y: number }

function cross(o: Pt, a: Pt, b: Pt) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

function convexHull(points: Pt[]): Pt[] {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y)
  if (pts.length < 3) return pts
  const lower: Pt[] = []
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop()
    lower.push(p)
  }
  const upper: Pt[] = []
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop()
    upper.push(p)
  }
  upper.pop()
  lower.pop()
  return lower.concat(upper)
}

function smoothClosedPath(points: Pt[]) {
  const n = points.length
  if (n === 0) return ''
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return `${d} Z`
}

/** Organic blob around a set of points: pad each point with a ring, take the hull, then smooth it. */
export function organicBlobPath(points: Pt[], radius = 60) {
  const ring: Pt[] = []
  points.forEach((p, idx) => {
    for (let k = 0; k < 12; k++) {
      const angle = (k / 12) * Math.PI * 2 + idx
      const wobble = radius * (0.88 + 0.12 * Math.sin(k * 2.3 + idx))
      ring.push({ x: p.x + Math.cos(angle) * wobble, y: p.y + Math.sin(angle) * wobble })
    }
  })
  return smoothClosedPath(convexHull(ring))
}

export function curvedSegment(a: Pt, b: Pt, bend = 0.18) {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const control = { x: mx - dy * bend, y: my + dx * bend }
  const mid = {
    x: 0.25 * a.x + 0.5 * control.x + 0.25 * b.x,
    y: 0.25 * a.y + 0.5 * control.y + 0.25 * b.y,
  }
  // A quadratic Bézier's tangent at t = 0.5 is parallel to (b - a).
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI
  return {
    d: `M ${a.x} ${a.y} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${b.x} ${b.y}`,
    mid,
    angle,
  }
}

export function centroid(points: Pt[]): Pt {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
  return { x: sum.x / points.length, y: sum.y / points.length }
}
