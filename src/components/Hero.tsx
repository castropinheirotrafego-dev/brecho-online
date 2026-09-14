import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import DressIcon from './DressIcon'

const defaultTitle = 'Uma peça.\nDuas histórias.'
const defaultSubtitle = 'Roupas, sapatos e bolsas que ganham novos começos.'
const defaultButtonText = 'Ver peças'
const defaultBadges = ['Peças únicas', 'Comunidade feminina', 'Moda mais consciente']

function badgeEmoji(label: string) {
  const value = label.toLowerCase()
  if (value.includes('únic') || value.includes('unic')) return '✨'
  if (value.includes('comunidade') || value.includes('feminin')) return '🤝'
  if (value.includes('consciente') || value.includes('moda') || value.includes('sustent')) return '🌱'
  return '♡'
}

export default function Hero() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [title, setTitle] = useState(defaultTitle)
  const [subtitle, setSubtitle] = useState(defaultSubtitle)
  const [buttonText, setButtonText] = useState(defaultButtonText)
  const [badges, setBadges] = useState<string[]>(defaultBadges)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('hero_image_path, hero_title, hero_subtitle, hero_button_text, hero_badges')
      .eq('id', 'default')
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        if (data.hero_image_path) {
          setImageUrl(supabase.storage.from('item-photos').getPublicUrl(data.hero_image_path).data.publicUrl)
        }
        if (data.hero_title) setTitle(data.hero_title)
        if (data.hero_subtitle) setSubtitle(data.hero_subtitle)
        if (data.hero_button_text) setButtonText(data.hero_button_text)
        if (data.hero_badges && data.hero_badges.length > 0) setBadges(data.hero_badges)
      })
  }, [])

  const titleLines = title.split('\n')

  return (
    <section className="relative mb-8 flex min-h-[420px] w-full flex-col justify-end overflow-hidden rounded-3xl bg-cream-200">
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-forest-900/20 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <DressIcon size={160} className="text-forest-900/10" />
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-5 p-8 md:p-12">
        <h1
          className={`font-serif text-4xl font-medium leading-tight md:text-5xl ${
            imageUrl ? 'text-cream-50' : 'text-forest-900'
          }`}
        >
          {titleLines.map((line, i) => (
            <span key={i}>
              {i === titleLines.length - 1 ? (
                <em className={`italic ${imageUrl ? 'text-rosequeimado' : 'text-forest-600'}`}>{line}</em>
              ) : (
                line
              )}
              {i < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className={`max-w-sm ${imageUrl ? 'text-cream-100' : 'text-forest-600'}`}>{subtitle}</p>
        <a
          href="#catalogo"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-forest-600 px-6 py-3 font-medium text-cream-50 hover:bg-forest-700"
        >
          {buttonText} <span aria-hidden>→</span>
        </a>

        {badges.length > 0 && (
          <div className="flex flex-col gap-3">
            {badges.map((badge) => (
              <span
                key={badge}
                className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-full bg-oliva p-1.5 text-center text-[9px] font-bold uppercase leading-tight tracking-wide text-cream-50 shadow-sm"
              >
                <span aria-hidden className="text-sm leading-none">
                  {badgeEmoji(badge)}
                </span>
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
