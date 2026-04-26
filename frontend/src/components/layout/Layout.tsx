import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useDashboardStore, useAuthStore } from '@/store'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import s from './Layout.module.css'

const NAV = [
  { to: '/',         label: 'Visão Geral', icon: '◈' },
  { to: '/services', label: 'Serviços',    icon: '⬡' },
  { to: '/metrics',  label: 'Métricas',    icon: '⟁' },
  { to: '/alerts',   label: 'Alertas',     icon: '◬' },
]

export function Layout() {
  const { fetchAll, lastUpdated, summary } = useDashboardStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const ref = useRef<number>()
  const [time, setTime] = useState(new Date().toLocaleTimeString('pt-BR'))

  useEffect(() => {
    fetchAll()
    ref.current = window.setInterval(fetchAll, 30_000)
    const tick  = window.setInterval(() => setTime(new Date().toLocaleTimeString('pt-BR')), 1000)
    return () => { clearInterval(ref.current); clearInterval(tick) }
  }, [])

  return (
    <div className={s.shell}>
      <aside className={s.sidebar}>
        <div className={s.brand}>
          <span className={s.brandDot}>◉</span>
          <span className={s.brandName}>MONITOR</span>
        </div>

        <nav className={s.nav}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>
              <span className={s.icon}>{icon}</span>
              <span>{label}</span>
              {to === '/alerts' && (summary?.activeAlerts ?? 0) > 0 && (
                <span className={s.badge}>{summary!.activeAlerts}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={s.footer}>
          <div className={s.user}>
            <span className={s.userDot} />
            <span className={s.userEmail}>{user?.email}</span>
          </div>
          <button className={s.logoutBtn} onClick={() => { logout(); navigate('/login') }}>
            ⏻ Sair
          </button>
        </div>
      </aside>

      <div className={s.main}>
        <header className={s.header}>
          <div className={s.headerLeft}>
            <span className={s.live} />
            <span className={s.liveLabel}>AO VIVO</span>
            {lastUpdated && (
              <span className={s.updated}>
                atualizado {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: ptBR })}
              </span>
            )}
          </div>
          <span className={s.clock}>{time}</span>
        </header>
        <div className={s.content}><Outlet /></div>
      </div>
    </div>
  )
}
