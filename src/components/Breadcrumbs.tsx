import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface Crumb {
  label: string
  to?: string
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-forest-500">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1">
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-forest-700 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-forest-900' : ''}>{item.label}</span>
            )}
            {!isLast && <ChevronRight size={14} className="text-forest-400" />}
          </span>
        )
      })}
    </nav>
  )
}
