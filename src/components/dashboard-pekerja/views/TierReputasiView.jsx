import Icon from '../../common/Icon.jsx'

function TierReputasiView({ workerProfile = {}, onOpenQuizModal }) {
  const currentCompleted = workerProfile.completedTasksCount || 2
  const targetCompleted = workerProfile.targetTasksForNextTier || 5
  const remainingTasks = Math.max(0, targetCompleted - currentCompleted)
  const progressPercent = Math.min(100, Math.round((currentCompleted / targetCompleted) * 100))
  const ratingValue = workerProfile.rating ? Number(workerProfile.rating).toFixed(1) : '5.0'

  return (
    <main className="clean-dash-wrapper">
      {/* 1. HEADER (Konsisten dengan Gaya Beranda & Peluang) */}
      <header className="clean-dash-header">
        <div className="clean-dash-header__intro">
          <span className="clean-dash-eyebrow">REPUTASI &amp; VERIFIKASI MITRA</span>
          <h1 className="clean-dash-title">Jenjang Reputasi &amp; Verifikasi Keahlian</h1>
          <p className="clean-dash-subtitle">
            Bangun reputasi profesional berbasis bukti kerja nyata di lapangan. Naik tier untuk akses tugas bernilai lebih tinggi.
          </p>
        </div>
        <div className="clean-dash-header__actions">
          <button
            className="clean-btn-pill clean-btn-pill--primary"
            onClick={onOpenQuizModal}
            type="button"
          >
            <Icon name="star" size={14} />
            <span>Mulai Uji Kompetensi</span>
          </button>
        </div>
      </header>

      {/* 2. PROGRES KENAIKAN TIER (KARTU UTAMA CLEAN) */}
      <section className="clean-card clean-tier-progress-card">
        <div className="clean-tier-progress-header">
          <div>
            <h3 className="clean-tier-card-title">Jalur Kenaikan ke Tier 2 (Terverifikasi)</h3>
            <p className="clean-tier-card-subtitle">
              {remainingTasks > 0
                ? `Selesaikan ${remainingTasks} tugas lagi dengan rating min. 4.70 untuk otomatis naik ke Tier 2.`
                : 'Syarat tugas telah terpenuhi! Sistem sedang memvalidasi kenaikan jenjang Anda.'}
            </p>
          </div>

          <div className="clean-tier-percent-box">
            <span className="clean-tier-percent-val">{progressPercent}%</span>
            <small className="clean-tier-percent-label">Menuju Tier 2</small>
          </div>
        </div>

        {/* Progress Bar Minimalis */}
        <div className="clean-tier-progress-track">
          <div
            className="clean-tier-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 4 Kartu Syarat Naik Level (Style Minimalis KPI) */}
        <div className="clean-tier-requirements-grid">
          <div className="clean-tier-req-item">
            <div className="clean-tier-req-icon clean-tier-req-icon--done">
              <Icon name="check" size={14} />
            </div>
            <div className="clean-tier-req-info">
              <strong>Verifikasi KTP &amp; Identitas</strong>
              <small>Lulus verifikasi data kependudukan</small>
            </div>
          </div>

          <div className="clean-tier-req-item">
            <div className="clean-tier-req-icon clean-tier-req-icon--active">
              <Icon name="briefcase" size={14} />
            </div>
            <div className="clean-tier-req-info">
              <strong>Tugas Sukses: {currentCompleted} / {targetCompleted}</strong>
              <small>{remainingTasks > 0 ? `Butuh ${remainingTasks} tugas lagi` : 'Target terpenuhi'}</small>
            </div>
          </div>

          <div className="clean-tier-req-item">
            <div className="clean-tier-req-icon clean-tier-req-icon--done">
              <Icon name="star" size={14} />
            </div>
            <div className="clean-tier-req-info">
              <strong>Rating Kepuasan: {ratingValue} / 5.0</strong>
              <small>Syarat min: &ge; 4.70 (Terpenuhi)</small>
            </div>
          </div>

          <div className="clean-tier-req-item">
            <div className="clean-tier-req-icon clean-tier-req-icon--done">
              <Icon name="shield" size={14} />
            </div>
            <div className="clean-tier-req-info">
              <strong>Rekam Jejak: 0 Komplain</strong>
              <small>100% bebas dari klaim sengketa klien</small>
            </div>
          </div>
        </div>

        {/* Strip Keuntungan Tier 2 */}
        <div className="clean-tier-benefit-strip">
          <span className="clean-tier-benefit-label">
            <Icon name="bolt" size={13} /> Keuntungan Terbuka di Tier 2:
          </span>
          <div className="clean-tier-benefit-list">
            <span>• Akses tugas s/d Rp150.000</span>
            <span>• Hak bergabung Tim Tandem</span>
            <span>• Lencana Checklist Terverifikasi</span>
            <span>• Prioritas algoritma radar</span>
          </div>
        </div>
      </section>

      {/* 3. TINGKATAN JENJANG MITRA RELINK (3 KARTU BERSIH) */}
      <div className="clean-section-eyebrow-row">
        <span className="clean-section-eyebrow">TINGKATAN JENJANG KARIR</span>
        <span className="clean-section-eyebrow-stat">Standar upah &amp; komisi bertingkat</span>
      </div>

      <section className="clean-tier-levels-grid">
        {/* Tier 1 Card */}
        <article className="clean-card clean-tier-level-box clean-tier-level-box--current">
          <div className="clean-tier-level-box__badge">JENJANG SAAT INI</div>
          <h4 className="clean-tier-level-box__name">Tier 1: Basic (Pemula)</h4>
          <p className="clean-tier-level-box__desc">
            Pintu masuk bagi pekerja lokal terampil tanpa syarat ijazah formal.
          </p>
          <ul className="clean-tier-perks">
            <li><Icon name="check" size={13} /> Tugas risiko rendah &amp; operasional toko</li>
            <li><Icon name="check" size={13} /> Proteksi program Cold-Start Anti-Bias</li>
            <li><Icon name="check" size={13} /> Lencana Rising Star (uji kompetensi 100%)</li>
            <li><Icon name="check" size={13} /> Komisi platform standar 8% transparan</li>
          </ul>
        </article>

        {/* Tier 2 Card */}
        <article className="clean-card clean-tier-level-box">
          <div className="clean-tier-level-box__badge clean-tier-level-box__badge--next">TARGET BERIKUTNYA</div>
          <h4 className="clean-tier-level-box__name">Tier 2: Verified (Terverifikasi)</h4>
          <p className="clean-tier-level-box__desc">
            Mitra dengan riwayat tugas terbukti dan rating kepuasan konsisten.
          </p>
          <ul className="clean-tier-perks">
            <li><Icon name="check" size={13} /> Akses tugas umum &amp; perbaikan menengah</li>
            <li><Icon name="check" size={13} /> Hak bergabung Tim Tandem sebagai anggota</li>
            <li><Icon name="check" size={13} /> Prioritas radar rekomendasi toko sekitar</li>
            <li><Icon name="check" size={13} /> Tarif tugas lebih tinggi s/d Rp150.000</li>
          </ul>
        </article>

        {/* Tier 3 Card */}
        <article className="clean-card clean-tier-level-box">
          <div className="clean-tier-level-box__badge clean-tier-level-box__badge--pro">STATUS TERTINGGI</div>
          <h4 className="clean-tier-level-box__name">Tier 3: Pro (Team Lead)</h4>
          <p className="clean-tier-level-box__desc">
            Pakar teknis andalan dan pemimpin supervisi pekerjaan tim tandem.
          </p>
          <ul className="clean-tier-perks">
            <li><Icon name="check" size={13} /> Tugas bernilai tinggi &amp; teknis khusus</li>
            <li><Icon name="check" size={13} /> Bertindak sebagai Team Lead di paket Tandem</li>
            <li><Icon name="check" size={13} /> Fee supervisi tambahan dari platform</li>
            <li><Icon name="check" size={13} /> Rekomendasi utama mitra langganan UMKM</li>
          </ul>
        </article>
      </section>

      {/* 4. PUSAT VERIFIKASI KEAHLIAN (SKILL VERIFICATION HUB) */}
      <section className="clean-card clean-verification-hub-card">
        <div className="clean-card__header">
          <div>
            <span className="clean-section-eyebrow">PORTOFOLIO DIGITAL</span>
            <h3 className="clean-card-title">Pusat Verifikasi Keahlian</h3>
            <p className="clean-card-subtitle">
              Validasi keterampilan non-formal dan bukti hasil kerja nyata di lapangan
            </p>
          </div>
          <button
            className="clean-btn-pill clean-btn-pill--pink"
            onClick={onOpenQuizModal}
            type="button"
          >
            <Icon name="star" size={14} />
            <span>Ikuti Micro-Assessment</span>
          </button>
        </div>

        <div className="clean-verification-items-grid">
          <div className="clean-verification-item">
            <div className="clean-verif-icon">
              <Icon name="shield" size={16} />
            </div>
            <div className="clean-verif-info">
              <strong>KTP &amp; Face Match</strong>
              <small className="text-mint">Terverifikasi 100%</small>
            </div>
          </div>

          <div className="clean-verification-item">
            <div className="clean-verif-icon">
              <Icon name="bolt" size={16} />
            </div>
            <div className="clean-verif-info">
              <strong>In-App Micro-Assessment</strong>
              <small className="text-mint">Lolos Skor 100% (Rising Star)</small>
            </div>
          </div>

          <div className="clean-verification-item">
            <div className="clean-verif-icon">
              <Icon name="image" size={16} />
            </div>
            <div className="clean-verif-info">
              <strong>Portofolio Visual Lapangan</strong>
              <small className="text-mint">Foto &amp; GPS Watermark Valid</small>
            </div>
          </div>

          <div className="clean-verification-item">
            <div className="clean-verif-icon">
              <Icon name="users" size={16} />
            </div>
            <div className="clean-verif-info">
              <strong>Community Vouching</strong>
              <small className="text-mint">2 Ulasan Pelanggan Tervalidasi</small>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default TierReputasiView
