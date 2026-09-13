import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Breadcrumbs from '../../components/Breadcrumbs'
import BackButton from '../../components/BackButton'
import type { ItemStatus, ItemType } from '../../lib/database.types'

interface ItemRow {
  id: string
  name: string
  type: ItemType
  size: string | null
  price: number
  status: ItemStatus
  cover_path: string | null
}

const statusLabels: Record<ItemStatus, string> = {
  available: 'Disponível',
  negotiating: 'Em negociação',
  reserved: 'Reservada',
  sold: 'Vendida',
}

export default function AdminItems() {
  const { user } = useAuth()
  const [items, setItems] = useState<ItemRow[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [type, setType] = useState<ItemType>('roupa')
  const [size, setSize] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadItems() {
    setLoading(true)
    const { data } = await supabase
      .from('items')
      .select('id, name, type, size, price, status, item_images(storage_path, position)')
      .order('created_at', { ascending: false })

    setItems(
      (data ?? []).map((row) => {
        const images = (row.item_images ?? []) as { storage_path: string; position: number }[]
        const sorted = [...images].sort((a, b) => a.position - b.position)
        return {
          id: row.id,
          name: row.name,
          type: row.type,
          size: row.size,
          price: row.price,
          status: row.status,
          cover_path: sorted[0]?.storage_path ?? null,
        }
      }),
    )
    setLoading(false)
  }

  useEffect(() => {
    loadItems()
  }, [])

  function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotos(Array.from(e.target.files ?? []).slice(0, 6))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)
    try {
      const priceNumber = Number(price.replace(',', '.'))
      if (Number.isNaN(priceNumber) || priceNumber < 0) throw new Error('Informe um preço válido')

      const { data: item, error: itemError } = await supabase
        .from('items')
        .insert({ name, type, size, price: priceNumber, description })
        .select('id')
        .single()
      if (itemError || !item) throw itemError ?? new Error('Erro ao criar peça')

      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        const path = `${item.id}/${i}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('item-photos')
          .upload(path, file, { upsert: true })
        if (uploadError) throw uploadError

        const { error: imageError } = await supabase
          .from('item_images')
          .insert({ item_id: item.id, storage_path: path, position: i })
        if (imageError) throw imageError
      }

      setName('')
      setSize('')
      setPrice('')
      setDescription('')
      setPhotos([])
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao publicar peça')
    } finally {
      setSubmitting(false)
    }
  }

  async function markAvailable(id: string) {
    await supabase.from('items').update({ status: 'available' }).eq('id', id)
    await loadItems()
  }

  return (
    <div>
      <BackButton />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Admin' }, { label: 'Publicar peça' }]} />
      <h1 className="mb-6 text-2xl font-bold text-forest-900">Publicar uma peça</h1>

      <form onSubmit={handleSubmit} className="mb-10 flex max-w-xl flex-col gap-4 rounded-xl border border-cream-300 bg-white p-5">
        <input
          required
          placeholder="Nome (ex: Jaqueta Jeans)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ItemType)}
            className="rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
          >
            <option value="roupa">Roupa</option>
            <option value="sapato">Sapato</option>
            <option value="bolsa">Bolsa</option>
          </select>
          <input
            placeholder="Tamanho"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
          />
        </div>

        <input
          required
          placeholder="Preço (R$)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
        />

        <textarea
          placeholder="Descrição"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
        />

        <div>
          <label className="mb-1 block text-sm text-forest-500">Fotos (até 6)</label>
          <input type="file" accept="image/*" multiple onChange={handlePhotosChange} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-forest-600 px-4 py-2 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
        >
          {submitting ? 'Publicando...' : 'Publicar'}
        </button>
      </form>

      <h2 className="mb-4 text-xl font-semibold text-forest-900">Minhas peças</h2>
      {loading ? (
        <p className="text-forest-400">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const imageUrl = item.cover_path
              ? supabase.storage.from('item-photos').getPublicUrl(item.cover_path).data.publicUrl
              : null
            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-cream-300 bg-white p-3"
              >
                <div className="h-14 w-14 overflow-hidden rounded-lg bg-cream-100">
                  {imageUrl && <img src={imageUrl} alt={item.name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-forest-900">{item.name}</p>
                  <p className="text-sm text-forest-500">
                    {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    {item.size ? ` · Tam. ${item.size}` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-cream-200 px-3 py-1 text-xs text-forest-600">
                  {statusLabels[item.status]}
                </span>
                {item.status !== 'available' && (
                  <button
                    onClick={() => markAvailable(item.id)}
                    className="rounded-full border border-forest-600 px-3 py-1 text-xs font-medium text-forest-700 hover:bg-forest-50"
                  >
                    Reativar no catálogo
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
