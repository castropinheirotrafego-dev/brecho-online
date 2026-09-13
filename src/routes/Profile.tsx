import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Tag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Breadcrumbs from '../components/Breadcrumbs'
import BackButton from '../components/BackButton'
import type { OfferStatus, OrderStatus } from '../lib/database.types'

interface OrderRow {
  id: string
  price: number
  status: OrderStatus
  created_at: string
  item_name: string
}

interface OfferRow {
  id: string
  item_id: string
  item_name: string
  status: OfferStatus
  last_amount: number
  last_author: 'buyer' | 'admin'
}

const orderStatusLabels: Record<OrderStatus, string> = {
  pending_delivery: 'Aguardando entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const offerStatusLabels: Record<OfferStatus, string> = {
  pending: 'Em negociação',
  accepted: 'Aceita',
  rejected: 'Recusada',
  cancelled: 'Cancelada',
}

export default function Profile() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [offers, setOffers] = useState<OfferRow[]>([])
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [offerError, setOfferError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) setPhone(profile.phone)
  }, [profile])

  async function loadData() {
    if (!user) return
    const { data: orderData } = await supabase
      .from('orders')
      .select('id, price, status, created_at, item:items(name)')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })

    setOrders(
      (orderData ?? []).map((row: any) => ({
        id: row.id,
        price: row.price,
        status: row.status,
        created_at: row.created_at,
        item_name: Array.isArray(row.item) ? row.item[0]?.name : row.item?.name,
      })),
    )

    const { data: offerData } = await supabase
      .from('offers')
      .select('id, item_id, status, last_amount, last_author, item:items(name)')
      .eq('buyer_id', user.id)
      .order('updated_at', { ascending: false })

    setOffers(
      (offerData ?? []).map((row: any) => ({
        id: row.id,
        item_id: row.item_id,
        status: row.status,
        last_amount: row.last_amount,
        last_author: row.last_author,
        item_name: Array.isArray(row.item) ? row.item[0]?.name : row.item?.name,
      })),
    )
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (location.hash === '#negociacoes') {
      document.getElementById('negociacoes')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash, offers.length])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSaved(false)
    await supabase.from('profiles').update({ phone }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
  }

  async function respondOffer(offerId: string, action: 'accept' | 'cancel') {
    setRespondingId(offerId)
    setOfferError(null)
    const { error } = await supabase.rpc('buyer_respond_offer', { p_offer_id: offerId, p_action: action })
    if (error) setOfferError(error.message)
    await loadData()
    setRespondingId(null)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div>
      <BackButton />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Meu perfil' }]} />
      <h1 className="mb-6 text-2xl font-bold text-forest-900">Meu perfil</h1>

      <form onSubmit={handleSave} className="mb-10 flex max-w-md flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-forest-500">Nome</label>
          <p className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-2 text-forest-700">
            {profile?.full_name}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm text-forest-500">E-mail</label>
          <p className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-2 text-forest-700">
            {profile?.email}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm text-forest-500">Telefone / WhatsApp</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-forest-600 px-4 py-2 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
        {saved && <p className="text-sm text-green-700">Perfil atualizado!</p>}
      </form>

      {profile?.is_admin && (
        <div className="mb-10 flex flex-col gap-2 sm:hidden">
          <h2 className="mb-1 text-xl font-semibold text-forest-900">Painel administrativo</h2>
          <Link
            to="/admin/pecas"
            className="flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-4 py-2.5 text-forest-700"
          >
            <LayoutDashboard size={18} /> Publicar / gerenciar peças
          </Link>
          <Link
            to="/admin/ofertas"
            className="flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-4 py-2.5 text-forest-700"
          >
            <Tag size={18} /> Ofertas recebidas
          </Link>
          <Link
            to="/admin/pedidos"
            className="flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-4 py-2.5 text-forest-700"
          >
            Pedidos
          </Link>
        </div>
      )}

      <h2 id="negociacoes" className="mb-3 scroll-mt-24 text-xl font-semibold text-forest-900">
        Minhas negociações
      </h2>
      {offerError && <p className="mb-4 text-sm text-red-600">{offerError}</p>}
      {offers.length === 0 ? (
        <p className="mb-8 text-forest-400">Você ainda não fez nenhuma oferta.</p>
      ) : (
        <div className="mb-10 flex flex-col gap-3">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-xl border border-cream-300 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-forest-900">{offer.item_name}</p>
                <span className="rounded-full bg-cream-200 px-3 py-1 text-xs text-forest-600">
                  {offerStatusLabels[offer.status]}
                </span>
              </div>
              <p className="mt-1 text-forest-600">
                {offer.last_author === 'admin' ? 'Contraproposta: ' : 'Sua oferta: '}
                {offer.last_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              {offer.status === 'pending' && (
                <>
                  {offer.last_author === 'buyer' && (
                    <p className="mt-2 text-xs text-forest-400">Aguardando resposta da administradora.</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    {offer.last_author === 'admin' && (
                      <button
                        onClick={() => respondOffer(offer.id, 'accept')}
                        disabled={respondingId === offer.id}
                        className="rounded-full bg-forest-600 px-4 py-1.5 text-sm font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
                      >
                        Aceitar
                      </button>
                    )}
                    <button
                      onClick={() => respondOffer(offer.id, 'cancel')}
                      disabled={respondingId === offer.id}
                      className="rounded-full border border-cream-300 px-4 py-1.5 text-sm text-forest-600 disabled:opacity-50"
                    >
                      Desistir da negociação
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-3 text-xl font-semibold text-forest-900">Meus pedidos</h2>
      {orders.length === 0 ? (
        <p className="text-forest-400">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cream-300 bg-white p-4"
            >
              <div>
                <p className="font-medium text-forest-900">{order.item_name}</p>
                <p className="text-forest-600">
                  {order.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <span className="rounded-full bg-cream-200 px-3 py-1 text-xs text-forest-600">
                {orderStatusLabels[order.status]}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSignOut}
        className="mt-10 flex items-center gap-2 text-sm font-medium text-forest-500 hover:text-red-600"
      >
        <LogOut size={16} />
        Sair da conta
      </button>
    </div>
  )
}
