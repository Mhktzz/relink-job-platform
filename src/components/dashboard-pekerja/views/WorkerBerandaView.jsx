import Icon from '../../common/Icon.jsx'

function WorkerBerandaView({
  workerProfile,
  activeTask,
  walletData,
  isAvailableNow,
  setIsAvailableNow,
  setCurrentMenu,
  onOpenAcceptModal,
  onOpenProofModal,
  onCheckInEnRoute,
  onCheckInArrived,
  availableJobs,
  onOpenWithdrawModal,
  onTriggerSos,
}) {
  const steps = [
    { id: 0, title: 'Dana Escrow Terkunci', desc: 'Dana aman di penampungan' },
    { id: 1, title: 'Menuju Lokasi', desc: 'Perjalanan ke toko UMKM' },
    { id: 2, title: 'Pengerjaan Berlangsung', desc: 'Menjalankan checklist SOP' },
    { id: 3, title: 'Serah Terima Bukti', desc: 'Verifikasi hasil kerja & TTD' },
    { id: 4, title: 'Dana Cair ke Saldo', desc: 'Pencairan instan ke dompet' },
  ]

  const currentStep = activeTask?.currentStepIndex || 0

  return (
    <main className="dashboard-content-flow worker-dashboard-flow">
      {/* 1. Header Banner Selamat Datang & Status Kesiapan */}
      <div className="worker-welcome-banner">
        <div className="worker-welcome-copy">
          <div className="worker-status-badge-row">
            <span className="worker-tier-pill">
              <Icon name="star" size={14} className="text-amber" />
              <span>{workerProfile.tierLabel}</span>
            </span>
            <span className="worker-trust-pill">
              <Icon name="shield" size={14} className="text-mint" />
              <span>Trust Score {workerProfile.trustScore}%</span>
            </span>
            {workerProfile.isRisingStar && (
              <span className="worker-rising-star-pill">
                <Icon name="bolt" size={14} className="text-pink" />
                <span>Rising Star Aktif</span>
              </span>
            )}
          </div>
          <h1>Halo, {workerProfile.name}!</h1>
          <p>
            Radar order aktif dalam radius 1–5 km. Anda memiliki <strong>1 tugas aktif</strong> yang sedang berjalan dan <strong>{availableJobs.length} tugas baru</strong> tersedia di sekitarmu.
          </p>
        </div>

        <div className="worker-radar-toggle-box">
          <div className="radar-status-info">
            <span className={`radar-indicator-dot ${isAvailableNow ? 'radar-indicator-dot--active' : ''}`} />
            <div>
              <strong>Status: {isAvailableNow ? 'Siap Kerja Instan' : 'Istirahat (Offline)'}</strong>
              <small>{isAvailableNow ? 'Radar terlihat oleh UMKM sekitar' : 'Tidak menerima tawaran tugas baru'}</small>
            </div>
          </div>
          <button
            className={`btn-toggle-availability ${isAvailableNow ? 'btn-toggle-availability--on' : 'btn-toggle-availability--off'}`}
            onClick={() => setIsAvailableNow(!isAvailableNow)}
            type="button"
          >
            {isAvailableNow ? 'Nonaktifkan Radar' : 'Aktifkan Radar Kerja'}
          </button>
        </div>
      </div>

      {/* 2. 4 Kartu Metrik Utama */}
      <div className="summary-metrics-grid worker-metrics-grid">
        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Saldo Tersedia (Dompet)</span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="wallet" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>Rp{(walletData.availableBalance || 0).toLocaleString('id-ID')}</strong>
            <button
              className="metric-inline-action-btn"
              onClick={onOpenWithdrawModal}
              type="button"
            >
              Tarik Saldo &rarr;
            </button>
          </div>
          <small className="metric-sub-note">Bebas biaya admin ke e-wallet &amp; rekening bank</small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Dana Tertahan di Escrow</span>
            <div className="metric-icon-bubble metric-icon-bubble--warn">
              <Icon name="shield" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong className="text-pink">Rp{(walletData.heldEscrowBalance || 0).toLocaleString('id-ID')}</strong>
            <span className="metric-trend metric-trend--good">Tersimpan Aman</span>
          </div>
          <small className="metric-sub-note">
            {activeTask ? `1 tugas aktif (#${activeTask.code})` : 'Belum ada dana tugas berjalan'}
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Progres Menuju Tier 2</span>
            <div className="metric-icon-bubble metric-icon-bubble--blue">
              <Icon name="chart" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>{workerProfile.completedTasksCount} / {workerProfile.targetTasksForNextTier} Tugas</strong>
            <span className="metric-trend metric-trend--good">Rating {workerProfile.rating}</span>
          </div>
          <small className="metric-sub-note">Butuh {workerProfile.targetTasksForNextTier - workerProfile.completedTasksCount} tugas lagi untuk buka akses tugas bernilai tinggi</small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Reputasi &amp; Keamanan</span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="check-circle" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>100% Bersih</strong>
            <span className="metric-trend metric-trend--good">0 Komplain</span>
          </div>
          <small className="metric-sub-note">Garansi proteksi kerja Relink aktif</small>
        </div>
      </div>

      {/* 3. Kartu Tugas Aktif Berjalan (Live Status Stepper & Aksi Cepat) */}
      {activeTask && (
        <section className="worker-active-task-card">
          <div className="worker-active-task-header">
            <div>
              <div className="task-header-tags">
                <span className="task-tag-chip task-tag-chip--pink">{activeTask.category}</span>
                <span className="task-tag-chip task-tag-chip--mint">Tugas Berjalan</span>
                <span className="task-code-badge">{activeTask.code}</span>
              </div>
              <h3>{activeTask.title}</h3>
              <p className="task-client-info">
                <Icon name="pin" size={14} />
                <span><strong>{activeTask.clientName}</strong> &bull; {activeTask.location} ({activeTask.distance})</span>
              </p>
            </div>
            <div className="worker-active-task-payout">
              <span className="payout-label">Penghasilan Bersih (Net)</span>
              <strong className="payout-amount text-pink">
                Rp{activeTask.netHonor.toLocaleString('id-ID')}
              </strong>
              <small className="payout-sub">Escrow Ref: {activeTask.escrowRef}</small>
            </div>
          </div>

          {/* Stepper Status Transaksi 5 Tahap */}
          <div className="worker-stepper-container">
            <div className="worker-stepper-bar">
              {steps.map((s, idx) => {
                const isPassed = idx < currentStep
                const isCurrent = idx === currentStep
                return (
                  <div
                    key={s.id}
                    className={`stepper-step ${isPassed ? 'stepper-step--done' : isCurrent ? 'stepper-step--active' : 'stepper-step--pending'}`}
                  >
                    <div className="stepper-step-circle">
                      {isPassed ? <Icon name="check" size={14} /> : <span>{idx + 1}</span>}
                    </div>
                    <div className="stepper-step-content">
                      <strong className="stepper-step-title">{s.title}</strong>
                      <small className="stepper-step-desc">{s.desc}</small>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Checklist Progress Ringkas & Tombol Aksi */}
          <div className="worker-active-task-body">
            <div className="active-task-checklist-preview">
              <div className="checklist-preview-header">
                <strong>Progress Acceptance Checklist (SOP):</strong>
                <span>
                  {activeTask.checklist.filter((c) => c.done).length} dari {activeTask.checklist.length} butir tuntas
                </span>
              </div>
              <div className="checklist-items-compact">
                {activeTask.checklist.map((item) => (
                  <div key={item.id} className="checklist-item-compact">
                    <Icon
                      name={item.done ? 'check-circle' : 'circle'}
                      size={16}
                      className={item.done ? 'text-mint' : 'text-muted'}
                    />
                    <span className={item.done ? 'text-strikethrough' : ''}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="active-task-action-buttons">
              {currentStep === 1 && (
                <button
                  className="btn-worker-action btn-worker-action--primary"
                  onClick={onCheckInArrived}
                  type="button"
                >
                  <Icon name="pin" size={16} />
                  <span>Saya Sudah Tiba di Lokasi Toko</span>
                </button>
              )}

              {currentStep === 2 && (
                <button
                  className="btn-worker-action btn-worker-action--pink"
                  onClick={onOpenProofModal}
                  type="button"
                >
                  <Icon name="check-circle" size={16} />
                  <span>Selesai &amp; Serah Terima Digital (Proof-of-Work)</span>
                </button>
              )}

              {currentStep === 3 && (
                <div className="waiting-client-box">
                  <Icon name="clock" size={16} className="text-amber" />
                  <span>Bukti telah diserahkan. Menunggu konfirmasi pemilik UMKM atau auto-release dalam 24–48 jam.</span>
                </div>
              )}

              <div className="action-buttons-sub-row">
                <a
                  className="btn-worker-action btn-worker-action--whatsapp"
                  href={`https://wa.me/${activeTask.clientPhone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(activeTask.clientName)},%20saya%20Dimas%20dari%20Relink%20terkait%20tugas%20${encodeURIComponent(activeTask.title)}.`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon name="whatsapp" size={16} />
                  <span>Hubungi Klien (WhatsApp)</span>
                </a>
                <button
                  className="btn-worker-action btn-worker-action--sos"
                  onClick={onTriggerSos}
                  type="button"
                >
                  <Icon name="alert" size={16} />
                  <span>Siaga SOS Darurat</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Rekomendasi Tugas Sekitar (Job Opportunities Teaser) */}
      <section className="worker-job-opportunities-section">
        <div className="section-header-flex">
          <div>
            <h3>Peluang Tugas Terdekat di Radiusmu</h3>
            <p className="text-muted">Pilih pekerjaan yang sesuai keahlianmu dengan proteksi pembayaran escrow 100%.</p>
          </div>
          <button
            className="btn-see-all-jobs"
            onClick={() => setCurrentMenu('peluang')}
            type="button"
          >
            <span>Buka Semua Tugas ({availableJobs.length})</span>
            <Icon name="arrow" size={14} />
          </button>
        </div>

        <div className="worker-jobs-grid">
          {availableJobs.slice(0, 3).map((job) => (
            <div key={job.id} className="worker-job-card">
              <div className="job-card-top">
                <div className="job-tag-group">
                  <span className="task-tag-chip task-tag-chip--pink">{job.category}</span>
                  <span className="task-tag-chip task-tag-chip--mint">{job.tag}</span>
                </div>
                <span className="job-distance-pill">
                  <Icon name="pin" size={12} /> {job.distance}
                </span>
              </div>

              <h4 className="job-card-title">{job.title}</h4>
              <p className="job-card-desc">{job.description}</p>

              <div className="job-card-meta">
                <span>Klien: <strong>{job.clientName}</strong></span>
                <span>Durasi: {job.duration}</span>
              </div>

              <div className="job-card-divider" />

              <div className="job-card-footer">
                <div>
                  <span className="honor-label">Honor Bersih</span>
                  <strong className="honor-value text-pink">
                    Rp{job.netHonor.toLocaleString('id-ID')}
                  </strong>
                </div>
                <button
                  className="btn-take-job"
                  onClick={() => onOpenAcceptModal(job)}
                  type="button"
                >
                  <Icon name="bolt" size={14} />
                  <span>Ambil Tugas</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default WorkerBerandaView
