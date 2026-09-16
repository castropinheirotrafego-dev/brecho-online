import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Breadcrumbs from '../components/Breadcrumbs'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar e-mail')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <h1 className="mb-4 text-2xl font-bold text-forest-900">Verifique seu e-mail</h1>
        <p className="text-forest-500">
          Se houver uma conta com o e-mail <strong>{email}</strong>, enviamos um link para redefinir sua senha.
        </p>
        <Link
          to="/entrar"
          className="mt-6 inline-block rounded-full bg-forest-600 px-4 py-2 font-medium text-cream-50 hover:bg-forest-700"
        >
          Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Entrar', to: '/entrar' }, { label: 'Esqueci a senha' }]} />
      <h1 className="mb-2 text-2xl font-bold text-forest-900">Esqueceu a senha?</h1>
      <p className="mb-6 text-sm text-forest-500">
        Digite seu e-mail e enviaremos um link para você criar uma nova senha.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          autoFocus
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-forest-600 px-4 py-2 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar link de redefinição'}
        </button>
      </form>
      <p className="mt-4 text-sm text-forest-500">
        Lembrou a senha?{' '}
        <Link to="/entrar" className="font-medium text-forest-700">
          Entrar
        </Link>
      </p>
    </div>
  )
}
