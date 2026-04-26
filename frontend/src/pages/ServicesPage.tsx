import { useState } from 'react'
import { useDashboardStore } from '@/store'
import { dashboardApi, ServiceResponse, HealthStatus } from '@/api/client'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import s from './ServicesPage.module.css'

const STATUS_COLOR: Record<HealthStatus, string> = {
  UP:'var(--green)', DOWN:'var(--red)', DEGRADED:'var(--yellow)', UNKNOWN:'var(--text-muted)'
}

export function ServicesPage() {
  const { summary, fetchAll } = useDashboardStore()
  const services = summary?.services ?? []

  const [open,   setOpen]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')
  const [form,   setForm]   = useState({ name:'', url:'', description:'', category:'API' })

  function setField(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim()) { setErr('Nome e URL são obrigatórios.'); return }
    setSaving(true); setErr('')
    try {
      await dashboardApi.createService(form)
      await fetchAll()
      setOpen(false)
      setForm({ name:'', url:'', description:'', category:'API' })
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? 'Erro ao criar serviço.')
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Desativar "${name}"?`)) return
    await dashboardApi.deleteService(id)
    fetchAll()
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>⬡ Serviços</h1>
          <p className={s.sub}>{services.length} serviço(s) monitorado(s)</p>
        </div>
        <button className={s.addBtn} onClick={() => { setOpen(o => !o); setErr('') }}>
          {open ? '✕ Cancelar' : '+ Novo Serviço'}
        </button>
      </div>

      {open && (
        <form className={s.form} onSubmit={handleAdd}>
          <div className={s.formGrid}>
            <div className={s.field}>
              <label>Nome *</label>
              <input value={form.name} onChange={e => setField('name', e.target.value)}
                placeholder="Minha API" />
            </div>
            <div className={s.field}>
              <label>URL *</label>
              <input value={form.url} onChange={e => setField('url', e.target.value)}
                placeholder="https://api.exemplo.com/health" />
            </div>
            <div className={s.field}>
              <label>Categoria</label>
              <select value={form.category} onChange={e => setField('category', e.target.value)}>
                {['API','DATABASE','CACHE','WEB','QUEUE','OTHER'].map(c =>
                  <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={s.field}>
              <label>Descrição</label>
              <input value={form.description} onChange={e => setField('description', e.target.value)}
                placeholder="Opcional" />
            </div>
          </div>
          {err && <p className={s.err}>{err}</p>}
          <button type="submit" className={s.saveBtn} disabled={saving}>
            {saving ? '⟳ Salvando...' : '✔ Criar Serviço'}
          </button>
        </form>
      )}

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Status</th><th>Serviço</th><th>Categoria</th>
              <th>URL</th><th>Resposta</th><th>Verificado</th><th></th>
            </tr>
          </thead>
          <tbody>
            {services.map((svc, i) => (
              <tr key={svc.id} className={s.row}
                style={{ animationDelay:`${i * 35}ms` }}>
                <td>
                  <span className={s.dot}
                    style={{ background: STATUS_COLOR[svc.lastStatus],
                             boxShadow:`0 0 6px ${STATUS_COLOR[svc.lastStatus]}` }} />
                  <span style={{ color: STATUS_COLOR[svc.lastStatus], fontWeight:600, fontSize:11 }}>
                    {svc.lastStatus}
                  </span>
                </td>
                <td>
                  <span className={s.name}>{svc.name}</span>
                  {svc.description && <span className={s.desc}>{svc.description}</span>}
                </td>
                <td><span className={s.tag}>{svc.category}</span></td>
                <td className={s.url}>{svc.url}</td>
                <td className={s.rt}>
                  {svc.lastResponseTime != null ? `${svc.lastResponseTime}ms` : '—'}
                </td>
                <td className={s.ago}>
                  {svc.lastCheckedAt
                    ? formatDistanceToNow(new Date(svc.lastCheckedAt),
                        { addSuffix:true, locale:ptBR })
                    : '—'}
                </td>
                <td>
                  <button className={s.delBtn}
                    onClick={() => handleDelete(svc.id, svc.name)}>✕</button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={7} className={s.empty}>
                Nenhum serviço. Clique em "Novo Serviço" para começar.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
