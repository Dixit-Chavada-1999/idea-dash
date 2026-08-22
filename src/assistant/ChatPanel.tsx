import { useEffect, useRef, useState, type FormEvent } from 'react'
import { MODELS, SUGGESTIONS, THREADS } from './scenarios'
import type { Scenario } from './types'

export type BotTurn = {
  kind: 'bot'
  scenario: Scenario
  /** how many pipeline steps have completed */
  completedSteps: number
  /** wall-clock ms when the current step began, for the live elapsed counter */
  stepStartedAt: number
  finished: boolean
}
export type Turn = { kind: 'user'; text: string } | BotTurn

type Props = {
  turns: Turn[]
  running: boolean
  collapsed: boolean
  onSend: (text: string) => void
  onStop: () => void
  onToggleCollapse: () => void
  onLoadThread: (index: number) => void
}

function StepRow({
  label,
  detail,
  rows,
  state,
  elapsed,
}: {
  label: string
  detail?: string
  rows?: number
  state: 'done' | 'run' | 'wait'
  elapsed: string
}) {
  return (
    <div className={`step ${state}`}>
      <span className="ic">{state === 'done' ? '✓' : state === 'run' ? '◐' : '·'}</span>
      <span className="nm">{label}</span>
      {detail && <span className="dt">{detail}</span>}
      {rows !== undefined && state === 'done' && <span className="rowchip">{rows} rows</span>}
      <span className="el">{elapsed}</span>
    </div>
  )
}

function BotMessage({ turn, tick }: { turn: BotTurn; tick: number }) {
  const { scenario, completedSteps, finished, stepStartedAt } = turn

  return (
    <div className="msg msg-bot">
      <span className="msg-who">Assistant</span>
      <p style={{ margin: '0 0 2px' }}>{scenario.plan}</p>

      <div className="steps">
        {scenario.steps.map((s, i) => {
          const state = i < completedSteps ? 'done' : i === completedSteps && !finished ? 'run' : finished ? 'done' : 'wait'
          const elapsed =
            state === 'run'
              ? `${Math.max(0, (tick - stepStartedAt) / 1000).toFixed(1)}s`
              : state === 'done'
                ? `${(s.ms / 1000).toFixed(1)}s`
                : ''
          return (
            <StepRow key={s.tool + i} label={s.label} detail={s.detail} rows={s.rows} state={state} elapsed={elapsed} />
          )
        })}
      </div>

      {finished && (
        <>
          <p style={{ margin: 0 }}>{scenario.answer}</p>
          <div className="follow">
            {scenario.followUps.map((f) => (
              <button key={f} type="button" title="Static wireframe — chips are not wired">
                {f}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function ChatPanel({
  turns,
  running,
  collapsed,
  onSend,
  onStop,
  onToggleCollapse,
  onLoadThread,
}: Props) {
  const [text, setText] = useState('')
  const [tick, setTick] = useState(() => Date.now())
  const [showThreads, setShowThreads] = useState(false)
  const [model, setModel] = useState(MODELS[0].id)
  const scrollRef = useRef<HTMLDivElement>(null)

  // drives the elapsed-second counters while a pipeline is in flight
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTick(Date.now()), 100)
    return () => clearInterval(id)
  }, [running])

  // keep the newest message in view
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, tick])

  function submit(e: FormEvent) {
    e.preventDefault()
    const t = text.trim()
    if (!t || running) return
    onSend(t)
    setText('')
  }

  return (
    <section className="chat">
      <div className="chat-hd">
        <h2>Assistant</h2>
        <span className="spacer" />
        <select
          className="mini"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          aria-label="Model"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <button
          className={showThreads ? 'mini on' : 'mini'}
          type="button"
          onClick={() => setShowThreads((v) => !v)}
        >
          history
        </button>
        <button className="mini" type="button" onClick={onToggleCollapse} title="Shift+B">
          {collapsed ? 'show' : 'hide'}
        </button>
      </div>

      {showThreads && (
        <div style={{ borderBottom: '1px solid var(--color-rule)', background: '#f7f9fb', padding: '8px 12px' }}>
          <span className="sugg-lbl">Recent threads</span>
          <div className="chips">
            {THREADS.map((t, i) => (
              <button
                className="chip-btn"
                type="button"
                key={t.id}
                onClick={() => {
                  onLoadThread(i)
                  setShowThreads(false)
                }}
              >
                {t.title}
                <span style={{ display: 'block', fontSize: 11, color: 'var(--color-ink-3)', marginTop: 2 }}>
                  {t.when}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-scroll" ref={scrollRef}>
        {turns.length === 0 ? (
          <>
            <div className="empty-note">
              Ask about the portfolio in plain English. The assistant resolves a metric from the registry, runs the
              aggregation in the database, and builds the dashboard beside this chat.
            </div>
            <span className="sugg-lbl">Try one of these</span>
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <button className="chip-btn" type="button" key={s} onClick={() => onSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          </>
        ) : (
          turns.map((t, i) =>
            t.kind === 'user' ? (
              <div className="msg msg-user" key={i}>
                <span>{t.text}</span>
              </div>
            ) : (
              <BotMessage turn={t} tick={tick} key={i} />
            ),
          )
        )}
      </div>

      <div className="chat-foot">
        <form className="chat-form" onSubmit={submit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) submit(e)
            }}
            placeholder={running ? 'Working…' : 'Ask about backlog, POs, hours, margin…'}
            rows={1}
            aria-label="Ask a question"
          />
          {running ? (
            <button className="send stop" type="button" onClick={onStop}>
              Stop
            </button>
          ) : (
            <button className="send" type="submit" disabled={!text.trim()}>
              Send
            </button>
          )}
        </form>
      </div>
    </section>
  )
}
