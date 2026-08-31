export type BacklogBar = {
  label: string
  /**
   * Net backlog in £ — budget at the rate card less the cost booked against it.
   * Can be negative where a discipline is overspent; the chart clamps the bar,
   * not the figure.
   */
  value: number
  colour: string
  /** small caption under the axis label, e.g. what the bucket bundles */
  sub?: { text: string; colour: string }
}

