import type { ReactNode } from 'react'
import { Illus } from '../components/Illus'

/* ---------------------------------------------------------------- rail nav */

export type NavGroup = { group: string; items: NavItem[] }
export type NavItem = { href: string; label: string; clause?: string }

/** Route-level navigation. Rendered as router links, always visible. */
export const PAGES: { to: string; label: string; clause?: string }[] = [
  { to: '/', label: 'Operations dashboard' },
  { to: '/assistant', label: 'AI assistant', clause: 'NEW' },
]

/** In-page section anchors. Only meaningful on the dashboard route. */
export const NAV: NavGroup[] = [
  {
    group: 'Run',
    items: [{ href: '#integrity', label: 'Ingestion & integrity', clause: '§2' }],
  },
  {
    group: 'Board view',
    items: [
      { href: '#headline', label: 'Headline', clause: '§5' },
      { href: '#shape', label: 'Portfolio shape', clause: '§5.2' },
    ],
  },
  {
    group: 'Exceptions',
    items: [
      { href: '#checks', label: 'Standing checks', clause: '§6' },
      { href: '#movements', label: 'Movements', clause: '§8' },
    ],
  },
  {
    group: 'Build',
    items: [{ href: '#open', label: 'Open decisions' }],
  },
]

/* ------------------------------------------------------ ingestion strip */

export type IntegrityCheck = {
  key: string
  status: 'ok' | 'watch'
  value: string
  note: string
}

export const INTEGRITY: IntegrityCheck[] = [
  {
    key: 'Rows in → clean',
    status: 'ok',
    value: '1,264 → 1,097',
    note: '167 removed: blank duplicates, overhead and leave codes, test rows. Prior run 1,089.',
  },
  {
    key: 'Forecast cols CM:CY',
    status: 'ok',
    value: 'Located by index',
    note: 'Header now reads Mar 2026 → Mar 2027. Rolled forward as expected. No month-name matching used.',
  },
  {
    key: 'Discipline blocks',
    status: 'ok',
    value: '8 / 8 verified',
    note: 'CAD, ELC, INC, MEC, OPE, PRM, PRO, SAF in expected order against the live header row.',
  },
  {
    key: 'Vintage cascade',
    status: 'ok',
    value: '0 unresolved',
    note: '59% enquiry date · 23% tracker start · 18% code prefix · remainder name-year.',
  },
  {
    key: 'Awarded floored at £0',
    status: 'watch',
    value: '11 · −£157,665',
    note: 'Delayed Awarded-logging. Surfaced every run, never applied silently — real projects, real costs booked.',
  },
]

/* ------------------------------------------------------------- sectors */

export type Sector = { name: string; colour: string; cytd: number; prior: number }

export const SECTORS: Sector[] = [
  { name: 'Chemicals', colour: '#1D6FA5', cytd: 431200, prior: 505100 },
  { name: 'Water', colour: '#58A3CE', cytd: 296300, prior: 372800 },
  { name: 'Energy & Power', colour: '#9AC7E3', cytd: 243600, prior: 288600 },
  { name: 'Food & Drink', colour: '#E8940C', cytd: 168900, prior: 226500 },
  { name: 'Pharmaceutical', colour: '#17795A', cytd: 121400, prior: 141200 },
  { name: 'Waste', colour: '#4B5F6E', cytd: 89700, prior: 132700 },
  { name: '(blank)', colour: '#C6D2DA', cytd: 47908, prior: 45500 },
]

/* --------------------------------------------------- standing checks */

export type Ribbon = 'red' | 'amber' | 'grey'
export type Cell = { v: string; illus?: boolean }

export const cell = (v: string, illus = false): Cell => ({ v, illus })

export type CheckRow = {
  ribbon: Ribbon
  code: Cell
  project: Cell
  note?: string
  figures: Cell[]
  pill: { label: string; tone: Ribbon }
}

export const PENDING_PO: CheckRow[] = [
  {
    ribbon: 'red',
    code: cell('25153'),
    project: cell('Spend already exceeds budget, no PO on file'),
    note: 'A distinct, higher-severity flavour of this flag: 2× budget spent with no commercial cover in place.',
    figures: [cell('28,400', true), cell('56,900', true), cell('0'), cell('14/03/2026', true)],
    pill: { label: 'Escalate', tone: 'red' },
  },
  {
    ribbon: 'amber',
    code: cell('24188B'),
    project: cell('Scope change riding on master project 24188'),
    note: 'Parent already holds a PO — confirm whether this needs its own. Not suppressed: the name says scope change, not admin.',
    figures: [cell('41,750', true), cell('33,120', true), cell('0', true), cell('08/01/2026', true)],
    pill: { label: 'Confirm', tone: 'amber' },
  },
  {
    ribbon: 'amber',
    code: cell('OTECSA-25'),
    project: cell('Retainer / ad-hoc technical support'),
    note: 'Zero budget, small actual. May legitimately not need an individual PO — rule pending your ruling.',
    figures: [cell('0'), cell('4,180', true), cell('0'), cell('22/02/2026', true)],
    pill: { label: 'Rule needed', tone: 'amber' },
  },
  {
    ribbon: 'grey',
    code: cell('2512x', true),
    project: cell('Remaining 20 rows render identically', true),
    note: 'Every row the rule returns appears in this table. Nothing is filtered between the rule and the screen.',
    figures: [cell('416,150', true), cell('118,550', true), cell('—'), cell('—')],
    pill: { label: 'Review', tone: 'grey' },
  },
]

export const PENDING_PO_TOTAL = {
  label: 'Total exposure — 23 projects',
  figures: [cell('486,300', true), cell('212,750', true), cell('—')],
}

export const UNPLANNED_INVOICING: CheckRow[] = [
  {
    ribbon: 'amber',
    code: cell('25041', true),
    project: cell('Substantially delivered, small tail balance', true),
    note: 'The most valuable shape this check finds: real money outstanding, and nothing scheduled anywhere in the next 13 months to collect it.',
    figures: [cell('90%'), cell('184,300', true), cell('171,900', true), cell('158,400', true)],
    pill: { label: 'No', tone: 'grey' },
  },
  {
    ribbon: 'amber',
    code: cell('25098', true),
    project: cell('Half invoiced, all 13 forecast columns blank', true),
    figures: [cell('50%'), cell('96,500', true), cell('89,200', true), cell('61,700', true)],
    pill: { label: 'No', tone: 'grey' },
  },
]

/* -------------------------------------------------------- movements */

export type MovementRow = {
  ribbon: Ribbon
  metric: string
  last: Cell
  now: Cell
  delta: Cell
  deltaAlarm?: boolean
  classification: { label: string; tone: Ribbon }
  explanation: ReactNode
}

export const MOVEMENTS: MovementRow[] = [
  {
    ribbon: 'grey',
    metric: 'Clean row count',
    last: cell('1,089'),
    now: cell('1,097'),
    delta: cell('+8'),
    classification: { label: 'Expected', tone: 'grey' },
    explanation: 'New projects in the fresh export. Inside the normal weekly range.',
  },
  {
    ribbon: 'red',
    metric: 'Pending-PO flags',
    last: cell('6'),
    now: cell('23'),
    delta: cell('+17'),
    deltaAlarm: true,
    classification: { label: 'Not a real move', tone: 'red' },
    explanation: (
      <>
        <strong>Reporting completeness, not a business change.</strong> The published 6 was a hand-picked list; the
        documented rule returns 23 on identical data. Caught only by re-running the rule against the prior week.
      </>
    ),
  },
  {
    ribbon: 'grey',
    metric: 'Backlog, SO',
    last: cell('£1,071,900', true),
    now: cell('£1,096,400', true),
    delta: cell('+2.3%', true),
    classification: { label: 'Within noise', tone: 'grey' },
    explanation: 'Inside the normal ±2–3% run-to-run drift. Mechanical is the least stable bucket. Not chased.',
  },
  {
    ribbon: 'amber',
    metric: 'Live proposals',
    last: cell('£2,486,000', true),
    now: cell('£2,341,600', true),
    delta: cell('−5.8%', true),
    classification: { label: 'Pipeline', tone: 'amber' },
    explanation: 'Two proposals converted, one lapsed. A real movement — explained before it was displayed.',
  },
  {
    ribbon: 'amber',
    metric: 'Unplanned invoicing',
    last: cell('—'),
    now: cell('2'),
    delta: cell('new'),
    classification: { label: 'New check', tone: 'amber' },
    explanation: 'Check introduced this run. No prior baseline exists to compare against.',
  },
]

/* --------------------------------------------------- open decisions */

export type Decision = { n: string; title: string; body: string }

export const DECISIONS: Decision[] = [
  {
    n: '01',
    title: 'Status "Lost"',
    body: "Currently mapped to Didn't Go Ahead. It isn't in your own status table — confirm, or redirect it.",
  },
  {
    n: '02',
    title: 'Zero-value gate',
    body: 'On unplanned invoicing: add the gate, or keep the technicality trips visible for review?',
  },
  {
    n: '03',
    title: 'Retainer codes',
    body: "Do OTECSA-NN codes legitimately run without individual POs? If so that's a suppression rule, not a flag.",
  },
  {
    n: '04',
    title: 'CRM access',
    body: 'Weekly CSV export forever, or is there an API? Decides whether a run is a button or a file upload.',
  },
  {
    n: '05',
    title: 'Audience',
    body: 'Board monthly or ops weekly? Sets refresh cadence, permissions, and whether run history is stored.',
  },
]

/* ------------------------------------------------------- run header */

export const RUN = {
  current: '2026-08-11',
  previous: '2026-08-05',
  cleanRows: '1,097',
  source: 'CRM export · 2026-08-11 · Tracker baseline fixed',
}

export const KEYLINE = [
  { k: 'Client', v: 'IDEA Ltd' },
  { k: 'Document', v: 'Dashboard wireframe' },
  { k: 'Data run', v: '2026-08-11' },
  { k: 'Sources', v: 'CRM export + Project Master Tracker' },
  { k: 'Revision', v: 'B — for discussion' },
]

/** Renders a data cell, adding the dotted illustrative underline when flagged. */
export function renderCell(c: Cell) {
  return c.illus ? <Illus>{c.v}</Illus> : c.v
}
