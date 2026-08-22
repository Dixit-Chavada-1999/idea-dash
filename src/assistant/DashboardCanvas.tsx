import { useState } from 'react'
import { QueryDrawer } from './QueryDrawer'
import { WidgetCard } from './WidgetCard'
import type { Scenario, Widget } from './types'

export function DashboardCanvas({ scenario }: { scenario: Scenario | null }) {
  const [drawerFor, setDrawerFor] = useState<Widget | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)

  if (!scenario) {
    return (
      <section className="canvas">
        <div className="canvas-empty">
          <div>
            <div className="t">No dashboard yet</div>
            <p className="s">
              Ask a question in the chat. The dashboard renders here — KPI cards, charts and tables, with the query
              behind every number one click away.
            </p>
          </div>
        </div>
      </section>
    )
  }

  function focusWidget(id: string) {
    document.getElementById(`wg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFlashId(id)
    window.setTimeout(() => setFlashId(null), 1500)
  }

  return (
    <section className="canvas">
      <div className="canvas-hd">
        <h2>{scenario.dashboardTitle}</h2>
        {scenario.dateLabel && <span className="cl">{scenario.dateLabel}</span>}
        <span className="r">
          <button className="mini" type="button">
            save
          </button>
          <button className="mini" type="button">
            share
          </button>
          <button className="mini" type="button">
            export
          </button>
        </span>
      </div>

      <div className="canvas-body">
        {scenario.insights.length > 0 && (
          <div className="insights">
            <span className="lead">Insights — computed in code, phrased by the model</span>
            {scenario.insights.map((ins, i) => (
              <button className="insight" type="button" key={i} onClick={() => focusWidget(ins.widgetId)}>
                <span className={`sev sev-${ins.severity}`} />
                <span>{ins.text}</span>
              </button>
            ))}
          </div>
        )}

        <div className="grid12">
          {scenario.widgets.map((w) => (
            <WidgetCard key={w.id} widget={w} flash={flashId === w.id} onShowQuery={setDrawerFor} />
          ))}
        </div>
      </div>

      {drawerFor && <QueryDrawer widget={drawerFor} onClose={() => setDrawerFor(null)} />}
    </section>
  )
}
