// Supabase Client для админ-панели
import { createClient } from '@supabase/supabase-js'

// Конфигурация (та же что и в desktop-app)
const SUPABASE_URL = 'https://wwqhsmckvmfquezfsyds.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_-ohfdIC9yMQMUzXJ54cKTg_GNDXnNgm'

// Создание клиента
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Проверка роли администратора
export async function isAdmin() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile && (profile.role === 'admin' || profile.role === 'superadmin')
}

// Получить текущего пользователя
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// Выход
export async function signOut() {
  await supabase.auth.signOut()
}
