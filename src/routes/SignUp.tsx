import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Breadcrumbs from '../components/Breadcrumbs'
import GoogleIcon from '../components/GoogleIcon'

export default function SignUp() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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

  async function handleGoogleSignIn() {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar com Google')
      setGoogleLoading(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <h1 className="mb-4 text-2xl font-bold text-forest-900">Quase lá!</h1>
        <p className="text-forest-500">
          Enviamos um e-mail de confirmação para <strong>{email}</strong>. Verifique sua caixa de entrada para
          ativar a conta.
        </p>
        <button
          onClick={() => navigate('/entrar', { state: { email } })}
          className="mt-6 rounded-full bg-forest-600 px-4 py-2 font-medium text-cream-50 hover:bg-forest-700"
        >
          Ir para o login
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Criar conta' }]} />
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
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            placeholder="Senha (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-cream-300 bg-white px-4 py-2 pr-10 outline-none focus:border-forest-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-700"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-forest-600 px-4 py-2 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-cream-300" />
        <span className="text-xs font-medium text-forest-400">ou</span>
        <div className="h-px flex-1 bg-cream-300" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-cream-300 bg-white px-4 py-2 font-medium text-forest-700 hover:bg-cream-100 disabled:opacity-50"
      >
        <GoogleIcon size={18} />
        {googleLoading ? 'Conectando...' : 'Continuar com Google'}
      </button>

      <p className="mt-4 text-sm text-forest-500">
        Já tem conta?{' '}
        <Link to="/entrar" className="font-medium text-forest-700">
          Entrar
        </Link>
      </p>
    </div>
  )
}
