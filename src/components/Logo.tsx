import LogoMark from './LogoMark'

export default function Logo() {
  return (
    <span className="flex items-center gap-1.5 sm:flex-col sm:gap-3">
      <LogoMark className="h-9 w-auto flex-shrink-0 sm:h-40 md:h-56" />
      <span className="flex flex-col leading-none sm:items-center">
        <span className="whitespace-nowrap font-serif text-base font-semibold tracking-wide text-forest-900 sm:text-3xl md:text-4xl">
          PRÓXIMA DONA
        </span>
        <span className="hidden text-[10px] font-medium tracking-[0.15em] text-rosequeimado sm:mt-1 sm:block sm:text-sm">
          MODA COM NOVOS COMEÇOS
        </span>
      </span>
    </span>
  )
}
