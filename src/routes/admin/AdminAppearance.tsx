import { useEffect, useRef, useState } from 'react'
import { Camera, ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Breadcrumbs from '../../components/Breadcrumbs'
import BackButton from '../../components/BackButton'
import { quickCategoryFilters } from '../../lib/itemTypes'
import type { BannerItem, ItemType } from '../../lib/database.types'

interface CategoryEntry {
  storage_path: string | null
  label: string | null
}

export default function AdminAppearance() {
  const heroInputRef = useRef<HTMLInputElement>(null)
  const heroMobileInputRef = useRef<HTMLInputElement>(null)
  const [heroPath, setHeroPath] = useState<string | null>(null)
  const [heroPathMobile, setHeroPathMobile] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [categories, setCategories] = useState<Record<string, CategoryEntry>>({})
  const [bannerHeading, setBannerHeading] = useState('')
  const [bannerTagline, setBannerTagline] = useState('')
  const [bannerItems, setBannerItems] = useState<string[]>(['', '', '', ''])
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingHeroMobile, setUploadingHeroMobile] = useState(false)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [savingType, setSavingType] = useState<string | null>(null)
  const [savingText, setSavingText] = useState(false)
  const [savedText, setSavedText] = useState(false)
  const [savingBanner, setSavingBanner] = useState(false)
  const [savedBanner, setSavedBanner] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    const [{ data: settings }, { data: images }] = await Promise.all([
      supabase
        .from('site_settings')
        .select(
          'hero_image_path, hero_image_path_mobile, hero_title, hero_subtitle, hero_button_text, banner_heading, banner_tagline, banner_items',
        )
        .eq('id', 'default')
        .maybeSingle(),
      supabase.from('category_images').select('type, storage_path, label'),
    ])
    setHeroPath(settings?.hero_image_path ?? null)
    setHeroPathMobile(settings?.hero_image_path_mobile ?? null)
    setTitle(settings?.hero_title ?? 'Uma peça.\nDuas histórias.')
    setSubtitle(settings?.hero_subtitle ?? 'Roupas, sapatos e bolsas que ganham novos começos.')
    setButtonText(settings?.hero_button_text ?? 'Ver peças')
    setBannerHeading(settings?.banner_heading ?? 'Mais que um brechó, um movimento.')
    setBannerTagline(settings?.banner_tagline ?? 'Uma peça. Duas histórias.')
    const defaultBannerItems = ['Moda mais consciente', 'Impacto positivo', 'Comunidade feminina', 'Novos começos']
    const savedBannerItems = settings?.banner_items as BannerItem[] | undefined
    setBannerItems(
      savedBannerItems && savedBannerItems.length > 0
        ? savedBannerItems.map((item) => item.label)
        : defaultBannerItems,
    )
    const next: Record<string, CategoryEntry> = {}
    for (const row of images ?? []) {
      next[row.type] = { storage_path: row.storage_path, label: row.label }
    }
    setCategories(next)
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

  async function handleHeroMobileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploadingHeroMobile(true)
    try {
      const path = `site/hero-mobile-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('item-photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { error: settingsError } = await supabase
        .from('site_settings')
        .upsert({ id: 'default', hero_image_path_mobile: path })
      if (settingsError) throw settingsError
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploadingHeroMobile(false)
    }
  }

  async function handleCategoryImageChange(type: ItemType, file: File | undefined) {
    if (!file) return
    setError(null)
    setUploadingType(type)
    try {
      const path = `site/category-${type}-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('item-photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { error: upsertError } = await supabase
        .from('category_images')
        .upsert({ type, storage_path: path, label: categories[type]?.label ?? null })
      if (upsertError) throw upsertError
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploadingType(null)
    }
  }

  function handleCategoryLabelChange(type: ItemType, label: string) {
    setCategories((prev) => ({ ...prev, [type]: { storage_path: prev[type]?.storage_path ?? null, label } }))
  }

  async function saveCategoryLabel(type: ItemType) {
    setError(null)
    setSavingType(type)
    try {
      const entry = categories[type]
      const { error: upsertError } = await supabase
        .from('category_images')
        .upsert({ type, storage_path: entry?.storage_path ?? null, label: entry?.label || null })
      if (upsertError) throw upsertError
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar nome da categoria')
    } finally {
      setSavingType(null)
    }
  }

  async function handleSaveText(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSavingText(true)
    setSavedText(false)
    try {
      const { error: settingsError } = await supabase.from('site_settings').upsert({
        id: 'default',
        hero_title: title,
        hero_subtitle: subtitle,
        hero_button_text: buttonText,
      })
      if (settingsError) throw settingsError
      setSavedText(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar texto')
    } finally {
      setSavingText(false)
    }
  }

  async function handleSaveBanner(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSavingBanner(true)
    setSavedBanner(false)
    try {
      const { error: settingsError } = await supabase.from('site_settings').upsert({
        id: 'default',
        banner_heading: bannerHeading,
        banner_tagline: bannerTagline,
        banner_items: bannerItems.map((label) => ({ label })),
      })
      if (settingsError) throw settingsError
      setSavedBanner(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar bloco de valores')
    } finally {
      setSavingBanner(false)
    }
  }

  return (
    <div>
      <BackButton />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Admin' }, { label: 'Aparência' }]} />
      <h1 className="mb-6 text-2xl font-bold text-forest-900">Aparência do site</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <section className="mb-10">
        <h2 className="mb-1 text-xl font-semibold text-forest-900">"Uma peça. Duas histórias."</h2>
        <p className="mb-4 text-sm text-forest-500">
          Bloco de destaque da página inicial — imagem, título, texto, botão e selos. As imagens de PC e celular são
          independentes; se só uma for definida, ela é usada nas duas telas.
        </p>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-forest-500">Imagem de fundo — PC</label>
            <input ref={heroInputRef} type="file" accept="image/*" onChange={handleHeroChange} className="hidden" />
            <button
              type="button"
              onClick={() => heroInputRef.current?.click()}
              disabled={uploadingHero}
              className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50 text-forest-600 hover:bg-cream-100 disabled:opacity-50"
            >
              {heroPath ? (
                <img src={publicUrl(heroPath)} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2">
                  <ImageIcon size={28} />
                  <span className="text-sm font-medium">
                    {uploadingHero ? 'Enviando...' : 'Adicionar imagem (PC)'}
                  </span>
                </span>
              )}
              <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-cream-50 shadow">
                <Camera size={14} />
              </span>
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm text-forest-500">Imagem de fundo — Celular</label>
            <input
              ref={heroMobileInputRef}
              type="file"
              accept="image/*"
              onChange={handleHeroMobileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => heroMobileInputRef.current?.click()}
              disabled={uploadingHeroMobile}
              className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50 text-forest-600 hover:bg-cream-100 disabled:opacity-50"
            >
              {heroPathMobile ? (
                <img src={publicUrl(heroPathMobile)} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2">
                  <ImageIcon size={28} />
                  <span className="text-sm font-medium">
                    {uploadingHeroMobile ? 'Enviando...' : 'Adicionar imagem (celular)'}
                  </span>
                </span>
              )}
              <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-cream-50 shadow">
                <Camera size={14} />
              </span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveText} className="flex max-w-lg flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-forest-500">Título (uma linha por frase)</label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-forest-500">Texto</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-forest-500">Texto do botão</label>
            <input
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              className="w-full rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
            />
          </div>
          <button
            type="submit"
            disabled={savingText}
            className="w-fit rounded-full bg-forest-600 px-5 py-2 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
          >
            {savingText ? 'Salvando...' : 'Salvar'}
          </button>
          {savedText && <p className="text-sm text-green-700">Salvo!</p>}
        </form>
      </section>

      <section className="mb-10">
        <h2 className="mb-1 text-xl font-semibold text-forest-900">Categorias</h2>
        <p className="mb-4 text-sm text-forest-500">
          Nome e foto de cada círculo em "Categorias" na página inicial. Quando não há foto definida aqui, o site usa
          a foto da primeira peça disponível daquele tipo.
        </p>
        <div className="flex flex-wrap gap-6">
          {quickCategoryFilters.map((opt) => {
            const type = opt.value as ItemType
            const entry = categories[type]
            const path = entry?.storage_path
            const busyImage = uploadingType === type
            const busyLabel = savingType === type
            return (
              <div key={opt.value} className="flex w-24 flex-col items-center gap-2">
                <label className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-cream-300 bg-white hover:border-forest-500">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleCategoryImageChange(type, e.target.files?.[0])}
                  />
                  {path ? (
                    <img src={publicUrl(path)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon size={22} className="text-forest-400" />
                  )}
                  <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-forest-600 text-cream-50">
                    <Camera size={12} />
                  </span>
                </label>
                <span className="text-xs text-forest-400">{busyImage ? 'Enviando...' : ''}</span>
                <input
                  value={entry?.label ?? ''}
                  placeholder={opt.label}
                  onChange={(e) => handleCategoryLabelChange(type, e.target.value)}
                  onBlur={() => saveCategoryLabel(type)}
                  className="w-full rounded-lg border border-cream-300 px-2 py-1 text-center text-xs outline-none focus:border-forest-500"
                />
                {busyLabel && <span className="text-xs text-forest-400">Salvando...</span>}
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-xl font-semibold text-forest-900">"Mais que um brechó, um movimento."</h2>
        <p className="mb-4 text-sm text-forest-500">
          Bloco de valores no final da página inicial — título, os 4 itens e a frase de assinatura.
        </p>
        <form onSubmit={handleSaveBanner} className="flex max-w-lg flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-forest-500">Título</label>
            <input
              value={bannerHeading}
              onChange={(e) => setBannerHeading(e.target.value)}
              className="w-full rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {bannerItems.map((item, i) => (
              <input
                key={i}
                value={item}
                onChange={(e) =>
                  setBannerItems((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                }
                className="rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
              />
            ))}
          </div>
          <div>
            <label className="mb-1 block text-sm text-forest-500">Frase de assinatura</label>
            <input
              value={bannerTagline}
              onChange={(e) => setBannerTagline(e.target.value)}
              className="w-full rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
            />
          </div>
          <button
            type="submit"
            disabled={savingBanner}
            className="w-fit rounded-full bg-forest-600 px-5 py-2 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
          >
            {savingBanner ? 'Salvando...' : 'Salvar'}
          </button>
          {savedBanner && <p className="text-sm text-green-700">Salvo!</p>}
        </form>
      </section>
    </div>
  )
}
