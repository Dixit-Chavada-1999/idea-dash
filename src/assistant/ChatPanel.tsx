import { useEffect, useRef, useState, type FormEvent } from 'react'
import { assistantApi, type MetricsResponse, type ThreadSummary } from '../api/assistant'
import type { AssistantAnswer, ToolStep } from '../contracts/assistant'

export type Turn =
  | { kind: 'user'; text: string }
  | { kind: 'bot'; answer: AssistantAnswer }
  | { kind: 'error'; text: string }

type Props = {
  turns: Turn[]
  pending: boolean
  meta: MetricsResponse | null
  model: string
  onModel: (id: string) => void
  onSend: (text: string) => void
  onLoadThread: (id: number) => void
  onNewThread: () => void
}

/**
 * A step that actually ran.
 *
 * The wireframe animated these on a timer with durations written into a file.
 * `ms` here is wall clock from the server, and the same numbers are in
 * `assistant_audit` — so the timeline is a record rather than a dramatisation.
 * That is why they appear all at once when the answer lands: they are being
 * reported, not performed.
 */
function StepRow({ step }: { step: ToolStep }) {
  return (
    <div className={step.error ? 'step wait' : 'step done'}>
      <span className="ic">{step.error ? '×' : '✓'}</span>
      <span className="nm">{step.label}</span>
      {(step.detail ?? step.error) && <span className="dt">{step.error ?? step.detail}</span>}
      {step.rows !== undefined && <span className="rowchip">{step.rows} rows</span>}
      <span className="el">{(step.ms / 1000).toFixed(1)}s</span>
    </div>
  )
}

function BotMessage({ answer, onFollowUp }: { answer: AssistantAnswer; onFollowUp: (t: string) => void }) {
  const [voted, setVoted] = useState<1 | -1 | null>(null)

  async function vote(v: 1 | -1) {
    if (!answer.messageId) return
    setVoted(v)
    try {
      await assistantApi.feedback(answer.messageId, v)
    } catch {
      setVoted(null)
    }
  }

  return (
    <div className="msg msg-bot">
      <span className="msg-who">
        Assistant
        {/* who wrote the words, never who produced the figures */}
        {answer.phrasing === 'template' && <span className="chip plain"> WRITTEN WITHOUT A MODEL</span>}
      </span>

      {answer.ok && <p style={{ margin: '0 0 2px' }}>{answer.plan}</p>}

      {answer.steps.length > 0 && (
        <div className="steps">
          {answer.steps.map((s, i) => (
            <StepRow key={`${s.tool}-${i}`} step={s} />
          ))}
        </div>
      )}

      <p style={{ margin: 0 }}>{answer.answer}</p>

      {/* the candidates are the useful part of an ambiguous answer — offer them */}
      {!answer.ok && answer.problem.reason === 'ambiguous' && (
        <div className="follow">
          {answer.problem.candidates.map((c) => (
            <button key={c.id} type="button" onClick={() => onFollowUp(c.name)}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {answer.followUps.length > 0 && (
        <div className="follow">
          {answer.followUps.map((f) => (
            <button key={f} type="button" onClick={() => onFollowUp(f)}>
              {f}
            </button>
          ))}
        </div>
      )}

      {answer.messageId && (
        <div className="follow" style={{ marginTop: 6 }}>
          <button type="button" onClick={() => void vote(1)} aria-pressed={voted === 1} data-tip="This answer was right" aria-label="Mark this answer right">
            {voted === 1 ? '👍 recorded' : '👍'}
          </button>
          <button type="button" onClick={() => void vote(-1)} aria-pressed={voted === -1} className="tip-left" data-tip="Something is wrong with this" aria-label="Mark this answer wrong">
            {voted === -1 ? '👎 recorded' : '👎'}
          </button>
        </div>
      )}
    </div>
  )
}

export function ChatPanel({
  turns,
  pending,
  meta,
  model,
  onModel,
  onSend,
  onLoadThread,
  onNewThread,
}: Props) {
  const [text, setText] = useState('')
  const [showThreads, setShowThreads] = useState(false)
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // keep the newest message in view
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, pending])

  // real conversations, loaded when the panel is opened rather than hardcoded
  useEffect(() => {
    if (!showThreads) return
    assistantApi
      .threads()
      .then((r) => setThreads(r.threads))
      .catch(() => setThreads([]))
  }, [showThreads])

  function submit(e: FormEvent) {
    e.preventDefault()
    const t = text.trim()
    if (!t || pending) return
    onSend(t)
    setText('')
  }

  return (
    <section className="chat">
      <div className="chat-hd">
        <h2>Assistant</h2>
        <span className="spacer" />

        {/* Disabled where no key is configured, and labelled — a live-looking
            model picker over a pipeline that never calls one is a lie. */}
        <select
          className="mini"
          value={model}
          onChange={(e) => onModel(e.target.value)}
          aria-label="Model"
          disabled={!meta?.modelConfigured}
          title={meta?.modelConfigured ? 'Model used to word the answer' : 'No API key configured — answers are worded from templates'}
        >
          {meta?.modelConfigured ? (
            meta.models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))
          ) : (
            <option>no model configured</option>
          )}
        </select>

        {/* Every tip says what the control does. "Shift+B" was the whole of the
            collapse button's tooltip, which names the shortcut for a thing the
            reader has not been told the meaning of. */}
        {/*
          * Lit while the chat actually is a new conversation — history closed
          * and nothing asked yet. `new` is an action rather than a view, so
          * this reports the state it puts you in rather than pretending to be
          * the other half of a tab pair: press it and it lights, ask something
          * and it dims, open a stored thread and it dims.
          */}
        <button
          className={!showThreads && turns.length === 0 ? 'mini on' : 'mini'}
          type="button"
          aria-pressed={!showThreads && turns.length === 0}
          onClick={() => {
            /*
             * Closing the history panel is part of starting a conversation.
             *
             * `onNewThread` only clears the turns, and with the panel left open
             * over an already-empty chat nothing on screen changed — the button
             * read as broken while doing exactly what it was asked. "New" means
             * an empty chat ready for a question, so it has to land there.
             */
            setShowThreads(false)
            onNewThread()
            setText('')
            // the cursor lands where the next question goes, so the button has
            // a visible effect even when the chat was already empty
            inputRef.current?.focus()
          }}
          data-tip="Start a new conversation — clears the chat and forgets the earlier questions"
          aria-label="Start a new conversation"
        >
          new
        </button>
        {/*
          * A view, not a toggle.
          *
          * It used to close on a second press, which with `new` lit for an empty
          * chat meant pressing the tab you were already on moved you to the
          * other one. Tabs do not do that. Leaving history is what `new` and
          * picking a conversation are for; pressing `history` while on history
          * does nothing, which is the whole point of a tab.
          */}
        <button
          className={showThreads ? 'mini on tip-left' : 'mini tip-left'}
          type="button"
          onClick={() => setShowThreads(true)}
          aria-pressed={showThreads}
          data-tip="Reopen a past conversation, exactly as it was answered"
          aria-label="Conversation history"
        >
          history
        </button>
      </div>

      {showThreads && (
        <div className={turns.length === 0 ? 'thread-list full' : 'thread-list'}>
          <span className="sugg-lbl">Your conversations</span>
          {threads.length === 0 ? (
            <div className="empty-note" style={{ margin: '6px 0 0' }}>
              Nothing stored yet. Every question you ask is kept, with the steps that answered it.
            </div>
          ) : (
            <div className="chips">
              {threads.map((t) => (
                <button
                  className="chip-btn"
                  type="button"
                  key={t.id}
                  onClick={() => {
                    onLoadThread(t.id)
                    setShowThreads(false)
                  }}
                >
                  {t.title}
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--color-ink-3)', marginTop: 2 }}>
                    {new Date(t.updated_at).toLocaleString('en-GB')} · {t.messages}{' '}
                    {t.messages === 1 ? 'question' : 'questions'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="chat-scroll" ref={scrollRef}>
        {turns.length === 0 ? (
          /*
           * Nothing below the history panel while it is open.
           *
           * The stored conversations and the starter suggestions are both lists
           * of `chip-btn`s, so on an empty chat they stacked into what looked
           * like one list where the second half did something entirely
           * different — clicking a conversation reopens it, clicking a
           * suggestion asks a new question. Browsing history is a mode, and it
           * shows one list.
           */
          showThreads ? null : (
            <>
              <div className="empty-note">
                Ask about the portfolio in plain English. The assistant matches your question to one of{' '}
                {meta?.metrics.length ?? 12} measured figures, runs the query the dashboard already uses, and builds
                the result beside this chat. It does not calculate anything itself.
              </div>
              <span className="sugg-lbl">Try one of these</span>
              <div className="chips">
                {(meta?.examples ?? []).map((s) => (
                  <button className="chip-btn" type="button" key={s} onClick={() => onSend(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          )
        ) : (
          turns.map((t, i) =>
            t.kind === 'user' ? (
              <div className="msg msg-user" key={i}>
                <span>{t.text}</span>
              </div>
            ) : t.kind === 'error' ? (
              <div className="msg msg-bot" key={i}>
                <span className="msg-who">Assistant</span>
                <div className="gate-err">{t.text}</div>
              </div>
            ) : (
              <BotMessage key={i} answer={t.answer} onFollowUp={onSend} />
            ),
          )
        )}

        {pending && (
          <div className="msg msg-bot">
            <span className="msg-who">Assistant</span>
            <div className="steps">
              <div className="step run">
                <span className="ic">◐</span>
                <span className="nm">Reading the reporting database</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-foot">
        <form className="chat-form" onSubmit={submit}>
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) submit(e)
            }}
            placeholder={pending ? 'Working…' : 'Ask about backlog, orders, margin, conversion…'}
            rows={1}
            aria-label="Ask a question"
          />
          <button className="send" type="submit" disabled={!text.trim() || pending}>
            {pending ? '…' : 'Send'}
          </button>
        </form>
      </div>
    </section>
  )
}
