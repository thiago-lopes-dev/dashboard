import { useDashboardStore } from '@/store'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { GaugeRing } from '@/components/ui/GaugeRing'
import s from './MetricsPage.module.css'

export function MetricsPage() {
  const { metricsHistory, summary } = useDashboardStore()
  const m = summary?.latestMetric

  const data = metricsHistory.slice().reverse().map(m => ({
    time:    new Date(m.recordedAt).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }),
    cpu:     Number(m.cpuUsage    ?? 0),
    mem:     Number(m.memoryUsage ?? 0),
    threads: m.activeThreads ?? 0,
  }))

  const ttStyle = {
    contentStyle: { background:'var(--bg-elevated)', border:'1px solid var(--border-bright)',
      borderRadius:8, fontFamily:'var(--font-mono)', fontSize:11 },
    labelStyle: { color:'var(--text-muted)' },
  }
  const interval = Math.max(0, Math.floor(data.length / 8))

  return (
    <div className={s.page}>
      <h1 className={s.title}>⟁ Métricas do Sistema</h1>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Snapshot Atual</h2>
        <div className={s.snapshot}>
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
          <div className={s.statBox}>
            <div className={s.statLabel}>Threads Ativas</div>
            <div className={s.statVal}>{m?.activeThreads ?? '—'}</div>
            <div className={s.statSub}>JVM threads</div>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>CPU & Memória — Histórico</h2>
        <div className={s.chart}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top:4, right:4, left:-24, bottom:0 }}>
              <defs>
                <linearGradient id="mc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--cyan)"  stopOpacity={.25}/>
                  <stop offset="95%" stopColor="var(--cyan)"  stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="mm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--green)" stopOpacity={.25}/>
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="time" tick={{ fill:'var(--text-muted)', fontSize:10 }}
                tickLine={false} axisLine={false} interval={interval}/>
              <YAxis domain={[0,100]} tick={{ fill:'var(--text-muted)', fontSize:10 }}
                tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`}/>
              <Tooltip {...ttStyle}/>
              <Legend wrapperStyle={{ fontSize:11, fontFamily:'var(--font-mono)' }}/>
              <Area type="monotone" dataKey="cpu" name="CPU"
                stroke="var(--cyan)"  strokeWidth={2} fill="url(#mc)" dot={false}/>
              <Area type="monotone" dataKey="mem" name="Memória"
                stroke="var(--green)" strokeWidth={2} fill="url(#mm)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Threads JVM — Histórico</h2>
        <div className={s.chart}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} margin={{ top:4, right:4, left:-24, bottom:0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="time" tick={{ fill:'var(--text-muted)', fontSize:10 }}
                tickLine={false} axisLine={false} interval={interval}/>
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }}
                tickLine={false} axisLine={false}/>
              <Tooltip {...ttStyle}/>
              <Bar dataKey="threads" name="Threads" fill="var(--purple)"
                opacity={.8} radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
