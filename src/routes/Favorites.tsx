import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useFavorites } from '../contexts/FavoritesContext'
import ItemCard, { type ItemCardData } from '../components/ItemCard'
import Breadcrumbs from '../components/Breadcrumbs'
import BackButton from '../components/BackButton'

export default function Favorites() {
  const { user } = useAuth()
  const { favoriteIds } = useFavorites()
  const [items, setItems] = useState<ItemCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('favorites')
      .select('item:items(id, name, price, size, type, condition, status, item_images(storage_path, position))')
      .eq('user_id', user.id)
      .then(({ data }) => {
        const parsed = (data ?? [])
          .map((row: any) => (Array.isArray(row.item) ? row.item[0] : row.item))
          .filter((item: any) => item)
          .map((item: any) => {
            const images = (item.item_images ?? []) as { storage_path: string; position: number }[]
            const sorted = [...images].sort((a, b) => a.position - b.position)
            return {
              id: item.id,
              name: item.name,
              price: item.price,
              size: item.size,
              type: item.type,
              condition: item.condition,
              cover_path: sorted[0]?.storage_path ?? null,
            }
          })
        setItems(parsed)
        setLoading(false)
      })
  }, [user, favoriteIds])

  return (
    <div>
      <BackButton />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Favoritas' }]} />
      <h1 className="mb-6 text-2xl font-bold text-forest-900">Minhas favoritas</h1>

      {loading ? (
        <p className="py-10 text-center text-forest-400">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-forest-400">Você ainda não favoritou nenhuma peça.</p>
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
