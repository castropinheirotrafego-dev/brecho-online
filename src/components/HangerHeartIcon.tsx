export default function HangerHeartIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 4.5c-.9-1.2-2.6-1.4-3.6-.4-1 1-.9 2.6.2 3.7L12 11l3.4-3.2c1.1-1.1 1.2-2.7.2-3.7-1-1-2.7-.8-3.6.4Z" />
      <path d="M12 11v1.6" />
      <path d="M3 20.5 12 12.6l9 7.9" />
      <path d="M6.5 17.5h11" />
    </svg>
  )
}
