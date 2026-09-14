import { supabase } from './supabase'

export async function getAdminPhoneDigits(): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('phone')
    .eq('is_admin', true)
    .not('phone', 'is', null)
    .limit(1)
    .maybeSingle()

  const digits = data?.phone?.replace(/\D/g, '')
  if (!digits) return null

  return digits.length <= 11 ? `55${digits}` : digits
}

export function buildWhatsappUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`
}

export async function getAdminWhatsappUrl(message: string): Promise<string | null> {
  const phone = await getAdminPhoneDigits()
  if (!phone) return null
  return buildWhatsappUrl(phone, message)
}
