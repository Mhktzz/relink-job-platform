import { useState } from 'react'
import Icon from '../../common/Icon.jsx'

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
      {/* 1. Content Heading Bar Identik dengan Dashboard Perusahaan */}
      <div className="content-heading-bar">
        <div>
          <h1>Beranda Mitra Kerja</h1>
          <p>
            Radar lokasimu aktif dalam radius 1–5 km. Amankan honor escrow, selesaikan tugas mikro tepat waktu, dan bangun reputasi profesionalmu.
          </p>
        </div>
        <div className="escrow-header-actions">
          <button
            className="btn-download-recap"
            onClick={onOpenWithdrawModal}
            type="button"
          >
            <Icon name="download" size={15} />
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
          <small className="metric-sub-note">Bebas biaya admin transfer ke e-wallet &amp; rekening bank</small>
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
            <span className="metric-trend metric-trend--warn">
              {activeTask ? '1 Tugas Berjalan' : 'Tidak Ada'}
            </span>
          </div>
          <small className="metric-sub-note">
            {activeTask ? `Escrow Ref: ${activeTask.escrowRef}` : 'Dana aman di penampungan berlisensi'}
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
          <small className="metric-sub-note">
            Selesaikan {workerProfile.targetTasksForNextTier - workerProfile.completedTasksCount} tugas lagi untuk buka akses tugas bernilai tinggi
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Reputasi &amp; Garansi K3</span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="check" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>100% Bersih</strong>
            <span className="metric-trend metric-trend--good">0 Komplain</span>
          </div>
          <small className="metric-sub-note">
            {workerProfile.isRisingStar ? 'Lencana Rising Star Aktif di Radar UMKM' : 'Garansi perlindungan Relink aktif'}
          </small>
        </div>
      </div>

      {/* 3. Realtime Double Analytics Chart (Identik dengan Beranda Perusahaan) */}
      <div className="analytics-double-grid">
        {/* GRAFIK 1: BEBAN JAM KERJA MINGGUAN */}
        <div className="analytics-chart-card">
          <div className="analytics-chart-card__header">
            <div>
              <h3>Statistik Jam Kerja Mingguan</h3>
              <small>Jumlah jam pengerjaan tugas mikro per hari (Realtime Interaktif)</small>
            </div>
            <button className="chart-pill-selector" type="button">
              <span>Minggu Ini &rarr;</span>
            </button>
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
              <h3>Efisiensi &amp; Pendapatan Bersih</h3>
              <small>Perbandingan honor diterima vs komisi platform transparan</small>
            </div>
            <div className="chart-legend-row">
              <span className="legend-item"><span className="legend-dot legend-dot--pink" /> Honor</span>
              <span className="legend-item"><span className="legend-dot legend-dot--navy" /> Komisi</span>
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

      {/* 4. Kartu Alur Transaksi Escrow Interaktif (Stepper 4-5 Tahap - FR-402) */}
      {activeTask && (
        <section className="escrow-lifecycle-card">
          <div className="escrow-lifecycle-header">
            <div>
              <h3>Alur Pengerjaan Tugas &amp; Proteksi Escrow Terkunci ({activeTask.code})</h3>
              <small>Bagaimana dana dan hak Anda dilindungi sejak pemesanan hingga pencairan selesai</small>
            </div>
            <span className="escrow-verified-pill">
              <Icon name="shield" size={14} /> Terverifikasi Payment Gateway Berlisensi
            </span>
          </div>

          <div className="escrow-steps-grid">
            <div className={`escrow-step-item ${currentStep >= 0 ? 'escrow-step-item--done' : ''}`}>
              <div className="escrow-step-num">1</div>
              <h4>Deposit Terkunci</h4>
              <p>UMKM menyetor dana Rp{activeTask.grossHonor.toLocaleString('id-ID')} ke escrow penampung resmi. Dana aman terjamin.</p>
            </div>
            <div className="escrow-step-connector" />
            <div className={`escrow-step-item ${currentStep >= 1 ? 'escrow-step-item--done' : currentStep === 1 ? 'escrow-step-item--highlight' : ''}`}>
              <div className="escrow-step-num">2</div>
              <h4>Menuju Lokasi</h4>
              <p>Mitra bergerak ke alamat {activeTask.clientName}. Tekan tombol Check-in saat telah tiba di depan toko.</p>
            </div>
            <div className="escrow-step-connector" />
            <div className={`escrow-step-item ${currentStep >= 2 ? 'escrow-step-item--done' : currentStep === 2 ? 'escrow-step-item--highlight' : ''}`}>
              <div className="escrow-step-num">3</div>
              <h4>Pengerjaan SOP</h4>
              <p>Mengerjakan kriteria acceptance checklist sesuai instruksi K3 dan standar operasional kerja.</p>
            </div>
            <div className="escrow-step-connector" />
            <div className={`escrow-step-item ${currentStep >= 3 ? 'escrow-step-item--done' : currentStep === 3 ? 'escrow-step-item--highlight' : ''}`}>
              <div className="escrow-step-num">4</div>
              <h4>Bukti Foto GPS</h4>
              <p>Unggah foto serah terima ber-watermark GPS dan persetujuan tanda tangan digital pemilik toko.</p>
            </div>
            <div className="escrow-step-connector" />
            <div className={`escrow-step-item ${currentStep >= 4 ? 'escrow-step-item--highlight' : ''}`}>
              <div className="escrow-step-num">5</div>
              <h4>Dana Cair ke Saldo</h4>
              <p>Dana bersih Rp{activeTask.netHonor.toLocaleString('id-ID')} cair instan ke dompet Anda tanpa biaya admin.</p>
            </div>
          </div>

          {/* Action Row Khusus Tugas Aktif */}
          <div className="active-task-action-bar-row">
            <div className="active-task-quick-info">
              <span className="task-tag-chip task-tag-chip--pink">{activeTask.category}</span>
              <strong>{activeTask.title}</strong> &bull; <span className="text-muted">{activeTask.clientName} ({activeTask.distance})</span>
            </div>

            <div className="active-task-buttons-cluster">
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
                <div className="waiting-client-pill">
                  <Icon name="clock" size={15} />
                  <span>Bukti telah diserahkan &bull; Menunggu review klien (Auto-release 24–48 jam)</span>
                </div>
              )}

              <a
                className="btn-worker-action btn-worker-action--whatsapp"
                href={`https://wa.me/${activeTask.clientPhone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(activeTask.clientName)},%20saya%20Dimas%20dari%20Relink%20terkait%20tugas%20${encodeURIComponent(activeTask.title)}.`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon name="whatsapp" size={16} />
                <span>Chat Klien</span>
              </a>

              <button
                className="btn-worker-action btn-worker-action--sos"
                onClick={onTriggerSos}
                type="button"
              >
                <Icon name="alert" size={16} />
                <span>Siaga SOS</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. Tabel Aktivitas Tugas Terkini (Identik dengan Recent Orders Card di Dashboard Perusahaan) */}
      <div className="recent-orders-card">
        <div className="recent-orders-card__header">
          <div>
            <h3>Aktivitas &amp; Peluang Tugas Terkini</h3>
            <small>Daftar penugasan berjalan dan rekomendasi tugas sekitar radius 1–5 km</small>
          </div>
          <div className="table-action-filters">
            <button
              className="btn-view-kanban-link"
              onClick={() => setCurrentMenu('peluang')}
              type="button"
            >
              Buka Semua Peluang Tugas ({availableJobs.length}) &rarr;
            </button>
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="clean-data-table">
            <thead>
              <tr>
                <th width="40"><input aria-label="Pilih semua" type="checkbox" /></th>
                <th>Kode</th>
                <th>Tugas / Kategori</th>
                <th>Pemesan (UMKM)</th>
                <th>Jarak</th>
                <th>Status</th>
                <th>Honor Bersih</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {/* Tugas Aktif Berjalan */}
              {activeTask && (
                <tr className="table-row--highlight">
                  <td><input aria-label={`Pilih ${activeTask.code}`} type="checkbox" /></td>
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

              {/* Daftar Peluang Tugas Baru */}
              {availableJobs.map((job) => (
                <tr key={job.id}>
                  <td><input aria-label={`Pilih ${job.code}`} type="checkbox" /></td>
                  <td><strong>{job.code}</strong></td>
                  <td>
                    <strong>{job.title}</strong>
                    <div className="text-muted text-small">{job.category} &bull; {job.tag}</div>
                  </td>
                  <td>{job.clientName}</td>
                  <td>{job.distance}</td>
                  <td>
                    <span className="table-status-pill table-status-pill--open">
                      Tersedia
                    </span>
                  </td>
                  <td>
                    <strong className="text-navy">Rp{job.netHonor.toLocaleString('id-ID')}</strong>
                  </td>
                  <td>
                    <button
                      className="btn-table-action"
                      onClick={() => onOpenAcceptModal(job)}
                      type="button"
                    >
                      Ambil Tugas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default WorkerBerandaView
