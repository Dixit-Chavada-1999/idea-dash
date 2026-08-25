import type {
  AuthResponse,
  ChangePasswordBody,
  LoginBody,
  PublicUser,
  RegisterBody,
} from '../contracts/auth'
import { api } from './client'

export const authApi = {
  login: (body: LoginBody) => api.post<AuthResponse>('/auth/login', body),
  register: (body: RegisterBody) => api.post<AuthResponse>('/auth/register', body),
  me: () => api.get<AuthResponse>('/auth/me'),
  logout: () => api.post<void>('/auth/logout'),
  changePassword: (body: ChangePasswordBody) => api.post<void>('/auth/change-password', body),
}

export type { PublicUser }

/* --------------------------------------------------------- password reset */

export const passwordResetApi = {
  /**
   * Resolves whatever the email. The API answers 204 either way — confirming an
   * address is registered would make this a user-enumeration oracle.
   */
  request: (email: string) => api.post<void>('/auth/forgot-password', { email }),

  /** Checked before the form renders, so a dead link fails before anything is typed. */
  verify: (token: string) =>
    api.get<{ valid: boolean; reason?: 'expired' | 'used' | 'missing' }>(
      `/auth/reset-password/${encodeURIComponent(token)}`,
    ),

  reset: (token: string, newPassword: string) =>
    api.post<void>('/auth/reset-password', { token, newPassword }),
}
