import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import type { OfferStatus } from '../../lib/database.types'

interface OfferRow {
  id: string
  item_id: string
  item_name: string
  buyer_name: string
  status: OfferStatus
  last_amount: number
  last_author: 'buyer' | 'admin'
  updated_at: string
}

const statusLabels: Record<OfferStatus, string> = {
  pending: 'Pendente',
  accepted: 'Aceita',
  rejected: 'Recusada',
  cancelled: 'Cancelada',
}

export default function AdminOffers() {
  const [offers, setOffers] = useState<OfferRow[]>([])
  const [loading, setLoading] = useState(true)
  const [counterId, setCounterId] = useState<string | null>(null)
  const [counterAmount, setCounterAmount] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadOffers() {
    setLoading(true)
    const { data } = await supabase
      .from('offers')
      .select(
        'id, item_id, status, last_amount, last_author, updated_at, item:items(name), buyer:profiles!offers_buyer_id_fkey(full_name)',
      )
      .order('updated_at', { ascending: false })

    setOffers(
      (data ?? []).map((row: any) => ({
        id: row.id,
        item_id: row.item_id,
        item_name: Array.isArray(row.item) ? row.item[0]?.name : row.item?.name,
        buyer_name: Array.isArray(row.buyer) ? row.buyer[0]?.full_name : row.buyer?.full_name,
        status: row.status,
        last_amount: row.last_amount,
        last_author: row.last_author,
        updated_at: row.updated_at,
      })),
    )
    setLoading(false)
  }

  useEffect(() => {
    loadOffers()
  }, [])

  async function respond(offerId: string, action: 'accept' | 'reject') {
    setBusyId(offerId)
    setError(null)
    const { error } = await supabase.rpc('admin_respond_offer', { p_offer_id: offerId, p_action: action })
    if (error) setError(error.message)
    await loadOffers()
    setBusyId(null)
  }

  async function sendCounter(offerId: string) {
    setBusyId(offerId)
    setError(null)
    try {
      const amount = Number(counterAmount.replace(',', '.'))
      if (Number.isNaN(amount) || amount <= 0) throw new Error('Informe um valor válido')
      const { error } = await supabase.rpc('admin_respond_offer', {
        p_offer_id: offerId,
        p_action: 'counter',
        p_amount: amount,
      })
      if (error) throw error
      setCounterId(null)
      setCounterAmount('')
      await loadOffers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar contraproposta')
    } finally {
      setBusyId(null)
    }
  }

  const pending = offers.filter((o) => o.status === 'pending')
  const closed = offers.filter((o) => o.status !== 'pending')

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-forest-900">Ofertas recebidas</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-forest-400">Carregando...</p>
      ) : (
        <>
          {pending.length === 0 ? (
            <p className="mb-8 text-forest-400">Nenhuma oferta pendente.</p>
          ) : (
            <div className="mb-10 flex flex-col gap-3">
              {pending.map((offer) => (
                <div key={offer.id} className="rounded-xl border border-cream-300 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-forest-900">
                        {offer.buyer_name} — {offer.item_name}
                      </p>
                      <p className="text-xs text-forest-400">
                        {formatDistanceToNow(new Date(offer.updated_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-forest-700">
                      {offer.last_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>

                  {offer.last_author === 'buyer' ? (
                    counterId === offer.id ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <input
                          value={counterAmount}
                          onChange={(e) => setCounterAmount(e.target.value)}
                          placeholder="Novo valor (R$)"
                          className="rounded-lg border border-cream-300 px-3 py-1.5"
                        />
                        <button
                          onClick={() => sendCounter(offer.id)}
                          disabled={busyId === offer.id}
                          className="rounded-full bg-forest-600 px-4 py-1.5 text-sm font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
                        >
                          Enviar
                        </button>
                        <button
                          onClick={() => setCounterId(null)}
                          className="rounded-full border border-cream-300 px-4 py-1.5 text-sm text-forest-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => respond(offer.id, 'accept')}
                          disabled={busyId === offer.id}
                          className="rounded-full bg-forest-600 px-4 py-1.5 text-sm font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => setCounterId(offer.id)}
                          disabled={busyId === offer.id}
                          className="rounded-full border border-forest-600 px-4 py-1.5 text-sm font-medium text-forest-700 disabled:opacity-50"
                        >
                          Contrapropor
                        </button>
                        <button
                          onClick={() => respond(offer.id, 'reject')}
                          disabled={busyId === offer.id}
                          className="rounded-full border border-cream-300 px-4 py-1.5 text-sm text-forest-600 disabled:opacity-50"
                        >
                          Recusar
                        </button>
                      </div>
                    )
                  ) : (
                    <p className="mt-2 text-xs text-forest-400">Aguardando resposta do comprador.</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <h2 className="mb-3 text-xl font-semibold text-forest-900">Histórico</h2>
          {closed.length === 0 ? (
            <p className="text-forest-400">Nenhuma negociação encerrada ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {closed.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cream-300 bg-white p-3"
                >
                  <p className="text-forest-700">
                    {offer.buyer_name} — {offer.item_name}
                  </p>
                  <span className="rounded-full bg-cream-200 px-3 py-1 text-xs text-forest-600">
                    {statusLabels[offer.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
