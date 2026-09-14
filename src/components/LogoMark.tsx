export default function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={(size * 92) / 100}
      viewBox="0 0 100 92"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <text x="6" y="66" fontFamily="'Playfair Display', Georgia, serif" fontWeight="700" fontSize="62" fill="#382a25">
        P
      </text>
      <text
        x="30"
        y="66"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight="700"
        fontSize="62"
        fill="#382a25"
      >
        D
      </text>
      <path
        d="M62 20c0-5.5-4.4-10-9.5-10-3 0-5.6 1.5-7 4.1-1.4-2.6-4-4.1-7-4.1C33.4 10 29 14.5 29 20c0 3 1.5 5.6 3.9 7.6L45.5 39l12.6-11.4C60.5 25.6 62 23 62 20Z"
        fill="none"
        stroke="#b8664f"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M45.5 39v6.5" fill="none" stroke="#b8664f" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M20 78 45.5 45.5 71 78"
        fill="none"
        stroke="#b8664f"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M28 68h35" fill="none" stroke="#b8664f" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
