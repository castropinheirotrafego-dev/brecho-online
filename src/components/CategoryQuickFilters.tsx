import { Shirt } from 'lucide-react'
import DressIcon from './DressIcon'
import type { ItemType } from '../lib/database.types'
import { quickCategoryFilters } from '../lib/itemTypes'

const icons: Record<string, typeof Shirt> = {
  '': Shirt,
  vestidos: DressIcon as unknown as typeof Shirt,
  'blusas-camisetas': Shirt,
  calcas: Shirt,
  'jaquetas-casacos': Shirt,
  bolsas: Shirt,
  sapatos: Shirt,
}

export default function CategoryQuickFilters({
  value,
  onChange,
}: {
  value: ItemType | ''
  onChange: (value: ItemType | '') => void
}) {
  return (
    <div className="mb-6 flex gap-5 overflow-x-auto pb-1">
      {quickCategoryFilters.map((opt) => {
        const Icon = icons[opt.value] ?? Shirt
        const active = value === opt.value
        return (
          <button
            key={opt.value || 'tudo'}
            onClick={() => onChange(opt.value)}
            className="flex flex-shrink-0 flex-col items-center gap-2"
          >
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${
                active ? 'border-forest-600 bg-forest-50' : 'border-cream-300 bg-white'
              }`}
            >
              <Icon size={26} className={active ? 'text-forest-700' : 'text-forest-400'} />
            </span>
            <span className={`text-xs ${active ? 'font-semibold text-forest-900' : 'text-forest-500'}`}>
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
