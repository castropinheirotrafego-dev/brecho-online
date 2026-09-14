export default function DressIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 3c0 1.5 1 2 3 2s3-.5 3-2" />
      <path d="M9 3 5 8l2 2-1.5 11h13L17 10l2-2-4-5" />
      <path d="M9.5 10h5" />
    </svg>
  )
}
