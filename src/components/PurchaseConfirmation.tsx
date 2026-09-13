import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { getAdminWhatsappUrl } from '../lib/whatsapp'

export default function PurchaseConfirmation({ itemName }: { itemName?: string }) {
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)

  useEffect(() => {
    const message = itemName
      ? `Olá! Acabei de comprar "${itemName}" na Próxima Dona e gostaria de combinar a entrega e o pagamento.`
      : 'Olá! Acabei de fazer uma compra na Próxima Dona e gostaria de combinar a entrega e o pagamento.'
    getAdminWhatsappUrl(message).then(setWhatsappUrl)
  }, [itemName])

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="mb-3 text-2xl font-bold text-forest-900">Pedido confirmado!</h1>
      <p className="text-forest-500">
        Combine a entrega e o pagamento pessoalmente com a administradora. Acompanhe o status no seu perfil.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
          >
            <MessageCircle size={18} />
            Conversar no WhatsApp
          </a>
        )}
        <Link
          to="/"
          className="rounded-full border border-forest-600 px-4 py-3 font-medium text-forest-700 hover:bg-forest-50"
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  )
}
