import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, ShoppingBag, MapPin, Heart, Sparkles } from 'lucide-react'
import { getAdminWhatsappUrl } from '../lib/whatsapp'

const features = [
  { icon: MapPin, label: 'Retirada na nossa cidade' },
  { icon: Heart, label: 'Atendimento personalizado' },
  { icon: Sparkles, label: 'Moda que continua a história' },
]

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
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-700">
        <ShoppingBag size={28} />
      </div>
      <h1 className="mb-1 font-serif text-2xl font-medium text-forest-900">Pedido confirmado!</h1>
      <p className="text-forest-500">
        Que bom ter você por aqui! <span aria-hidden>♡</span>
      </p>
      <p className="mt-3 text-forest-500">
        Sua compra foi registrada com sucesso. Em breve entraremos em contato pelo WhatsApp para combinar a retirada
        da sua peça.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-oliva px-4 py-3 font-medium text-white hover:bg-oliva-dark"
          >
            <MessageCircle size={18} />
            Conversar no WhatsApp
          </a>
        )}
        <Link
          to="/perfil"
          className="rounded-full border border-forest-600 px-4 py-3 font-medium text-forest-700 hover:bg-forest-50"
        >
          Ver meus pedidos
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-forest-500">
        {features.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <Icon size={18} className="text-rosequeimado" />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 font-serif text-lg italic text-forest-700">
        Uma peça. Duas histórias. <span aria-hidden>♡</span>
      </p>

      <div className="mt-4 flex flex-col items-center leading-none">
        <span className="font-serif text-sm font-semibold tracking-wide text-forest-900">PRÓXIMA DONA</span>
        <span className="mt-1 text-[10px] font-medium tracking-[0.15em] text-forest-400">
          MODA COM NOVOS COMEÇOS
        </span>
      </div>
    </div>
  )
}
