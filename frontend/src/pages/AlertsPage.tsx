import { useDashboardStore } from '@/store'
import { AlertSeverity }     from '@/api/client'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import s from './AlertsPage.module.css'

const COLORS: Record<AlertSeverity, string> = {
  INFO:'var(--cyan)', WARNING:'var(--yellow)', CRITICAL:'var(--red)'
}
const ICONS: Record<AlertSeverity, string> = {
  INFO:'ℹ', WARNING:'⚠', CRITICAL:'◬'
}

export function AlertsPage() {
  const { alerts, resolveAlert } = useDashboardStore()
  const critical = alerts.filter(a => a.severity === 'CRITICAL').length
  const warning  = alerts.filter(a => a.severity === 'WARNING').length

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>◬ Alertas</h1>
        <div className={s.counts}>
          <span style={{ color:'var(--red)' }}>{critical} críticos</span>
          <span style={{ color:'var(--yellow)' }}>{warning} avisos</span>
          <span style={{ color:'var(--text-muted)' }}>{alerts.length} total</span>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className={s.empty}>
          <span className={s.emptyIcon}>✓</span>
          <span>Nenhum alerta ativo. Tudo operacional!</span>
        </div>
      ) : (
        <div className={s.list}>
          {alerts.map((a, i) => (
            <div key={a.id} className={s.card}
              style={{ '--c': COLORS[a.severity], animationDelay:`${i*45}ms` } as React.CSSProperties}>
              <div className={s.left}>
                <span className={s.icon} style={{ color: COLORS[a.severity] }}>
                  {ICONS[a.severity]}
                </span>
                <div className={s.body}>
                  <div className={s.alertTitle}>{a.title}</div>
                  <div className={s.message}>{a.message}</div>
                  <div className={s.meta}>
                    {a.serviceName && <span className={s.svc}>⬡ {a.serviceName}</span>}
                    <span className={s.time}>
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix:true, locale:ptBR })}
                    </span>
                  </div>
                </div>
              </div>
              <button className={s.resolveBtn} onClick={() => resolveAlert(a.id)}>
                ✔ Resolver
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
