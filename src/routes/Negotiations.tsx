import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { buildWhatsappUrl, getAdminPhoneDigits } from '../lib/whatsapp'
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

const offerStatusColors: Record<OfferStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-200 text-gray-600',
}

const orderStatusColors: Record<OrderStatus, string> = {
  pending_delivery: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-200 text-gray-600',
}

export default function Negotiations() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [offers, setOffers] = useState<OfferRow[]>([])
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [offerError, setOfferError] = useState<string | null>(null)
  const [adminPhone, setAdminPhone] = useState<string | null>(null)

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
    getAdminPhoneDigits().then(setAdminPhone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function respondOffer(offerId: string, action: 'accept' | 'cancel') {
    setRespondingId(offerId)
    setOfferError(null)
    const { error } = await supabase.rpc('buyer_respond_offer', { p_offer_id: offerId, p_action: action })
    if (error) setOfferError(error.message)
    await loadData()
    setRespondingId(null)
  }

  return (
    <div>
      <BackButton />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Minhas negociações' }]} />

      <h1 className="mb-3 text-xl font-semibold text-forest-900">Minhas negociações</h1>
      {offerError && <p className="mb-4 text-sm text-red-600">{offerError}</p>}
      {offers.length === 0 ? (
        <p className="mb-8 text-forest-400">Você ainda não fez nenhuma oferta.</p>
      ) : (
        <div className="mb-10 flex flex-col gap-3">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-xl border border-cream-300 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-forest-900">{offer.item_name}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${offerStatusColors[offer.status]}`}>
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
              {offer.status === 'accepted' && adminPhone && (
                <a
                  href={buildWhatsappUrl(
                    adminPhone,
                    `Olá! Minha oferta para "${offer.item_name}" foi aceita e gostaria de combinar a entrega e o pagamento.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-oliva px-4 py-1.5 text-sm font-medium text-white hover:bg-oliva-dark"
                >
                  <MessageCircle size={16} />
                  Conversar no WhatsApp
                </a>
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
            <div key={order.id} className="rounded-xl border border-cream-300 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-forest-900">{order.item_name}</p>
                  <p className="text-forest-600">
                    {order.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${orderStatusColors[order.status]}`}>
                  {orderStatusLabels[order.status]}
                </span>
              </div>
              {order.status !== 'completed' && adminPhone && (
                <a
                  href={buildWhatsappUrl(adminPhone, `Olá! Gostaria de falar sobre meu pedido "${order.item_name}".`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-oliva px-4 py-1.5 text-sm font-medium text-white hover:bg-oliva-dark"
                >
                  <MessageCircle size={16} />
                  Conversar no WhatsApp
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
