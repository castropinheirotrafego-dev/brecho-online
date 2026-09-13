import { supabase } from './supabase'

export async function getAdminWhatsappUrl(message: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('phone')
    .eq('is_admin', true)
    .not('phone', 'is', null)
    .limit(1)
    .maybeSingle()

  const digits = data?.phone?.replace(/\D/g, '')
  if (!digits) return null

  const phone = digits.length <= 11 ? `55${digits}` : digits
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
