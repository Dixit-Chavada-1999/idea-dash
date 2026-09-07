/**
 * Shared with the frontend. Keep in sync with the copy in the web repo.
 */

/** How confident we are in a figure — the UI shows uncertainty rather than hiding it. */
export type Confidence = 'measured' | 'partial' | 'unavailable'

/**
 * One enquiry cohort, split the way IDEA split it.
 *
 * `won + pending + unsuccessful` is the whole cohort — the buckets are
 * exhaustive by construction, which is what lets the pie be read as a whole.
 * Both rates travel: `resolved` is the headline, `naive` is kept beside it
 * because the distance between them is the lag this metric removes.
 */
export type OutcomeCohort = {
  label: string
  /** status Live or Closed — became real work */
  won: number
  /** status Enquiry or Proposal Sent — raised, not yet decided */
  pending: number
  /** status Didn’t Go Ahead, absorbing No Bid, No outcome and Lost */
  unsuccessful: number
  /** won / (won + unsuccessful) */
  resolved: number | null
  /** won / (won + pending + unsuccessful) */
  naive: number | null
}

export type Kpi = {
  key: string
  label: string
  /** already formatted for display, so the server owns currency and rounding */
  value: string
  /** raw number for charts and comparisons; null when unavailable */
  raw: number | null
  confidence: Confidence
  delta?: { dir: 'up' | 'dn'; text: string }
  meta?: string[]
  /** why a figure is partial or unavailable — shown, never swallowed */
  caveat?: string
  /**
   * Red/amber/green against IDEA's own band, from `kpi_thresholds`.
   *
   * Absent where that table holds no row for the metric. Three of the six
   * headline figures map to a key; the rest are left unrated rather than judged
   * against a threshold nobody agreed. `confidence` says how much to trust the
   * number, this says whether the number is good — they are different questions.
   */
  rating?: {
    band: 'green' | 'amber' | 'red'
    /** the rule that produced it, in IDEA's own numbers */
    note: string
  }
  /**
   * Monthly trend, present only where the metric can actually be rebuilt.
   *
   * Three facts in this database carry a date — `po_date`, `enquiry_date` and
   * `hours_worked.date` — and only those can be recomputed as they stood in a
   * past month. Everything else is derived from a project's *current* status,
   * and `project_status_history` holds 72 rows covering one week, so there is
   * no history to rebuild from. Those KPIs carry no series rather than a drawn
   * one: a trend line is read as measured whether or not it is.
   */
  /**
   * The three-way outcome split behind a conversion figure (IDEA spec §3, §7).
   *
   * Present only on the conversion card. A single percentage cannot show why it
   * moved: the same rate arises from a cohort that has mostly been decided and
   * from one that has barely started, and those mean opposite things. The two
   * cohorts travel together so the card can draw them side by side, current
   * against the prior-year equivalent, in IDEA's own semantic colours.
   */
  outcome?: {
    /** the window the current cohort covers, e.g. 'Mar 2026 → Sep 2026' */
    window: string
    current: OutcomeCohort
    prior: OutcomeCohort
  }

  series?: {
    /**
     * What the points plot.
     *
     * Named on every series because three of them answer a *different* question
     * from the headline figure above them — proposals issued rather than
     * currently open, conversion by enquiry cohort rather than over time, the
     * burn-down of today's live set rather than the backlog as it stood. An
     * unlabelled line would be read as the headline number's own history.
     */
    plots: string
    /** the window the points cover, e.g. 'Aug 2025 → Jul 2026' */
    label: string
    /** one point per month, oldest first; gaps are real zeroes */
    values: number[]
    /**
     * The month each value belongs to, e.g. 'Aug 2025' — same length and order
     * as `values`.
     *
     * Carried rather than derived on the client from `label`. IDEA asked to see
     * the year and month on hover, and reconstructing twelve months by parsing
     * a range string is a second implementation of the window that can drift
     * from the one the figures were actually measured over.
     */
    keys: string[]
    /** how to format a value in a tooltip — the series is bare numbers */
    unit: 'money' | 'count' | 'percent'
  }
}

export type HeadlineResponse = {
  /** the window every YTD figure was measured over */
  period: { from: string; to: string; label: string }
  kpis: Kpi[]
  /** data-quality facts the figures depend on */
  integrity: {
    projectsTotal: number
    projectsActive: number
    valueRecoveredFromCsv: number
    projectsWithoutValue: number
    orphanClients: number
    /**
     * Procurement recorded outside the numeric columns.
     *
     * `3rd_party_budget_*` and `expenses_budget_*` are empty across the whole
     * table, but `procurement_global` — a JSON array — is not. Reporting only
     * the empty columns would say no split is possible when the data for one
     * exists.
     */
    procurementProjects: number
    procurementValue: number
  }
  generatedAt: string
}

/* ------------------------------------------------- ingestion & integrity */

export type CheckStatus = 'ok' | 'watch' | 'alert'

export type IntegrityCheck = {
  key: string
  label: string
  status: CheckStatus
  value: string
  note: string
}

export type IntegrityResponse = {
  checks: IntegrityCheck[]
  /** worst status across the checks — drives the strip's rail colour */
  worst: CheckStatus
  generatedAt: string
}

/* ---------------------------------------------------- portfolio shape */

export type SectorSlice = { name: string; value: number; orders: number }

export type BacklogBucket = {
  label: string
  /**
   * Net backlog: budget at the rate card less the cost booked to this bucket.
   * Not clamped — a bucket carrying more cost than budget is overspent, and
   * zeroing it would hide that and break the reconciliation to the headline.
   */
  value: number
  /** the budget before cost is taken off, so the panel can show what was netted */
  grossValue: number
  /** cost booked to this bucket's disciplines */
  cost: number
  /** budgeted hours less hours booked — the same subtraction in hours */
  hours: number
  /** which disciplines this bucket is made of — MECHANICAL is MEC + CAD */
  composedOf: string[]
  bundled: boolean
}

export type PortfolioResponse = {
  progressVsSpend: {
    /** earned value as a share of budget, weighted by budget per discipline */
    progressPct: number | null
    /** cost booked as a share of the same budget */
    spentPct: number
    /** priced budget of the projects both bars are measured over */
    budgetValue: number
    earnedValue: number
    cost: number
    /** projects both bars cover — those recording progress */
    measuredProjects: number
    liveProjects: number
    projectsWithProgress: number
    /** priced budget across every live project, measured or not */
    liveBudgetValue: number
  }
  backlogByDiscipline: {
    buckets: BacklogBucket[]
    /** net backlog across the four buckets only — `unbucketed` sits outside it */
    total: number
    /** disciplines outside the four buckets — never dropped silently. Net, like the buckets. */
    unbucketed: { initial: string; value: number }[]
    /** the four buckets before cost, for the panel's "less cost booked" line */
    grossTotal: number
    costTotal: number
    /**
     * Cost booked to a timesheet row whose discipline is missing or no longer
     * exists. Almost always zero; held out rather than folded into a bucket it
     * cannot be shown to belong to, and subtracted in the tie check below.
     */
    unattributedCost: number
    /**
     * The Headline card's "Current backlog", so the panel can state the tie
     * rather than leave two figures on one screen to be compared by eye.
     */
    headlineBacklog: number
    /**
     * That tie, checked: every part of this breakdown summed against
     * `budgetValue − actualCost` over the same population, by a second query.
     * A false means the breakdown and the headline have drifted — a discipline
     * row lost from one side and not the other would do it.
     */
    tiesToHeadline: boolean
  }
  sectorSplit: {
    current: { label: string; slices: SectorSlice[]; total: number }
    prior: { label: string; slices: SectorSlice[]; total: number }
    /**
     * The panel claims its current-year total ties to Orders won YTD. This is
     * that claim, checked: the same purchase orders summed **without** the sector
     * grouping, by a second query. A false here means one of the two paths has
     * drifted — a project losing its sector row would drop out of the grouped
     * sum and not the plain one.
     */
    headlineOrders: number
    tiesToHeadline: boolean
  }
  generatedAt: string
}

/* -------------------------------------------------------- standing checks */

export type CheckSeverity = 'escalate' | 'rule_needed' | 'confirm' | 'review'

export type PendingPoRow = {
  code: string
  name: string
  budget: number
  actual: number
  awarded: number
  startDate: string | null
  severity: CheckSeverity
  /** held back from the table, but still counted and named */
  suppressed: boolean
  suppressedBecause?: string
}

export type UnplannedInvoicingRow = {
  code: string
  name: string
  /** invoiced as a share of awarded, value-weighted */
  invoicedPct: number
  invoiced: number
  outstanding: number
  awarded: number
  budget: number
  actual: number
  /** appears on the pending-PO check too — labelled rather than reported twice */
  alsoPendingPo: boolean
}

export type ChecksResponse = {
  pendingPo: {
    rows: PendingPoRow[]
    shownCount: number
    suppressedCount: number
    totals: { budget: number; actual: number }
    /** the rule in words, shown under the table so it can be challenged */
    rule: string
  }
  unplannedInvoicing: {
    rows: UnplannedInvoicingRow[]
    outstandingTotal: number
    rule: string
    /** how many rows the rule returns without the money-outstanding gate */
    withoutGateCount: number
    /**
     * What the rule returned while it read `month` alone.
     *
     * `project_invoice_milestones` carries two month columns and they disagree
     * on 92 of 797 rows: `month` is the original plan, `forecast_month` the
     * revised one. Reading the plan alone reported projects as unscheduled when
     * their invoice had simply been moved. Reported so the correction is
     * auditable rather than a silent drop in the row count.
     */
    planOnlyCount: number
  }
  generatedAt: string
}

/* ------------------------------------------------------------ movements */

export type MetricUnit = 'count' | 'money' | 'percent'

export type MovementClass = 'within_noise' | 'material'

export type MovementRow = {
  key: string
  label: string
  unit: MetricUnit
  previous: number
  current: number
  change: number
  changePct: number | null
  /** the threshold's call; a person's ruling is not stored anywhere */
  classification: MovementClass
}

export type MovementsResponse = {
  window: { from: string; to: string; days: number }
  rows: MovementRow[]
  threshold: { pct: number }
  /** metrics that cannot be rewound, named rather than quietly dropped */
  unavailable: { label: string; reason: string }[]
  generatedAt: string
}

/* ------------------------------------------------------------------ run */

/**
 * What the console's run header can honestly say.
 *
 * No run history is stored, so there is no "previous run" to name. What can be
 * measured is how current the data is and how much of it survives the active
 * filter — which is what the header was really claiming.
 */
export type RunResponse = {
  /** most recent fact anywhere in the reporting database, 'YYYY-MM-DD' */
  latestData: string | null
  /** rows the console reads, after the active filter */
  cleanRows: number
  /** rows before it */
  totalRows: number
  /**
   * The tables every figure rests on, with what each holds.
   *
   * Counted rather than listed: a name typed into an array says the console
   * reads a table, not that the table has anything in it. If a source empties or
   * stops being loaded, the line says so.
   */
  sources: { label: string; rows: number; latest: string | null }[]
  generatedAt: string
}

/* ------------------------------------------------------------ decisions */

/**
 * Live evidence for the open-decision cards.
 *
 * The questions themselves are authored — they are what IDEA is being asked,
 * not something the database knows. What the database *does* hold is the
 * evidence each question rests on, and that goes stale the moment it is typed
 * into the card. So the text stays in the frontend and the figures under it are
 * measured on every read.
 *
 * Two of the cards have no evidence here and never will: CRM access is a
 * question about another system, and reporting cadence is an organisational one.
 * They carry no line rather than a padded one.
 */
export type DecisionEvidence = {
  /** matches `Decision.evidenceKey` in the frontend's card list */
  key: string
  /** one line, already formatted — the server owns rounding and currency */
  text: string
}

export type DecisionsResponse = {
  evidence: DecisionEvidence[]
  generatedAt: string
}

/* ---------------------------------------------------------- data sync */

/**
 * The result of one refresh of the reporting database from the CRM.
 *
 * Row counts before and after travel together deliberately. "Sync complete" is
 * not an outcome anyone can check; "hours_worked 55,992 → 56,431" is. A table
 * that arrives empty, or one that does not move at all, is visible here and
 * nowhere else.
 */
export type SyncResponse = {
  ok: boolean
  startedAt: string
  finishedAt: string
  durationMs: number
  /** size of the downloaded dump */
  bytes: number
  /** SQL statements executed — TRUNCATEs and INSERTs */
  statements: number
  tables: { name: string; rowsBefore: number; rowsAfter: number }[]
  totalRowsBefore: number
  totalRowsAfter: number
}
