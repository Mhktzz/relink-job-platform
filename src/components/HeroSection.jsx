import WorkerShowcase from './WorkerShowcase.jsx'

function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="hero-section">
      <div className="hero-layout">
        <div className="hero-copy">
          <h1 id="hero-title">
            Tangan terampil,
            <br />
            di sekitarmu,
            <br />
            <span>sekarang juga.</span>
          </h1>
          <p className="hero-copy__description">
            Relink menghubungkan UMKM dengan pekerja lokal terdekat untuk micro-job harian,
            lengkap dengan dana escrow dan bukti kerja yang aman.
          </p>
          <div className="hero-actions">
            <a className="button button--pink" href="#fitur-adil">
              Cari Pekerja Sekarang
            </a>
            <a className="button button--outline-light" href="/pekerja">
              Daftar sebagai Mitra
            </a>
          </div>
          <div aria-label="Keunggulan Relink" className="hero-stats">
            <div className="hero-stat">
              <strong>1–5 km</strong>
              <span>radius pencarian</span>
            </div>
            <div className="hero-stat">
              <strong>100%</strong>
              <span>dana aman escrow</span>
            </div>
            <div className="hero-stat">
              <strong>3 Tier</strong>
              <span>reputasi berjenjang</span>
            </div>
          </div>
        </div>
        <WorkerShowcase />
      </div>
    </section>
  )
}

export default HeroSection
