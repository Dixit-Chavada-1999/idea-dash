import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MARGIN = 12
const WIDTH = 340

// splits "SO Actual = ... -- (SP only) note" into a code part and a trailing
// "-- comment", then highlights "S+P"/"(SP only)" within the code part —
// same shading the reference doc uses for a basis-conditional term
const HIGHLIGHT = /(\(SP only\)|S\+P)/g

function formatLine(line: string, key: number) {
  if (line === '') return <br key={key} />
  const [code, ...rest] = line.split(/(\s+--\s*)/)
  const comment = rest.join('')
  // split() with a capturing group alternates [text, match, text, match, …] —
  // odd indices are always the captured "S+P"/"(SP only)" highlight, so no
  // need to re-test each part against the (stateful, global) regex
  const parts = (code ?? '').split(HIGHLIGHT)
  return (
    <div key={key}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span className="calctip-hl" key={i}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
      {comment && <span className="calctip-comment">{comment}</span>}
    </div>
  )
}

/**
 * "How this is calculated" affordance for a KPI card header — an eye icon
 * that opens its formula in a small tooltip on click.
 *
 * Positioned in JS from the icon's own `getBoundingClientRect()`, then
 * rendered into `document.body` via a portal — not CSS-anchored to the icon
 * (`position: absolute` inside the card). A card-anchored tooltip has to fit
 * inside that card's own width, and next to a neighbouring card, or near a
 * screen edge, it doesn't: it overlapped the card's own value and caveat
 * text instead of sitting cleanly beside them. Computing a `fixed` position
 * against the viewport, clamped to stay on-screen, keeps the same small
 * tooltip look with a pointer arrow, but guarantees it never overlaps card
 * content or runs off the edge of the screen.
 *
 * Shows the formula only (`kpi.calc`) — not the caveat, which already sits
 * permanently visible under the card.
 *
 * `tone` picks the icon's resting/hover colour: `'dark'` (default) for a
 * `.kpi-hd`/`.panel-hd` header, which sits on the dark shell colour; `'light'`
 * for a `.chk`/`.sec-hd`, which sits on the page's light canvas. The popover
 * itself is unaffected — always the dark tooltip, regardless of tone.
 */
export function CalcTip({ text, tone = 'dark' }: { text: string; tone?: 'dark' | 'light' }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; width: number; arrowLeft: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    // narrower than WIDTH on a phone-width viewport, so the box never runs off both edges at once
    const width = Math.min(WIDTH, window.innerWidth - MARGIN * 2)
    const idealLeft = r.right - width
    const left = Math.min(Math.max(idealLeft, MARGIN), window.innerWidth - width - MARGIN)
    const top = r.bottom + 8
    // the arrow points at the icon's centre regardless of how far the box shifted to stay on-screen
    const arrowLeft = r.left + r.width / 2 - left
    setPos({ top, left, width, arrowLeft })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (!btnRef.current?.contains(target) && !tipRef.current?.contains(target)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    // capture scroll/resize so a moved card doesn't leave the tooltip stranded
    const onReflow = () => setOpen(false)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onReflow, true)
    window.addEventListener('resize', onReflow)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onReflow, true)
      window.removeEventListener('resize', onReflow)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={tone === 'light' ? 'calctip-btn on-light' : 'calctip-btn'}
        aria-label="How this is calculated"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={tipRef}
            className="calctip-body"
            role="tooltip"
            style={{ top: pos.top, left: pos.left, width: pos.width, ['--arrow-left' as string]: `${pos.arrowLeft}px` }}
          >
            <span className="calctip-kicker">How this is calculated</span>
            <div className="calctip-formula">{text.split('\n').map((line, i) => formatLine(line, i))}</div>
          </div>,
          document.body,
        )}
    </>
  )
}
