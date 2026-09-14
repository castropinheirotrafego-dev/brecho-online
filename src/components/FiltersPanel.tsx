import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import type { ItemCategory } from '../lib/database.types'
import { priceRangeOptions, sizeOptions } from '../lib/itemTypes'

export interface FilterValues {
  category: ItemCategory | ''
  size: string
  maxPrice: string
  sort: string
}

const sortOptions = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'size', label: 'Tamanho' },
  { value: 'name', label: 'Ordem alfabética' },
]

export default function FiltersPanel({
  values,
  onChange,
}: {
  values: FilterValues
  onChange: (values: FilterValues) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const activeCount = [values.category, values.size, values.maxPrice, values.sort !== 'recent' ? values.sort : ''].filter(
    Boolean,
  ).length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-medium text-forest-700 hover:bg-cream-100"
      >
        <SlidersHorizontal size={16} />
        Filtros
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest-600 text-[11px] text-cream-50">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-cream-300 bg-white p-4 shadow-lg">
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-forest-500">Categoria</label>
            <select
              value={values.category}
              onChange={(e) => onChange({ ...values, category: e.target.value as ItemCategory | '' })}
              className="w-full rounded-lg border border-cream-300 px-3 py-2 outline-none focus:border-forest-500"
            >
              <option value="">Todas as categorias</option>
              <option value="adulto">Adulto</option>
              <option value="infantil">Kids</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-forest-500">Tamanho</label>
            <select
              value={values.size}
              onChange={(e) => onChange({ ...values, size: e.target.value })}
              className="w-full rounded-lg border border-cream-300 px-3 py-2 outline-none focus:border-forest-500"
            >
              <option value="">Todos os tamanhos</option>
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-forest-500">Preço</label>
            <select
              value={values.maxPrice}
              onChange={(e) => onChange({ ...values, maxPrice: e.target.value })}
              className="w-full rounded-lg border border-cream-300 px-3 py-2 outline-none focus:border-forest-500"
            >
              {priceRangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-forest-500">Ordenar por</label>
            <select
              value={values.sort}
              onChange={(e) => onChange({ ...values, sort: e.target.value })}
              className="w-full rounded-lg border border-cream-300 px-3 py-2 outline-none focus:border-forest-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {activeCount > 0 && (
            <button
              onClick={() => onChange({ category: '', size: '', maxPrice: '', sort: 'recent' })}
              className="mt-3 w-full rounded-full border border-cream-300 py-1.5 text-sm text-forest-600 hover:bg-cream-100"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
