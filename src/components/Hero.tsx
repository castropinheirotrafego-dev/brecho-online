import { Leaf, Recycle } from 'lucide-react'
import DressIcon from './DressIcon'

const features = [
  { icon: Leaf, label: 'Moda mais consciente' },
  { icon: Recycle, label: 'Roupas que circulam mais' },
]

export default function Hero() {
  return (
    <section className="mb-8 grid gap-0 overflow-hidden rounded-3xl md:grid-cols-2">
      <div className="flex flex-col justify-between gap-6 bg-forest-900 p-8 text-cream-50 md:p-10">
        <div>
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest-100">
            Desapego que faz bem
          </span>
          <h1 className="mt-4 font-serif text-4xl font-medium leading-tight md:text-5xl">
            Seu próximo look já teve uma <em className="italic text-forest-600">história.</em>
          </h1>
          <p className="mt-4 max-w-sm text-cream-100/80">Peças usadas e prontas para viver uma nova.</p>
          <a
            href="#catalogo"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest-600 px-6 py-3 font-medium text-cream-50 hover:bg-forest-700"
          >
            Ver peças <span aria-hidden>→</span>
          </a>
        </div>

        <div className="flex gap-8 text-sm text-cream-100/90">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-start gap-2">
              <Icon size={20} className="text-forest-600" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative hidden min-h-[320px] items-center justify-center bg-cream-200 md:flex">
        <DressIcon size={140} className="text-forest-900/15" />
        <p className="absolute right-8 top-8 text-right font-serif italic leading-tight text-forest-900/70">
          desapega
          <br />
          veste
          <br />
          circula
          <br />
          transforma
        </p>
      </div>
    </section>
  )
}
