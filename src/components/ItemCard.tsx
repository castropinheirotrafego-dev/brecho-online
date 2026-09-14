import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { itemTypeLabels } from '../lib/itemTypes'
import type { ItemType } from '../lib/database.types'

export interface ItemCardData {
  id: string
  name: string
  price: number
  size: string | null
  type: ItemType
  cover_path: string | null
}

export default function ItemCard({ item }: { item: ItemCardData }) {
  const imageUrl = item.cover_path
    ? supabase.storage.from('item-photos').getPublicUrl(item.cover_path).data.publicUrl
    : null

  return (
    <Link
      to={`/pecas/${item.id}`}
      className="group overflow-hidden rounded-2xl border border-cream-300 bg-white transition hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-cream-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-forest-400">Sem foto</div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm text-forest-700">{item.name}</p>
        <p className="mt-1 text-lg font-bold text-forest-900">
          {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        <div className="mt-1 flex items-center justify-between text-xs text-forest-400">
          <span>{itemTypeLabels[item.type] ?? item.type}</span>
          {item.size && <span>Tam. {item.size}</span>}
        </div>
      </div>
    </Link>
  )
}
