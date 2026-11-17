import iconList from '../assets/figma/step-icon-list.svg'
import iconTarget from '../assets/figma/step-icon-target.svg'
import iconWallet from '../assets/figma/step-icon-wallet.svg'
import Footer from './Footer.jsx'
import Navbar from './Navbar.jsx'
import VerificationSection from './VerificationSection.jsx'
import WorkerShowcase from './WorkerShowcase.jsx'
import TrustLevelsSection from './TrustLevelsSection.jsx'

const steps = [
  {
    number: '01',
    icon: iconList,
    title: 'Buat profil',
    description: 'Ceritakan keahlian, area kerja, dan waktu yang tersedia.',
    tone: 'navy',
  },
  {
    number: '02',
    icon: iconTarget,
    title: 'Pilih tugas terdekat',
    description: 'Temukan pekerjaan yang sesuai kemampuan dan lokasimu.',
    tone: 'pink',
  },
  {
    number: '03',
    icon: iconWallet,
    title: 'Selesaikan dan dibayar',
    description: 'Kirim bukti kerja. Dana diteruskan setelah hasil dikonfirmasi.',
    tone: 'soft',
  },
]

const opportunities = [
  {
    title: 'Teknis & perbaikan',
    description: 'Bantu perawatan perangkat, instalasi, dan kebutuhan teknis harian.',
    tone: 'pink',
  },
  {
    title: 'Operasional usaha',
    description: 'Dukung kebutuhan toko, layanan pelanggan, dan pekerjaan lapangan.',
    tone: 'navy',
  },
  {
    title: 'Administrasi & digital',
    description: 'Ambil tugas pencatatan, input data, atau dukungan digital sederhana.',
    tone: 'mint',
  },
]

function WorkerLandingPage() {
  return (
    <>
      <Navbar workerPage />
      <main className="worker-page">
        <section aria-labelledby="worker-hero-title" className="hero-shell worker-hero-shell">
          <div className="hero-section">
            <div className="hero-layout">
              <div className="hero-copy">
                <h1 id="worker-hero-title">
                  Kerja dekat,
                  <br />
                  penghasilan <span>tepat.</span>
                </h1>
                <p className="hero-copy__description">
                  Temukan pekerjaan harian di sekitarmu, pilih tugas yang sesuai keahlian, dan
                  bangun reputasi dari hasil kerja nyata.
                </p>
                <div className="hero-actions">
                  <a className="button button--pink" href="#alur-pekerja">
                    Mulai Jadi Mitra
                  </a>
                  <a className="button button--outline-light" href="#manfaat-pekerja">
                    Kenali Manfaatnya
                  </a>
                </div>
                <div aria-label="Manfaat Relink untuk pekerja" className="hero-stats">
                  <div className="hero-stat">
                    <strong>1–5 km</strong>
                    <span>peluang di sekitar</span>
                  </div>
                  <div className="hero-stat">
                    <strong>100%</strong>
                    <span>bayaran via escrow</span>
                  </div>
                  <div className="hero-stat">
                    <strong>3 Tier</strong>
                    <span>reputasi bertumbuh</span>
                  </div>
                </div>
              </div>
              <WorkerShowcase workerPage />
            </div>
          </div>
        </section>

        <section aria-labelledby="worker-steps-title" className="how-section" id="alur-pekerja">
          <div className="section-wrap">
            <div className="section-heading section-heading--split">
              <h2 id="worker-steps-title">
                Mulai kerja,
                <br />
                sesederhana ini.
              </h2>
              <p>
                Atur profilmu, pilih kesempatan yang cocok, lalu buktikan hasilnya untuk membangun
                kepercayaan.
              </p>
            </div>
            <div className="steps-grid worker-steps-grid">
              {steps.map((step) => (
                <article className={`step-card step-card--${step.tone}`} key={step.number}>
                  <div className="step-card__top">
                    <span className="step-card__number">{step.number}</span>
                    <span className="step-card__icon">
                      <img alt="" height="30" src={step.icon} width="30" />
                    </span>
                  </div>
                  <div className="step-card__copy">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="worker-opportunities-title"
          className="worker-opportunities"
          id="manfaat-pekerja"
        >
          <div className="section-wrap">
            <div className="section-heading section-heading--split section-heading--light">
              <h2 id="worker-opportunities-title">
                Keahlianmu punya
                <br />
                tempat di sini.
              </h2>
              <p>
                Dari pekerjaan teknis sampai dukungan usaha, temukan tugas yang sesuai dengan
                kemampuanmu.
              </p>
            </div>
            <div className="worker-opportunities-grid">
              {opportunities.map((opportunity) => (
                <article
                  className={`worker-opportunity-card worker-opportunity-card--${opportunity.tone}`}
                  key={opportunity.title}
                >
                  <span aria-hidden="true" className="worker-opportunity-card__dot" />
                  <h3>{opportunity.title}</h3>
                  <p>{opportunity.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <TrustLevelsSection />
        <VerificationSection />

        <section
          aria-labelledby="worker-cta-title"
          className="cta-section worker-cta-section"
          id="daftar-pekerja"
        >
          <div className="cta-card">
            <h2 id="worker-cta-title">
              Kerja nyata.
              <br />
              Reputasi bertumbuh.
            </h2>
            <p>
              Mulai dari kemampuan yang kamu punya dan temukan peluang kerja lokal bersama Relink.
            </p>
            <div className="cta-card__actions">
              <a className="button button--navy" href="#alur-pekerja">
                Lihat Cara Memulai
              </a>
              <a className="button button--outline-dark" href="/">
                Kembali ke Beranda
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer workerPage />
    </>
  )
}

export default WorkerLandingPage
