/**
 * CSV export, built in the browser from what the panel already holds.
 *
 * No round trip: every panel is rendered from a response it has in hand, so
 * asking the server to recompute the same figures for a download would open a
 * second path to the same numbers — and a second path is how an export starts
 * disagreeing with the screen it was taken from. What you see is what is
 * written.
 */

/**
 * One CSV field.
 *
 * Quotes anything carrying a comma, a quote or a newline, per RFC 4180, and
 * doubles quotes inside. Numbers are written bare — no currency symbol and no
 * thousands separators, so a spreadsheet reads them as numbers rather than as
 * text that has to be cleaned first.
 */
function field(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : ''
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

/** Rows to CSV text. The first row is treated as the header by every reader. */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((r) => r.map(field).join(',')).join('\r\n')
}

/**
 * Offer the text as a file download.
 *
 * The BOM is deliberate. Excel on Windows reads a UTF-8 CSV as the system
 * codepage unless one is present, which turns £ into Â£ in every money column
 * on the first open — the single most likely thing to make an export look
 * broken to whoever receives it.
 */
export function download(filename: string, csv: string): void {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // the object URL holds the blob in memory until it is released
  URL.revokeObjectURL(url)
}

/** `orders-by-discipline-2026-09-22.csv` — dated, so successive exports do not overwrite. */
export const stamped = (name: string): string =>
  `${name}-${new Date().toISOString().slice(0, 10)}.csv`
