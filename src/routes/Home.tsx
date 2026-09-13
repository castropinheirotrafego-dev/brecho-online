import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ItemCard, { type ItemCardData } from '../components/ItemCard'
import type { ItemCategory, ItemType } from '../lib/database.types'

const typeOptions: { value: ItemType | ''; label: string }[] = [
  { value: '', label: 'Todos os tipos' },
  { value: 'roupa', label: 'Roupas' },
  { value: 'sapato', label: 'Sapatos' },
  { value: 'bolsa', label: 'Bolsas' },
]

const categoryOptions: { value: ItemCategory | ''; label: string }[] = [
  { value: '', label: 'Todas as categorias' },
  { value: 'adulto', label: 'Adulto' },
  { value: 'infantil', label: 'Infantil' },
]

const sizeOptions = [
  '',
  'PP',
  'P',
  'M',
  'G',
  'GG',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  'Única',
]

const sortOptions: { value: string; label: string; column: string; ascending: boolean }[] = [
  { value: 'recent', label: 'Mais recentes', column: 'created_at', ascending: false },
  { value: 'price_asc', label: 'Menor preço', column: 'price', ascending: true },
  { value: 'price_desc', label: 'Maior preço', column: 'price', ascending: false },
  { value: 'size', label: 'Tamanho', column: 'size', ascending: true },
  { value: 'type', label: 'Tipo', column: 'type', ascending: true },
  { value: 'name', label: 'Ordem alfabética', column: 'name', ascending: true },
]

export default function Home() {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<ItemCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<ItemType | ''>((searchParams.get('tipo') as ItemType | null) ?? '')
  const [category, setCategory] = useState<ItemCategory | ''>('')
  const [size, setSize] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(async () => {
      const sortConfig = sortOptions.find((s) => s.value === sort) ?? sortOptions[0]
      let query = supabase
        .from('items')
        .select('id, name, price, size, type, category, item_images(storage_path, position)')
        .eq('status', 'available')
        .order(sortConfig.column, { ascending: sortConfig.ascending })

      if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)
      if (type) query = query.eq('type', type)
      if (category) query = query.eq('category', category)
      if (size) query = query.eq('size', size)
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
  }, [search, type, category, size, maxPrice, sort])

  return (
    <div>
      <section className="mb-8 rounded-2xl bg-cream-200 p-8">
        <h1 className="text-3xl font-bold leading-tight text-forest-900 md:text-4xl">
          Roupas que ganham novas histórias
        </h1>
        <p className="mt-3 text-forest-500">Novas histórias para vestir, do adulto ao infantil.</p>
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
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ItemCategory | '')}
          className="rounded-full border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="rounded-full border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        >
          <option value="">Todos os tamanhos</option>
          {sizeOptions
            .filter((s) => s)
            .map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
        </select>
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Preço até (R$)"
          inputMode="decimal"
          className="w-36 rounded-full border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Ordenar: {opt.label}
            </option>
          ))}
        </select>
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
