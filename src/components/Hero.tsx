import { Leaf, MapPin, Users } from 'lucide-react'
import DressIcon from './DressIcon'

const features = [
  { icon: Leaf, label: 'Consumo mais consciente' },
  { icon: MapPin, label: 'Retirada na nossa cidade' },
  { icon: Users, label: 'Atendimento personalizado' },
]

export default function Hero() {
  return (
    <section className="mb-8">
      <div className="grid gap-0 overflow-hidden rounded-3xl bg-cream-200 md:grid-cols-2">
        <div className="flex flex-col justify-center gap-5 p-8 md:p-10">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-500">
            Moda circular mais consciente
          </span>
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
          <DressIcon size={140} className="text-forest-900/15" />
          <span className="absolute right-8 top-8 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-forest-800 text-center text-[10px] font-semibold uppercase leading-tight text-cream-50">
            <Leaf size={16} className="mb-1" />
            Peças
            <br />
            Únicas
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 divide-y divide-cream-300 rounded-2xl border border-cream-300 bg-white text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {features.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center justify-center gap-2 px-4 py-4 text-center text-forest-700">
            <Icon size={18} className="flex-shrink-0 text-forest-600" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
