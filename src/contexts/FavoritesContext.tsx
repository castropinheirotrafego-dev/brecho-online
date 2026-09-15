import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface FavoritesContextValue {
  favoriteIds: Set<string>
  count: number
  isFavorite: (itemId: string) => boolean
  toggleFavorite: (itemId: string) => Promise<void>
  refresh: () => void
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  const refresh = useCallback(() => {
    if (!user) {
      setFavoriteIds(new Set())
      return
    }
    supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', user.id)
      .then(({ data }) => setFavoriteIds(new Set((data ?? []).map((row) => row.item_id))))
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function toggleFavorite(itemId: string) {
    if (!user) return
    const isFav = favoriteIds.has(itemId)
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (isFav) next.delete(itemId)
      else next.add(itemId)
      return next
    })
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('item_id', itemId)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, item_id: itemId })
    }
  }

  function isFavorite(itemId: string) {
    return favoriteIds.has(itemId)
  }

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, count: favoriteIds.size, isFavorite, toggleFavorite, refresh }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites deve ser usado dentro de FavoritesProvider')
  return ctx
}
