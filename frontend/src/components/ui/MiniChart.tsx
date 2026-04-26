import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import s from './MiniChart.module.css'

interface Point { time: string; cpu: number; mem: number }

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className={s.tip}>
      <div className={s.tipTime}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className={s.tipRow}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span>{Number(p.value).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

export function MiniChart({ data }: { data: Point[] }) {
  if (!data.length) return <div className={s.empty}>sem dados ainda</div>
  return (
    <div className={s.wrap}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top:4, right:4, left:-24, bottom:0 }}>
          <defs>
            <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--cyan)"  stopOpacity={.25}/>
              <stop offset="95%" stopColor="var(--cyan)"  stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--green)" stopOpacity={.25}/>
              <stop offset="95%" stopColor="var(--green)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="time" tick={{ fill:'var(--text-muted)', fontSize:10 }}
            tickLine={false} axisLine={false}
            interval={Math.max(0, Math.floor(data.length / 7))}/>
          <YAxis domain={[0,100]} tick={{ fill:'var(--text-muted)', fontSize:10 }}
            tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`}/>
          <Tooltip content={<Tip/>}/>
          <Area type="monotone" dataKey="cpu" name="CPU"
            stroke="var(--cyan)"  strokeWidth={2} fill="url(#gc)" dot={false}
            activeDot={{ r:4, fill:'var(--cyan)' }}/>
          <Area type="monotone" dataKey="mem" name="Memória"
            stroke="var(--green)" strokeWidth={2} fill="url(#gm)" dot={false}
            activeDot={{ r:4, fill:'var(--green)' }}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
