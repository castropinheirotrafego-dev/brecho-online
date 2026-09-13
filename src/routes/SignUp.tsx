import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUp(fullName, email, phone, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <h1 className="mb-4 text-2xl font-bold text-forest-900">Quase lá!</h1>
        <p className="text-forest-500">
          Enviamos um e-mail de confirmação. Verifique sua caixa de entrada para ativar a conta.
        </p>
        <button
          onClick={() => navigate('/entrar')}
          className="mt-6 rounded-full bg-forest-600 px-4 py-2 font-medium text-cream-50 hover:bg-forest-700"
        >
          Ir para o login
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-forest-900">Criar conta</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="rounded-lg border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        />
        <input
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        />
        <input
          required
          placeholder="Telefone / WhatsApp"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-lg border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Senha (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-forest-600 px-4 py-2 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
      <p className="mt-4 text-sm text-forest-500">
        Já tem conta?{' '}
        <Link to="/entrar" className="font-medium text-forest-700">
          Entrar
        </Link>
      </p>
    </div>
  )
}
