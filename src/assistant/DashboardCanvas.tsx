import { useState } from 'react'
import { assistantApi } from '../api/assistant'
import type { AssistantAnswer, Widget } from '../contracts/assistant'
import { QueryDrawer } from './QueryDrawer'
import { WidgetCard } from './WidgetCard'

export function DashboardCanvas({ answer }: { answer: AssistantAnswer | null }) {
  const [drawerFor, setDrawerFor] = useState<Widget | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  if (!answer || !answer.ok) {
    return (
      <section className="canvas">
        <div className="canvas-empty">
          <div>
            <div className="t">No dashboard yet</div>
            <p className="s">
              Ask a question in the chat. The result renders here — cards and charts built from the same queries
              the operations dashboard runs, with the trail behind every number one click away.
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

  async function save() {
    if (!answer?.ok) return
    try {
      await assistantApi.save({
        messageId: answer.messageId,
        title: answer.title,
        payload: { widgets: answer.widgets, insights: answer.insights, window: answer.window },
      })
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch {
      /* the dashboard is still on screen; failing to keep it is not fatal */
    }
  }

  return (
    <section className="canvas">
      <div className="canvas-hd">
        <h2>{answer.title}</h2>
        {answer.window && <span className="cl">{answer.window.label}</span>}
        <span className="r">
          {/* only actions that do something — the wireframe's share and export
              buttons did nothing and are gone rather than left as decoration */}
          <button className="mini" type="button" onClick={() => void save()}>
            {saved ? 'saved' : 'save'}
          </button>
        </span>
      </div>

      <div className="canvas-body">
        {answer.insights.length > 0 && (
          <div className="insights">
            <span className="lead">
              Findings — computed from the figures, not written by a model
            </span>
            {answer.insights.map((ins, i) => (
              <button className="insight" type="button" key={i} onClick={() => focusWidget(ins.widgetId)}>
                <span className={`sev sev-${ins.severity}`} />
                <span>{ins.text}</span>
              </button>
            ))}
          </div>
        )}

        <div className="grid12">
          {answer.widgets.map((w) => (
            <WidgetCard key={w.id} widget={w} flash={flashId === w.id} onShowQuery={setDrawerFor} />
          ))}
        </div>
      </div>

      {drawerFor && (
        <QueryDrawer widget={drawerFor} messageId={answer.messageId} onClose={() => setDrawerFor(null)} />
      )}
    </section>
  )
}
