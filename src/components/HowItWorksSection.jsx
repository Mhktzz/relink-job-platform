import iconList from '../assets/figma/step-icon-list.svg'
import iconTarget from '../assets/figma/step-icon-target.svg'
import iconShield from '../assets/figma/step-icon-shield.svg'
import iconWallet from '../assets/figma/step-icon-wallet.svg'

const steps = [
  {
    number: '01',
    icon: iconList,
    title: 'Posting tugas',
    description: 'Tulis kebutuhan, lokasi, dan anggaran. Sistem memberi label tingkat kesulitan otomatis.',
    tone: 'navy',
  },
  {
    number: '02',
    icon: iconTarget,
    title: 'Matching terdekat',
    description: 'Tugas dikirim ke pekerja dalam radius 1–5 km yang cocok dengan skill-nya.',
    tone: 'pink',
  },
  {
    number: '03',
    icon: iconShield,
    title: 'Dana ditahan escrow',
    description: 'Pembayaran aman di Relink sampai pekerjaan benar-benar selesai.',
    tone: 'soft',
  },
  {
    number: '04',
    icon: iconWallet,
    title: 'Bukti kerja, dana cair',
    description: 'Foto hasil dan tanda tangan digital jadi syarat dana diteruskan ke pekerja.',
    tone: 'blue',
  },
]

function HowItWorksSection() {
  return (
    <section aria-labelledby="how-title" className="how-section" id="cara-kerja">
      <div className="section-wrap">
        <div className="section-heading section-heading--split">
          <h2 id="how-title">
            Dari posting ke cair,
            <br />4 langkah saja.
          </h2>
          <p>Tanpa tawar-menawar panjang. Posting, cocokkan, bayar aman, selesai.</p>
        </div>
        <div className="steps-grid">
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
  )
}

export default HowItWorksSection
