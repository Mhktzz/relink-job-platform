import Icon from '../../common/Icon.jsx'
import { initialNearbyWorkers } from '../mockData.js'

function RadarMitraView({
  workers = initialNearbyWorkers,
  setCurrentMenu,
  setNewTaskTitle,
}) {
  return (
    <main className="dashboard-content-flow">
      <div className="content-heading-bar">
        <div>
          <h1>Radar Mitra Terdekat (1–5 km)</h1>
          <p>Mitra berkeahlian di sekitar toko Anda. 30% slot teratas dicadangkan untuk Rising Star.</p>
        </div>
        <button className="btn-create-pill" onClick={() => setCurrentMenu('beranda')} type="button">
          Kembali ke Dashboard
        </button>
      </div>

      <div className="nearby-workers-grid">
        {workers.map((worker) => (
          <article
            className={`worker-card${worker.isRisingStar ? ' worker-card--rising-star' : ''}`}
            key={worker.id}
          >
            {worker.isRisingStar && (
              <div className="rising-star-banner">
                <Icon name="star" size={14} />
                <span>SLOT RISING STAR (30%) · TES SKOR 100%</span>
              </div>
            )}

            <div className="worker-card__top">
              <img alt={worker.name} className="worker-card__photo" src={worker.photo} />
              <div className="worker-card__info">
                <div className="worker-tier-badge">
                  <span className={`badge-pill badge-pill--${worker.tier.toLowerCase().replace(' ', '-')}`}>
                    {worker.tier}
                  </span>
                  <span className="worker-distance">{worker.distance}</span>
                </div>
                <h3>{worker.name}</h3>
                <p className="worker-role">{worker.role}</p>
                <div className="worker-rating">
                  Rating: <strong>{worker.rating}</strong> ({worker.completedJobs} tugas selesai)
                </div>
              </div>
            </div>

            <div className="worker-card__badges">
              {worker.verifiedBadges.map((badge) => (
                <span className="verified-tag" key={badge}>
                  ✓ {badge}
                </span>
              ))}
            </div>

            <div className="worker-card__skills">
              {worker.skills.map((skill) => (
                <span className="skill-pill" key={skill}>
                  {skill}
                </span>
              ))}
            </div>

            <div className="worker-card__footer">
              <div className="worker-rate">
                <small>Estimasi Tarif</small>
                <strong>Rp{worker.ratePerTask.toLocaleString('id-ID')}<small>/tugas</small></strong>
              </div>
              <button
                className="button button--pink button--sm"
                onClick={() => {
                  setNewTaskTitle(`Bantuan Jasa bersama ${worker.name}`)
                  setCurrentMenu('new_task')
                }}
                type="button"
              >
                Pilih Mitra Ini
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

export default RadarMitraView
