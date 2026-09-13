import { useEffect, useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ItemCard, { type ItemCardData } from '../components/ItemCard'
import type { ItemType } from '../lib/database.types'

const typeOptions: { value: ItemType | ''; label: string }[] = [
  { value: '', label: 'Todos os tipos' },
  { value: 'roupa', label: 'Roupas' },
  { value: 'sapato', label: 'Sapatos' },
  { value: 'bolsa', label: 'Bolsas' },
]

export default function Home() {
  const [items, setItems] = useState<ItemCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<ItemType | ''>('')
  const [size, setSize] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(async () => {
      let query = supabase
        .from('items')
        .select('id, name, price, size, type, item_images(storage_path, position)')
        .eq('status', 'available')
        .order('created_at', { ascending: false })

      if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)
      if (type) query = query.eq('type', type)
      if (size.trim()) query = query.ilike('size', size.trim())
      if (maxPrice.trim()) {
        const value = Number(maxPrice.replace(',', '.'))
        if (!Number.isNaN(value)) query = query.lte('price', value)
      }

      const { data, error } = await query
      if (!error && data) {
        setItems(
          data.map((row) => {
            const images = (row.item_images ?? []) as { storage_path: string; position: number }[]
            const sorted = [...images].sort((a, b) => a.position - b.position)
            return {
              id: row.id,
              name: row.name,
              price: row.price,
              size: row.size,
              type: row.type,
              cover_path: sorted[0]?.storage_path ?? null,
            }
          }),
        )
      }
      setLoading(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [search, type, size, maxPrice])

  return (
    <div>
      <section className="mb-8 grid gap-6 rounded-2xl bg-cream-200 p-8 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-forest-900 md:text-4xl">
            Roupas que ganham novas histórias
          </h1>
          <p className="mt-3 text-forest-500">
            Peças selecionadas, com preços justos, esperando por você.
          </p>
          <a
            href="#catalogo"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest-600 px-5 py-2.5 font-medium text-cream-50 hover:bg-forest-700"
          >
            Ver peças <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <div id="catalogo" className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 sm:min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar peças..."
            className="w-full rounded-full border border-cream-300 bg-white py-2 pl-10 pr-4 outline-none focus:border-forest-500"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ItemType | '')}
          className="rounded-full border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="Tamanho"
          className="w-28 rounded-full border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        />
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Preço até (R$)"
          className="w-36 rounded-full border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        />
      </div>

      {loading ? (
        <p className="py-10 text-center text-forest-400">Carregando peças...</p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-forest-400">Nenhuma peça encontrada.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
