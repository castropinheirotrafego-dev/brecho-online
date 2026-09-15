import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useFavorites } from '../contexts/FavoritesContext'
import Breadcrumbs from '../components/Breadcrumbs'
import BackButton from '../components/BackButton'
import { itemConditionLabels, itemTypeLabels } from '../lib/itemTypes'
import type { ItemCondition, ItemType } from '../lib/database.types'

interface ItemDetailData {
  id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  size: string | null
  type: ItemType
  condition: ItemCondition
  status: string
  images: { storage_path: string; position: number }[]
}

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { refresh: refreshCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  const [item, setItem] = useState<ItemDetailData | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [inCart, setInCart] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [offerError, setOfferError] = useState<string | null>(null)
  const [offerSent, setOfferSent] = useState(false)
  const [sendingOffer, setSendingOffer] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase
      .from('items')
      .select(
        'id, name, description, price, original_price, size, type, condition, status, item_images(storage_path, position)',
      )
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setItem({
            ...data,
            images: [...(data.item_images ?? [])].sort((a, b) => a.position - b.position),
          })
        }
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    supabase
      .from('cart_items')
      .select('item_id')
      .eq('user_id', user.id)
      .eq('item_id', id)
      .maybeSingle()
      .then(({ data }) => setInCart(!!data))
  }, [user, id])

  function handleToggleFavorite() {
    if (!user) return navigate('/entrar')
    toggleFavorite(id!)
  }

  async function handleAddToCart() {
    if (!user || !item) return navigate('/entrar')
    setAddingToCart(true)
    await supabase.from('cart_items').insert({ user_id: user.id, item_id: item.id })
    setInCart(true)
    setAddingToCart(false)
    refreshCart()
  }

  async function handleSendOffer(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !item) return navigate('/entrar')
    setOfferError(null)
    setSendingOffer(true)
    try {
      const amount = Number(offerAmount.replace(',', '.'))
      if (Number.isNaN(amount) || amount <= 0) throw new Error('Informe um valor válido')

      const { error } = await supabase.rpc('create_offer', {
        p_item_id: item.id,
        p_amount: amount,
        p_message: offerMessage || null,
      })
      if (error) throw error
      setOfferSent(true)
      setShowOfferForm(false)
    } catch (err) {
      setOfferError(err instanceof Error ? err.message : 'Erro ao enviar oferta')
    } finally {
      setSendingOffer(false)
    }
  }

  if (loading) return <p className="py-10 text-center text-forest-400">Carregando...</p>
  if (!item) return <p className="py-10 text-center text-forest-400">Peça não encontrada.</p>

  const images = item.images.length > 0 ? item.images : [{ storage_path: '', position: 0 }]
  const activeUrl = images[activeImage]?.storage_path
    ? supabase.storage.from('item-photos').getPublicUrl(images[activeImage].storage_path).data.publicUrl
    : null
  const available = item.status === 'available'
  const typeLabel = itemTypeLabels[item.type] ?? item.type

  return (
    <div>
      <BackButton />
      <Breadcrumbs
        items={[{ label: 'Início', to: '/' }, { label: typeLabel, to: `/?tipo=${item.type}` }, { label: item.name }]}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-2xl bg-cream-100">
            {activeUrl ? (
              <img src={activeUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-forest-400">Sem foto</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? 'border-forest-600' : 'border-transparent'
                  }`}
                >
                  {img.storage_path && (
                    <img
                      src={supabase.storage.from('item-photos').getPublicUrl(img.storage_path).data.publicUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-forest-900">{item.name}</h1>
            <button
              type="button"
              onClick={handleToggleFavorite}
              title={isFavorite(id!) ? 'Remover dos favoritos' : 'Favoritar'}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-cream-300 text-forest-700 hover:bg-cream-100"
            >
              <Heart size={18} className={isFavorite(id!) ? 'fill-rosequeimado text-rosequeimado' : ''} />
            </button>
          </div>
          <p className="mt-2 text-3xl font-bold text-forest-700">
            {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>

          {!available && (
            <span className="mt-3 inline-block rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
              Indisponível
            </span>
          )}

          <div className="mt-5 flex flex-col gap-3 text-sm">
            {item.size && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-forest-500">Tamanho:</span>
                <span className="rounded-full bg-cream-200 px-3 py-1 font-medium text-forest-700">{item.size}</span>
              </div>
            )}
            <div>
              <p className="font-bold text-forest-500">Estado da peça</p>
              <p className="text-forest-800">{itemConditionLabels[item.condition]}</p>
            </div>
            {item.original_price != null && item.original_price > item.price && (
              <div>
                <p className="font-bold text-forest-500">Valor original</p>
                <p className="text-gray-400 line-through">
                  {item.original_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            )}
          </div>

          {item.description && (
            <div className="mt-4">
              <p className="text-sm font-bold text-forest-500">Descrição</p>
              <p className="mt-1 whitespace-pre-line text-forest-600">{item.description}</p>
            </div>
          )}

          {!available ? (
            <p className="mt-6 text-forest-500">Esta peça não está mais disponível para compra ou oferta.</p>
          ) : offerSent ? (
            <div className="mt-6 flex flex-col gap-3">
              <p className="rounded-lg bg-forest-50 p-3 text-forest-700">
                Oferta enviada! Acompanhe a negociação no seu perfil.
              </p>
              <Link
                to="/negociacoes"
                className="w-full rounded-full bg-forest-600 px-4 py-3 text-center font-medium text-cream-50 hover:bg-forest-700"
              >
                Acompanhar negociação
              </Link>
              <Link
                to="/"
                className="w-full rounded-full border border-forest-600 px-4 py-3 text-center font-medium text-forest-700 hover:bg-forest-50"
              >
                Continuar comprando
              </Link>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || inCart}
                className="w-full rounded-full bg-forest-600 px-4 py-3 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
              >
                {inCart ? 'Já está na sacola' : addingToCart ? 'Adicionando...' : 'Adicionar à sacola'}
              </button>
              {!showOfferForm ? (
                <button
                  onClick={() => setShowOfferForm(true)}
                  className="w-full rounded-full text-sm font-medium text-forest-600 underline hover:text-forest-800"
                >
                  Prefere negociar? Fazer uma oferta
                </button>
              ) : (
                <form onSubmit={handleSendOffer} className="rounded-xl border border-cream-300 bg-white p-4">
                  <h2 className="mb-3 font-semibold text-forest-900">Fazer uma oferta</h2>
                  <label className="mb-1 block text-sm text-forest-500">Seu valor (R$)</label>
                  <input
                    required
                    inputMode="decimal"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder={item.price.toString()}
                    className="mb-3 w-full rounded-lg border border-cream-300 px-3 py-2 outline-none focus:border-forest-500"
                  />
                  <label className="mb-1 block text-sm text-forest-500">Mensagem (opcional)</label>
                  <textarea
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value.slice(0, 200))}
                    maxLength={200}
                    rows={3}
                    className="mb-1 w-full rounded-lg border border-cream-300 px-3 py-2 outline-none focus:border-forest-500"
                  />
                  <p className="mb-3 text-right text-xs text-forest-400">{offerMessage.length}/200</p>
                  {offerError && <p className="mb-3 text-sm text-red-600">{offerError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={sendingOffer}
                      className="flex-1 rounded-full bg-forest-600 px-4 py-2 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
                    >
                      {sendingOffer ? 'Enviando...' : 'Enviar oferta'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOfferForm(false)}
                      className="rounded-full border border-cream-300 px-4 py-2 text-forest-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
