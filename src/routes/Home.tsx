import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ItemCard, { type ItemCardData } from '../components/ItemCard'
import Hero from '../components/Hero'
import CategoryQuickFilters from '../components/CategoryQuickFilters'
import FiltersPanel, { type FilterValues } from '../components/FiltersPanel'
import type { ItemType } from '../lib/database.types'

const sortColumns: Record<string, { column: string; ascending: boolean }> = {
  recent: { column: 'created_at', ascending: false },
  price_asc: { column: 'price', ascending: true },
  price_desc: { column: 'price', ascending: false },
  size: { column: 'size', ascending: true },
  name: { column: 'name', ascending: true },
}

export default function Home() {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<ItemCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<ItemType | ''>((searchParams.get('tipo') as ItemType | null) ?? '')
  const [filters, setFilters] = useState<FilterValues>({ category: '', size: '', maxPrice: '', sort: 'recent' })

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(async () => {
      const sortConfig = sortColumns[filters.sort] ?? sortColumns.recent
      let query = supabase
        .from('items')
        .select('id, name, price, size, type, category, condition, item_images(storage_path, position)')
        .eq('status', 'available')
        .order(sortConfig.column, { ascending: sortConfig.ascending })

      if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)
      if (type) query = query.eq('type', type)
      if (filters.category) query = query.eq('category', filters.category)
      if (filters.size) query = query.eq('size', filters.size)
      if (filters.maxPrice) {
        const value = Number(filters.maxPrice)
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
              condition: row.condition,
              cover_path: sorted[0]?.storage_path ?? null,
            }
          }),
        )
      }
      setLoading(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [search, type, filters])

  return (
    <div>
      <Hero />

      <CategoryQuickFilters value={type} onChange={setType} />

      <div id="catalogo" className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar peças..."
            className="w-full rounded-full border border-cream-300 bg-white py-2 pl-10 pr-4 outline-none focus:border-forest-500"
          />
        </div>
        <FiltersPanel values={filters} onChange={setFilters} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-medium text-forest-900">Achados da semana</h2>
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
