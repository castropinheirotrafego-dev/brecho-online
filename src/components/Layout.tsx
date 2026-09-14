import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Home, ShoppingCart, User, LayoutDashboard, Tag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { supabase } from '../lib/supabase'
import BackToTopButton from './BackToTopButton'
import Logo from './Logo'

const mobileNavItems = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/carrinho', label: 'Carrinho', icon: ShoppingCart },
  { to: '/negociacoes', label: 'Negociações', icon: Tag },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export default function Layout() {
  const { user, profile } = useAuth()
  const { count: cartCount } = useCart()
  const [pendingOffers, setPendingOffers] = useState(0)

  useEffect(() => {
    if (!profile?.is_admin) return
    supabase
      .from('offers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingOffers(count ?? 0))
  }, [profile?.is_admin])

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <header className="sticky top-0 z-30 border-b border-cream-300 bg-cream-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/">
            <Logo />
          </Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <>
                {profile?.is_admin && (
                  <div className="hidden items-center gap-3 sm:flex">
                    <Link
                      to="/admin/pecas"
                      className="flex items-center gap-1 rounded-full bg-forest-600 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-forest-700"
                    >
                      <LayoutDashboard size={18} />
                      Admin
                    </Link>
                    <Link
                      to="/admin/pedidos"
                      className="text-sm font-medium text-forest-500 hover:text-forest-700"
                    >
                      Pedidos
                    </Link>
                    <Link
                      to="/admin/ofertas"
                      className="relative p-2 text-forest-500 hover:text-forest-700"
                      title="Ofertas recebidas"
                    >
                      <Tag size={20} />
                      {pendingOffers > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                          {pendingOffers}
                        </span>
                      )}
                    </Link>
                  </div>
                )}
                <Link
                  to="/carrinho"
                  className="relative hidden p-2 text-forest-500 hover:text-forest-700 sm:block"
                  title="Carrinho"
                >
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-forest-600 text-[10px] text-cream-50">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/perfil" className="hidden p-2 text-forest-500 hover:text-forest-700 sm:block" title="Perfil">
                  <User size={22} />
                </Link>
              </>
            ) : (
              <>
                <Link to="/entrar" className="text-sm font-medium text-forest-700 hover:text-forest-900">
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="rounded-full bg-forest-600 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-forest-700"
                >
                  Criar conta
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:pb-6">
        <Outlet />
      </main>

      <footer className="hidden border-t border-cream-300 bg-cream-50 py-6 text-center text-sm text-forest-400 sm:block">
        Próxima Dona — roupas, sapatos e bolsas que ganham novas histórias.
      </footer>

      {user && (
        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-cream-300 bg-cream-50 sm:hidden">
          {mobileNavItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                  isActive ? 'text-forest-700' : 'text-forest-400'
                }`
              }
            >
              <span className="relative">
                <Icon size={20} />
                {label === 'Carrinho' && cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-forest-600 text-[9px] text-cream-50">
                    {cartCount}
                  </span>
                )}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      <BackToTopButton />
    </div>
  )
}
