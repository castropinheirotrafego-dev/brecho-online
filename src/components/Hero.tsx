import { useEffect, useState } from 'react'
import { Heart, Leaf } from 'lucide-react'
import { supabase } from '../lib/supabase'
import DressIcon from './DressIcon'

const features = [
  { icon: Heart, label: 'Peças selecionadas' },
  { icon: Leaf, label: 'Consumo mais consciente' },
]

export default function Hero() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('hero_image_path')
      .eq('id', 'default')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.hero_image_path) {
          setImageUrl(supabase.storage.from('item-photos').getPublicUrl(data.hero_image_path).data.publicUrl)
        }
      })
  }, [])

  return (
    <section className="mb-8">
      <div className="grid gap-0 overflow-hidden rounded-3xl bg-cream-200 md:grid-cols-2">
        <div className="flex flex-col justify-center gap-5 p-8 md:p-10">
          <h1 className="font-serif text-4xl font-medium leading-tight text-forest-900 md:text-5xl">
            Uma peça.
            <br />
            Duas <em className="italic text-forest-600">histórias.</em>
          </h1>
          <p className="max-w-sm text-forest-600">Roupas, sapatos e bolsas que ganham novos começos.</p>
          <a
            href="#catalogo"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-forest-600 px-6 py-3 font-medium text-cream-50 hover:bg-forest-700"
          >
            Ver peças <span aria-hidden>→</span>
          </a>
        </div>

        <div className="relative hidden min-h-[320px] items-center justify-center bg-cream-300 md:flex">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <DressIcon size={140} className="text-forest-900/15" />
          )}
          <span className="absolute right-8 top-8 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-oliva text-center text-[10px] font-semibold uppercase leading-tight text-cream-50">
            <Leaf size={16} className="mb-1" />
            Peças
            <br />
            Únicas
          </span>
          {!imageUrl && (
            <span className="absolute bottom-6 left-6 -rotate-3 font-serif text-sm italic text-forest-900/50">
              Mais moda, menos desperdício
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-cream-300 bg-white px-4 py-5 text-sm">
        {features.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 text-center text-forest-700">
            <Icon size={18} className="flex-shrink-0 text-rosequeimado" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
