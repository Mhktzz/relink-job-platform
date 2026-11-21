import { useState } from 'react'
import Icon from '../../common/Icon.jsx'

function InfoTooltip({ text }) {
  return (
    <span className="dm-info-tooltip" tabIndex={0} title={text}>
      i
    </span>
  )
}

function WorkerBerandaView({
  workerProfile,
  activeTask,
  walletData,
  isAvailableNow,
  setCurrentMenu,
  onOpenAcceptModal,
  onOpenProofModal,
  onCheckInArrived,
  availableJobs = [],
  onOpenWithdrawModal,
  onTriggerSos,
  actionItems = [],
  upcomingSchedule = [],
  onOpenQuizModal,
}) {
  const [hoveredDayIndex, setHoveredDayIndex] = useState(2) // Default ke Rabu
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState(4) // Default ke Nov

  const currentStep = activeTask?.currentStepIndex || 0

  // 1. DATA GRAFIK 1: BEBAN JAM KERJA MINGGUAN (Senin - Minggu)
  const daysData = [
    { key: 'Sen', label: 'Senin', hours: 4.5, jobs: 1, x: 50 },
    { key: 'Sel', label: 'Selasa', hours: 3.0, jobs: 1, x: 120 },
    { key: 'Rab', label: 'Rabu', hours: 6.5, jobs: 2, x: 190 },
    { key: 'Kam', label: 'Kamis', hours: 4.0, jobs: 1, x: 260 },
    { key: 'Jum', label: 'Jumat', hours: 5.5, jobs: 1, x: 330 },
    { key: 'Sab', label: 'Sabtu', hours: 7.0, jobs: 2, x: 400 },
    { key: 'Min', label: 'Minggu', hours: 4.0, jobs: 1, x: 470 },
  ]

  // 2. DATA GRAFIK 2: EFISIENSI PENDAPATAN & KOMISI PLATFORM (Bulan Jul - Des)
  const monthlyData = [
    { month: 'Jul', net: 380000, fee: 32000, x: 40, netH: 42, feeH: 18 },
    { month: 'Agu', net: 520000, fee: 44000, x: 86, netH: 56, feeH: 26 },
    { month: 'Sep', net: 410000, fee: 35000, x: 132, netH: 46, feeH: 20 },
    { month: 'Okt', net: 650000, fee: 55000, x: 178, netH: 70, feeH: 30 },
    { month: 'Nov', net: 782000, fee: 68000, x: 224, netH: 84, feeH: 36 },
    { month: 'Des', net: 490000, fee: 42000, x: 270, netH: 52, feeH: 24 },
  ]

  const activeMonth = monthlyData[hoveredMonthIndex]

  return (
    <main className="dashboard-content-flow">
      {/* 1. Content Heading Bar Identik dengan Panduan Dashboard */}
      <div className="content-heading-bar">
        <div>
          <h1>Beranda Mitra Kerja</h1>
          <p>
            Radar lokasimu aktif dalam radius 1–5 km. Selesaikan tugas tepat waktu, amankan honor escrow, dan bangun reputasimu.
          </p>
        </div>
        <div className="escrow-header-actions">
          <button
            className="btn-download-recap"
            onClick={onOpenWithdrawModal}
            type="button"
          >
            <Icon name="wallet" size={16} />
            <span>Tarik Saldo Dompet</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Kartu Metrik Ringkasan Utama (Summary Metrics Grid) */}
      <div className="summary-metrics-grid">
        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Saldo Siap Cair</span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="wallet" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>Rp{(walletData.availableBalance || 0).toLocaleString('id-ID')}</strong>
            <span className="metric-trend metric-trend--good">Siap Tarik</span>
          </div>
          <small className="metric-sub-note">
            <span className="text-mint font-bold">+Rp98.000 minggu ini</span> &bull; bebas biaya admin ke e-wallet &amp; bank
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>
              Dana Tertahan di Escrow <InfoTooltip text="Uang Klien yang ditahan di rekening penampung resmi Relink dan dicairkan otomatis setelah pekerjaan selesai." />
            </span>
            <div className="metric-icon-bubble metric-icon-bubble--warn">
              <Icon name="shield" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong className="text-pink">Rp{(walletData.heldEscrowBalance || 0).toLocaleString('id-ID')}</strong>
            <span className="metric-trend metric-trend--warn">
              {activeTask ? '1 Tugas Berjalan' : 'Tidak Ada'}
            </span>
          </div>
          <small className="metric-sub-note">
            {activeTask ? `${activeTask.title} &bull; cair setelah Klien konfirmasi` : 'Dana aman di penampungan resmi berlisensi'}
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Progres Menuju Tier 2</span>
            <div className="metric-icon-bubble metric-icon-bubble--good">
              <Icon name="star" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>{workerProfile.completedTasksCount} / {workerProfile.targetTasksForNextTier} Tugas</strong>
            <span className="metric-trend metric-trend--good">Rating {workerProfile.rating}</span>
          </div>
          <div className="dm-mini-progress-track">
            <i style={{ width: `${Math.min(100, Math.round((workerProfile.completedTasksCount / workerProfile.targetTasksForNextTier) * 100))}%` }} />
          </div>
          <small className="metric-sub-note">
            Rating syarat min. 4.7 <strong className="text-mint">terpenuhi</strong>. Selesaikan {Math.max(0, workerProfile.targetTasksForNextTier - workerProfile.completedTasksCount)} tugas lagi untuk buka tugas umum &amp; Tandem.
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>
              Reputasi &amp; Garansi K3 <InfoTooltip text="K3: Standar Keselamatan dan Kesehatan Kerja lapangan serta etika layanan mitra." />
            </span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="check" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>100% Bersih</strong>
            <span className="metric-trend metric-trend--good">0 Komplain</span>
          </div>
          <small className="metric-sub-note">
            &starf; {workerProfile.rating} &bull; {workerProfile.completedTasksCount} tugas selesai &bull; respons 96% &bull; Rising Star aktif di radar UMKM
          </small>
        </div>
      </div>

      {/* 3. Row 2: Grid 2 Kolom (Tugas Aktif & Alur Escrow + Perlu Tindakan) */}
      <div className="active-and-action-grid">
        {/* Left: Alur Transaksi Escrow Interaktif (Stepper 5 Tahap) */}
        {activeTask ? (
          <section className="escrow-lifecycle-card" id="active-task-section">
            <div className="escrow-lifecycle-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="task-tag-chip task-tag-chip--pink">Tugas Aktif</span>
                  <span className="task-tag-chip task-tag-chip--mint">Escrow {activeTask.escrowRef}</span>
                </div>
                <h3>{activeTask.title}</h3>
                <small className="text-muted">
                  {activeTask.clientName} &bull; <Icon name="pin" size={13} /> {activeTask.distance} &bull; tiba sekitar 6 menit
                </small>
              </div>
              <span className="escrow-verified-pill">
                <Icon name="shield" size={14} /> Terverifikasi Escrow
              </span>
            </div>

            <div className="escrow-steps-grid">
              <div className={`escrow-step-item ${currentStep >= 0 ? 'escrow-step-item--done' : ''}`}>
                <div className="escrow-step-num">1</div>
                <h4>Dana Ditahan</h4>
                <p>Klien setor Rp{activeTask.grossHonor.toLocaleString('id-ID')} ke rekening escrow aman.</p>
              </div>
              <div className="escrow-step-connector" />
              <div className={`escrow-step-item ${currentStep >= 1 ? 'escrow-step-item--done' : currentStep === 1 ? 'escrow-step-item--highlight' : ''}`}>
                <div className="escrow-step-num">2</div>
                <h4>Menuju Lokasi</h4>
                <p>Mitra bergerak ke alamat toko. Tekan check-in saat tiba.</p>
              </div>
              <div className="escrow-step-connector" />
              <div className={`escrow-step-item ${currentStep >= 2 ? 'escrow-step-item--done' : currentStep === 2 ? 'escrow-step-item--highlight' : ''}`}>
                <div className="escrow-step-num">3</div>
                <h4>Pengerjaan</h4>
                <p>Mengerjakan kriteria acceptance checklist sesuai SOP.</p>
              </div>
              <div className="escrow-step-connector" />
              <div className={`escrow-step-item ${currentStep >= 3 ? 'escrow-step-item--done' : currentStep === 3 ? 'escrow-step-item--highlight' : ''}`}>
                <div className="escrow-step-num">4</div>
                <h4>Menunggu Konfirmasi</h4>
                <p>Klien memeriksa foto bukti hasil kerja (Auto-release 24-48j).</p>
              </div>
              <div className="escrow-step-connector" />
              <div className={`escrow-step-item ${currentStep >= 4 ? 'escrow-step-item--highlight' : ''}`}>
                <div className="escrow-step-num">5</div>
                <h4>Dana Cair</h4>
                <p>Honor bersih Rp{activeTask.netHonor.toLocaleString('id-ID')} cair instan ke dompet.</p>
              </div>
            </div>

            {/* Action Row Khusus Tugas Aktif */}
            <div className="active-task-action-bar-row">
              <div className="active-task-quick-info">
                <span className="text-muted">Pendapatan bersih diterima:</span>
                <strong className="text-pink" style={{ fontSize: '18px' }}>
                  Rp{activeTask.netHonor.toLocaleString('id-ID')}
                </strong>
              </div>

              <div className="active-task-buttons-cluster">
                <a
                  className="btn-worker-action btn-worker-action--whatsapp"
                  href={`https://wa.me/${activeTask.clientPhone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(activeTask.clientName)},%20saya%20Dimas%20dari%20Relink%20terkait%20tugas%20${encodeURIComponent(activeTask.title)}.`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon name="chat" size={16} />
                  <span>Chat Klien</span>
                </a>

                <button
                  className="btn-worker-action btn-worker-action--sos"
                  onClick={onTriggerSos}
                  type="button"
                >
                  <Icon name="alert" size={16} />
                  <span>SOS</span>
                </button>

                {currentStep === 1 && (
                  <button
                    className="btn-worker-action btn-worker-action--primary"
                    onClick={onCheckInArrived}
                    type="button"
                  >
                    <Icon name="pin" size={16} />
                    <span>Check-in di Lokasi</span>
                  </button>
                )}

                {currentStep === 2 && (
                  <button
                    className="btn-worker-action btn-worker-action--pink"
                    onClick={onOpenProofModal}
                    type="button"
                  >
                    <Icon name="check" size={16} />
                    <span>Selesai &amp; Serah Terima Bukti</span>
                  </button>
                )}

                {currentStep === 3 && (
                  <div className="waiting-client-pill">
                    <Icon name="clock" size={15} />
                    <span>Menunggu Review Klien</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="escrow-lifecycle-card">
            <div className="escrow-lifecycle-header">
              <div>
                <h3>Radar Tugas Siap Siaga</h3>
                <small>Tidak ada tugas yang sedang berjalan saat ini</small>
              </div>
              <button
                className="btn-worker-action btn-worker-action--pink"
                onClick={() => setCurrentMenu('peluang')}
                type="button"
              >
                Cari Peluang Tugas Sekitar &rarr;
              </button>
            </div>
          </section>
        )}

        {/* Right: Widget Perlu Tindakan (Action Items dari Panduan) */}
        <section className="perlu-tindakan-card">
          <div className="perlu-tindakan-header">
            <div>
              <h3>Perlu Tindakan</h3>
              <small>Peluang percepatan order &amp; reputasi</small>
            </div>
            <span className="perlu-tindakan-counter-pill">{actionItems.length}</span>
          </div>

          <ul className="perlu-tindakan-list">
            {actionItems.map((act) => (
              <li key={act.id} className="perlu-tindakan-item">
                <div className={`action-item-dot action-item-dot--${act.tone}`}>
                  <Icon name={act.type === 'video' ? 'star' : act.type === 'review' ? 'check' : 'users'} size={15} />
                </div>
                <div className="action-item-text">
                  <strong>{act.title}</strong>
                  <small>{act.desc}</small>
                </div>
                {act.type === 'video' && onOpenQuizModal && (
                  <button
                    className="btn-action-item-go"
                    onClick={onOpenQuizModal}
                    title="Mulai Uji Kompetensi"
                    type="button"
                  >
                    Mulai &rarr;
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 4. Rekomendasi Tugas Terdekat Untukmu (Grid 4 Kartu Horisontal) */}
      <section className="dashboard-rekomendasi-section">
        <div className="rekomendasi-header">
          <div>
            <h3>Tugas Terdekat Untukmu</h3>
            <small>Pekerjaan instan terverifikasi escrow dalam radius 1–5 km</small>
          </div>
          <button
            className="btn-view-all-link"
            onClick={() => setCurrentMenu('peluang')}
            type="button"
          >
            Lihat semua ({availableJobs.length}) &rarr;
          </button>
        </div>

        <div className="rekomendasi-grid-cards">
          {availableJobs.slice(0, 4).map((job) => (
            <article
              key={job.id}
              className={`rekomendasi-task-card ${job.locked ? 'rekomendasi-task-card--locked' : ''}`}
            >
              <div className="rekomendasi-card-top">
                <span className="task-tag-chip task-tag-chip--mint">{job.tag}</span>
                <span className="rekomendasi-dist-tag">
                  <Icon name="pin" size={12} /> {job.distance}
                </span>
              </div>
              <h4>{job.title}</h4>
              <p className="rekomendasi-meta">
                <Icon name="clock" size={13} /> {job.duration} &bull; {job.clientName}
              </p>
              <div className="rekomendasi-pay-block">
                <strong className="text-pink">Rp{job.netHonor.toLocaleString('id-ID')}</strong>
                <small className="text-muted">bersih setelah komisi</small>
              </div>
              {job.locked ? (
                <button
                  className="btn-rekomendasi-action btn-rekomendasi-action--locked"
                  disabled
                  title="Selesaikan 3 tugas lagi untuk membuka akses ke Tier 2"
                  type="button"
                >
                  <Icon name="lock" size={14} />
                  <span>Buka di Tier 2</span>
                </button>
              ) : (
                <button
                  className="btn-rekomendasi-action"
                  onClick={() => onOpenAcceptModal(job)}
                  type="button"
                >
                  <span>Lihat &amp; Ambil Tugas</span>
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* 5. Realtime Double Analytics Chart dengan KPI Summary */}
      <div className="analytics-double-grid">
        {/* GRAFIK 1: BEBAN JAM KERJA MINGGUAN */}
        <div className="analytics-chart-card">
          <div className="analytics-chart-card__header">
            <div>
              <h3>Statistik Jam Kerja Mingguan</h3>
              <small>Jumlah jam pengerjaan tugas mikro per hari</small>
            </div>
            <button className="chart-pill-selector" type="button">
              <span>Minggu Ini &rarr;</span>
            </button>
          </div>

          {/* KPI Summary Bar (Inspirasi Panduan) */}
          <div className="chart-kpis-summary-bar">
            <div className="kpi-mini-col">
              <small>Total Jam</small>
              <strong>34.5 jam</strong>
            </div>
            <div className="kpi-mini-col">
              <small>Rata-rata/hari</small>
              <strong>4.9 jam</strong>
            </div>
            <div className="kpi-mini-col">
              <small>Vs minggu lalu</small>
              <strong className="text-mint">+3.5 jam</strong>
            </div>
          </div>

          <div className="svg-chart-container">
            <svg
              className="chart-svg-root"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 540 210"
              width="100%"
            >
              {/* Garis Grid Horizontal */}
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="40" x2="510" y1="35" y2="35" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="40" x2="510" y1="80" y2="80" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="40" x2="510" y1="125" y2="125" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="40" x2="510" y1="170" y2="170" />

              {/* Label Sumbu Y (Jam) */}
              <text fill="#8c9cb8" fontSize="11" textAnchor="end" x="32" y="38">8 Jam</text>
              <text fill="#8c9cb8" fontSize="11" textAnchor="end" x="32" y="83">6 Jam</text>
              <text fill="#8c9cb8" fontSize="11" textAnchor="end" x="32" y="128">4 Jam</text>
              <text fill="#8c9cb8" fontSize="11" textAnchor="end" x="32" y="173">0</text>

              {/* Batang-batang hari (Senin - Minggu) */}
              {daysData.map((d, idx) => {
                const barHeight = Math.max(16, (d.hours / 8) * 135)
                const barY = 170 - barHeight
                const isHovered = hoveredDayIndex === idx

                return (
                  <g
                    key={d.key}
                    className="chart-bar-group"
                    onClick={() => setHoveredDayIndex(idx)}
                    onMouseEnter={() => setHoveredDayIndex(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect fill="transparent" height="160" width="50" x={d.x - 7} y="15" />
                    <rect
                      fill="#ff3d8b"
                      height={barHeight}
                      rx="14"
                      style={{
                        transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                        opacity: isHovered ? 1 : 0.9,
                        filter: isHovered ? 'drop-shadow(0 4px 10px rgba(255, 61, 139, 0.4))' : 'none',
                      }}
                      width="36"
                      x={d.x}
                      y={barY}
                    />
                    <text
                      fill={isHovered ? '#0f1b3d' : '#5c6c8d'}
                      fontSize="11"
                      fontWeight={isHovered ? '800' : '600'}
                      textAnchor="middle"
                      x={d.x + 18}
                      y="190"
                    >
                      {d.key}
                    </text>
                  </g>
                )
              })}

              {/* Tooltip Bubble Hari */}
              {hoveredDayIndex !== null && daysData[hoveredDayIndex] && (
                (() => {
                  const day = daysData[hoveredDayIndex]
                  const barHeight = (day.hours / 8) * 135
                  const barY = 170 - barHeight
                  const bubbleWidth = 92
                  const bubbleX = day.x + 18 - bubbleWidth / 2
                  const bubbleY = Math.max(10, barY - 26)

                  return (
                    <g
                      className="chart-tooltip-bubble"
                      style={{ pointerEvents: 'none', transition: 'transform 180ms ease' }}
                      transform={`translate(${bubbleX}, ${bubbleY})`}
                    >
                      <rect
                        fill="#0f1b3d"
                        height="20"
                        rx="10"
                        style={{ filter: 'drop-shadow(0 2px 6px rgba(15, 27, 61, 0.25))' }}
                        width={bubbleWidth}
                      />
                      <text
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="700"
                        textAnchor="middle"
                        x={bubbleWidth / 2}
                        y="14"
                      >
                        {day.hours} Jam ({day.jobs} Tugas)
                      </text>
                    </g>
                  )
                })()
              )}
            </svg>
          </div>
        </div>

        {/* GRAFIK 2: ESTIMASI PENDAPATAN & KOMISI BULANAN */}
        <div className="analytics-chart-card">
          <div className="analytics-chart-card__header">
            <div>
              <h3>Efisiensi &amp; Pendapatan Bersih <InfoTooltip text="Komisi platform Tier 1 sebesar 8% transparan untuk asuransi perlindungan kerja & operasional escrow." /></h3>
              <small>Perbandingan honor diterima vs komisi platform transparan</small>
            </div>
            <div className="chart-legend-row">
              <span className="legend-item"><span className="legend-dot legend-dot--pink" /> Honor</span>
              <span className="legend-item"><span className="legend-dot legend-dot--navy" /> Komisi</span>
            </div>
          </div>

          {/* KPI Summary Bar (Inspirasi Panduan) */}
          <div className="chart-kpis-summary-bar">
            <div className="kpi-mini-col">
              <small>Honor Kotor (Nov)</small>
              <strong>Rp850.000</strong>
            </div>
            <div className="kpi-mini-col">
              <small>Komisi 8%</small>
              <strong>Rp68.000</strong>
            </div>
            <div className="kpi-mini-col">
              <small>Bersih Diterima</small>
              <strong className="text-pink">Rp782.000</strong>
            </div>
          </div>

          <div className="svg-chart-container">
            <svg
              className="chart-svg-root"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 340 210"
              width="100%"
            >
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="25" x2="315" y1="35" y2="35" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="25" x2="315" y1="80" y2="80" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="25" x2="315" y1="125" y2="125" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="25" x2="315" y1="170" y2="170" />

              {monthlyData.map((m, idx) => {
                const isHovered = hoveredMonthIndex === idx
                const navyY = 170 - m.feeH
                const pinkY = navyY - m.netH

                return (
                  <g
                    key={m.month}
                    className="chart-bar-group"
                    onClick={() => setHoveredMonthIndex(idx)}
                    onMouseEnter={() => setHoveredMonthIndex(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect fill="transparent" height="160" width="36" x={m.x - 7} y="15" />
                    {/* Komisi Platform (Navy) */}
                    <rect
                      fill="#0f1b3d"
                      height={m.feeH}
                      rx="8"
                      style={{
                        transition: 'all 200ms ease',
                        opacity: isHovered ? 1 : 0.85,
                        filter: isHovered ? 'drop-shadow(0 2px 6px rgba(15, 27, 61, 0.4))' : 'none',
                      }}
                      width="22"
                      x={m.x}
                      y={navyY}
                    />
                    {/* Honor Bersih (Pink) */}
                    <rect
                      fill="#ff3d8b"
                      height={m.netH}
                      rx="8"
                      style={{
                        transition: 'all 200ms ease',
                        opacity: isHovered ? 1 : 0.9,
                        filter: isHovered ? 'drop-shadow(0 2px 6px rgba(255, 61, 139, 0.4))' : 'none',
                      }}
                      width="22"
                      x={m.x}
                      y={pinkY}
                    />
                    <text
                      fill={isHovered ? '#0f1b3d' : '#5c6c8d'}
                      fontSize="10"
                      fontWeight={isHovered ? '800' : '600'}
                      textAnchor="middle"
                      x={m.x + 11}
                      y="188"
                    >
                      {m.month}
                    </text>
                  </g>
                )
              })}

              {/* Tooltip Bulan */}
              {activeMonth && (
                (() => {
                  const bubbleWidth = 118
                  const bubbleX = Math.min(Math.max(activeMonth.x + 11 - bubbleWidth / 2, 20), 226)

                  return (
                    <g
                      style={{ pointerEvents: 'none', transition: 'all 180ms ease' }}
                      transform={`translate(${bubbleX}, 6)`}
                    >
                      <rect
                        fill="#0f1b3d"
                        height="20"
                        rx="10"
                        style={{ filter: 'drop-shadow(0 2px 5px rgba(15, 27, 61, 0.25))' }}
                        width={bubbleWidth}
                      />
                      <text
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="700"
                        textAnchor="middle"
                        x={bubbleWidth / 2}
                        y="14"
                      >
                        {activeMonth.month}: Rp {activeMonth.net.toLocaleString('id-ID')}
                      </text>
                    </g>
                  )
                })()
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* 6. Row 5: Jadwal Mendatang & Aktivitas Terkini */}
      <div className="jadwal-and-activity-grid">
        {/* Jadwal Mendatang (Inspirasi Panduan) */}
        <section className="jadwal-mendatang-card">
          <div className="jadwal-header">
            <div>
              <h3>Jadwal Mendatang</h3>
              <small>Agenda penugasan kerja yang telah terkonfirmasi</small>
            </div>
            <span className="jadwal-verified-chip">
              <Icon name="check" size={13} /> Terjadwal
            </span>
          </div>

          <ul className="jadwal-list">
            {upcomingSchedule.map((sch) => (
              <li key={sch.id} className="jadwal-item">
                <div className="jadwal-icon-bubble">
                  <Icon name="clock" size={16} />
                </div>
                <div className="jadwal-item-info">
                  <strong>{sch.title}</strong>
                  <small>{sch.time} &bull; {sch.client} ({sch.distance})</small>
                </div>
                <button
                  className="btn-jadwal-detail"
                  onClick={() => {
                    const el = document.getElementById('active-task-section')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  type="button"
                >
                  Detail
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Tabel Aktivitas Tugas Terkini */}
        <div className="recent-orders-card" style={{ marginBottom: 0 }}>
          <div className="recent-orders-card__header">
            <div>
              <h3>Aktivitas &amp; Peluang Tugas Terkini</h3>
              <small>Daftar penugasan berjalan dan rekomendasi sekitar</small>
            </div>
            <div className="table-action-filters">
              <button
                className="btn-view-kanban-link"
                onClick={() => setCurrentMenu('peluang')}
                type="button"
              >
                Buka Semua ({availableJobs.length}) &rarr;
              </button>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="clean-data-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Tugas / Kategori</th>
                  <th>Pemesan</th>
                  <th>Jarak</th>
                  <th>Status</th>
                  <th>Honor Bersih</th>
                  <th>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {activeTask && (
                  <tr className="table-row--highlight">
                    <td><strong>{activeTask.code}</strong></td>
                    <td>
                      <strong>{activeTask.title}</strong>
                      <div className="text-muted text-small">{activeTask.category}</div>
                    </td>
                    <td>{activeTask.clientName}</td>
                    <td>{activeTask.distance}</td>
                    <td>
                      <span className="table-status-pill table-status-pill--in-progress">
                        {currentStep === 1 ? 'Menuju Lokasi' : currentStep === 2 ? 'Sedang Dikerjakan' : currentStep === 3 ? 'Review Bukti' : 'Selesai'}
                      </span>
                    </td>
                    <td>
                      <strong className="text-pink">Rp{activeTask.netHonor.toLocaleString('id-ID')}</strong>
                    </td>
                    <td>
                      <button
                        className="btn-table-action btn-table-action--pink"
                        onClick={onOpenProofModal}
                        type="button"
                      >
                        Buka Checklist
                      </button>
                    </td>
                  </tr>
                )}

                {availableJobs.slice(0, 3).map((job) => (
                  <tr key={job.id}>
                    <td><strong>{job.code}</strong></td>
                    <td>
                      <strong>{job.title}</strong>
                      <div className="text-muted text-small">{job.category} &bull; {job.tag}</div>
                    </td>
                    <td>{job.clientName}</td>
                    <td>{job.distance}</td>
                    <td>
                      <span className="table-status-pill table-status-pill--open">
                        {job.locked ? 'Tier 2' : 'Tersedia'}
                      </span>
                    </td>
                    <td>
                      <strong className="text-navy">Rp{job.netHonor.toLocaleString('id-ID')}</strong>
                    </td>
                    <td>
                      {job.locked ? (
                        <button
                          className="btn-table-action"
                          disabled
                          style={{ opacity: 0.6, cursor: 'not-allowed' }}
                          title="Buka di Tier 2"
                          type="button"
                        >
                          Terkunci
                        </button>
                      ) : (
                        <button
                          className="btn-table-action"
                          onClick={() => onOpenAcceptModal(job)}
                          type="button"
                        >
                          Ambil Tugas
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}

export default WorkerBerandaView
