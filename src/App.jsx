import { useEffect } from 'react'
import FairAccessSection from './components/landing-page/FairAccessSection.jsx'
import FinalCta from './components/landing-page/FinalCta.jsx'
import Footer from './components/landing-page/Footer.jsx'
import HeroSection from './components/landing-page/HeroSection.jsx'
import HowItWorksSection from './components/landing-page/HowItWorksSection.jsx'
import Navbar from './components/landing-page/Navbar.jsx'
import TrustLevelsSection from './components/landing-page/TrustLevelsSection.jsx'
import VerificationSection from './components/landing-page/VerificationSection.jsx'
import WorkerLandingPage from './components/landing-page/WorkerLandingPage.jsx'
import AuthPage from './components/auth/AuthPage.jsx'
import ClientDashboard from './components/dashboard-perusahaan/ClientDashboard.jsx'
import WorkerDashboard from './components/dashboard-pekerja/WorkerDashboard.jsx'
import { useIdleLogout } from './hooks/useIdleLogout.js'
import './App.css'

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
  const searchParams = new URLSearchParams(window.location.search)
  const portalParam = searchParams.get('portal')

  const userSession = (() => {
    try {
      const saved = localStorage.getItem('relink_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })()
  const isWorkerRole = userSession?.role === 'mitra' || userSession?.role === 'pekerja'
  const isClientRole = userSession?.role === 'klien' || userSession?.role === 'umkm'

  // Fitur Idle Auto-Logout (1 jam tanpa aktivitas pada sesi login aktif)
  const isLoggedIn = Boolean(userSession && (isWorkerRole || isClientRole))
  const activeRole = isWorkerRole ? 'pekerja' : isClientRole ? 'umkm' : null
  useIdleLogout(isLoggedIn, activeRole)

  const workerDashboardDirect =
    pathname === '/dashboard-pekerja' || pathname === '/mitra' || pathname === '/pekerja/dashboard'
  const clientDashboardDirect =
    pathname === '/dashboard-umkm' || pathname === '/klien' || pathname === '/admin'
  const workerPage = pathname === '/pekerja'
  const dashboardPage = pathname === '/dashboard'

  const isResetPassword =
    pathname === '/reset-password' ||
    searchParams.get('reset') === 'true' ||
    window.location.hash.includes('type=recovery')
  const authMode = pathname === '/masuk' ? 'login' : pathname === '/daftar' ? 'signup' : isResetPassword ? 'reset-password' : null
  const requestedRole = searchParams.get('peran')
  const authRole = requestedRole === 'pekerja' ? 'pekerja' : 'umkm'

  useEffect(() => {
    const revealTargets = document.querySelectorAll(
      [
        '.hero-copy > *',
        '.hero-visual > .hero-photo',
        '.hero-visual > .job-card',
        '.section-heading',
        '.steps-grid > .step-card',
        '.tier-grid > .tier-card',
        '.fair-grid .benefit-card',
        '.verification-copy > *',
        '.verification-grid > .verification-card',
        '.cta-card > *',
        '.footer-brand',
        '.footer-links > div',
        '.footer-bottom',
        '.worker-steps-grid > .step-card',
        '.worker-opportunities-grid > .worker-opportunity-card',
      ].join(', '),
    )
    revealTargets.forEach((target) => target.classList.add('scroll-reveal'))

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const introTargets = document.querySelectorAll(
      '.site-header .nav-shell, .hero-copy > *, .hero-visual > .hero-photo, .hero-visual > .job-card',
    )
    if (!prefersReducedMotion) {
      introTargets.forEach((target, index) => {
        const bounds = target.getBoundingClientRect()
        if (bounds.top < window.innerHeight && bounds.bottom > 0) {
          const introDelay = target.matches('.site-header .nav-shell')
            ? 90
            : 180 + (index - 1) * 90
          target.style.setProperty('--intro-delay', `${introDelay}ms`)
          target.classList.add('scroll-reveal--intro')
          target.addEventListener(
            'animationend',
            () => {
              target.classList.remove('scroll-reveal--intro')
              target.style.removeProperty('--intro-delay')
            },
            { once: true },
          )
        }
      })
    }

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach((target) => target.classList.add('scroll-reveal--visible'))
      return
    }

    let lastScrollY = window.scrollY
    let scrollDirection = 'up'
    let hasScrolledDown = false
    const intersectingTargets = new Set()
    const footerTargets = new Set(
      Array.from(revealTargets).filter((target) => target.closest('.site-footer')),
    )
    const revealedFooterTargets = new Set()
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY) {
        scrollDirection = 'down'
        hasScrolledDown = true
        revealTargets.forEach((target) => {
          if (
            !intersectingTargets.has(target) &&
            !(footerTargets.has(target) && revealedFooterTargets.has(target))
          ) {
            target.classList.remove('scroll-reveal--visible', 'scroll-reveal--instant')
          }
        })
      } else if (currentScrollY < lastScrollY) {
        scrollDirection = 'up'
      }
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            intersectingTargets.add(entry.target)
            if (hasScrolledDown && scrollDirection === 'down') {
              entry.target.classList.remove('scroll-reveal--instant')
              entry.target.classList.add('scroll-reveal--visible')
              if (footerTargets.has(entry.target)) {
                revealedFooterTargets.add(entry.target)
              }
            } else if (!hasScrolledDown) {
              entry.target.classList.remove('scroll-reveal--instant')
              entry.target.classList.add('scroll-reveal--visible')
            } else {
              entry.target.classList.add('scroll-reveal--instant', 'scroll-reveal--visible')
            }
          } else {
            intersectingTargets.delete(entry.target)
            if (
              hasScrolledDown &&
              scrollDirection === 'down' &&
              !revealedFooterTargets.has(entry.target)
            ) {
              entry.target.classList.remove('scroll-reveal--visible', 'scroll-reveal--instant')
            }
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -10% 0px' },
    )

    const observationFrame = window.requestAnimationFrame(() => {
      revealTargets.forEach((target) => observer.observe(target))
    })

    return () => {
      window.cancelAnimationFrame(observationFrame)
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  if (authMode) {
    return <AuthPage mode={authMode} role={authRole} />
  }

  // Khusus URL langsung portal pekerja
  if (workerDashboardDirect) {
    if (!isWorkerRole) {
      const defaultWorker = {
        id: userSession?.id || 'w-1',
        email: userSession?.email || 'dimas.prasetyo@relink.id',
        full_name: userSession?.full_name || 'Dimas Prasetyo',
        business_name: 'Mitra Mandiri',
        role: 'mitra',
        tier: 'Tier 1',
        trust_score: 98,
      }
      try {
        localStorage.setItem('relink_user', JSON.stringify(defaultWorker))
      } catch {}
    }
    return <WorkerDashboard />
  }

  // Khusus URL langsung portal UMKM
  if (clientDashboardDirect) {
    if (!isClientRole) {
      const defaultUmkm = {
        id: userSession?.id || 'a1111111-1111-1111-1111-111111111111',
        email: userSession?.email || 'burina@tokokue.id',
        full_name: userSession?.full_name || 'Bu Rina',
        business_name: 'Toko Kue Bu Rina',
        role: 'klien',
      }
      try {
        localStorage.setItem('relink_user', JSON.stringify(defaultUmkm))
      } catch {}
    }
    return <ClientDashboard />
  }

  // Akses halaman /pekerja
  if (workerPage) {
    // Jika pekerja sudah register/login, langsung tampilkan dashboard pekerja dan tetap di sini saat refresh
    if (isWorkerRole) {
      return <WorkerDashboard />
    }
    // Jika admin perusahaan atau publik, tampilkan landing page edukasi pekerja
    return <WorkerLandingPage />
  }

  // Akses halaman /dashboard umum
  if (dashboardPage) {
    if (portalParam === 'pekerja') {
      if (!isWorkerRole) {
        const defaultWorker = {
          id: userSession?.id || 'w-1',
          email: userSession?.email || 'dimas.prasetyo@relink.id',
          full_name: userSession?.full_name || 'Dimas Prasetyo',
          business_name: 'Mitra Mandiri',
          role: 'mitra',
          tier: 'Tier 1',
          trust_score: 98,
        }
        try {
          localStorage.setItem('relink_user', JSON.stringify(defaultWorker))
        } catch {}
      }
      return <WorkerDashboard />
    }

    if (!isClientRole) {
      const defaultUmkm = {
        id: userSession?.id || 'a1111111-1111-1111-1111-111111111111',
        email: userSession?.email || 'burina@tokokue.id',
        full_name: userSession?.full_name || 'Bu Rina',
        business_name: 'Toko Kue Bu Rina',
        role: 'klien',
      }
      try {
        localStorage.setItem('relink_user', JSON.stringify(defaultUmkm))
      } catch {}
    }

    return <ClientDashboard />
  }

  return (
    <>
      <Navbar />
      <main>
        <section className="hero-shell" id="beranda">
          <HeroSection />
        </section>
        <HowItWorksSection />
        <TrustLevelsSection />
        <FairAccessSection />
        <VerificationSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}

export default App
