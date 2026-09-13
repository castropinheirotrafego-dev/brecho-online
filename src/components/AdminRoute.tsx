import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <p className="py-10 text-center text-forest-400">Carregando...</p>
  if (!user) return <Navigate to="/entrar" replace />
  if (!profile?.is_admin) return <Navigate to="/" replace />

  return <>{children}</>
}
