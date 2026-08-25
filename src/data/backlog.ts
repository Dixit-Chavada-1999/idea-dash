export type BacklogBar = {
  label: string
  /** remaining budget in £ */
  value: number
  colour: string
  /** small caption under the axis label, e.g. what the bucket bundles */
  sub?: { text: string; colour: string }
}

