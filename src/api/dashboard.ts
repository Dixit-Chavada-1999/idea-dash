import type {
  ChecksResponse,
  DecisionsResponse,
  HeadlineResponse,
  IntegrityResponse,
  MovementsResponse,
  PortfolioResponse,
  RunResponse,
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
}
