import { ServiceResponse, HealthStatus } from '@/api/client'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import s from './ServiceCard.module.css'

const COLOR: Record<HealthStatus, string> = {
  UP:       'var(--green)',
  DOWN:     'var(--red)',
  DEGRADED: 'var(--yellow)',
  UNKNOWN:  'var(--text-muted)',
}
const LABEL: Record<HealthStatus, string> = {
  UP: 'operacional', DOWN: 'fora do ar', DEGRADED: 'degradado', UNKNOWN: 'desconhecido',
}

export function ServiceCard({ service }: { service: ServiceResponse }) {
  const color = COLOR[service.lastStatus]
  return (
    <div className={s.card} style={{ '--c': color } as React.CSSProperties}>
      <div className={s.top}>
        <span className={s.dot} />
        <span className={s.category}>{service.category}</span>
      </div>
      <div className={s.name}>{service.name}</div>
      <div className={s.url}>{service.url}</div>
      <div className={s.bottom}>
        <span className={s.status}>{LABEL[service.lastStatus]}</span>
        {service.lastResponseTime != null && (
          <span className={s.rt}>{service.lastResponseTime}ms</span>
        )}
      </div>
      {service.lastCheckedAt && (
        <div className={s.ago}>
          {formatDistanceToNow(new Date(service.lastCheckedAt), { addSuffix: true, locale: ptBR })}
        </div>
      )}
    </div>
  )
}
