// ─── StatCard ─────────────────────────────────────────────────────────────────
import s from './StatCard.module.css'
export function StatCard({ label, value, sub, accent = 'cyan' }: {
  label: string; value: string | number; sub?: string
  accent?: 'cyan'|'green'|'yellow'|'red'|'purple'
}) {
  return (
    <div className={`${s.card} ${s[accent]}`}>
      <div className={s.label}>{label}</div>
      <div className={s.value}>{value}</div>
      {sub && <div className={s.sub}>{sub}</div>}
      <div className={s.corner} />
    </div>
  )
}
