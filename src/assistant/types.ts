/** One step in the agent pipeline, as rendered in the chat timeline. */
export type ToolStep = {
  tool: string
  label: string
  detail?: string
  /** simulated duration, drives the elapsed counter during playback */
  ms: number
  /** rows returned, shown like the real tool timeline does */
  rows?: number
}

/** How a widget's number was produced — powers the "show your work" drawer. */
export type Provenance = {
  table: string
  filters: { column: string; operator: string; value: string; rationale?: string }[]
  aggregate: { method: string; valueColumn?: string; groupBy?: string; topN?: number; sort?: string }
  dateColumn?: string
  limit?: number
  metric?: string
}

export type Widget =
  | {
      id: string
      kind: 'kpi'
      /** grid columns out of 12 */
      w: number
      title: string
      chip?: string
      value: string
      delta?: { dir: 'up' | 'dn'; text: string }
      note?: string
      query: Provenance
    }
  | {
      id: string
      kind: 'bar'
      w: number
      title: string
      chip?: string
      axisLabel?: string
      bars: { label: string; value: number; colour?: string }[]
      format: 'money' | 'hours' | 'count'
      query: Provenance
    }
  | {
      id: string
      kind: 'line'
      w: number
      title: string
      chip?: string
      points: { label: string; value: number }[]
      format: 'money' | 'hours' | 'count'
      query: Provenance
    }
  | {
      id: string
      kind: 'table'
      w: number
      title: string
      chip?: string
      columns: { key: string; label: string; numeric?: boolean }[]
      rows: Record<string, string>[]
      query: Provenance
    }

export type Insight = {
  text: string
  severity: 'info' | 'warning' | 'alert'
  widgetId: string
}

export type Scenario = {
  id: string
  question: string
  /** the resolved window, echoed in the reply the way the prompt demands (DD/MM/YYYY) */
  dateLabel?: string
  steps: ToolStep[]
  /** opening plan sentence, streamed before the tools run */
  plan: string
  /** closing summary, after the dashboard renders */
  answer: string
  dashboardTitle: string
  widgets: Widget[]
  insights: Insight[]
  followUps: string[]
}

export type ChatTurn = {
  role: 'user' | 'assistant'
  text: string
  scenarioId?: string
}
