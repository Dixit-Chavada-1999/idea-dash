import { SectionHead } from '../components/Panel'
import { INTEGRITY } from '../data/console'

export function Integrity() {
  return (
    <section className="sec fade" id="integrity">
      <SectionHead
        title="Ingestion & integrity"
        clause="§2 · §3 · §7"
        right="Every check clears before a single number renders"
      />
      <div className="strip">
        {INTEGRITY.map((c) => (
          <div className="chk" key={c.key}>
            <span className="k">{c.key}</span>
            <span className="v">
              <span className={`dot ${c.status}`} />
              {c.value}
            </span>
            <span className="n">{c.note}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
