import shieldIcon from '../../assets/figma/icon-shield-mint.svg'
import usersIcon from '../../assets/figma/benefit-icon-users.svg'
import starIcon from '../../assets/figma/benefit-icon-star.svg'
import targetIcon from '../../assets/figma/step-icon-target.svg'

const benefits = [
  {
    value: '100%',
    icon: shieldIcon,
    title: 'Garansi kepuasan Tier 1',
    description: 'Hasil tak sesuai kesepakatan? Refund penuh atau pekerja pengganti Tier 3, gratis.',
    tone: 'pink',
  },
  {
    value: '1+2',
    icon: usersIcon,
    title: 'Paket Tandem',
    description: '1 pekerja Tier 3 sebagai Team Lead plus 2 pekerja Tier 1. Lebih hemat, pemula dapat jam terbang.',
    tone: 'soft',
  },
  {
    value: '30%',
    icon: starIcon,
    title: 'Slot Rising Star',
    description: 'Sepertiga slot teratas pencarian untuk pekerja baru dengan skor tes sempurna dan respons cepat.',
    tone: 'navy',
  },
  {
    value: '1–5 km',
    icon: targetIcon,
    title: 'Radar peta real-time',
    description: 'Pin berwarna per Tier dan lencana Siap Kerja Instan langsung di sekitar lokasi usahamu.',
    tone: 'mist',
  },
]

function FairAccessSection() {
  return (
    <section aria-labelledby="fair-title" className="fair-section" id="fitur-adil">
      <div className="section-wrap">
        <div className="section-heading section-heading--split">
          <h2 id="fair-title">
            Dibuat adil untuk
            <br />dua sisi.
          </h2>
          <p>Klien terlindungi, pekerja baru tetap dapat kesempatan yang sama.</p>
        </div>
        <div className="fair-grid">
          <div className="fair-grid__row fair-grid__row--first">
            {benefits.slice(0, 2).map((benefit) => (
              <article
                className={`benefit-card benefit-card--${benefit.tone}`}
                key={benefit.value}
              >
                <div className="benefit-card__top">
                  <strong>{benefit.value}</strong>
                  <span className="benefit-card__icon">
                    <img alt="" height="30" src={benefit.icon} width="30" />
                  </span>
                </div>
                <div className="benefit-card__copy">
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="fair-grid__row fair-grid__row--second">
            {benefits.slice(2).map((benefit) => (
              <article
                className={`benefit-card benefit-card--${benefit.tone}`}
                key={benefit.value}
              >
                <div className="benefit-card__top">
                  <strong>{benefit.value}</strong>
                  <span className="benefit-card__icon">
                    <img alt="" height="30" src={benefit.icon} width="30" />
                  </span>
                </div>
                <div className="benefit-card__copy">
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FairAccessSection
