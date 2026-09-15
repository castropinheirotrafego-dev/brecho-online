import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import DressIcon from './DressIcon'
import type { HeroBadge } from '../lib/database.types'

const defaultTitle = 'Uma peça.\nDuas histórias.'
const defaultSubtitle = 'Roupas, sapatos e bolsas que ganham novos começos.'
const defaultButtonText = 'Explorar peças'
const defaultBadges: HeroBadge[] = [
  { label: 'Peças únicas', image_path: null },
  { label: 'Comunidade feminina', image_path: null },
  { label: 'Moda mais consciente', image_path: null },
]

function badgeEmoji(label: string) {
  const value = label.toLowerCase()
  if (value.includes('únic') || value.includes('unic')) return '✨'
  if (value.includes('comunidade') || value.includes('feminin')) return '🤝'
  if (value.includes('consciente') || value.includes('moda') || value.includes('sustent')) return '🌱'
  return '♡'
}

// Aceita o formato antigo (array de strings) para não quebrar dados já salvos
function normalizeBadges(raw: unknown): HeroBadge[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) =>
    typeof item === 'string' ? { label: item, image_path: null } : (item as HeroBadge),
  )
}

export default function Hero() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [mobileImageUrl, setMobileImageUrl] = useState<string | null>(null)
  const [title, setTitle] = useState(defaultTitle)
  const [subtitle, setSubtitle] = useState(defaultSubtitle)
  const [buttonText, setButtonText] = useState(defaultButtonText)
  const [badges, setBadges] = useState<HeroBadge[]>(defaultBadges)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('hero_image_path, hero_image_path_mobile, hero_title, hero_subtitle, hero_button_text, hero_badges')
      .eq('id', 'default')
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        if (data.hero_image_path) {
          setImageUrl(supabase.storage.from('item-photos').getPublicUrl(data.hero_image_path).data.publicUrl)
        }
        if (data.hero_image_path_mobile) {
          setMobileImageUrl(
            supabase.storage.from('item-photos').getPublicUrl(data.hero_image_path_mobile).data.publicUrl,
          )
        }
        if (data.hero_title) setTitle(data.hero_title)
        if (data.hero_subtitle) setSubtitle(data.hero_subtitle)
        if (data.hero_button_text) setButtonText(data.hero_button_text)
        const normalized = normalizeBadges(data.hero_badges)
        if (normalized.length > 0) setBadges(normalized)
      })
  }, [])

  const titleLines = title.split('\n')
  const hasImage = Boolean(imageUrl || mobileImageUrl)

  function renderBadge(badge: HeroBadge, i: number) {
    const badgeImageUrl = badge.image_path
      ? supabase.storage.from('item-photos').getPublicUrl(badge.image_path).data.publicUrl
      : null
    return (
      <span
        key={`${badge.label}-${i}`}
        className={`flex h-[74px] w-[74px] flex-shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-full text-center text-[9px] font-bold uppercase leading-tight tracking-wide shadow-sm sm:h-20 sm:w-20 sm:text-[10px] ${
          badgeImageUrl ? '' : 'bg-oliva p-2 text-cream-50'
        }`}
      >
        {badgeImageUrl ? (
          <img src={badgeImageUrl} alt={badge.label} className="h-full w-full object-cover" />
        ) : (
          <>
            <span aria-hidden className="text-base leading-none sm:text-lg">
              {badgeEmoji(badge.label)}
            </span>
            {badge.label}
          </>
        )}
      </span>
    )
  }

  return (
    <section className="relative -mx-4 -mt-6 mb-8 flex min-h-[336px] w-auto flex-col justify-end overflow-hidden rounded-none bg-cream-200 sm:mx-0 sm:mt-0 sm:min-h-[420px] sm:w-full sm:rounded-3xl">
      {hasImage ? (
        <>
          <img
            src={mobileImageUrl ?? imageUrl ?? undefined}
            alt=""
            className="absolute inset-0 h-full w-full object-cover md:hidden"
          />
          <img
            src={imageUrl ?? mobileImageUrl ?? undefined}
            alt=""
            className="absolute inset-0 hidden h-full w-full object-cover md:block"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-forest-900/20 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <DressIcon size={160} className="text-forest-900/10" />
        </div>
      )}

      {badges.length > 0 && (
        <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-4 md:flex lg:right-10">
          {badges.map((badge, i) => renderBadge(badge, i))}
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-5 p-8 md:max-w-md md:p-12">
        <h1
          className={`font-serif text-4xl font-medium leading-tight md:text-5xl ${
            hasImage ? 'text-cream-50' : 'text-forest-900'
          }`}
        >
          {titleLines.map((line, i) => (
            <span key={i}>
              {i === titleLines.length - 1 ? (
                <em className={`italic ${hasImage ? 'text-rosequeimado' : 'text-forest-600'}`}>{line}</em>
              ) : (
                line
              )}
              {i < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className={`max-w-sm ${hasImage ? 'text-cream-100' : 'text-forest-600'}`}>{subtitle}</p>
        <a
          href="#catalogo"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-forest-600 px-6 py-3 font-medium text-cream-50 hover:bg-forest-700"
        >
          {buttonText} <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  )
}
