import type { Scenario } from './types'

/**
 * Scripted answers for the static assistant.
 *
 * Figures are taken from the real IDEA database so the demo reads as plausible,
 * but nothing here is computed — this file is a wireframe, not a data source.
 * When the real agent lands, each scenario becomes a metric-registry entry.
 */

const NOT_REMOVED = { column: 'active', operator: '=', value: '1', rationale: 'excludes deleted rows' }

export const SUGGESTIONS = [
  'Backlog by discipline this quarter',
  'Which live projects have no PO on file?',
  'How are we doing this month?',
  'Hours logged by discipline, last 90 days',
]

export const SCENARIOS: Scenario[] = [
  /* ------------------------------------------------------------------ */
  {
    id: 'backlog-by-discipline',
    question: 'Backlog by discipline this quarter',
    dateLabel: '01/07/2026 – 21/08/2026',
    plan: 'Resolving the quarter, then reading secured backlog per discipline from budget hours less hours booked.',
    steps: [
      { tool: 'resolveDateRange', label: 'Resolving date range', detail: 'this quarter → 01/07/2026 – 21/08/2026', ms: 300 },
      { tool: 'resolveKpi', label: 'Resolving metric', detail: 'secured_backlog_cost (confidence 0.91)', ms: 420 },
      { tool: 'queryDatabase', label: 'Querying database', detail: 'project_budget_hours', ms: 680, rows: 10 },
      { tool: 'planDashboard', label: 'Planning layout', detail: 'ranking · moderate → layout A', ms: 260 },
      { tool: 'generateDashboard', label: 'Generating dashboard', detail: '4 widgets', ms: 1150 },
      { tool: 'generateInsights', label: 'Generating insights', detail: '3 findings', ms: 740 },
      { tool: 'suggestFollowUps', label: 'Suggesting follow-ups', ms: 380 },
    ],
    answer:
      'Secured backlog for 01/07/2026 – 21/08/2026 is £1,096,400 across four buckets. Process carries 38% of it; Mechanical is an upper bound because CAD is bundled into it.',
    dashboardTitle: 'Secured backlog by discipline',
    widgets: [
      {
        id: 'w-backlog-total',
        kind: 'kpi',
        w: 3,
        title: 'Secured backlog',
        chip: 'SO',
        value: '£1,096,400',
        delta: { dir: 'up', text: '▲ 2.3%' },
        note: 'vs last run',
        query: {
          metric: 'secured_backlog_cost',
          table: 'project_budget_hours',
          filters: [NOT_REMOVED, { column: 'projects.status', operator: '=', value: '5', rationale: 'Live projects only' }],
          aggregate: { method: 'sum', valueColumn: 'value' },
          dateColumn: 'projects.start_date',
        },
      },
      {
        id: 'w-backlog-hours',
        kind: 'kpi',
        w: 3,
        title: 'Backlog hours',
        chip: 'SO',
        value: '7,240',
        delta: { dir: 'up', text: '▲ 1.1%' },
        note: '4 disciplines',
        query: {
          metric: 'secured_backlog_hours',
          table: 'project_budget_hours',
          filters: [NOT_REMOVED],
          aggregate: { method: 'sum', valueColumn: 'value' },
        },
      },
      {
        id: 'w-live-count',
        kind: 'kpi',
        w: 3,
        title: 'Live projects',
        chip: 'COUNT',
        value: '86',
        note: '1,233 total on file',
        query: {
          metric: 'live_projects',
          table: 'projects',
          filters: [NOT_REMOVED, { column: 'status', operator: '=', value: '5', rationale: 'status 5 = Live' }],
          aggregate: { method: 'count' },
        },
      },
      {
        id: 'w-po-cover',
        kind: 'kpi',
        w: 3,
        title: 'PO cover',
        chip: 'BOUND',
        value: '£7,335,606',
        note: '354 of 1,233 projects',
        query: {
          metric: 'po_cover_total',
          table: 'project_purchase_orders',
          filters: [NOT_REMOVED],
          aggregate: { method: 'sum', valueColumn: 'value' },
          dateColumn: 'po_date',
        },
      },
      {
        id: 'w-backlog-bars',
        kind: 'bar',
        w: 7,
        title: 'Backlog by discipline',
        chip: 'REMAINING BUDGET',
        axisLabel: 'Mechanical bundles CAD — upper bound',
        format: 'money',
        bars: [
          { label: 'PROCESS', value: 412000, colour: '#1D6FA5' },
          { label: 'SAFETY', value: 188000, colour: '#58A3CE' },
          { label: 'MECHANICAL', value: 265000, colour: '#E8940C' },
          { label: 'EC&I', value: 231000, colour: '#9AC7E3' },
        ],
        query: {
          metric: 'secured_backlog_cost',
          table: 'project_budget_hours',
          filters: [
            NOT_REMOVED,
            { column: 'projects.status', operator: '=', value: '5', rationale: 'Live projects only' },
          ],
          aggregate: { method: 'sum', valueColumn: 'value', groupBy: 'disciplines.name', topN: 10, sort: 'value_desc' },
          dateColumn: 'projects.start_date',
          limit: 500,
        },
      },
      {
        id: 'w-backlog-trend',
        kind: 'line',
        w: 5,
        title: 'Backlog run-to-run',
        chip: 'WEEKLY',
        format: 'money',
        points: [
          { label: 'W1', value: 1043000 },
          { label: 'W2', value: 1058000 },
          { label: 'W3', value: 1051000 },
          { label: 'W4', value: 1064000 },
          { label: 'W5', value: 1071900 },
          { label: 'W6', value: 1082000 },
          { label: 'W7', value: 1096400 },
        ],
        query: {
          metric: 'secured_backlog_cost',
          table: 'project_budget_hours',
          filters: [NOT_REMOVED],
          aggregate: { method: 'sum', valueColumn: 'value', groupBy: 'week' },
          dateColumn: 'projects.start_date',
        },
      },
    ],
    insights: [
      { text: 'Process holds £412,000 — 38% of all secured backlog.', severity: 'info', widgetId: 'w-backlog-bars' },
      {
        text: 'Mechanical (£265,000) includes CAD; treat as an upper bound.',
        severity: 'warning',
        widgetId: 'w-backlog-bars',
      },
      { text: 'Backlog has risen every week for seven runs — +5.1% total.', severity: 'info', widgetId: 'w-backlog-trend' },
    ],
    followUps: [
      'Show Process backlog by project',
      'Which disciplines are below threshold?',
      'Compare backlog to last quarter',
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'no-po',
    question: 'Which live projects have no PO on file?',
    plan: 'Checking live projects against the purchase-order table — this is the standing pending-PO rule, not a filtered list.',
    steps: [
      { tool: 'resolveKpi', label: 'Resolving metric', detail: 'pending_po_projects (confidence 0.88)', ms: 400 },
      { tool: 'queryDatabase', label: 'Querying database', detail: 'projects × project_purchase_orders', ms: 820, rows: 23 },
      { tool: 'generateDashboard', label: 'Generating dashboard', detail: '3 widgets', ms: 980 },
      { tool: 'generateInsights', label: 'Generating insights', detail: '2 findings', ms: 610 },
      { tool: 'suggestFollowUps', label: 'Suggesting follow-ups', ms: 350 },
    ],
    answer:
      '23 live projects have no purchase order on file, carrying £486,300 of budget and £212,750 already spent. Three admin-only cost-centre splits are suppressed and shown on the face of the report.',
    dashboardTitle: 'Live projects with no PO',
    widgets: [
      {
        id: 'w-po-count',
        kind: 'kpi',
        w: 4,
        title: 'Projects flagged',
        chip: 'RULE §6.1',
        value: '23',
        delta: { dir: 'up', text: '▲ 17' },
        note: 'vs 6 published last run',
        query: {
          metric: 'pending_po_projects',
          table: 'projects',
          filters: [
            NOT_REMOVED,
            { column: 'status', operator: '=', value: '5', rationale: 'status 5 = Live' },
            { column: 'po_reference', operator: 'IS NULL', value: '—', rationale: 'no PO recorded' },
          ],
          aggregate: { method: 'count' },
        },
      },
      {
        id: 'w-po-budget',
        kind: 'kpi',
        w: 4,
        title: 'Budget exposed',
        chip: 'SO',
        value: '£486,300',
        note: 'across 23 projects',
        query: {
          metric: 'pending_po_budget',
          table: 'project_budget_hours',
          filters: [NOT_REMOVED],
          aggregate: { method: 'sum', valueColumn: 'value' },
        },
      },
      {
        id: 'w-po-spent',
        kind: 'kpi',
        w: 4,
        title: 'Already spent',
        chip: 'ALERT',
        value: '£212,750',
        note: '43.7% of exposed budget',
        query: {
          metric: 'pending_po_spent',
          table: 'hours_worked',
          filters: [NOT_REMOVED],
          aggregate: { method: 'sum', valueColumn: 'value' },
          dateColumn: 'date',
        },
      },
      {
        id: 'w-po-table',
        kind: 'table',
        w: 12,
        title: 'Pending PO — full rule output',
        chip: 'NO TRIAGE',
        columns: [
          { key: 'code', label: 'Code' },
          { key: 'project', label: 'Project' },
          { key: 'budget', label: 'Budget', numeric: true },
          { key: 'actual', label: 'Actual', numeric: true },
          { key: 'start', label: 'Start date' },
          { key: 'status', label: 'Flag' },
        ],
        rows: [
          {
            code: '25153',
            project: 'Spend already exceeds budget, no PO on file',
            budget: '28,400',
            actual: '56,900',
            start: '14/03/2026',
            status: 'Escalate',
          },
          {
            code: '24188B',
            project: 'Scope change riding on master project 24188',
            budget: '41,750',
            actual: '33,120',
            start: '08/01/2026',
            status: 'Confirm',
          },
          {
            code: 'OTECSA-25',
            project: 'Retainer / ad-hoc technical support',
            budget: '0',
            actual: '4,180',
            start: '22/02/2026',
            status: 'Rule needed',
          },
          {
            code: '25091',
            project: 'Distillery cooling upgrade — phase 2',
            budget: '96,500',
            actual: '31,400',
            start: '11/04/2026',
            status: 'Confirm',
          },
          {
            code: '2512x',
            project: 'Remaining 19 rows render identically',
            budget: '319,650',
            actual: '87,150',
            start: '—',
            status: 'Review',
          },
        ],
        query: {
          metric: 'pending_po_projects',
          table: 'projects',
          filters: [
            NOT_REMOVED,
            { column: 'status', operator: '=', value: '5', rationale: 'status 5 = Live' },
            { column: 'po_reference', operator: 'IS NULL', value: '—', rationale: 'no PO recorded' },
          ],
          aggregate: { method: 'select_rows' },
          limit: 500,
        },
      },
    ],
    insights: [
      {
        text: 'Project 25153 has spent 2× its budget with no commercial cover.',
        severity: 'alert',
        widgetId: 'w-po-table',
      },
      {
        text: 'The jump from 6 to 23 is reporting completeness, not a business change.',
        severity: 'warning',
        widgetId: 'w-po-count',
      },
    ],
    followUps: [
      'Show the three suppressed splits',
      'Which of these have invoices raised?',
      'Pending PO by project lead',
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'this-month',
    question: 'How are we doing this month?',
    dateLabel: '01/08/2026 – 21/08/2026',
    plan: 'That is a broad question, so matching a curated dashboard rather than a single metric.',
    steps: [
      { tool: 'resolveDateRange', label: 'Resolving date range', detail: 'this month → 01/08/2026 – 21/08/2026', ms: 290 },
      { tool: 'suggestTemplate', label: 'Matching template', detail: 'monthly_performance (5 metrics)', ms: 460 },
      { tool: 'generateDashboard', label: 'Generating dashboard', detail: 'prebuilt widgets forwarded verbatim', ms: 1080 },
      { tool: 'generateInsights', label: 'Generating insights', detail: '3 findings', ms: 700 },
      { tool: 'suggestFollowUps', label: 'Suggesting follow-ups', ms: 340 },
    ],
    answer:
      'Month to date, 01/08/2026 – 21/08/2026: £1,399,008 of orders won, 86 live projects, and 8,412 hours booked. Invoice milestone adherence is 85.8%, above the 75% green threshold.',
    dashboardTitle: 'Monthly performance',
    widgets: [
      {
        id: 'w-m-orders',
        kind: 'kpi',
        w: 3,
        title: 'Orders won',
        chip: 'EX-PROC',
        value: '£1,399,008',
        delta: { dir: 'up', text: '▲ 17.8%' },
        note: '63 orders',
        query: {
          metric: 'orders_won',
          table: 'projects',
          filters: [NOT_REMOVED, { column: 'po_reference', operator: 'IS NOT NULL', value: '—', rationale: 'PO received only' }],
          aggregate: { method: 'sum', valueColumn: 'value' },
          dateColumn: 'project_purchase_orders.po_date',
        },
      },
      {
        id: 'w-m-hours',
        kind: 'kpi',
        w: 3,
        title: 'Hours booked',
        chip: 'MTD',
        value: '8,412',
        delta: { dir: 'up', text: '▲ 4.2%' },
        note: '62 timesheet users',
        query: {
          metric: 'hours_booked',
          table: 'hours_worked',
          filters: [NOT_REMOVED],
          aggregate: { method: 'sum', valueColumn: 'value' },
          dateColumn: 'date',
        },
      },
      {
        id: 'w-m-adherence',
        kind: 'kpi',
        w: 3,
        title: 'Milestone adherence',
        chip: 'GREEN',
        value: '85.8%',
        delta: { dir: 'up', text: '▲ 10.8pp' },
        note: 'green ≥ 75%',
        query: {
          metric: 'invoice_milestone_adherence',
          table: 'project_invoice_milestones',
          filters: [NOT_REMOVED],
          aggregate: { method: 'avg', valueColumn: 'hit' },
          dateColumn: 'month',
        },
      },
      {
        id: 'w-m-conversion',
        kind: 'kpi',
        w: 3,
        title: 'Conversion',
        chip: 'COHORT',
        value: '38.6%',
        delta: { dir: 'dn', text: '▼ 5.5pp' },
        note: 'amber — green ≥ 55%',
        query: {
          metric: 'conversion_rate',
          table: 'projects',
          filters: [NOT_REMOVED],
          aggregate: { method: 'count' },
          dateColumn: 'enquiry_date',
        },
      },
      {
        id: 'w-m-sector',
        kind: 'bar',
        w: 6,
        title: 'Live projects by sector',
        chip: 'COUNT',
        format: 'count',
        bars: [
          { label: 'DISTILLED SPIRITS', value: 60, colour: '#1D6FA5' },
          { label: 'OTHER', value: 10, colour: '#58A3CE' },
          { label: 'RENEWABLES', value: 5, colour: '#9AC7E3' },
          { label: 'OIL & GAS', value: 3, colour: '#4B5F6E' },
        ],
        query: {
          metric: 'live_projects_by_sector',
          table: 'projects',
          filters: [NOT_REMOVED, { column: 'status', operator: '=', value: '5', rationale: 'status 5 = Live' }],
          aggregate: { method: 'count', groupBy: 'sectors.name', topN: 10, sort: 'value_desc' },
        },
      },
      {
        id: 'w-m-trend',
        kind: 'line',
        w: 6,
        title: 'Hours booked per week',
        chip: 'LAST 8 WEEKS',
        format: 'hours',
        points: [
          { label: 'W1', value: 1980 },
          { label: 'W2', value: 2110 },
          { label: 'W3', value: 2040 },
          { label: 'W4', value: 2190 },
          { label: 'W5', value: 2120 },
          { label: 'W6', value: 2260 },
          { label: 'W7', value: 2180 },
          { label: 'W8', value: 2094 },
        ],
        query: {
          metric: 'hours_booked',
          table: 'hours_worked',
          filters: [NOT_REMOVED],
          aggregate: { method: 'sum', valueColumn: 'value', groupBy: 'week' },
          dateColumn: 'date',
        },
      },
    ],
    insights: [
      {
        text: 'Distilled Spirits carries 60 of 86 live projects — 70% concentration.',
        severity: 'warning',
        widgetId: 'w-m-sector',
      },
      { text: 'Milestone adherence 85.8% sits above the 75% green threshold.', severity: 'info', widgetId: 'w-m-adherence' },
      { text: 'Conversion 38.6% is amber; green requires 55%.', severity: 'warning', widgetId: 'w-m-conversion' },
    ],
    followUps: ['Break orders won down by sector', 'Which milestones slipped?', 'Compare to last month'],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'hours-by-discipline',
    question: 'Hours logged by discipline, last 90 days',
    dateLabel: '23/05/2026 – 21/08/2026',
    plan: 'Resolving the 90-day window, then summing booked hours grouped by discipline.',
    steps: [
      { tool: 'resolveDateRange', label: 'Resolving date range', detail: 'last 90 days → 23/05/2026 – 21/08/2026', ms: 300 },
      { tool: 'resolveKpi', label: 'Resolving metric', detail: 'hours_by_discipline (confidence 0.94)', ms: 390 },
      { tool: 'queryDatabase', label: 'Querying database', detail: 'hours_worked', ms: 910, rows: 8 },
      { tool: 'planDashboard', label: 'Planning layout', detail: 'ranking · moderate → layout D', ms: 240 },
      { tool: 'generateDashboard', label: 'Generating dashboard', detail: '3 widgets', ms: 1020 },
      { tool: 'generateInsights', label: 'Generating insights', detail: '2 findings', ms: 660 },
      { tool: 'suggestFollowUps', label: 'Suggesting follow-ups', ms: 330 },
    ],
    answer:
      '26,480 hours booked over 23/05/2026 – 21/08/2026 across eight disciplines. PRO leads with 8,940. OPE returned 210 — low enough to be worth checking against the timesheet rota.',
    dashboardTitle: 'Hours by discipline, last 90 days',
    widgets: [
      {
        id: 'w-h-total',
        kind: 'kpi',
        w: 4,
        title: 'Hours booked',
        chip: '90 DAYS',
        value: '26,480',
        delta: { dir: 'up', text: '▲ 3.4%' },
        note: '719 projects touched',
        query: {
          metric: 'hours_booked',
          table: 'hours_worked',
          filters: [NOT_REMOVED],
          aggregate: { method: 'sum', valueColumn: 'value' },
          dateColumn: 'date',
        },
      },
      {
        id: 'w-h-users',
        kind: 'kpi',
        w: 4,
        title: 'Timesheet users',
        chip: 'DISTINCT',
        value: '62',
        note: '67 on file',
        query: {
          metric: 'active_timesheet_users',
          table: 'hours_worked',
          filters: [NOT_REMOVED],
          aggregate: { method: 'count_distinct', valueColumn: 'user_id' },
          dateColumn: 'date',
        },
      },
      {
        id: 'w-h-avg',
        kind: 'kpi',
        w: 4,
        title: 'Avg per week',
        chip: 'DERIVED',
        value: '2,037',
        note: '13 weeks',
        query: {
          metric: 'hours_booked',
          table: 'hours_worked',
          filters: [NOT_REMOVED],
          aggregate: { method: 'avg', valueColumn: 'value', groupBy: 'week' },
          dateColumn: 'date',
        },
      },
      {
        id: 'w-h-bars',
        kind: 'bar',
        w: 12,
        title: 'Hours by discipline',
        chip: 'SUM',
        format: 'hours',
        bars: [
          { label: 'PRO', value: 8940, colour: '#1D6FA5' },
          { label: 'MEC', value: 5120, colour: '#58A3CE' },
          { label: 'SAF', value: 4380, colour: '#9AC7E3' },
          { label: 'ELC', value: 3260, colour: '#1D6FA5' },
          { label: 'PRM', value: 2410, colour: '#58A3CE' },
          { label: 'CAD', value: 1580, colour: '#9AC7E3' },
          { label: 'INC', value: 580, colour: '#4B5F6E' },
          { label: 'OPE', value: 210, colour: '#E8940C' },
        ],
        query: {
          metric: 'hours_by_discipline',
          table: 'hours_worked',
          filters: [NOT_REMOVED],
          aggregate: { method: 'sum', valueColumn: 'value', groupBy: 'disciplines.name', topN: 10, sort: 'value_desc' },
          dateColumn: 'date',
          limit: 500,
        },
      },
    ],
    insights: [
      { text: 'PRO booked 8,940 hours — 33.8% of the 90-day total.', severity: 'info', widgetId: 'w-h-bars' },
      { text: 'OPE returned 210 hours; verify against the timesheet rota.', severity: 'warning', widgetId: 'w-h-bars' },
    ],
    followUps: ['Hours by grade within PRO', 'Which projects consumed most hours?', 'Compare to the prior 90 days'],
  },
]

export const THREADS = [
  { id: 't1', title: 'Backlog by discipline', when: 'Today 14:02' },
  { id: 't2', title: 'Pending PO review', when: 'Today 09:41' },
  { id: 't3', title: 'Monthly performance', when: 'Yesterday' },
  { id: 't4', title: 'Hours vs budget, Q2', when: '19/08/2026' },
]

export const MODELS = [
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5', tier: 'BALANCED' },
  { id: 'claude-opus-5', label: 'Claude Opus 5', tier: 'POWERFUL' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', tier: 'FAST' },
]

/** Loose match so a typed question still finds its scripted answer. */
export function matchScenario(input: string): Scenario {
  const q = input.trim().toLowerCase()
  const exact = SCENARIOS.find((s) => s.question.toLowerCase() === q)
  if (exact) return exact

  const scored = SCENARIOS.map((s) => {
    const words = s.question.toLowerCase().split(/\s+/)
    const hits = words.filter((w) => w.length > 3 && q.includes(w)).length
    return { s, hits }
  }).sort((a, b) => b.hits - a.hits)

  return scored[0].hits > 0 ? scored[0].s : SCENARIOS[0]
}
