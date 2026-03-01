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
