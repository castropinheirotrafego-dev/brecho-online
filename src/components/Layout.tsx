import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ShoppingBag, Shirt, User, LayoutDashboard, Tag, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import BackToTopButton from './BackToTopButton'

export default function Layout() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)
  const [pendingOffers, setPendingOffers] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      setCartCount(0)
      return
    }
    supabase
      .from('cart_items')
      .select('item_id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setCartCount(count ?? 0))
  }, [user])

  useEffect(() => {
    if (!profile?.is_admin) return
    supabase
      .from('offers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingOffers(count ?? 0))
  }, [profile?.is_admin])

  useEffect(() => {
    setMenuOpen(false)
  }, [user])

  async function handleSignOut() {
    setMenuOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <header className="sticky top-0 z-30 border-b border-cream-300 bg-cream-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-forest-700">
            <Shirt size={26} />
            Próxima Dona
          </Link>

          {/* Navegação desktop */}
          <nav className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                {profile?.is_admin && (
                  <>
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
                  </>
                )}
                <Link to="/carrinho" className="relative p-2 text-forest-500 hover:text-forest-700" title="Carrinho">
                  <ShoppingBag size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-forest-600 text-[10px] text-cream-50">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/perfil" className="p-2 text-forest-500 hover:text-forest-700" title="Perfil">
                  <User size={20} />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-forest-400 hover:text-forest-700"
                >
                  Sair
                </button>
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

          {/* Botão do menu mobile */}
          <div className="flex items-center gap-2 sm:hidden">
            {user && (
              <Link to="/carrinho" className="relative p-2 text-forest-500" title="Carrinho">
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-forest-600 text-[10px] text-cream-50">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Abrir menu"
              className="p-2 text-forest-700"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu mobile (drawer) */}
        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-cream-300 bg-cream-50 px-4 py-3 sm:hidden">
            {user ? (
              <>
                {profile?.is_admin && (
                  <>
                    <Link
                      to="/admin/pecas"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-forest-700 hover:bg-cream-200"
                    >
                      <LayoutDashboard size={18} /> Admin — Peças
                    </Link>
                    <Link
                      to="/admin/pedidos"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-forest-700 hover:bg-cream-200"
                    >
                      Pedidos
                    </Link>
                    <Link
                      to="/admin/ofertas"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-forest-700 hover:bg-cream-200"
                    >
                      <Tag size={18} /> Ofertas recebidas
                      {pendingOffers > 0 && (
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] text-white">
                          {pendingOffers}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <Link
                  to="/perfil"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-forest-700 hover:bg-cream-200"
                >
                  <User size={18} /> Meu perfil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-left text-forest-500 hover:bg-cream-200"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/entrar"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-forest-700 hover:bg-cream-200"
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-forest-600 px-3 py-2.5 text-center font-medium text-cream-50 hover:bg-forest-700"
                >
                  Criar conta
                </Link>
              </>
            )}
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-cream-300 bg-cream-50 py-6 text-center text-sm text-forest-400">
        Próxima Dona — roupas, sapatos e bolsas que ganham novas histórias.
      </footer>

      <BackToTopButton />
    </div>
  )
}
