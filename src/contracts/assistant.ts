/**
 * Shared with the frontend. Keep in sync with the copy in the web repo.
 *
 * The widget shapes deliberately match the union the assistant canvas already
 * renders, so the built dashboard drops into the existing UI. One thing does
 * not match, and it is the point of the change: `provenance`.
 *
 * The wireframe's drawer describes a single-table query — table, filters,
 * groupBy — because that is what a generic executor produces. None of these
 * figures come from one. Each is joined, verified SQL whose correctness lives
 * in the join, so a drawer listing "table: project_budget_hours" would name the
 * least important part and imply the query is simpler than it is. What can be
 * said honestly is which registry metric ran, over what window, across what
 * population — and that is what travels here.
 */

export type Unit = 'money' | 'count' | 'percent' | 'hours'

export type Window = { from: string; to: string; label: string; partial: boolean }

/**
 * The single-table query a dynamic answer actually ran.
 *
 * Present only where `source` is `query`. This is the spec **after** the
 * allow-list finished with it, not what the model proposed — a drawer showing
 * the proposal would describe a query that may never have run. The registry
 * metrics carry no plan because theirs is joined SQL a person wrote, and
 * naming one table of five would describe the least important part of it.
 */
export type QueryPlan = {
  table: string
  method?: string
  valueColumn?: string
  groupBy?: string
  grain?: string
  columns?: string[]
  /** how the rows were sorted — the difference between "the highest" and "one of them" */
  orderBy?: string
  /**
   * Columns fetched by a second allow-listed read rather than by the query
   * above — a client's address, read from `clients` once the project rows were
   * in. Listed apart from `columns` because they did not come from the same
   * statement, and a drawer that blurred the two would describe a join that
   * never ran.
   */
  resolved?: string[]
  filters: { column: string; operator: string; value?: string }[]
  limit?: number
}

/** How a figure was produced. Everything here is recorded, never inferred. */
export type Provenance = {
  /** registry id — the one canonical definition of this figure */
  metric: string
  /** the human name of that definition */
  definition: string
  /**
   * `metric` is joined SQL that a person wrote and checked; `query` is a
   * single-table aggregate the executor assembled under the allow-list. The
   * two carry different weight and the drawer should not blur them.
   */
  source: 'metric' | 'query'
  /** null where the figure is a standing one with no window at all */
  window: Window | null
  /** the executed spec, on dynamic answers only — see `QueryPlan` */
  plan?: QueryPlan
  /** figures that qualify the value — reported beside it, never used to compute it */
  meta: Record<string, number | string>
  /** what the figure does not cover */
  caveat?: string
  /** IDEA's own band, where `kpi_thresholds` holds a row for this metric */
  rating?: { band: 'green' | 'amber' | 'red'; note: string }
}

export type KpiWidget = {
  id: string
  kind: 'kpi'
  /** grid columns out of 12 */
  w: number
  title: string
  chip?: string
  /** already formatted — the server owns currency and rounding */
  value: string
  note?: string
  query: Provenance
}

export type BarWidget = {
  id: string
  kind: 'bar'
  w: number
  title: string
  chip?: string
  axisLabel?: string
  bars: { label: string; value: number; colour?: string }[]
  format: Unit
  query: Provenance
}

/**
 * Rows, where naming the members *is* the answer.
 *
 * `columns` is sent rather than derived from the first row: an empty list still
 * renders its header, and the client cannot know which column holds money
 * without being told. `note` carries the truncation — a table showing 200 of
 * 400 says so on the card, not only in the drawer.
 */
export type TableWidget = {
  id: string
  kind: 'table'
  w: number
  title: string
  chip?: string
  columns: { key: string; label: string; align?: 'left' | 'right' }[]
  /** already formatted — the server owns currency, dates and rounding */
  rows: Record<string, string>[]
  note?: string
  query: Provenance
}

export type Widget = KpiWidget | BarWidget | TableWidget

/**
 * A computed finding, phrased from numbers rather than read from rows.
 *
 * Every one is a template filled by `insights.ts` — no model sees a row, and
 * none of these can say anything the arithmetic does not support.
 */
export type Insight = {
  text: string
  severity: 'info' | 'warning' | 'alert'
  /** the widget the finding is about; the canvas scrolls to it */
  widgetId: string
}

/**
 * One step of the pipeline, as it actually ran.
 *
 * The wireframe showed a timeline like this with the durations written into a
 * file. These are measured: `ms` is wall clock, `rows` is what came back. The
 * same array is written to `assistant_audit`, so what the user watched and what
 * can be reconstructed later are the same record rather than two accounts of it.
 */
export type ToolStep = {
  tool: string
  label: string
  detail?: string
  ms: number
  rows?: number
  /** set where the step failed; the answer then says so rather than rendering */
  error?: string
}

/** Why an answer could not be built. Each one is a thing to say, not an error to swallow. */
export type Unanswered =
  | {
      reason: 'no_metric'
      question: string
      /**
       * Why the query planner refused, in its own words.
       *
       * Present whenever the planner ran, which since the dynamic path exists is
       * most of the time. It is the difference between "this console cannot
       * answer that" and "client email is not reachable from the projects
       * table" — the second tells the reader what to change about the question.
       */
      detail?: string
    }
  | { reason: 'ambiguous'; candidates: { id: string; name: string }[] }
  | { reason: 'needs_window'; metric: string; name: string }

/** Present on every answer, whether or not one could be built. */
type Common = {
  question: string
  /** the pipeline as it ran — shown live, then stored */
  steps: ToolStep[]
  /** set once the turn is persisted; null when persistence is unavailable */
  threadId: number | null
  messageId: number | null
  /**
   * Who wrote the prose.
   *
   * `template` means the sentences were assembled from the computed facts with
   * no model involved — the whole pipeline runs, and answers, without an API
   * key. `model` means a model phrased those same facts. The figures are
   * identical either way; only the wording differs, and a reader is entitled to
   * know which they are looking at.
   */
  phrasing: 'template' | 'model'
  generatedAt: string
  /**
   * What to offer asking next — and it belongs here, on every answer, rather
   * than only on the ones that worked.
   *
   * A refusal is where suggestions matter most. "Orders by sector is measured
   * over a period, and none was named" is a correct answer that leaves the
   * reader with nothing to click, so they retype the question with a window
   * appended and hope. Where the pipeline knows exactly what would have
   * answered, it should say so as something clickable.
   *
   * Every string here must resolve. A chip the pipeline cannot answer is worse
   * than no chip, which is why a metric needing a window is never offered
   * without one.
   */
  followUps: string[]
}

export type AssistantAnswer =
  | (Common & {
      ok: true
      title: string
      /** the opening line, before the steps run */
      plan: string
      /** the closing line, once the figures are in */
      answer: string
      window: Window | null
      widgets: Widget[]
      insights: Insight[]
    })
  | (Common & { ok: false; problem: Unanswered; answer: string })
