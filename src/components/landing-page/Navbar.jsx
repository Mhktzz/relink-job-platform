import { useState } from 'react'
import menuIcon from '../../assets/figma/icon-menu.svg'
import Icon from '../common/Icon.jsx'
import Logo from '../common/Logo.jsx'

const homeLinks = [
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Sistem Tier', href: '#tier' },
  { label: 'Untuk UMKM', href: '#fitur-adil' },
  { label: 'Untuk Pekerja', href: '/pekerja' },
  { label: 'Dashboard UMKM', href: '/dashboard' },
]

const workerLinks = [
  { label: 'Cara Kerja', href: '#alur-pekerja' },
  { label: 'Sistem Tier', href: '#tier' },
  { label: 'Untuk UMKM', href: '/#fitur-adil' },
  { label: 'Untuk Pekerja', href: '#manfaat-pekerja' },
  { label: 'Dashboard UMKM', href: '/dashboard' },
]

function Navbar({ workerPage = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const links = workerPage ? workerLinks : homeLinks
  const accountRole = workerPage ? 'pekerja' : 'umkm'
  const loginHref = `/masuk?peran=${accountRole}`
  const signupHref = `/daftar?peran=${accountRole}`

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <nav
        aria-label="Navigasi utama"
        className={`nav-shell${menuOpen ? ' nav-shell--menu-open' : ''}`}
      >
        <Logo />
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          className="nav-toggle"
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
        >
          {menuOpen ? (
            <Icon name="close" size={24} />
          ) : (
            <img alt="" height="28" src={menuIcon} width="28" />
          )}
        </button>
        <div
          className={`nav-content${menuOpen ? ' nav-content--open' : ''}`}
          id="primary-navigation"
        >
          <div className="nav-links">
            {links.map((link) => (
              <a href={link.href} key={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="nav-actions">
            <a className="button button--nav-ghost" href={loginHref} onClick={closeMenu}>
              Masuk
            </a>
            <a className="button button--nav-pink" href={signupHref} onClick={closeMenu}>
              Daftar Gratis
            </a>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
