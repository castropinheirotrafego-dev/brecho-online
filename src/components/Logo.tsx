import LogoMark from './LogoMark'

export default function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark size={34} className="flex-shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-lg font-semibold tracking-wide text-forest-900">PRÓXIMA DONA</span>
        <span className="hidden text-[10px] font-medium tracking-[0.15em] text-rosequeimado sm:block">
          MODA COM NOVOS COMEÇOS
        </span>
      </span>
    </span>
  )
}
