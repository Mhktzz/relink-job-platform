import Logo from '../common/Logo.jsx'
import { appPath } from '../../lib/routes.js'

function Footer({ workerPage = false }) {
  return (
    <footer className="site-footer">
      <div className="section-wrap footer-wrap">
        <div className="footer-main">
          <div className="footer-brand">
            <Logo />
            <p>
              {workerPage
                ? 'Temukan pekerjaan lokal, bangun reputasi, dan kembangkan keahlian bersama Relink.'
                : 'Micro-job lokal yang adil, aman, dan terukur untuk UMKM Indonesia.'}
            </p>
          </div>
          <div className="footer-links">
            <div>
              <h2>Produk</h2>
              <a href={workerPage ? '#alur-pekerja' : '#cara-kerja'}>Cara Kerja</a>
              <a href="#tier">Sistem Tier</a>
              <a href={workerPage ? '#verifikasi' : '#fitur-adil'}>Keamanan</a>
            </div>
            <div>
              <h2>Mitra</h2>
              <a href={appPath('/daftar?peran=umkm')}>Daftar UMKM</a>
              <a href={appPath('/daftar?peran=pekerja')}>Daftar Pekerja</a>
              <a href={workerPage ? '#daftar-pekerja' : '#cta'}>Bantuan</a>
            </div>
            <div>
              <h2>Relink</h2>
              <a href={workerPage ? appPath('/') : '#beranda'}>Tentang</a>
              <a href={workerPage ? '#daftar-pekerja' : '#cta'}>Kontak</a>
              <a href={workerPage ? '#daftar-pekerja' : '#cta'}>Privasi</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Relink. Dibuat untuk SDGs 8: Pekerjaan Layak dan Pertumbuhan Ekonomi.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
