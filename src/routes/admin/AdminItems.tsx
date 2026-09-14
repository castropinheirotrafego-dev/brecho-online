import { useEffect, useRef, useState } from 'react'
import { Paperclip, Pencil, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Breadcrumbs from '../../components/Breadcrumbs'
import BackButton from '../../components/BackButton'
import { itemTypeOptions, sizeOptions } from '../../lib/itemTypes'
import type { ItemCategory, ItemStatus, ItemType } from '../../lib/database.types'

interface ItemRow {
  id: string
  name: string
  type: ItemType
  category: ItemCategory
  size: string | null
  price: number
  description: string | null
  status: ItemStatus
  cover_path: string | null
}

const statusLabels: Record<ItemStatus, string> = {
  available: 'Disponível',
  negotiating: 'Em negociação',
  reserved: 'Reservada',
  sold: 'Vendida',
}

const statusColors: Record<ItemStatus, string> = {
  available: 'bg-green-100 text-green-700',
  negotiating: 'bg-amber-100 text-amber-700',
  reserved: 'bg-blue-100 text-blue-700',
  sold: 'bg-gray-200 text-gray-600',
}

const emptyForm = {
  name: '',
  type: 'blusas-camisetas' as ItemType,
  category: 'adulto' as ItemCategory,
  size: '',
  price: '',
  description: '',
}

export default function AdminItems() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [items, setItems] = useState<ItemRow[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState(emptyForm.name)
  const [type, setType] = useState<ItemType>(emptyForm.type)
  const [category, setCategory] = useState<ItemCategory>(emptyForm.category)
  const [size, setSize] = useState(emptyForm.size)
  const [price, setPrice] = useState(emptyForm.price)
  const [description, setDescription] = useState(emptyForm.description)
  const [photos, setPhotos] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadItems() {
    setLoading(true)
    const { data } = await supabase
      .from('items')
      .select('id, name, type, category, size, price, description, status, item_images(storage_path, position)')
      .order('created_at', { ascending: false })

    setItems(
      (data ?? []).map((row) => {
        const images = (row.item_images ?? []) as { storage_path: string; position: number }[]
        const sorted = [...images].sort((a, b) => a.position - b.position)
        return {
          id: row.id,
          name: row.name,
          type: row.type,
          category: row.category,
          size: row.size,
          price: row.price,
          description: row.description,
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

  function resetForm() {
    setEditingId(null)
    setName(emptyForm.name)
    setType(emptyForm.type)
    setCategory(emptyForm.category)
    setSize(emptyForm.size)
    setPrice(emptyForm.price)
    setDescription(emptyForm.description)
    setPhotos([])
    setError(null)
  }

  function startEdit(item: ItemRow) {
    setEditingId(item.id)
    setName(item.name)
    setType(item.type)
    setCategory(item.category)
    setSize(item.size ?? '')
    setPrice(String(item.price))
    setDescription(item.description ?? '')
    setPhotos([])
    setError(null)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)
    try {
      const priceNumber = Number(price.replace(',', '.'))
      if (Number.isNaN(priceNumber) || priceNumber < 0) throw new Error('Informe um preço válido')

      let itemId = editingId

      if (editingId) {
        const { error: updateError } = await supabase
          .from('items')
          .update({ name, type, category, size, price: priceNumber, description })
          .eq('id', editingId)
        if (updateError) throw updateError
      } else {
        const { data: item, error: itemError } = await supabase
          .from('items')
          .insert({ name, type, category, size, price: priceNumber, description })
          .select('id')
          .single()
        if (itemError || !item) throw itemError ?? new Error('Erro ao criar peça')
        itemId = item.id
      }

      if (itemId) {
        for (let i = 0; i < photos.length; i++) {
          const file = photos[i]
          const path = `${itemId}/${Date.now()}-${i}-${file.name}`
          const { error: uploadError } = await supabase.storage
            .from('item-photos')
            .upload(path, file, { upsert: true })
          if (uploadError) throw uploadError

          const { error: imageError } = await supabase
            .from('item_images')
            .insert({ item_id: itemId, storage_path: path, position: i })
          if (imageError) throw imageError
        }
      }

      resetForm()
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar peça')
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
      <h1 className="mb-6 text-2xl font-bold text-forest-900">
        {editingId ? 'Editar peça' : 'Publicar uma peça'}
      </h1>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="mb-10 flex max-w-xl flex-col gap-4 rounded-xl border border-cream-300 bg-white p-5"
      >
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
            {itemTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ItemCategory)}
            className="rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
          >
            <option value="adulto">Adulto</option>
            <option value="infantil">Kids</option>
          </select>
        </div>

        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
        >
          <option value="">Selecione o tamanho</option>
          {sizeOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotosChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-dashed border-cream-300 px-4 py-2 text-sm font-medium text-forest-700 hover:bg-cream-100"
          >
            <Paperclip size={16} />
            Anexar fotos
          </button>
          {photos.length > 0 && (
            <p className="mt-1 text-xs text-forest-400">{photos.length} foto(s) selecionada(s)</p>
          )}
          {editingId && (
            <p className="mt-1 text-xs text-forest-400">Fotos novas serão adicionadas às já existentes.</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-full bg-forest-600 px-4 py-2 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Publicar'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-cream-300 px-4 py-2 text-forest-600"
            >
              Cancelar
            </button>
          )}
        </div>
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
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[item.status]}`}>
                  {statusLabels[item.status]}
                </span>
                <button
                  onClick={() => startEdit(item)}
                  className="flex items-center gap-1 rounded-full border border-cream-300 px-3 py-1 text-xs font-medium text-forest-700 hover:bg-cream-100"
                >
                  <Pencil size={14} />
                  Editar
                </button>
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

      {editingId && (
        <button
          onClick={resetForm}
          className="fixed bottom-5 left-5 z-40 flex items-center gap-1 rounded-full bg-forest-900 px-4 py-2 text-sm text-cream-50 shadow-lg sm:hidden"
        >
          <X size={14} />
          Cancelar edição
        </button>
      )}
    </div>
  )
}
