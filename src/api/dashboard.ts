import type {
  ChecksResponse,
  DecisionsResponse,
  HeadlineResponse,
  IntegrityResponse,
  MovementsResponse,
  PortfolioResponse,
  RunResponse,
  SyncResponse,
} from '../contracts/dashboard'
import { api } from './client'

export const dashboardApi = {
  headline: () => api.get<HeadlineResponse>('/dashboard/headline'),
  integrity: () => api.get<IntegrityResponse>('/dashboard/integrity'),
  portfolio: () => api.get<PortfolioResponse>('/dashboard/portfolio'),
  checks: () => api.get<ChecksResponse>('/dashboard/checks'),
  movements: (days = 7) => api.get<MovementsResponse>(`/dashboard/movements?days=${days}`),
  run: () => api.get<RunResponse>('/dashboard/run'),
  decisions: () => api.get<DecisionsResponse>('/dashboard/decisions'),
  /**
   * Replace the reporting database from the CRM's export.
   *
   * POST because it writes. Slow by nature — it downloads ~10 MB and rewrites
   * every table — so the caller must keep the button disabled until it
   * settles rather than letting a second run start on top of the first.
   */
  sync: () => api.post<SyncResponse>('/dashboard/sync'),
}
