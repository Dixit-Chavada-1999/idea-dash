import type { AssistantAnswer } from '../contracts/assistant'
import { api } from './client'

export type MetricSummary = {
  id: string
  name: string
  unit: string
  needsRange: boolean
  rated: boolean
  caveat?: string
}

export type MetricsResponse = {
  metrics: MetricSummary[]
  /** questions built from the registry, so every one of them resolves */
  examples: string[]
  models: { id: string; label: string; tier: string }[]
  /** false when no API key is set — the assistant still answers, from templates */
  modelConfigured: boolean
  defaultModel: string
}

export type ThreadSummary = {
  id: number
  title: string
  messages: number
  updated_at: string
}

/** The audit rows written when an answer was produced — not a claim about them. */
export type AuditResponse = {
  steps: { tool: string; detail: string | null; rows: number | null; ms: number; error: string | null }[]
  totalMs: number
}

export const assistantApi = {
  metrics: () => api.get<MetricsResponse>('/assistant/metrics'),

  ask: (input: { question: string; threadId?: number; model?: string; useModel?: boolean }) =>
    api.post<AssistantAnswer>('/assistant/ask', input),

  threads: () => api.get<{ threads: ThreadSummary[] }>('/assistant/threads'),

  thread: (id: number) =>
    api.get<{ messages: { id: number; question: string; answer: AssistantAnswer | null }[] }>(
      `/assistant/threads/${id}`,
    ),

  audit: (messageId: number) => api.get<AuditResponse>(`/assistant/audit/${messageId}`),

  feedback: (messageId: number, vote: 1 | -1, note?: string) =>
    api.post<void>('/assistant/feedback', { messageId, vote, note }),

  save: (input: { messageId: number | null; title: string; payload: unknown }) =>
    api.post<{ id: number }>('/assistant/dashboards', input),
}
