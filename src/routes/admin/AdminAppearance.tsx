import { useEffect, useRef, useState } from 'react'
import { Camera, ImageIcon, Plus, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Breadcrumbs from '../../components/Breadcrumbs'
import BackButton from '../../components/BackButton'
import { quickCategoryFilters } from '../../lib/itemTypes'
import type { HeroBadge, ItemType } from '../../lib/database.types'

function normalizeBadges(raw: unknown): HeroBadge[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => (typeof item === 'string' ? { label: item, image_path: null } : (item as HeroBadge)))
}

export default function AdminAppearance() {
  const heroInputRef = useRef<HTMLInputElement>(null)
  const heroMobileInputRef = useRef<HTMLInputElement>(null)
  const [heroPath, setHeroPath] = useState<string | null>(null)
  const [heroPathMobile, setHeroPathMobile] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [badges, setBadges] = useState<HeroBadge[]>([])
  const [newBadge, setNewBadge] = useState('')
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({})
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingHeroMobile, setUploadingHeroMobile] = useState(false)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [uploadingBadge, setUploadingBadge] = useState<number | null>(null)
  const [savingText, setSavingText] = useState(false)
  const [savedText, setSavedText] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    const [{ data: settings }, { data: images }] = await Promise.all([
      supabase
        .from('site_settings')
        .select('hero_image_path, hero_image_path_mobile, hero_title, hero_subtitle, hero_button_text, hero_badges')
        .eq('id', 'default')
        .maybeSingle(),
      supabase.from('category_images').select('type, storage_path'),
    ])
    setHeroPath(settings?.hero_image_path ?? null)
    setHeroPathMobile(settings?.hero_image_path_mobile ?? null)
    setTitle(settings?.hero_title ?? 'Uma peça.\nDuas histórias.')
    setSubtitle(settings?.hero_subtitle ?? 'Roupas, sapatos e bolsas que ganham novos começos.')
    setButtonText(settings?.hero_button_text ?? 'Ver peças')
    const normalized = normalizeBadges(settings?.hero_badges)
    setBadges(
      normalized.length > 0
        ? normalized
        : [
            { label: 'Peças únicas', image_path: null },
            { label: 'Comunidade feminina', image_path: null },
            { label: 'Moda mais consciente', image_path: null },
          ],
    )
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

  async function handleBadgeImageChange(index: number, file: File | undefined) {
    if (!file) return
    setError(null)
    setUploadingBadge(index)
    try {
      const path = `site/badge-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('item-photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const nextBadges = badges.map((b, i) => (i === index ? { ...b, image_path: path } : b))
      setBadges(nextBadges)
      const { error: settingsError } = await supabase
        .from('site_settings')
        .upsert({ id: 'default', hero_badges: nextBadges })
      if (settingsError) throw settingsError
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploadingBadge(null)
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
        hero_badges: badges,
      })
      if (settingsError) throw settingsError
      setSavedText(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar texto')
    } finally {
      setSavingText(false)
    }
  }

  function addBadge() {
    const value = newBadge.trim()
    if (!value) return
    setBadges((prev) => [...prev, { label: value, image_path: null }])
    setNewBadge('')
  }

  function removeBadge(index: number) {
    setBadges((prev) => prev.filter((_, i) => i !== index))
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
          <div>
            <label className="mb-1 block text-sm text-forest-500">
              Selos (imagem circular + nome de referência)
            </label>
            <div className="mb-3 flex flex-wrap gap-4">
              {badges.map((badge, i) => {
                const badgeUrl = badge.image_path ? publicUrl(badge.image_path) : null
                const busy = uploadingBadge === i
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <label className="relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-cream-300 bg-white hover:border-forest-500">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleBadgeImageChange(i, e.target.files?.[0])}
                      />
                      {badgeUrl ? (
                        <img src={badgeUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon size={18} className="text-forest-400" />
                      )}
                      <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-forest-600 text-cream-50">
                        <Camera size={10} />
                      </span>
                    </label>
                    <input
                      value={badge.label}
                      onChange={(e) =>
                        setBadges((prev) => prev.map((b, bi) => (bi === i ? { ...b, label: e.target.value } : b)))
                      }
                      className="w-24 rounded-lg border border-cream-300 px-2 py-1 text-center text-xs outline-none focus:border-forest-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeBadge(i)}
                      className="flex items-center gap-0.5 text-xs text-forest-400 hover:text-red-600"
                    >
                      <X size={12} /> remover
                    </button>
                    {busy && <p className="text-xs text-forest-500">Enviando...</p>}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addBadge()
                  }
                }}
                placeholder="Nome do novo selo"
                className="flex-1 rounded-lg border border-cream-300 px-4 py-2 outline-none focus:border-forest-500"
              />
              <button
                type="button"
                onClick={addBadge}
                className="flex items-center gap-1 rounded-full border border-forest-600 px-4 py-2 text-sm font-medium text-forest-700 hover:bg-forest-50"
              >
                <Plus size={16} /> Adicionar
              </button>
            </div>
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
