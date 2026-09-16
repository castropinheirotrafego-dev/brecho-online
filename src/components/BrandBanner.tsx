import { useEffect, useState } from 'react'
import { Leaf, Heart, Users, Recycle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const icons = [Leaf, Heart, Users, Recycle]

const defaultHeading = 'Mais que um brechó, um movimento.'
const defaultTagline = 'Uma peça. Duas histórias.'
const defaultItems = ['Moda mais consciente', 'Impacto positivo', 'Comunidade feminina', 'Novos começos']

export default function BrandBanner() {
  const [heading, setHeading] = useState(defaultHeading)
  const [tagline, setTagline] = useState(defaultTagline)
  const [items, setItems] = useState(defaultItems)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('banner_heading, banner_tagline, banner_items')
      .eq('id', 'default')
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        if (data.banner_heading) setHeading(data.banner_heading)
        if (data.banner_tagline) setTagline(data.banner_tagline)
        if (Array.isArray(data.banner_items) && data.banner_items.length > 0) {
          setItems(data.banner_items.map((item) => item.label))
        }
      })
  }, [])

  return (
    <section className="mt-10 rounded-3xl bg-oliva p-8 text-center text-cream-50 md:p-12">
      <h2 className="font-serif text-2xl font-medium md:text-3xl">{heading}</h2>
      <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-cream-100/90">
        {items.map((label, i) => {
          const Icon = icons[i % icons.length]
          return (
            <div key={`${label}-${i}`} className="flex items-center gap-2">
              <Icon size={18} className="flex-shrink-0 text-rosequeimado" />
              <span>{label}</span>
            </div>
          )
        })}
      </div>
      <p className="mt-8 font-serif text-xl italic text-rosequeimado">
        {tagline} <span aria-hidden>♡</span>
      </p>

      <div className="mt-6 flex flex-col items-center leading-none">
        <span className="font-serif text-sm font-semibold tracking-wide text-cream-50">PRÓXIMA DONA</span>
        <span className="mt-1 text-[10px] font-medium tracking-[0.15em] text-cream-100/70">
          MODA COM NOVOS COMEÇOS
        </span>
      </div>
    </section>
  )
}
