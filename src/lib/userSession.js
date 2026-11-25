import { supabase } from './supabaseClient.js'

export function getStoredUser() {
  try {
    const saved = localStorage.getItem('relink_user')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function isDemoUser(user) {
  return (
    user?.is_demo === true ||
    user?.id === 'a1111111-1111-1111-1111-111111111111' ||
    user?.id === 'w-1'
  )
}

export function hasPendingOnboarding(user) {
  if (!user?.id) return false
  if (user.onboarding_complete === true) return false
  if (user.onboarding_complete === false) return true
  try {
    if (localStorage.getItem('relink_onboarding_pending') === String(user.id)) return true
    return (
      user.id === 'w-1' &&
      localStorage.getItem('relink_demo_worker_onboarding_complete') !== 'true'
    )
  } catch {
    return false
  }
}

export async function completeOnboarding(user) {
  if (!user?.id) return
  if (user.is_demo || user.id === 'w-1') {
    try {
      if (user.id === 'w-1') {
        localStorage.setItem('relink_demo_worker_onboarding_complete', 'true')
      }
      if (localStorage.getItem('relink_onboarding_pending') === String(user.id)) {
        localStorage.removeItem('relink_onboarding_pending')
      }
    } catch (error) {
      console.warn('Gagal menyimpan status onboarding demo:', error)
    }
    return
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  const authUser = sessionData.session?.user
  if (!authUser || authUser.id !== user.id) {
    throw new Error('Sesi login tidak valid. Status onboarding belum tersimpan.')
  }

  const { error } = await supabase.auth.updateUser({
    data: { onboarding_complete: true },
  })
  if (error) throw error

  try {
    localStorage.removeItem('relink_onboarding_pending')
    localStorage.setItem(
      'relink_user',
      JSON.stringify({ ...user, onboarding_complete: true })
    )
  } catch (storageError) {
    console.warn('Status onboarding tersimpan di Supabase, tetapi cache lokal gagal diperbarui:', storageError)
  }
}
