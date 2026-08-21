export type BacklogBar = {
  label: string
  /** remaining budget in £ */
  value: number
  colour: string
  /** small caption under the axis label, e.g. what the bucket bundles */
  sub?: { text: string; colour: string }
}

export const BACKLOG_BARS: BacklogBar[] = [
  { label: 'PROCESS', value: 412_000, colour: '#1D6FA5' },
  { label: 'SAFETY', value: 188_000, colour: '#58A3CE' },
  {
    label: 'MECHANICAL',
    value: 265_000,
    colour: '#E8940C',
    sub: { text: 'UPPER BOUND · MEC+CAD', colour: '#E8940C' },
  },
  { label: 'EC&I', value: 231_000, colour: '#9AC7E3', sub: { text: 'ELC + INC', colour: '#7B8FA0' } },
]
