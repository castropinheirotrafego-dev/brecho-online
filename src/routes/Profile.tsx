import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, LayoutDashboard, LogOut, Tag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Breadcrumbs from '../components/Breadcrumbs'
import BackButton from '../components/BackButton'

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name)
      setPhone(profile.phone)
    }
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSaved(false)
    await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setAvatarError(null)
    setUploadingAvatar(true)
    try {
      const path = `${user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)
      if (updateError) throw updateError
      await refreshProfile()
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Erro ao enviar foto')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div>
      <BackButton />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Meu perfil' }]} />
      <h1 className="mb-6 text-2xl font-bold text-forest-900">Meu perfil</h1>

      <div className="mb-8 flex flex-col items-center">
        <div className="relative">
          <div className="h-60 w-60 overflow-hidden rounded-full border border-cream-300 bg-cream-200">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-serif text-6xl text-forest-500">
                {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-forest-600 text-cream-50 shadow hover:bg-forest-700 disabled:opacity-50"
            title="Alterar foto de perfil"
          >
            <Camera size={20} />
          </button>
        </div>
        <p className="mt-4 text-center font-serif text-4xl font-semibold text-forest-900">{profile?.full_name}</p>
        <p className="mt-1 text-sm text-forest-500">{uploadingAvatar ? 'Enviando foto...' : 'Foto de perfil'}</p>
      </div>
      {avatarError && <p className="mb-4 text-center text-sm text-red-600">{avatarError}</p>}

      <form onSubmit={handleSave} className="mb-10 flex max-w-md flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-forest-500">Nome</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-forest-500">E-mail</label>
          <p className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-2 text-forest-700">
            {profile?.email}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm text-forest-500">Telefone / WhatsApp</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-cream-300 bg-white px-4 py-2 outline-none focus:border-forest-500"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-forest-600 px-4 py-2 font-medium text-cream-50 hover:bg-forest-700 disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
        {saved && <p className="text-sm text-green-700">Perfil atualizado!</p>}
      </form>

      {profile?.is_admin && (
        <div className="mb-10 flex flex-col gap-2">
          <h2 className="mb-1 text-xl font-semibold text-forest-900">Painel administrativo</h2>
          <Link
            to="/admin/pecas"
            className="flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-4 py-2.5 text-forest-700"
          >
            <LayoutDashboard size={18} /> Publicar / gerenciar peças
          </Link>
          <Link
            to="/admin/ofertas"
            className="flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-4 py-2.5 text-forest-700"
          >
            <Tag size={18} /> Ofertas recebidas
          </Link>
          <Link
            to="/admin/pedidos"
            className="flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-4 py-2.5 text-forest-700"
          >
            Pedidos
          </Link>
          <Link
            to="/admin/aparencia"
            className="flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-4 py-2.5 text-forest-700"
          >
            <Camera size={18} /> Aparência do site
          </Link>
        </div>
      )}

      <button
        onClick={handleSignOut}
        className="mt-4 flex items-center gap-2 text-sm font-medium text-forest-500 hover:text-red-600"
      >
        <LogOut size={16} />
        Sair da conta
      </button>
    </div>
  )
}
