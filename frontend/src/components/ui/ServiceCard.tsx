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
  UP: 'Operacional', DOWN: 'Fora do ar', DEGRADED: 'Degradado', UNKNOWN: 'Desconhecido',
}

export function ServiceCard({ service, compact }: { service: ServiceResponse, compact?: boolean }) {
  const color = COLOR[service.lastStatus]
  return (
    <div className={`${s.card} ${compact ? s.compact : ''}`} style={{ '--c': color } as React.CSSProperties}>
      <div className={s.top}>
        <div className={s.titleRow}>
          <span className={s.dot} />
          <span className={s.name}>{service.name}</span>
        </div>
        {!compact && <span className={s.category}>{service.category}</span>}
      </div>
      
      {!compact && <div className={s.url}>{service.url}</div>}
      
      <div className={s.bottom}>
        <span className={s.status}>{LABEL[service.lastStatus]}</span>
        {service.lastResponseTime != null && (
          <span className={s.rt}>{service.lastResponseTime}ms</span>
        )}
      </div>
      
      {!compact && service.lastCheckedAt && (
        <div className={s.ago}>
          {formatDistanceToNow(new Date(service.lastCheckedAt), { addSuffix: true, locale: ptBR })}
        </div>
      )}
    </div>
  )
}
