import LogoMark from './LogoMark'

export default function Logo() {
  return (
    <span className="flex items-center gap-1.5 sm:gap-2.5">
      <LogoMark className="h-11 w-auto flex-shrink-0 sm:h-14 md:h-16" />
      <span className="flex flex-col leading-none">
        <span className="whitespace-nowrap font-serif text-lg font-semibold tracking-wide text-oliva sm:text-xl md:text-2xl">
          PRÓXIMA DONA
        </span>
        <span className="hidden text-[10px] font-medium tracking-[0.15em] text-rosequeimado sm:block">
          MODA COM NOVOS COMEÇOS
        </span>
      </span>
    </span>
  )
}
