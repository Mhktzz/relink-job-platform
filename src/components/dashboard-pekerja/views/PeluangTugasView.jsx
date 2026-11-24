import { useState } from 'react'
import Icon from '../../common/Icon.jsx'

function PeluangTugasView({ availableJobs = [], onOpenAcceptModal, searchQueryGlobal = '' }) {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'tier1' | 'tandem' | 'teknis'
  const [searchQuery, setSearchQuery] = useState(searchQueryGlobal)
  const [maxDistance, setMaxDistance] = useState('all') // 'all' | '1km' | '3km'

  const effectiveQuery = searchQuery || searchQueryGlobal

  const filteredJobs = availableJobs.filter((job) => {
    const jobTag = job.tag || ''
    const jobCategory = job.category || ''

    if (activeTab === 'tier1' && !jobTag.includes('Tier 1')) return false
    if (activeTab === 'tandem' && !jobTag.includes('Tandem')) return false
    if (activeTab === 'teknis' && jobCategory !== 'Teknis & Perangkat') return false

    const distNum = parseFloat(job.distance) || 0
    if (maxDistance === '1km' && distNum > 1.0) return false
    if (maxDistance === '3km' && distNum > 3.0) return false

    const q = effectiveQuery.toLowerCase().trim()
    if (!q) return true

    return (
      (job.title && job.title.toLowerCase().includes(q)) ||
      (job.clientName && job.clientName.toLowerCase().includes(q)) ||
      (job.description && job.description.toLowerCase().includes(q)) ||
      (job.category && job.category.toLowerCase().includes(q))
    )
  })

  return (
    <main className="clean-dash-wrapper">
      {/* 1. HEADER (Konsisten dengan Gaya Beranda) */}
      <header className="clean-dash-header">
        <div className="clean-dash-header__intro">
          <span className="clean-dash-eyebrow">RADAR TUGAS LAPANGAN</span>
          <h1 className="clean-dash-title">Peluang Tugas Mikro Terdekat</h1>
          <p className="clean-dash-subtitle">
            Pekerjaan instan terverifikasi escrow dalam radius 1–5 km. Honor transparan dan dijamin aman di rekening penampung resmi.
          </p>
        </div>
        <div className="clean-dash-header__actions">
          <span className="clean-badge clean-badge--mint" style={{ padding: '8px 16px', fontSize: '12px' }}>
            <Icon name="shield" size={14} />
            <span>100% Terlindungi Escrow</span>
          </span>
        </div>
      </header>

      {/* 2. FILTER & PENCARIAN TUGAS (TOOLBAR CLEAN) */}
      <section className="clean-peluang-toolbar">
        {/* Tab Kategori */}
        <div className="clean-peluang-tabs">
          {[
            { id: 'all', label: `Semua Tugas (${availableJobs.length})` },
            { id: 'tier1', label: 'Khusus Pemula (Tier 1)' },
            { id: 'tandem', label: 'Tim Tandem' },
            { id: 'teknis', label: 'Teknis & Servis' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`clean-peluang-tab-btn ${activeTab === tab.id ? 'clean-peluang-tab-btn--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input Pencarian & Jarak Radius */}
        <div className="clean-peluang-search-group">
          <div className="clean-search-input-wrap">
            <Icon name="search" size={14} />
            <input
              className="clean-search-input"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas, kategori, atau nama toko..."
              type="text"
              value={searchQuery}
            />
          </div>

          <div className="clean-select-wrap">
            <Icon name="pin" size={13} />
            <select
              aria-label="Filter radius jarak tugas"
              className="clean-select-dropdown"
              onChange={(e) => setMaxDistance(e.target.value)}
              value={maxDistance}
            >
              <option value="all">Semua Jarak (1–5 km)</option>
              <option value="1km">&lt; 1 km (Sangat Dekat)</option>
              <option value="3km">&lt; 3 km (Jalan / Motor Cepat)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. BANNER EDUKASI PROTEKSI TIER 1 (CLEAN CARD) */}
      <section className="clean-card clean-tier1-protection-banner">
        <div className="clean-tier1-banner-inner">
          <div className="clean-tier1-banner-icon">
            <Icon name="shield" size={18} />
          </div>
          <div className="clean-tier1-banner-text">
            <h4>Proteksi Peluang Kerja Adil untuk Mitra Pemula (Tier 1)</h4>
            <p>
              Di Relink, tugas bertanda <strong>&quot;Khusus Pemula (Tier 1)&quot;</strong> diproteksi dari persaingan mitra senior agar Anda cepat mendapat order pertama dan membangun reputasi nyata tanpa syarat ijazah formal.
            </p>
          </div>
        </div>
      </section>

      {/* 4. GRID KARTU PELUANG TUGAS (CLEAN CARDS) */}
      {filteredJobs.length === 0 ? (
        <div className="clean-card clean-empty-state-card">
          <Icon name="search" size={32} />
          <h4>Tidak ada tugas yang sesuai filter saat ini</h4>
          <p>Coba ubah kata kunci pencarian atau pilih kategori dan radius jarak yang lebih luas.</p>
        </div>
      ) : (
        <section className="clean-jobs-cards-grid">
          {filteredJobs.map((job) => {
            const gross = job.grossHonor || 50000
            const net = job.netHonor || Math.round(gross * 0.92)
            const commission = gross - net

            return (
              <article
                key={job.id}
                className={`clean-card clean-job-card ${job.locked ? 'clean-job-card--locked' : ''}`}
              >
                {/* Header Kartu: Tag Kategori, Tier & Jarak */}
                <div className="clean-job-card__header">
                  <div className="clean-job-card__badges">
                    <span className="clean-badge clean-badge--navy">{job.category}</span>
                    <span className={`clean-badge ${job.locked ? 'clean-badge--navy' : 'clean-badge--mint'}`}>
                      {job.tag}
                    </span>
                    {job.urgent && (
                      <span className="clean-badge clean-badge--pink">Urgent</span>
                    )}
                  </div>
                  <span className="clean-badge clean-badge--navy" style={{ fontWeight: 600 }}>
                    <Icon name="pin" size={12} /> {job.distance}
                  </span>
                </div>

                {/* Judul & Deskripsi Tugas */}
                <h3 className="clean-job-card__title">{job.title}</h3>
                <p className="clean-job-card__desc">{job.description}</p>

                {/* Info Metadata: Klien & Durasi */}
                <div className="clean-job-card__meta">
                  <div className="clean-job-meta-item">
                    <Icon name="home" size={13} />
                    <span>Klien: <strong>{job.clientName}</strong></span>
                  </div>
                  <div className="clean-job-meta-item">
                    <Icon name="clock" size={13} />
                    <span>Estimasi: {job.duration}</span>
                  </div>
                  {job.leadWorker && (
                    <div className="clean-job-meta-item text-mint font-bold">
                      <Icon name="users" size={13} />
                      <span>Lead Tim: {job.leadWorker}</span>
                    </div>
                  )}
                </div>

                {/* Kotak Ringkasan SOP Checklist */}
                <div className="clean-job-checklist-preview">
                  <span className="clean-job-checklist-label">Kriteria Hasil yang Diharapkan (SOP):</span>
                  <p className="clean-job-checklist-text">{job.checklistSummary}</p>
                </div>

                {/* Divider Halus */}
                <div className="clean-job-divider" />

                {/* Footer Kartu: Rincian Honor & Tombol Aksi */}
                <div className="clean-job-card__footer">
                  <div className="clean-job-honor-block">
                    <span className="clean-job-honor-label">Honor Bersih Diterima:</span>
                    <strong className="clean-job-honor-val">
                      Rp{net.toLocaleString('id-ID')}
                    </strong>
                    <small className="clean-job-honor-gross">
                      Bruto Rp{gross.toLocaleString('id-ID')} • Komisi 8% Rp{commission.toLocaleString('id-ID')}
                    </small>
                  </div>

                  {job.locked ? (
                    <button
                      className="clean-btn-pill clean-btn-pill--disabled"
                      disabled
                      title="Selesaikan tugas dasar untuk membuka akses Tier 2"
                      type="button"
                    >
                      <Icon name="lock" size={14} />
                      <span>Buka di Tier 2</span>
                    </button>
                  ) : (
                    <button
                      className="clean-btn-pill clean-btn-pill--pink"
                      onClick={() => onOpenAcceptModal(job)}
                      type="button"
                    >
                      <Icon name="check" size={14} />
                      <span>Ambil Tugas Ini</span>
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}

export default PeluangTugasView
