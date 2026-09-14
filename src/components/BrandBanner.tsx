import { Leaf, Heart, Users, Recycle } from 'lucide-react'

const values = [
  { icon: Leaf, label: 'Moda mais consciente' },
  { icon: Heart, label: 'Impacto positivo' },
  { icon: Users, label: 'Comunidade feminina' },
  { icon: Recycle, label: 'Novos começos' },
]

export default function BrandBanner() {
  return (
    <section className="mt-10 rounded-3xl bg-forest-900 p-8 text-center text-cream-50 md:p-12">
      <h2 className="font-serif text-2xl font-medium md:text-3xl">Mais que um brechó, um movimento.</h2>
      <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-x-6 gap-y-4 text-left text-sm text-cream-100/90">
        {values.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={18} className="flex-shrink-0 text-forest-600" />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-8 font-serif text-xl italic text-forest-600">
        Uma peça. Duas histórias. <span aria-hidden>♡</span>
      </p>
    </section>
  )
}
