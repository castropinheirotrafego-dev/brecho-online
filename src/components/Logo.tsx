import LogoMark from './LogoMark'

export default function Logo() {
  return (
    <span className="flex items-center gap-1.5 sm:gap-4">
      <LogoMark className="h-8 w-auto flex-shrink-0 sm:h-24 md:h-32" />
      <span className="flex flex-col leading-none">
        <span className="whitespace-nowrap font-serif text-base font-semibold tracking-wide text-forest-900 sm:text-3xl md:text-4xl">
          PRÓXIMA DONA
        </span>
        <span className="hidden text-[10px] font-medium tracking-[0.15em] text-rosequeimado sm:block sm:text-sm">
          MODA COM NOVOS COMEÇOS
        </span>
      </span>
    </span>
  )
}
