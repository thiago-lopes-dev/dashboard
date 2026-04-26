import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import s from './LoginPage.module.css'

export function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const { login } = useAuthStore()
  const navigate  = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.error
        ?? err?.response?.data?.message
        ?? 'Credenciais inválidas. Verifique e tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.page}>
      <div className={s.grid} aria-hidden />

      <div className={s.card}>
        <div className={s.brand}>
          <span className={s.brandIcon}>◉</span>
          <span className={s.brandName}>MONITOR</span>
        </div>

        <h1 className={s.title}>Acesso ao Sistema</h1>
        <p className={s.subtitle}>Dashboard de Monitoramento v1.0</p>

        <form className={s.form} onSubmit={handleSubmit} noValidate>
          <div className={s.field}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className={s.field}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && <div className={s.error} role="alert">⚠ {error}</div>}

          <button className={s.btn} type="submit" disabled={loading}>
            {loading
              ? <><span className={s.spinner} /> Autenticando...</>
              : '→ Entrar'
            }
          </button>
        </form>

      </div>
    </div>
  )
}
