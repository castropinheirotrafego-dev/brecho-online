import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import Breadcrumbs from '../components/Breadcrumbs'
import BackButton from '../components/BackButton'
import PurchaseConfirmation from '../components/PurchaseConfirmation'

interface CartRow {
  item_id: string
  name: string
  price: number
  cover_path: string | null
}

export default function Cart() {
  const { user } = useAuth()
  const { refresh: refreshCart } = useCart()
  const [rows, setRows] = useState<CartRow[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function loadCart() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('cart_items')
      .select('item_id, item:items(name, price, item_images(storage_path, position))')
      .eq('user_id', user.id)

    const parsed = (data ?? []).map((row: any) => {
      const it = Array.isArray(row.item) ? row.item[0] : row.item
      const images = (it?.item_images ?? []) as { storage_path: string; position: number }[]
      const sorted = [...images].sort((a, b) => a.position - b.position)
      return {
        item_id: row.item_id,
        name: it?.name ?? '',
        price: it?.price ?? 0,
        cover_path: sorted[0]?.storage_path ?? null,
      }
    })
    setRows(parsed)
    setLoading(false)
  }

  useEffect(() => {
    loadCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function removeItem(itemId: string) {
    if (!user) return
    await supabase.from('cart_items').delete().eq('user_id', user.id).eq('item_id', itemId)
    setRows((prev) => prev.filter((r) => r.item_id !== itemId))
    refreshCart()
  }

  async function clearCart() {
    if (!user) return
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    setRows([])
    refreshCart()
  }

  async function handleCheckout() {
    setConfirmOpen(false)
    setCheckingOut(true)
    setError(null)
    try {
      const { error } = await supabase.rpc('checkout_cart')
      if (error) throw error
      setDone(true)
      setRows([])
      refreshCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar compra')
    } finally {
      setCheckingOut(false)
    }
  }

  const total = rows.reduce((sum, r) => sum + r.price, 0)

  if (done) {
    return <PurchaseConfirmation />
  }

  return (
    <div>
      <BackButton />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Sacola' }]} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-forest-900">
          Minha Sacola{rows.length > 0 ? ` (${rows.length})` : ''}
        </h1>
        <div className="flex items-center gap-4">
          {rows.length > 0 && (
            <button onClick={clearCart} className="text-sm font-medium text-forest-500 hover:text-red-600">
              Limpar
            </button>
          )}
          <Link to="/" className="text-sm font-medium text-forest-600 hover:text-forest-800">
            Continuar comprando
          </Link>
        </div>
      </div>
      {loading ? (
        <p className="text-forest-400">Carregando...</p>
      ) : rows.length === 0 ? (
        <p className="text-center text-forest-400">Sua sacola está vazia.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => {
            const imageUrl = row.cover_path
              ? supabase.storage.from('item-photos').getPublicUrl(row.cover_path).data.publicUrl
              : null
            return (
              <div
                key={row.item_id}
                className="flex items-center gap-4 rounded-xl border border-cream-300 bg-white p-3"
              >
                <div className="h-16 w-16 overflow-hidden rounded-lg bg-cream-100">
                  {imageUrl && <img src={imageUrl} alt={row.name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-forest-900">{row.name}</p>
                  <p className="text-forest-600">
                    {row.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(row.item_id)}
                  className="p-2 text-forest-400 hover:text-red-600"
                  title="Remover"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          })}

          <div className="flex items-center justify-between rounded-xl border border-cream-300 bg-white p-4">
            <span className="font-semibold text-forest-900">
              Subtotal: {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={checkingOut}
              className="rounded-full bg-forest-600 px-5 py-2.5 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
            >
              {checkingOut ? 'Finalizando...' : 'Finalizar compra'}
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="font-serif text-xl font-medium text-forest-900">Tem certeza que vai levar só isso?</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="w-full rounded-full border border-forest-600 px-4 py-3 font-medium text-forest-700 hover:bg-forest-50"
              >
                Continuar comprando
              </button>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full rounded-full bg-forest-600 px-4 py-3 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
              >
                {checkingOut ? 'Finalizando...' : 'Finalizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
