import { useDashboardStore } from '@/store'
import { StatCard }   from '@/components/ui/StatCard'
import { ServiceCard }from '@/components/ui/ServiceCard'
import { MiniChart }  from '@/components/ui/MiniChart'
import s from './OverviewPage.module.css'
import { useMemo } from 'react'

export function OverviewPage() {
  const { summary, metricsHistory, loading } = useDashboardStore()

  const systemStatus = useMemo(() => {
    if (!summary) return { label: 'Carregando...', color: 'var(--text-muted)' }
    if (summary.servicesDown > 0) return { label: 'Incidente Crítico', color: 'var(--red)' }
    if (summary.servicesDegraded > 0) return { label: 'Degradado', color: 'var(--yellow)' }
    return { label: 'Sistemas Operacionais', color: 'var(--green)' }
  }, [summary])

  const groupedServices = useMemo(() => {
    if (!summary?.services) return {}
    return summary.services.reduce((acc, svc) => {
      if (!acc[svc.category]) acc[svc.category] = []
      acc[svc.category].push(svc)
      return acc
    }, {} as Record<string, typeof summary.services>)
  }, [summary?.services])

  if (loading && !summary) {
    return <div className={s.loading}>
      <div className={s.spinner}></div>
      <span>Sincronizando infraestrutura...</span>
    </div>
  }

  const m = summary?.latestMetric

  const chartData = (metricsHistory || []).slice().reverse().map(m => ({
    time: m?.recordedAt ? new Date(m.recordedAt).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }) : '',
    cpu:  Number(m?.cpuUsage  ?? 0),
    mem:  Number(m?.memoryUsage ?? 0),
  }))

  const activeIncidents = summary?.services?.filter(s => s.lastStatus === 'DOWN' || s.lastStatus === 'DEGRADED') || []
  
  const uptimeStr = summary?.totalServices ? 
    (((summary.totalServices - summary.servicesDown) / summary.totalServices) * 100).toFixed(2) : '100.00'

  return (
    <div className={s.page}>
      
      {/* GLOBAL STATUS BANNER */}
      <div className={s.statusBanner} style={{ '--status-color': systemStatus.color } as React.CSSProperties}>
        <div className={s.statusIcon} />
        <div className={s.statusText}>
          <h2>{systemStatus.label}</h2>
          <p>Uptime global: {uptimeStr}%</p>
        </div>
      </div>

      <div className={s.kpis}>
        <StatCard label="Total de Serviços" value={summary?.totalServices ?? 0}
          sub={`${summary?.servicesUp ?? 0} operacionais`} accent="cyan" icon="⬡" />
        <StatCard label="Serviços Fora" value={summary?.servicesDown ?? 0}
          sub="precisam de atenção" accent="red" icon="✕" />
        <StatCard label="Alertas Ativos" value={summary?.activeAlerts ?? 0}
          sub={`${summary?.criticalAlerts ?? 0} críticos`}
          accent={(summary?.criticalAlerts ?? 0) > 0 ? 'yellow' : 'green'} icon="⚠" />
        <StatCard label="Consumo Global (RAM)" value={m?.memoryUsage ? `${m.memoryUsage}%` : '—'}
          sub={`${m?.memoryUsedMb || 0}MB em uso`} accent="purple" icon="⟁" />
      </div>

      <div className={s.gridLayout}>
        {/* LEFT COLUMN: Incidents & Chart */}
        <div className={s.leftCol}>
          
          <section className={`${s.section} ${s.glassPanel}`}>
            <h2 className={s.sectionTitle}>
              <span className={s.pulseRed}></span> 
              Incidentes Ativos
            </h2>
            {activeIncidents.length > 0 ? (
              <div className={s.incidentList}>
                {activeIncidents.map(svc => (
                  <div key={svc.id} className={s.incidentItem}>
                    <div className={s.incidentHeader}>
                      <strong>{svc.name}</strong>
                      <span className={s.badge} style={{ background: svc.lastStatus === 'DOWN' ? 'var(--red)' : 'var(--yellow)' }}>
                        {svc.lastStatus}
                      </span>
                    </div>
                    <span className={s.incidentUrl}>{svc.url}</span>
                    <span className={s.incidentAgo}>Falha há pouco tempo</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={s.emptyIncidents}>
                <div className={s.checkCircle}>✔</div>
                <p>Nenhum incidente no momento.</p>
              </div>
            )}
          </section>

          <section className={`${s.section} ${s.glassPanel}`}>
            <div className={s.chartHeader}>
              <h2 className={s.sectionTitle}>Performance (CPU & Memória)</h2>
              <span className={s.metricSummary}>CPU: {m?.cpuUsage ?? 0}%</span>
            </div>
            <MiniChart data={chartData} />
          </section>

        </div>

        {/* RIGHT COLUMN: Service Categories */}
        <div className={s.rightCol}>
          <section className={`${s.section} ${s.glassPanel}`}>
            <h2 className={s.sectionTitle}>Status por Categoria</h2>
            <div className={s.categoryList}>
              {Object.keys(groupedServices).length === 0 ? (
                 <p className={s.empty}>Nenhum serviço cadastrado.</p>
              ) : (
                Object.entries(groupedServices).map(([category, svcs]) => (
                  <div key={category} className={s.categoryGroup}>
                    <h3 className={s.categoryName}>{category}</h3>
                    <div className={s.services}>
                      {svcs.map(svc => (
                        <ServiceCard key={svc.id} service={svc} compact />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
