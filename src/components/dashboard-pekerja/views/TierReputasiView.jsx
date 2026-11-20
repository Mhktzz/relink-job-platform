import Icon from '../../common/Icon.jsx'

function TierReputasiView({ workerProfile, onOpenQuizModal }) {
  const currentCompleted = workerProfile.completedTasksCount || 2
  const targetCompleted = workerProfile.targetTasksForNextTier || 5
  const progressPercent = Math.min(100, Math.round((currentCompleted / targetCompleted) * 100))

  return (
    <main className="dashboard-content-flow worker-dashboard-flow">
      {/* 1. Header Section */}
      <div className="content-heading-bar">
        <div>
          <h1>Jenjang Reputasi &amp; Pusat Verifikasi Keahlian</h1>
          <p>
            Bangun reputasi profesional berbasis bukti kerja nyata, bukan kredensial ijazah. Naik tier untuk tarif lebih tinggi dan akses tugas eksklusif.
          </p>
        </div>
      </div>

      {/* 2. Gamified Tier Progress Tracker (FR-301) */}
      <section className="gamified-tier-tracker-card">
        <div className="tier-tracker-header">
          <div>
            <span className="tier-tag-pill">
              <Icon name="star" size={14} className="text-amber" />
              <span>Status Aktif: {workerProfile.tierLabel}</span>
            </span>
            <h3>Jalur Kenaikan ke Tier 2 (Terverifikasi)</h3>
            <p className="text-muted">
              Selesaikan <strong>{targetCompleted - currentCompleted} tugas lagi</strong> dengan rating di atas 4.7 untuk otomatis naik ke Tier 2!
            </p>
          </div>

          <div className="tier-progress-ring-box">
            <div className="tier-progress-big-number">{progressPercent}%</div>
            <small>Menuju Tier 2</small>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="tier-progress-bar-track">
          <div className="tier-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Persyaratan Detail Naik Level */}
        <div className="tier-requirements-grid">
          <div className="requirement-item requirement-item--done">
            <div className="requirement-icon">
              <Icon name="check" size={16} />
            </div>
            <div>
              <strong>Verifikasi KTP &amp; Identitas</strong>
              <small>Lulus verifikasi data kependudukan</small>
            </div>
          </div>

          <div className="requirement-item requirement-item--in-progress">
            <div className="requirement-icon">
              <Icon name="briefcase" size={16} />
            </div>
            <div>
              <strong>Tugas Sukses: {currentCompleted} / {targetCompleted}</strong>
              <small>Butuh {targetCompleted - currentCompleted} penyelesaian tugas lagi</small>
            </div>
          </div>

          <div className="requirement-item requirement-item--done">
            <div className="requirement-icon">
              <Icon name="star" size={16} />
            </div>
            <div>
              <strong>Rating Kepuasan: {workerProfile.rating} / 5.0</strong>
              <small>Syarat minimum rating: &ge; 4.70</small>
            </div>
          </div>

          <div className="requirement-item requirement-item--done">
            <div className="requirement-icon">
              <Icon name="shield" size={16} />
            </div>
            <div>
              <strong>Rekam Jejak Sengketa: 0 Komplain</strong>
              <small>100% bebas dari klaim sengketa klien</small>
            </div>
          </div>
        </div>

        {/* Keuntungan Naik Tier */}
        <div className="tier-benefits-unlock-box">
          <div className="benefits-badge">
            <Icon name="bolt" size={14} /> Keuntungan Terbuka di Tier 2:
          </div>
          <div className="benefits-tags">
            <span className="benefit-tag">&bull; Akses tugas hingga Rp150.000</span>
            <span className="benefit-tag">&bull; Hak bergabung Tim Tandem</span>
            <span className="benefit-tag">&bull; Lencana Checklist Terverifikasi</span>
            <span className="benefit-tag">&bull; Prioritas algoritma radar</span>
          </div>
        </div>
      </section>

      {/* 3. Perbandingan 3 Tingkatan Tier di Relink */}
      <section className="tier-comparison-section">
        <h3>Tingkatan Jenjang Mitra Relink</h3>
        <div className="tier-cards-row">
          <div className="tier-level-card tier-level-card--current">
            <div className="tier-card-badge">JENJANG ANDA SAAT INI</div>
            <h4>Tier 1: Basic (Pemula)</h4>
            <p>Pintu masuk bagi pekerja lokal terampil tanpa ijazah formal.</p>
            <ul className="tier-perks-list">
              <li><Icon name="check" size={14} /> Tugas risiko rendah &amp; operasional toko</li>
              <li><Icon name="check" size={14} /> Dilindungi program Cold-Start Anti-Bias</li>
              <li><Icon name="check" size={14} /> Lencana Rising Star (uji kompetensi sempurna)</li>
              <li><Icon name="check" size={14} /> Komisi platform standar: 8%</li>
            </ul>
          </div>

          <div className="tier-level-card">
            <div className="tier-card-badge tier-card-badge--next">TARGET BERIKUTNYA</div>
            <h4>Tier 2: Verified (Terverifikasi)</h4>
            <p>Mitra dengan riwayat pengerjaan terbukti dan ulasan tinggi konsisten.</p>
            <ul className="tier-perks-list">
              <li><Icon name="check" size={14} /> Akses tugas umum &amp; perbaikan perangkat menengah</li>
              <li><Icon name="check" size={14} /> Berhak ikut Tim Tandem sebagai anggota</li>
              <li><Icon name="check" size={14} /> Prioritas radar rekomendasi UMKM</li>
              <li><Icon name="check" size={14} /> Tarif tugas lebih tinggi s/d Rp150.000</li>
            </ul>
          </div>

          <div className="tier-level-card tier-level-card--pro">
            <div className="tier-card-badge tier-card-badge--pro">STATUS TERTINGGI</div>
            <h4>Tier 3: Pro (Team Lead)</h4>
            <p>Pakar teknis andalan dan pemimpin supervisi pekerjaan tim tandem.</p>
            <ul className="tier-perks-list">
              <li><Icon name="check" size={14} /> Tugas bernilai tinggi &amp; teknis khusus</li>
              <li><Icon name="check" size={14} /> Bertindak sebagai Team Lead di paket Tandem</li>
              <li><Icon name="check" size={14} /> Fee supervisi tambahan dari platform</li>
              <li><Icon name="check" size={14} /> Rekomendasi utama mitra langganan UMKM</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Skill Verification Hub (FR-302) */}
      <section className="skill-verification-hub-card">
        <div className="hub-header">
          <div>
            <h3>Skill Verification Hub (Bukti Keterampilan Non-Formal)</h3>
            <p className="text-muted">Portofolio visual dan uji pemahaman SOP langsung di aplikasi.</p>
          </div>
          <button
            className="btn-take-quiz-hub"
            onClick={onOpenQuizModal}
            type="button"
          >
            <Icon name="star" size={15} />
            <span>Ikuti Kuis Skenario / Micro-Assessment</span>
          </button>
        </div>

        <div className="verification-badges-grid">
          <div className="verification-badge-item">
            <div className="badge-status-icon badge-status-icon--valid">
              <Icon name="shield" size={18} />
            </div>
            <div>
              <strong>KTP &amp; Face Liveness Match</strong>
              <small className="text-mint">Terverifikasi 100%</small>
            </div>
          </div>

          <div className="verification-badge-item">
            <div className="badge-status-icon badge-status-icon--valid">
              <Icon name="bolt" size={18} />
            </div>
            <div>
              <strong>In-App Micro-Assessment</strong>
              <small className="text-mint">Lolos Skor 100% (Rising Star)</small>
            </div>
          </div>

          <div className="verification-badge-item">
            <div className="badge-status-icon badge-status-icon--valid">
              <Icon name="image" size={18} />
            </div>
            <div>
              <strong>Verified Visual Portfolio</strong>
              <small className="text-mint">Video 25 Detik + GPS Watermark</small>
            </div>
          </div>

          <div className="verification-badge-item">
            <div className="badge-status-icon badge-status-icon--valid">
              <Icon name="users" size={18} />
            </div>
            <div>
              <strong>Community Vouching (Rekomendasi)</strong>
              <small className="text-mint">2 Ulasan Pelanggan Tervalidasi</small>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default TierReputasiView
