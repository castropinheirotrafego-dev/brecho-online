import { useEffect, useState } from 'react'
import { Shirt } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { ItemType } from '../lib/database.types'
import { quickCategoryFilters } from '../lib/itemTypes'

export default function CategoryQuickFilters({
  value,
  onChange,
}: {
  value: ItemType | ''
  onChange: (value: ItemType | '') => void
}) {
  const [covers, setCovers] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([
      supabase
        .from('items')
        .select('type, item_images(storage_path, position)')
        .eq('status', 'available')
        .order('created_at', { ascending: false }),
      supabase.from('category_images').select('type, storage_path'),
    ]).then(([itemsRes, categoryImagesRes]) => {
      const next: Record<string, string> = {}
      const data = itemsRes.data as { type: string; item_images: { storage_path: string; position: number }[] }[] | null
      for (const row of data ?? []) {
        if (next[row.type]) continue
        const sorted = [...(row.item_images ?? [])].sort((a, b) => a.position - b.position)
        if (sorted[0]) next[row.type] = sorted[0].storage_path
      }
      for (const row of categoryImagesRes.data ?? []) {
        next[row.type] = row.storage_path
      }
      setCovers(next)
    })
  }, [])

  return (
    <div className="mb-6 flex gap-5 overflow-x-auto pb-1">
      {quickCategoryFilters.map((opt) => {
        const active = value === opt.value
        const coverPath = covers[opt.value]
        const coverUrl = coverPath ? supabase.storage.from('item-photos').getPublicUrl(coverPath).data.publicUrl : null
        return (
          <button
            key={opt.value || 'tudo'}
            onClick={() => onChange(opt.value)}
            className="flex flex-shrink-0 flex-col items-center gap-2"
          >
            <span
              className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 ${
                active ? 'border-forest-600' : 'border-cream-300'
              }`}
            >
              {coverUrl ? (
                <img src={coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-white">
                  <Shirt size={26} className={active ? 'text-forest-700' : 'text-forest-400'} />
                </span>
              )}
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
