export type Pt = { x: number; y: number }

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
