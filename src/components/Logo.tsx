export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-forest-700 font-serif text-sm font-semibold text-forest-900">
        PD
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-lg font-semibold tracking-wide text-forest-900">PRÓXIMA DONA</span>
        <span className="hidden text-[10px] font-medium tracking-[0.15em] text-forest-400 sm:block">
          MODA COM NOVOS COMEÇOS
        </span>
      </span>
    </span>
  )
}
