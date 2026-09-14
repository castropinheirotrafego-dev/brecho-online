import LogoMark from './LogoMark'

export default function Logo() {
  return (
    <span className="flex items-center gap-1 sm:gap-2.5">
      <LogoMark className="h-9 w-auto flex-shrink-0 sm:h-14 md:h-16" />
      <span className="flex flex-col leading-none">
        <span className="whitespace-nowrap font-serif text-xl font-semibold tracking-wide text-oliva sm:text-2xl md:text-3xl">
          PRÓXIMA DONA
        </span>
        <span className="text-[9px] font-medium tracking-[0.1em] text-rosequeimado sm:text-[10px] sm:tracking-[0.15em]">
          MODA COM NOVOS COMEÇOS
        </span>
      </span>
    </span>
  )
}
