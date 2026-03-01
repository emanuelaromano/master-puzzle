export function pathFromCell(cell: [number, number][]) {
  return (
    cell.reduce(
      (acc, [x, y], j) => (j === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`),
      ''
    ) + ' Z'
  )
}

export function pointInPolygon(x: number, y: number, polygon: [number, number][]): boolean {
  const n = polygon.length
  let inside = false
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

function polygonCentroid(polygon: [number, number][]): [number, number] {
  let cx = 0
  let cy = 0
  for (const [px, py] of polygon) {
    cx += px
    cy += py
  }
  const n = polygon.length
  return n === 0 ? [0, 0] : [cx / n, cy / n]
}

function avgRadiusFromCentroid(polygon: [number, number][], [cx, cy]: [number, number]): number {
  let sum = 0
  for (const [px, py] of polygon) {
    sum += Math.hypot(px - cx, py - cy)
  }
  return polygon.length === 0 ? 0 : sum / polygon.length
}


export function pointInOrNearPolygon(
  x: number,
  y: number,
  polygon: [number, number][],
  marginFactor: number
): boolean {
  if (pointInPolygon(x, y, polygon)) return true
  const [cx, cy] = polygonCentroid(polygon)
  const avgRadius = avgRadiusFromCentroid(polygon, [cx, cy])
  const margin = avgRadius * marginFactor
  return Math.hypot(x - cx, y - cy) < margin
}
