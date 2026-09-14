import { useEffect, useRef, useState } from 'react'
import { Camera, ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Breadcrumbs from '../../components/Breadcrumbs'
import BackButton from '../../components/BackButton'
import { quickCategoryFilters } from '../../lib/itemTypes'
import type { ItemType } from '../../lib/database.types'

export default function AdminAppearance() {
  const heroInputRef = useRef<HTMLInputElement>(null)
  const [heroPath, setHeroPath] = useState<string | null>(null)
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({})
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    const [{ data: settings }, { data: images }] = await Promise.all([
      supabase.from('site_settings').select('hero_image_path').eq('id', 'default').maybeSingle(),
      supabase.from('category_images').select('type, storage_path'),
    ])
    setHeroPath(settings?.hero_image_path ?? null)
    const next: Record<string, string> = {}
    for (const row of images ?? []) next[row.type] = row.storage_path
    setCategoryImages(next)
  }

  useEffect(() => {
    loadData()
  }, [])

  function publicUrl(path: string) {
    return supabase.storage.from('item-photos').getPublicUrl(path).data.publicUrl
  }

  async function handleHeroChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploadingHero(true)
    try {
      const path = `site/hero-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('item-photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { error: settingsError } = await supabase
        .from('site_settings')
        .upsert({ id: 'default', hero_image_path: path })
      if (settingsError) throw settingsError
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploadingHero(false)
    }
  }

  async function handleCategoryChange(type: ItemType, file: File | undefined) {
    if (!file) return
    setError(null)
    setUploadingType(type)
    try {
      const path = `site/category-${type}-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('item-photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { error: upsertError } = await supabase.from('category_images').upsert({ type, storage_path: path })
      if (upsertError) throw upsertError
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploadingType(null)
    }
  }

  return (
    <div>
      <BackButton />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Admin' }, { label: 'Aparência' }]} />
      <h1 className="mb-6 text-2xl font-bold text-forest-900">Aparência do site</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <section className="mb-10">
        <h2 className="mb-1 text-xl font-semibold text-forest-900">Imagem de fundo — "Uma peça. Duas histórias."</h2>
        <p className="mb-4 text-sm text-forest-500">
          Aparece ao lado do texto de destaque na página inicial (só some no mobile).
        </p>
        <input ref={heroInputRef} type="file" accept="image/*" onChange={handleHeroChange} className="hidden" />
        <button
          type="button"
          onClick={() => heroInputRef.current?.click()}
          disabled={uploadingHero}
          className="relative flex h-48 w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50 text-forest-600 hover:bg-cream-100 disabled:opacity-50"
        >
          {heroPath ? (
            <img src={publicUrl(heroPath)} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2">
              <ImageIcon size={28} />
              <span className="text-sm font-medium">
                {uploadingHero ? 'Enviando...' : 'Adicionar imagem de fundo'}
              </span>
            </span>
          )}
          <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-cream-50 shadow">
            <Camera size={14} />
          </span>
        </button>
      </section>

      <section>
        <h2 className="mb-1 text-xl font-semibold text-forest-900">Fotos das categorias</h2>
        <p className="mb-4 text-sm text-forest-500">
          Usadas nos círculos de "Categorias" na página inicial. Quando não há foto definida aqui, o site usa a foto
          da primeira peça disponível daquele tipo.
        </p>
        <div className="flex flex-wrap gap-6">
          {quickCategoryFilters.map((opt) => {
            const path = categoryImages[opt.value]
            const busy = uploadingType === opt.value
            return (
              <label key={opt.value} className="flex flex-col items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleCategoryChange(opt.value as ItemType, e.target.files?.[0])}
                />
                <span className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-cream-300 bg-white hover:border-forest-500">
                  {path ? (
                    <img src={publicUrl(path)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon size={22} className="text-forest-400" />
                  )}
                  <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-forest-600 text-cream-50">
                    <Camera size={12} />
                  </span>
                </span>
                <span className="text-xs text-forest-600">{busy ? 'Enviando...' : opt.label}</span>
              </label>
            )
          })}
        </div>
      </section>
    </div>
  )
}
