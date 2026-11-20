import { useState } from 'react'
import Icon from '../../common/Icon.jsx'

function PeluangTugasView({ availableJobs = [], onOpenAcceptModal, searchQueryGlobal = '' }) {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'tier1' | 'tandem' | 'teknis'
  const [searchQuery, setSearchQuery] = useState(searchQueryGlobal)
  const [maxDistance, setMaxDistance] = useState('all') // 'all' | '1km' | '3km'

  const effectiveQuery = searchQuery || searchQueryGlobal

  const filteredJobs = availableJobs.filter((job) => {
    if (activeTab === 'tier1' && !job.tag.includes('Tier 1')) return false
    if (activeTab === 'tandem' && !job.tag.includes('Tandem')) return false
    if (activeTab === 'teknis' && job.category !== 'Teknis & Perangkat') return false

    const distNum = parseFloat(job.distance) || 0
    if (maxDistance === '1km' && distNum > 1.0) return false
    if (maxDistance === '3km' && distNum > 3.0) return false

    const q = effectiveQuery.toLowerCase()
    return (
      job.title.toLowerCase().includes(q) ||
      job.clientName.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q) ||
      job.category.toLowerCase().includes(q)
    )
  })

  return (
    <main className="dashboard-content-flow">
      {/* 1. Header Section */}
      <div className="content-heading-bar">
        <div>
          <h1>Radar Peluang Tugas Mikro Terdekat</h1>
          <p>
            Ambil pekerjaan langsung di radius 1–5 km. Honor bersih transparan tanpa potongan tersembunyi dan dijamin aman di rekening Escrow Relink.
          </p>
        </div>
        <div className="escrow-header-actions">
          <span className="escrow-verified-pill">
            <Icon name="shield" size={14} /> 100% Terlindungi Escrow
          </span>
        </div>
      </div>

      {/* 2. Filter Toolbar (Menggunakan style escrow-filter-tabs & topbar-search dari Dashboard Perusahaan) */}
      <div className="escrow-ledger-header" style={{ marginBottom: '24px' }}>
        <div className="escrow-filter-tabs">
          <button
            className={`escrow-tab-btn${activeTab === 'all' ? ' escrow-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('all')}
            type="button"
          >
            Semua Tugas ({availableJobs.length})
          </button>
          <button
            className={`escrow-tab-btn${activeTab === 'tier1' ? ' escrow-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('tier1')}
            type="button"
          >
            Khusus Pemula (Tier 1)
          </button>
          <button
            className={`escrow-tab-btn${activeTab === 'tandem' ? ' escrow-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('tandem')}
            type="button"
          >
            Undangan Tim Tandem
          </button>
          <button
            className={`escrow-tab-btn${activeTab === 'teknis' ? ' escrow-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('teknis')}
            type="button"
          >
            Teknis &amp; Servis
          </button>
        </div>

        <div className="escrow-search-wrapper">
          <div className="escrow-search-input-wrap">
            <Icon name="search" size={15} />
            <input
              className="escrow-search-input"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas, nama toko UMKM..."
              type="text"
              value={searchQuery}
            />
          </div>

          <select
            className="job-distance-select"
            onChange={(e) => setMaxDistance(e.target.value)}
            value={maxDistance}
          >
            <option value="all">Semua Jarak (Radius 1–5 km)</option>
            <option value="1km">&lt; 1 km (Sangat Dekat)</option>
            <option value="3km">&lt; 3 km (Jalan / Motor Cepat)</option>
          </select>
        </div>
      </div>

      {/* 3. Banner Edukasi Anti-Bias Cold-Start (Design System: Card Soft Blue / Mint Glow) */}
      <div className="escrow-lifecycle-card" style={{ marginBottom: '28px', padding: '22px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="metric-icon-bubble metric-icon-bubble--mint" style={{ width: '44px', height: '44px' }}>
            <Icon name="shield" size={20} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: 'var(--navy)' }}>
              Proteksi Peluang Kerja Adil untuk Mitra Pemula (Tier 1)
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-muted)', lineHeight: '1.45' }}>
              Di Relink, tugas bertanda <em>&quot;Khusus Pemula (Tier 1)&quot;</em> diproteksi dari persaingan mitra senior agar Anda cepat mendapat order pertama dan membangun reputasi nyata tanpa syarat ijazah formal.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Grid Kartu Peluang Tugas */}
      {filteredJobs.length === 0 ? (
        <div className="worker-empty-jobs-card">
          <Icon name="search" size={36} className="text-muted" />
          <h4>Tidak ada tugas yang sesuai filter saat ini</h4>
          <p>Coba ubah kata kunci pencarian atau perluas radius jarak pencarian radar.</p>
        </div>
      ) : (
        <div className="worker-jobs-full-grid">
          {filteredJobs.map((job) => (
            <div key={job.id} className="worker-job-card worker-job-card--detailed">
              <div className="job-card-top">
                <div className="job-tag-group">
                  <span className="task-tag-chip task-tag-chip--pink">{job.category}</span>
                  <span className="task-tag-chip task-tag-chip--mint">{job.tag}</span>
                  {job.urgent && (
                    <span className="task-tag-chip task-tag-chip--urgent">Urgent</span>
                  )}
                </div>
                <span className="job-distance-pill">
                  <Icon name="pin" size={12} /> {job.distance}
                </span>
              </div>

              <h3 className="job-card-title">{job.title}</h3>
              <p className="job-card-desc">{job.description}</p>

              <div className="job-card-meta-list">
                <div className="meta-item">
                  <Icon name="home" size={14} />
                  <span>Klien: <strong>{job.clientName}</strong></span>
                </div>
                <div className="meta-item">
                  <Icon name="clock" size={14} />
                  <span>Estimasi: {job.duration}</span>
                </div>
                {job.leadWorker && (
                  <div className="meta-item meta-item--lead">
                    <Icon name="users" size={14} className="text-mint" />
                    <span>Lead Tim: <strong>{job.leadWorker}</strong></span>
                  </div>
                )}
              </div>

              <div className="job-card-checklist-box">
                <small className="checklist-heading">Kriteria Hasil yang Diharapkan (SOP):</small>
                <div className="checklist-summary-text">{job.checklistSummary}</div>
              </div>

              <div className="job-card-divider" />

              <div className="job-card-footer">
                <div className="honor-details-group">
                  <div className="honor-net-row">
                    <span className="honor-label">Penghasilan Bersih:</span>
                    <strong className="honor-value text-pink">
                      Rp{job.netHonor.toLocaleString('id-ID')}
                    </strong>
                  </div>
                  <small className="honor-gross-note">
                    Honor Bruto Rp{job.grossHonor.toLocaleString('id-ID')} &bull; Komisi 8% Rp{(job.grossHonor - job.netHonor).toLocaleString('id-ID')}
                  </small>
                </div>
                <button
                  className="btn-take-job btn-take-job--full"
                  onClick={() => onOpenAcceptModal(job)}
                  type="button"
                >
                  <Icon name="bolt" size={16} />
                  <span>Ambil Tugas Ini</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default PeluangTugasView
