import { useEffect, useState } from 'react'

/**
 * Highlights the rail entry for whichever section is currently in view.
 * Mirrors the wireframe: a band near the top of the viewport decides the winner.
 */
export function useScrollSpy(ids: string[], initial = ids[0]) {
  const [active, setActive] = useState(initial)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return

    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id)
        }
      },
      { rootMargin: '-70px 0px -65% 0px', threshold: 0 },
    )

    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [ids])

  return active
}
