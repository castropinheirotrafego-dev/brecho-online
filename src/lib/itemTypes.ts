import type { ItemCondition, ItemType } from './database.types'

export const itemConditionLabels: Record<ItemCondition, string> = {
  novo: 'Novo',
  seminovo: 'Ótimo estado',
  usado: 'Usado',
}

export const itemConditionOptions: { value: ItemCondition; label: string }[] = (
  Object.entries(itemConditionLabels) as [ItemCondition, string][]
).map(([value, label]) => ({ value, label }))

export const itemTypeLabels: Record<ItemType, string> = {
  conjuntos: 'Conjuntos',
  'jaquetas-casacos': 'Jaquetas & Casacos',
  vestidos: 'Vestidos',
  'blusas-camisetas': 'Blusas & Camisetas',
  camisas: 'Camisas',
  shorts: 'Shorts',
  saias: 'Saias',
  calcas: 'Calças',
  sapatos: 'Sapatos',
  tenis: 'Tênis',
  botas: 'Botas',
  bolsas: 'Bolsas',
}

export const itemTypeOptions: { value: ItemType; label: string }[] = (
  Object.entries(itemTypeLabels) as [ItemType, string][]
).map(([value, label]) => ({ value, label }))

// Categorias em destaque na home (ícones circulares) — um subconjunto curado dos tipos
export const quickCategoryFilters: { value: ItemType | ''; label: string }[] = [
  { value: 'blusas-camisetas', label: 'Blusas' },
  { value: 'calcas', label: 'Calças' },
  { value: 'vestidos', label: 'Vestidos' },
  { value: 'jaquetas-casacos', label: 'Jaquetas' },
  { value: 'bolsas', label: 'Bolsas' },
  { value: 'sapatos', label: 'Sapatos' },
]

export const priceRangeOptions = [
  { value: '', label: 'Qualquer preço' },
  { value: '50', label: 'Até R$ 50' },
  { value: '100', label: 'Até R$ 100' },
  { value: '200', label: 'Até R$ 200' },
  { value: '300', label: 'Até R$ 300' },
  { value: '500', label: 'Até R$ 500' },
]

export const sizeOptions = [
  'PP',
  'P',
  'M',
  'G',
  'GG',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  'Única',
]
