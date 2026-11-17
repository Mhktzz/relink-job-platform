import checkDark from '../assets/figma/tier-check-dark.svg'
import checkLight from '../assets/figma/tier-check-light.svg'

const levels = [
  {
    tier: 'TIER 1',
    name: 'Basic',
    requirement: 'Langsung bisa mulai',
    benefits: [
      'Tugas ringan, risiko rendah',
      'Tes skenario singkat di aplikasi',
      'Garansi kepuasan dari Relink',
    ],
    tone: 'basic',
    tag: 'HEMAT 45%',
  },
  {
    tier: 'TIER 2',
    name: 'Terverifikasi',
    requirement: '3–5 tugas dengan rating ≥ 4,8',
    benefits: [
      'Tugas teknis menengah',
      'Lencana Terverifikasi di profil',
      'Prioritas di hasil pencarian',
    ],
    tone: 'verified',
  },
  {
    tier: 'TIER 3',
    name: 'Pro',
    requirement: '15+ tugas tanpa komplain',
    benefits: [
      'Tugas kompleks bernilai tinggi',
      'Jadi Team Lead Paket Tandem',
      'Merekomendasikan pekerja junior',
    ],
    tone: 'pro',
  },
]

function TrustLevelsSection() {
  return (
    <section aria-labelledby="trust-title" className="trust-section" id="tier">
      <div className="section-wrap">
        <div className="section-heading section-heading--split section-heading--light">
          <h2 id="trust-title">
            Mulai dari mana pun.
            <br />Naik karena kerja nyata.
          </h2>
          <p>Tanpa ijazah atau sertifikat. Reputasi dibangun dari tugas yang benar-benar kamu selesaikan.</p>
        </div>
        <div className="tier-grid">
          {levels.map((tier) => (
            <article className={`tier-card tier-card--${tier.tone}`} key={tier.tier}>
              <div className="tier-card__top">
                <div className="tier-card__chips">
                  <span className="tier-card__chip">{tier.tier}</span>
                  {tier.tag && <span className="tier-card__tag">{tier.tag}</span>}
                </div>
                <h3>{tier.name}</h3>
                <p className="tier-card__requirement">{tier.requirement}</p>
              </div>
              <ul className="tier-card__benefits">
                {tier.benefits.map((benefit) => (
                  <li key={benefit}>
                    <span className="tier-card__check">
                      <img
                        alt=""
                        height="16"
                        src={tier.tone === 'pro' ? checkDark : checkLight}
                        width="16"
                      />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustLevelsSection
