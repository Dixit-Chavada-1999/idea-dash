/**
 * Money, to the penny.
 *
 * Whole pounds until 22 September 2026. Every figure on this console is
 * validated line by line against the client's own CRM export, and rounding put
 * the cards 40p out on Live proposals and 50p on Orders won — small enough to
 * read as a calculation error, and an unexplained difference costs more to
 * chase than the pence cost to show.
 *
 * One copy, imported wherever a £ is rendered. The backend formats card values
 * the same way (`dashboard/kpis.ts`); a second convention that drifts from it
 * is how a chart tooltip stops agreeing with the card above it.
 */
export const gbp = (v: number) =>
  `£${v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
