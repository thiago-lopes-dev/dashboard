import s from './GaugeRing.module.css'

export function GaugeRing({ label, value, color, sub }: {
  label: string; value: number; color: string; sub?: string
}) {
  const r    = 46
  const circ = 2 * Math.PI * r
  const pct  = Math.min(100, Math.max(0, isNaN(value) ? 0 : value))
  const dash = (pct / 100) * circ

  return (
    <div className={s.wrap}>
      <svg viewBox="0 0 110 110" className={s.svg}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ * 0.25}
          style={{ filter:`drop-shadow(0 0 6px ${color})`, transition:'stroke-dasharray .6s ease' }}
        />
        <text x="55" y="52" textAnchor="middle"
          fill="var(--text-primary)" fontSize="18"
          fontFamily="var(--font-display)" fontWeight="800">
          {pct.toFixed(0)}%
        </text>
        <text x="55" y="66" textAnchor="middle"
          fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">
          {label}
        </text>
      </svg>
      {sub && <div className={s.sub}>{sub}</div>}
    </div>
  )
}
