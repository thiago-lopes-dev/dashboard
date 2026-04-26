import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { LoginPage }     from '@/pages/LoginPage'
import { Layout }        from '@/components/layout/Layout'
import { OverviewPage }  from '@/pages/OverviewPage'
import { ServicesPage }  from '@/pages/ServicesPage'
import { MetricsPage }   from '@/pages/MetricsPage'
import { AlertsPage }    from '@/pages/AlertsPage'

function Guard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Guard><Layout /></Guard>}>
          <Route index          element={<OverviewPage />} />
          <Route path="services"element={<ServicesPage />} />
          <Route path="metrics" element={<MetricsPage />} />
          <Route path="alerts"  element={<AlertsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
