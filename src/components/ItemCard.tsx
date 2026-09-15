import { Link, useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { itemConditionLabels } from '../lib/itemTypes'
import { useAuth } from '../contexts/AuthContext'
import { useFavorites } from '../contexts/FavoritesContext'
import type { ItemCondition, ItemType } from '../lib/database.types'

export interface ItemCardData {
  id: string
  name: string
  price: number
  size: string | null
  type: ItemType
  condition: ItemCondition
  cover_path: string | null
}

export default function ItemCard({ item }: { item: ItemCardData }) {
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  const imageUrl = item.cover_path
    ? supabase.storage.from('item-photos').getPublicUrl(item.cover_path).data.publicUrl
    : null
  const favorited = isFavorite(item.id)

  function handleFavoriteClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate('/entrar')
      return
    }
    toggleFavorite(item.id)
  }

  return (
    <Link
      to={`/pecas/${item.id}`}
      className="group relative overflow-hidden rounded-2xl border border-cream-300 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-cream-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-forest-400">Sem foto</div>
        )}
        <button
          type="button"
          onClick={handleFavoriteClick}
          title={favorited ? 'Remover dos favoritos' : 'Favoritar'}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-forest-700 shadow-sm hover:bg-white"
        >
          <Heart size={16} className={favorited ? 'fill-rosequeimado text-rosequeimado' : ''} />
        </button>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-forest-900">{item.name}</p>
        <p className="mt-0.5 text-xs text-forest-400">
          {item.size ? `Tam. ${item.size} · ` : ''}
          {itemConditionLabels[item.condition]}
        </p>
        <p className="mt-1 text-lg font-bold text-forest-700">
          {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
    </Link>
  )
}
