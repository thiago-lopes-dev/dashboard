import { useDashboardStore } from '@/store'
import { StatCard }   from '@/components/ui/StatCard'
import { ServiceCard }from '@/components/ui/ServiceCard'
import { MiniChart }  from '@/components/ui/MiniChart'
import { GaugeRing }  from '@/components/ui/GaugeRing'
import s from './OverviewPage.module.css'

export function OverviewPage() {
  const { summary, metricsHistory, loading } = useDashboardStore()

  if (loading && !summary) {
    return <div className={s.loading}>⟳ carregando dados...</div>
  }

  const m = summary?.latestMetric

  const chartData = metricsHistory.slice().reverse().map(m => ({
    time: new Date(m.recordedAt).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }),
    cpu:  Number(m.cpuUsage  ?? 0),
    mem:  Number(m.memoryUsage ?? 0),
  }))

  return (
    <div className={s.page}>
      <div className={s.titleRow}>
        <h1 className={s.title}>Visão Geral</h1>
        <span className={s.subtitle}>Sistema de Monitoramento</span>
      </div>

      <div className={s.kpis}>
        <StatCard label="Total de Serviços" value={summary?.totalServices ?? 0}
          sub={`${summary?.servicesUp ?? 0} operacionais`} accent="cyan" />
        <StatCard label="Serviços UP" value={summary?.servicesUp ?? 0}
          sub={`${summary?.servicesDown ?? 0} fora do ar`} accent="green" />
        <StatCard label="Alertas Ativos" value={summary?.activeAlerts ?? 0}
          sub={`${summary?.criticalAlerts ?? 0} críticos`}
          accent={(summary?.criticalAlerts ?? 0) > 0 ? 'red' : 'yellow'} />
        <StatCard label="Threads JVM" value={m?.activeThreads ?? '—'}
          sub="threads ativas" accent="purple" />
      </div>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>◈ Recursos do Sistema</h2>
        <div className={s.gauges}>
          <div className={s.gaugeBox}>
            <GaugeRing label="CPU" value={Number(m?.cpuUsage ?? 0)} color="var(--cyan)" />
          </div>
          <div className={s.gaugeBox}>
            <GaugeRing label="Memória" value={Number(m?.memoryUsage ?? 0)} color="var(--green)"
              sub={m ? `${m.memoryUsedMb} MB / ${m.memoryTotalMb} MB` : undefined} />
          </div>
          <div className={s.gaugeBox}>
            <GaugeRing label="Disco" value={Number(m?.diskUsage ?? 0)} color="var(--yellow)" />
          </div>
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>⟁ CPU & Memória — Histórico</h2>
        <MiniChart data={chartData} />
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>⬡ Serviços Monitorados</h2>
        <div className={s.services}>
          {(summary?.services ?? []).map(svc => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
          {!summary?.services?.length && (
            <p className={s.empty}>Nenhum serviço cadastrado ainda.</p>
          )}
        </div>
      </section>
    </div>
  )
}
