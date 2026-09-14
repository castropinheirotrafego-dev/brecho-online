import LogoMark from './LogoMark'

export default function Logo() {
  return (
    <span className="flex items-center gap-4">
      <LogoMark size={136} className="flex-shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-3xl font-semibold tracking-wide text-forest-900 sm:text-4xl">
          PRÓXIMA DONA
        </span>
        <span className="hidden text-sm font-medium tracking-[0.15em] text-rosequeimado sm:block">
          MODA COM NOVOS COMEÇOS
        </span>
      </span>
    </span>
  )
}
