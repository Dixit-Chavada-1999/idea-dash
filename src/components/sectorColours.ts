import type { SectorSlice } from '../contracts/dashboard'

/**
 * Fixed palette, assigned by share of total across every chart that will use it.
 * A sector keeps one colour in all of them — a sector that changed colour
 * between two pies would read as a different sector.
 */
const PALETTE = ['#1D6FA5', '#58A3CE', '#9AC7E3', '#E8940C', '#17795A', '#4B5F6E', '#C6D2DA', '#B4894A']

export function sectorColours(...groups: SectorSlice[][]): Map<string, string> {
  const totals = new Map<string, number>()
  for (const g of groups) {
    for (const s of g) totals.set(s.name, (totals.get(s.name) ?? 0) + s.value)
  }
  const ordered = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name)
  return new Map(ordered.map((name, i) => [name, PALETTE[i % PALETTE.length]!]))
}
