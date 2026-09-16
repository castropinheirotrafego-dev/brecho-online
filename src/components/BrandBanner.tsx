import { Leaf, Heart, Users, Recycle } from 'lucide-react'

const values = [
  { icon: Leaf, label: 'Moda mais consciente' },
  { icon: Heart, label: 'Impacto positivo' },
  { icon: Users, label: 'Comunidade feminina' },
  { icon: Recycle, label: 'Novos começos' },
]

export default function BrandBanner() {
  return (
    <section className="mt-10 rounded-3xl bg-oliva p-8 text-center text-cream-50 md:p-12">
      <h2 className="font-serif text-2xl font-medium md:text-3xl">Mais que um brechó, um movimento.</h2>
      <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-cream-100/90">
        {values.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={18} className="flex-shrink-0 text-rosequeimado" />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-8 font-serif text-xl italic text-rosequeimado">
        Uma peça. Duas histórias. <span aria-hidden>♡</span>
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
