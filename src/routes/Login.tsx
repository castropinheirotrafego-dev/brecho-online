import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Breadcrumbs from '../components/Breadcrumbs'
import GoogleIcon from '../components/GoogleIcon'

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? ''
  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
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

  return (
    <div className="mx-auto max-w-sm">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Entrar' }]} />
      <h1 className="mb-6 text-2xl font-bold text-forest-900">Entrar</h1>
      {prefillEmail && (
        <p className="mb-4 rounded-lg bg-forest-50 p-3 text-sm text-forest-700">
          Conta criada! Digite sua senha para entrar.
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus={!!prefillEmail}
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
        <div className="-mt-2 text-right">
          <Link to="/esqueci-senha" className="text-sm font-medium text-forest-600 hover:text-forest-800">
            Esqueceu a senha?
          </Link>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-forest-600 px-4 py-2 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
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
        Não tem conta?{' '}
        <Link to="/cadastro" className="font-medium text-forest-700">
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}
