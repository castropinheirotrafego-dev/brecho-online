import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ShoppingBag, Shirt, User, LayoutDashboard, Tag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Layout() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)
  const [pendingOffers, setPendingOffers] = useState(0)

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

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <header className="border-b border-cream-300 bg-cream-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-forest-700">
            <Shirt size={26} />
            Meu Closet
          </Link>

          <nav className="flex items-center gap-3">
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
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-cream-300 bg-cream-50 py-6 text-center text-sm text-forest-400">
        Meu Closet — roupas, sapatos e bolsas que ganham novas histórias.
      </footer>
    </div>
  )
}
