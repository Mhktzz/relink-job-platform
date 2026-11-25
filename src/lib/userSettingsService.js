import { supabase } from './supabaseClient.js'

async function requireCurrentUser(userId) {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  const user = data.session?.user
  if (!user || user.id !== userId) {
    throw new Error('Sesi login tidak valid. Silakan masuk kembali.')
  }
  return user
}

export async function fetchUserSettings(userId) {
  await requireCurrentUser(userId)

  const { data, error } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data?.settings || {}
}

export async function saveUserSettings(userId, settings) {
  await requireCurrentUser(userId)

  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: userId,
      settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) throw error
}
