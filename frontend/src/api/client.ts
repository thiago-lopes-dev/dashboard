import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const dashboardApi = {
  login:         (email: string, password: string) =>
                   api.post<LoginResponse>('/auth/login', { email, password }),
  getSummary:    () => api.get<DashboardSummary>('/dashboard'),
  getServices:   () => api.get<ServiceResponse[]>('/services'),
  createService: (data: ServiceRequest) => api.post<ServiceResponse>('/services', data),
  deleteService: (id: string) => api.delete(`/services/${id}`),
  getHistory:    (id: string, limit = 50) =>
                   api.get<HealthCheckResponse[]>(`/services/${id}/history?limit=${limit}`),
  getMetrics:    (limit = 60) => api.get<SystemMetricResponse[]>(`/metrics?limit=${limit}`),
  getAlerts:     () => api.get<AlertResponse[]>('/alerts'),
  resolveAlert:  (id: string) => api.patch(`/alerts/${id}/resolve`),
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type HealthStatus  = 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN'
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export interface LoginResponse {
  token: string; type: string; name: string; email: string; role: string
}
export interface ServiceRequest {
  name: string; url: string; description?: string; category: string
}
export interface ServiceResponse {
  id: string; name: string; url: string; description: string | null
  category: string; active: boolean; lastStatus: HealthStatus
  lastResponseTime: number | null; lastCheckedAt: string | null; createdAt: string
}
export interface HealthCheckResponse {
  id: string; serviceId: string; serviceName: string
  status: HealthStatus; responseTime: number | null
  statusCode: number | null; errorMessage: string | null; checkedAt: string
}
export interface SystemMetricResponse {
  id: string; cpuUsage: number; memoryUsage: number
  memoryTotalMb: number; memoryUsedMb: number
  diskUsage: number; diskTotalGb: number | null; diskUsedGb: number | null
  activeThreads: number; recordedAt: string
}
export interface AlertResponse {
  id: string; serviceId: string | null; serviceName: string | null
  severity: AlertSeverity; title: string; message: string
  resolved: boolean; resolvedAt: string | null; createdAt: string
}
export interface DashboardSummary {
  totalServices: number; servicesUp: number; servicesDown: number
  servicesDegraded: number; activeAlerts: number; criticalAlerts: number
  latestMetric: SystemMetricResponse | null; services: ServiceResponse[]
}
