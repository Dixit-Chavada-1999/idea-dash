import { useCallback, useEffect, useState } from 'react'
import { assistantApi, type MetricsResponse } from '../api/assistant'
import { ApiError } from '../api/client'
import { ChatPanel, type Turn } from '../assistant/ChatPanel'
import { DashboardCanvas } from '../assistant/DashboardCanvas'
import { CommandBar } from '../components/CommandBar'
import { Rail } from '../components/Rail'
import type { AssistantAnswer } from '../contracts/assistant'

/**
 * The assistant, answering from the reporting database.
 *
 * This page used to play back four scripted answers on a timer. Everything on
 * it now comes from `POST /api/assistant/ask`: the figures, the step timings,
 * the findings and the wording. Where the wireframe faked something it either
 * became real or was removed — there is nothing left on this screen that claims
 * more than the pipeline actually did.
 */
export default function Assistant() {
  const [turns, setTurns] = useState<Turn[]>([])
  const [pending, setPending] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [meta, setMeta] = useState<MetricsResponse | null>(null)
  const [model, setModel] = useState<string>('')
  const [threadId, setThreadId] = useState<number | undefined>()

  // the registry, so the suggestion chips can only offer answerable questions
  useEffect(() => {
    let cancelled = false
    assistantApi
      .metrics()
      .then((m) => {
        if (cancelled) return
        setMeta(m)
        setModel(m.defaultModel)
      })
      .catch(() => {
        /* the chips are a convenience; the input works regardless */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const send = useCallback(
    async (text: string) => {
      const question = text.trim()
      if (!question || pending) return

      setTurns((t) => [...t, { kind: 'user', text: question }])
      setPending(true)

      try {
        const answer = await assistantApi.ask({
          question,
          ...(threadId && { threadId }),
          ...(model && { model }),
        })
        // one thread per conversation: the first answer names it, the rest join it
        if (answer.threadId) setThreadId(answer.threadId)
        setTurns((t) => [...t, { kind: 'bot', answer }])
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.code === 'LEGACY_UNAVAILABLE'
              ? 'The reporting database is not reachable, so there is nothing to read.'
              : err.code === 'TOO_MANY_REQUESTS'
                ? 'Too many questions in a short time. Wait a moment and ask again.'
                : (err.detail ?? err.code)
            : 'Something went wrong.'
        setTurns((t) => [...t, { kind: 'error', text: message }])
      } finally {
        setPending(false)
      }
    },
    [model, pending, threadId],
  )

  /** Reopen a stored thread. The answers are replayed as they were, not re-run. */
  const loadThread = useCallback(async (id: number) => {
    try {
      const { messages } = await assistantApi.thread(id)
      const replayed: Turn[] = []
      for (const m of messages) {
        replayed.push({ kind: 'user', text: m.question })
        if (m.answer) replayed.push({ kind: 'bot', answer: m.answer })
      }
      setTurns(replayed)
      setThreadId(id)
    } catch {
      setTurns([{ kind: 'error', text: 'That conversation could not be loaded.' }])
    }
  }, [])

  const newThread = useCallback(() => {
    setTurns([])
    setThreadId(undefined)
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

  // the newest answered turn owns the canvas
  const shown = [...turns]
    .reverse()
    .find((t): t is { kind: 'bot'; answer: AssistantAnswer } => t.kind === 'bot' && t.answer.ok)

  return (
    <div className="app">
      <Rail active="assistant" showSections={false} />

      <div className="main">
        <CommandBar />
        <div className={collapsed ? 'asst collapsed' : 'asst'}>
          <ChatPanel
            turns={turns}
            pending={pending}
            meta={meta}
            model={model}
            onModel={setModel}
            onSend={(t) => void send(t)}
            onLoadThread={(id) => void loadThread(id)}
            onNewThread={newThread}
          />
          <DashboardCanvas answer={shown?.answer ?? null} />
        </div>
      </div>
    </div>
  )
}
