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
  // The Run group held a single link to #integrity. That section is hidden
  // (see pages/Dashboard.tsx), and a rail link to an anchor that no longer
  // renders scrolls nowhere, so the group comes out with it.
  // {
  //   group: 'Run',
  //   items: [{ href: '#integrity', label: 'Ingestion & integrity', clause: '§2' }],
  // },
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
  // The Build group held a single link to #open. That section is hidden
  // (see pages/Dashboard.tsx), and a rail link to an anchor that no longer
  // renders scrolls nowhere, so the group comes out with it.
  // {
  //   group: 'Build',
  //   items: [{ href: '#open', label: 'Open decisions' }],
  // },
]

/* --------------------------------------------------- standing checks */

/** Row emphasis in the standing-checks tables. */
export type Ribbon = 'red' | 'amber' | 'grey'

/* --------------------------------------------------- open decisions */

export type Decision = {
  n: string
  title: string
  body: string
  /**
   * Ties the card to a live figure from `/api/dashboard/decisions`.
   *
   * Only where the database can actually answer part of the question. CRM
   * access and reporting cadence carry none, because neither is a fact this
   * database holds — a padded line there would be worse than a blank one.
   */
  evidenceKey?: string
}

export const DECISIONS: Decision[] = [
  {
    evidenceKey: 'status_mapping',
    n: '01',
    title: 'Status "Lost"',
    body: "Currently mapped to Didn't Go Ahead. It isn't in your own status table — confirm, or redirect it.",
  },
  {
    evidenceKey: 'zero_value_gate',
    n: '02',
    title: 'Zero-value gate',
    body: 'On unplanned invoicing: add the gate, or keep the technicality trips visible for review?',
  },
  {
    evidenceKey: 'retainer_codes',
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
  {
    evidenceKey: 'forecast_column',
    n: '06',
    title: 'Which month is the forecast',
    body: 'Invoice milestones carry both a planned and a forecast month. The unplanned rule now reads the later of the two — confirm that, or name the one it should trust.',
  },
]

/**
 * Document metadata, not data. `Data run` and `Sources` used to sit here too —
 * both are measurable, so they are read from the reporting database instead.
 */
export const KEYLINE = [
  { k: 'Client', v: 'IDEA Ltd' },
  { k: 'Document', v: 'Dashboard wireframe' },
  { k: 'Revision', v: 'B — for discussion' },
]
