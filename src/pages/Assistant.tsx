import { useCallback, useEffect, useState } from 'react'
import { ChatPanel, type BotTurn, type Turn } from '../assistant/ChatPanel'
import { DashboardCanvas } from '../assistant/DashboardCanvas'
import { SCENARIOS, matchScenario } from '../assistant/scenarios'
import { CommandBar } from '../components/CommandBar'
import { Rail } from '../components/Rail'

/** Replace the last turn, which is always the bot turn being played back. */
function patchLast(turns: Turn[], patch: (b: BotTurn) => BotTurn): Turn[] {
  const last = turns[turns.length - 1]
  if (!last || last.kind !== 'bot') return turns
  return [...turns.slice(0, -1), patch(last)]
}

export default function Assistant() {
  const [turns, setTurns] = useState<Turn[]>([])
  const [collapsed, setCollapsed] = useState(false)

  const last = turns[turns.length - 1]
  const running = last?.kind === 'bot' && !last.finished

  /**
   * Playback driver. Advances one pipeline step per timeout so the timeline
   * animates the way the real streaming agent does.
   */
  useEffect(() => {
    const cur = turns[turns.length - 1]
    if (!cur || cur.kind !== 'bot' || cur.finished) return

    const steps = cur.scenario.steps
    if (cur.completedSteps >= steps.length) {
      const t = setTimeout(() => setTurns((ts) => patchLast(ts, (b) => ({ ...b, finished: true }))), 240)
      return () => clearTimeout(t)
    }

    const t = setTimeout(
      () =>
        setTurns((ts) =>
          patchLast(ts, (b) => ({ ...b, completedSteps: b.completedSteps + 1, stepStartedAt: Date.now() })),
        ),
      steps[cur.completedSteps].ms,
    )
    return () => clearTimeout(t)
  }, [turns])

  const send = useCallback(
    (text: string) => {
      if (running) return
      const scenario = matchScenario(text)
      setTurns((ts) => [
        ...ts,
        { kind: 'user', text },
        { kind: 'bot', scenario, completedSteps: 0, stepStartedAt: Date.now(), finished: false },
      ])
    },
    [running],
  )

  const stop = useCallback(() => {
    setTurns((ts) => patchLast(ts, (b) => ({ ...b, finished: true })))
  }, [])

  const loadThread = useCallback((index: number) => {
    const scenario = SCENARIOS[index % SCENARIOS.length]
    setTurns([
      { kind: 'user', text: scenario.question },
      {
        kind: 'bot',
        scenario,
        completedSteps: scenario.steps.length,
        stepStartedAt: Date.now(),
        finished: true,
      },
    ])
  }, [])

  // Shift+B collapses the chat, as in the reference implementation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.shiftKey && (e.key === 'B' || e.key === 'b')) {
        const el = document.activeElement
        if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) return
        e.preventDefault()
        setCollapsed((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // the newest finished turn owns the canvas
  const shown = [...turns].reverse().find((t): t is BotTurn => t.kind === 'bot' && t.finished)

  return (
    <div className="app">
      <Rail active="assistant" showSections={false} />

      <div className="main">
        <CommandBar />
        <div className={collapsed ? 'asst collapsed' : 'asst'}>
          <ChatPanel
            turns={turns}
            running={running}
            collapsed={collapsed}
            onSend={send}
            onStop={stop}
            onToggleCollapse={() => setCollapsed((v) => !v)}
            onLoadThread={loadThread}
          />
          <DashboardCanvas scenario={shown?.scenario ?? null} />
        </div>
      </div>
    </div>
  )
}
