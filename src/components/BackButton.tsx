import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ label = 'Voltar' }: { label?: string }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(-1)}
      className="mb-4 flex items-center gap-1 text-sm font-medium text-forest-600 hover:text-forest-800"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  )
}
