import { Panel, Pill, SectionHead } from '../components/Panel'
import { MOVEMENTS, RUN, renderCell } from '../data/console'

export function Movements() {
  return (
    <section className="sec fade" id="movements" style={{ animationDelay: '.2s' }}>
      <SectionHead title="Movements" clause="§8" right="Nothing ships until every material delta is classified" />

      <Panel
        title={`${RUN.previous} → ${RUN.current}`}
        right={
          <>
            Threshold <b>&gt;10%</b> or <b>&gt;2pp</b>
          </>
        }
        padded={false}
        foot="A delta is either a real business movement or a defect in the reporting. This table forces that call to be made, and recorded, before anyone sees the number."
      >
        <div className="scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Metric</th>
                <th className="n">Last run</th>
                <th className="n">This run</th>
                <th className="n">Δ</th>
                <th style={{ width: 130 }}>Classification</th>
                <th>Explanation</th>
              </tr>
            </thead>
            <tbody>
              {MOVEMENTS.map((m) => (
                <tr className={`rib rib-${m.ribbon}`} key={m.metric}>
                  <td>{m.metric}</td>
                  <td className="n">{renderCell(m.last)}</td>
                  <td className="n">{renderCell(m.now)}</td>
                  <td className="n" style={m.deltaAlarm ? { color: '#BF3A2B', fontWeight: 700 } : undefined}>
                    {renderCell(m.delta)}
                  </td>
                  <td>
                    <Pill label={m.classification.label} tone={m.classification.tone} />
                  </td>
                  <td>{m.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}
