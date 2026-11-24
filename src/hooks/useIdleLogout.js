import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient.js'

// Durasi idle timeout: 10 menit (600.000 ms)
export const IDLE_TIMEOUT_MS = 10 * 60 * 1000

/**
 * Hook untuk otomatis logout ketika pengguna idle / meninggalkan website lebih dari 10 menit
 * @param {boolean} isLoggedIn - Apakah pengguna sedang memiliki sesi login aktif
 * @param {'pekerja' | 'umkm' | null} role - Peran akun aktif untuk pengalihan login yang tepat
 */
export function useIdleLogout(isLoggedIn, role) {
  const isLoggingOutRef = useRef(false)

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.removeItem('relink_last_activity')
      return
    }

    // Set waktu aktivitas awal jika belum ada
    if (!localStorage.getItem('relink_last_activity')) {
      localStorage.setItem('relink_last_activity', Date.now().toString())
    }

    const handleAutoLogout = async () => {
      if (isLoggingOutRef.current) return
      isLoggingOutRef.current = true

      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.warn('Auto logout signout error:', e)
      }

      localStorage.removeItem('relink_user')
      localStorage.removeItem('relink_last_activity')
      sessionStorage.removeItem('relink_client_menu')
      sessionStorage.removeItem('relink_worker_menu')

      const targetPeran = role === 'pekerja' || role === 'mitra' ? 'pekerja' : 'umkm'
      window.location.href = `/masuk?peran=${targetPeran}&idle_timeout=true`
    }

    let lastRecordTime = 0
    const recordActivity = () => {
      const now = Date.now()
      // Throttle update localStorage setiap minimal 3 detik untuk performa optimal
      if (now - lastRecordTime > 3000) {
        lastRecordTime = now
        localStorage.setItem('relink_last_activity', now.toString())
      }
    }

    const checkIdle = () => {
      const stored = localStorage.getItem('relink_last_activity')
      if (!stored) {
        localStorage.setItem('relink_last_activity', Date.now().toString())
        return
      }
      const lastActivity = parseInt(stored, 10)
      if (Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
        handleAutoLogout()
      }
    }

    // Event listener aktivitas pengguna
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach((evt) => {
      window.addEventListener(evt, recordActivity, { passive: true })
    })

    // Deteksi saat pengguna kembali membuka tab website setelah ditinggal
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkIdle()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Pengecekan interval berkala setiap 10 detik
    const intervalId = setInterval(checkIdle, 10000)

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, recordActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(intervalId)
    }
  }, [isLoggedIn, role])
}
