import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Breadcrumbs from '../../components/Breadcrumbs'
import BackButton from '../../components/BackButton'
import { getCustomerWhatsappUrl } from '../../lib/whatsapp'
import type { OrderStatus } from '../../lib/database.types'

interface OrderRow {
  id: string
  item_name: string
  buyer_name: string
  buyer_phone: string
  buyer_avatar: string | null
  price: number
  status: OrderStatus
  created_at: string
}

const statusLabels: Record<OrderStatus, string> = {
  pending_delivery: 'Aguardando entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const statusColors: Record<OrderStatus, string> = {
  pending_delivery: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-200 text-gray-600',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadOrders() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select(
        'id, price, status, created_at, item:items(name), buyer:profiles!orders_buyer_id_fkey(full_name, phone, avatar_url)',
      )
      .order('created_at', { ascending: false })

    setOrders(
      (data ?? []).map((row: any) => ({
        id: row.id,
        price: row.price,
        status: row.status,
        created_at: row.created_at,
        item_name: Array.isArray(row.item) ? row.item[0]?.name : row.item?.name,
        buyer_name: Array.isArray(row.buyer) ? row.buyer[0]?.full_name : row.buyer?.full_name,
        buyer_phone: Array.isArray(row.buyer) ? row.buyer[0]?.phone : row.buyer?.phone,
        buyer_avatar: Array.isArray(row.buyer) ? row.buyer[0]?.avatar_url : row.buyer?.avatar_url,
      })),
    )
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [])

  async function finish(orderId: string, action: 'reactivate' | 'complete') {
    setBusyId(orderId)
    setError(null)
    const { error } = await supabase.rpc('admin_finish_order', { p_order_id: orderId, p_action: action })
    if (error) setError(error.message)
    await loadOrders()
    setBusyId(null)
  }

  const pending = orders.filter((o) => o.status === 'pending_delivery')
  const closed = orders.filter((o) => o.status !== 'pending_delivery')

  return (
    <div>
      <BackButton />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Admin' }, { label: 'Pedidos' }]} />
      <h1 className="mb-6 text-2xl font-bold text-forest-900">Pedidos</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-forest-400">Carregando...</p>
      ) : (
        <>
          {pending.length === 0 ? (
            <p className="mb-8 text-forest-400">Nenhum pedido aguardando entrega.</p>
          ) : (
            <div className="mb-10 flex flex-col gap-3">
              {pending.map((order) => (
                <div key={order.id} className="rounded-xl border border-cream-300 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-cream-300 bg-cream-200">
                        {order.buyer_avatar ? (
                          <img src={order.buyer_avatar} alt={order.buyer_name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-serif text-sm text-forest-500">
                            {order.buyer_name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-forest-900">{order.item_name}</p>
                        <p className="text-sm text-forest-500">
                          {order.buyer_name} · {order.buyer_phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-forest-700">
                        {order.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      {getCustomerWhatsappUrl(order.buyer_phone, `Olá, ${order.buyer_name}! Sobre o seu pedido de "${order.item_name}"...`) && (
                        <a
                          href={getCustomerWhatsappUrl(order.buyer_phone, `Olá, ${order.buyer_name}! Sobre o seu pedido de "${order.item_name}"...`)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Falar no WhatsApp"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-green-600 text-green-600 hover:bg-green-50"
                        >
                          <MessageCircle size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => finish(order.id, 'complete')}
                      disabled={busyId === order.id}
                      className="rounded-full bg-forest-600 px-4 py-1.5 text-sm font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
                    >
                      Entrega e pagamento concluídos
                    </button>
                    <button
                      onClick={() => finish(order.id, 'reactivate')}
                      disabled={busyId === order.id}
                      className="rounded-full border border-cream-300 px-4 py-1.5 text-sm text-forest-600 disabled:opacity-50"
                    >
                      Não ocorreu — reativar peça
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="mb-3 text-xl font-semibold text-forest-900">Histórico</h2>
          {closed.length === 0 ? (
            <p className="text-forest-400">Nenhum pedido encerrado ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {closed.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cream-300 bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-cream-300 bg-cream-200">
                      {order.buyer_avatar ? (
                        <img src={order.buyer_avatar} alt={order.buyer_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-serif text-xs text-forest-500">
                          {order.buyer_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                    </div>
                    <p className="text-forest-700">
                      {order.buyer_name} — {order.item_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                    {getCustomerWhatsappUrl(order.buyer_phone, `Olá, ${order.buyer_name}! Sobre o seu pedido de "${order.item_name}"...`) && (
                      <a
                        href={getCustomerWhatsappUrl(order.buyer_phone, `Olá, ${order.buyer_name}! Sobre o seu pedido de "${order.item_name}"...`)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Falar no WhatsApp"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-green-600 text-green-600 hover:bg-green-50"
                      >
                        <MessageCircle size={16} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
