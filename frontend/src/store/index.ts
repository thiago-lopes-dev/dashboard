import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { dashboardApi, DashboardSummary, SystemMetricResponse, AlertResponse } from '@/api/client'

// ─── Auth ─────────────────────────────────────────────────────────────────────
interface AuthState {
  token: string | null
  user:  { name: string; email: string; role: string } | null
  login:  (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user:  null,
      login: async (email, password) => {
        const { data } = await dashboardApi.login(email, password)
        localStorage.setItem('token', data.token)
        set({
          token: data.token,
          user:  { name: data.name, email: data.email, role: data.role }
        })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null })
      }
    }),
    {
      name: 'auth',
      partialize: (s) => ({ token: s.token, user: s.user })
    }
  )
)

// ─── Dashboard ────────────────────────────────────────────────────────────────
interface DashboardState {
  summary:        DashboardSummary | null
  metricsHistory: SystemMetricResponse[]
  alerts:         AlertResponse[]
  loading:        boolean
  error:          string | null
  lastUpdated:    Date | null
  fetchAll:       () => Promise<void>
  resolveAlert:   (id: string) => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary:        null,
  metricsHistory: [],
  alerts:         [],
  loading:        false,
  error:          null,
  lastUpdated:    null,

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const [summaryRes, metricsRes, alertsRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getMetrics(60),
        dashboardApi.getAlerts(),
      ])
      set({
        summary:        summaryRes.data,
        metricsHistory: metricsRes.data,
        alerts:         alertsRes.data,
        loading:        false,
        lastUpdated:    new Date(),
      })
    } catch (err: any) {
      set({ loading: false, error: err.message })
    }
  },

  resolveAlert: async (id) => {
    await dashboardApi.resolveAlert(id)
    set(s => ({
      alerts:  s.alerts.filter(a => a.id !== id),
      summary: s.summary ? {
        ...s.summary,
        activeAlerts: Math.max(0, s.summary.activeAlerts - 1)
      } : null
    }))
  },
}))
