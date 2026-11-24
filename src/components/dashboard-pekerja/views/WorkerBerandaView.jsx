import { useState } from 'react'
import Icon from '../../common/Icon.jsx'

function WorkerBerandaView({
  workerProfile = {},
  activeTask = null,
  walletData = {},
  isAvailableNow = true,
  setCurrentMenu = () => {},
  onOpenAcceptModal = () => {},
  onOpenProofModal = () => {},
  onCheckInArrived = () => {},
  availableJobs = [],
  onOpenWithdrawModal = () => {},
  onTriggerSos = () => {},
  actionItems = [],
  upcomingSchedule = [],
  onOpenQuizModal = () => {},
}) {
  // 14 hari data jam kerja (ala contoh gambar referensi)
  const dailyWorkload = [
    { date: '11/11', day: 'Sen', hours: 2.5, earnings: 55000 },
    { date: '12/11', day: 'Sel', hours: 3.0, earnings: 70000 },
    { date: '13/11', day: 'Rab', hours: 2.0, earnings: 45000 },
    { date: '14/11', day: 'Kam', hours: 4.0, earnings: 90000 },
    { date: '15/11', day: 'Jum', hours: 3.5, earnings: 80000 },
    { date: '16/11', day: 'Sab', hours: 5.0, earnings: 115000 },
    { date: '17/11', day: 'Min', hours: 6.0, earnings: 135000 },
    { date: '18/11', day: 'Sen', hours: 4.5, earnings: 100000 },
    { date: '19/11', day: 'Sel', hours: 3.0, earnings: 68000 },
    { date: '20/11', day: 'Rab', hours: 7.0, earnings: 155000 }, // Peak / Active bar
    { date: '21/11', day: 'Kam', hours: 4.0, earnings: 92000 },
    { date: '22/11', day: 'Jum', hours: 5.5, earnings: 124000 },
    { date: '23/11', day: 'Sab', hours: 6.5, earnings: 145000 },
    { date: '24/11', day: 'Min', hours: 4.0, earnings: 90000 },
  ]

  const [hoveredBarIndex, setHoveredBarIndex] = useState(9) // Default: 20/11 (active bar)

  const currentStep = activeTask?.currentStepIndex || 0
  const totalHours = dailyWorkload.reduce((sum, d) => sum + d.hours, 0)
  const activeDay = dailyWorkload[hoveredBarIndex] || dailyWorkload[9]

  // Formatter nilai angka
  const activeTasksCount = activeTask ? 1 : 0
  const availableCount = availableJobs.length || 4
  const ratingValue = workerProfile.rating ? Number(workerProfile.rating).toFixed(1) : '5.0'
  const availableBalance = walletData.availableBalance || 145000
  const heldEscrow = walletData.heldEscrowBalance || (activeTask ? activeTask.netHonor || 78200 : 0)
  const totalMonthlyEarnings = availableBalance + heldEscrow

  return (
    <main className="clean-dash-wrapper">
      {/* 1. HEADER (Ala Contoh Gambar Referensi) */}
      <header className="clean-dash-header">
        <div className="clean-dash-header__intro">
          <span className="clean-dash-eyebrow">RINGKASAN HARI INI</span>
          <h1 className="clean-dash-title">{workerProfile.name || 'Dimas'}, ini ringkasan tugasmu</h1>
          <p className="clean-dash-subtitle">
            Aktivitas tugas hari ini dan performa tokomu 30 hari terakhir. Radar: {isAvailableNow ? 'Aktif (1–5 km)' : 'Nonaktif'}.
          </p>
        </div>
        <div className="clean-dash-header__actions">
          <button
            className="clean-btn-pill clean-btn-pill--secondary"
            onClick={() => setCurrentMenu('peluang')}
            type="button"
          >
            <Icon name="search" size={14} />
            <span>Peluang Tugas ({availableJobs.length})</span>
          </button>
          <button
            className="clean-btn-pill clean-btn-pill--primary"
            onClick={onOpenWithdrawModal}
            type="button"
          >
            <Icon name="wallet" size={14} />
            <span>Tarik Saldo</span>
          </button>
        </div>
      </header>

      {/* 2. ROW 1: 4 KARTU STATISTIK UTAMA (BOOKED TODAY / WAITING NOW / PATIENTS / STAFF) */}
      <section className="clean-stat-cards-grid">
        {/* Card 1: Tugas Aktif */}
        <article className="clean-stat-card">
          <div className="clean-stat-card__top">
            <div className="clean-stat-card__label-group">
              <Icon name="briefcase" size={14} />
              <span>TUGAS AKTIF</span>
            </div>
            <span className="clean-stat-card__dots">&bull;&bull;&bull;</span>
          </div>
          <div className="clean-stat-card__value">
            {activeTasksCount < 10 ? `0${activeTasksCount}` : activeTasksCount}
          </div>
          <div className="clean-stat-card__subtext">
            {activeTask ? activeTask.clientName : 'Belum ada tugas berjalan'}
          </div>
        </article>

        {/* Card 2: Radar Peluang */}
        <article className="clean-stat-card">
          <div className="clean-stat-card__top">
            <div className="clean-stat-card__label-group">
              <Icon name="pin" size={14} />
              <span>RADAR ORDER</span>
            </div>
            <span className="clean-stat-card__dots">&bull;&bull;&bull;</span>
          </div>
          <div className="clean-stat-card__value">
            {availableCount < 10 ? `0${availableCount}` : availableCount}
          </div>
          <div className="clean-stat-card__subtext">
            Radius 1–5 km siap diambil
          </div>
        </article>

        {/* Card 3: Rating Mitra */}
        <article className="clean-stat-card">
          <div className="clean-stat-card__top">
            <div className="clean-stat-card__label-group">
              <Icon name="star" size={14} />
              <span>RATING MITRA</span>
            </div>
            <span className="clean-stat-card__dots">&bull;&bull;&bull;</span>
          </div>
          <div className="clean-stat-card__value">
            {ratingValue}
          </div>
          <div className="clean-stat-card__subtext">
            Tier 1 &bull; {workerProfile.completedTasksCount || 2} ulasan selesai
          </div>
        </article>

        {/* Card 4: Kepatuhan K3 */}
        <article className="clean-stat-card">
          <div className="clean-stat-card__top">
            <div className="clean-stat-card__label-group">
              <Icon name="shield" size={14} />
              <span>KEPATUHAN K3</span>
            </div>
            <span className="clean-stat-card__dots">&bull;&bull;&bull;</span>
          </div>
          <div className="clean-stat-card__value">
            100%
          </div>
          <div className="clean-stat-card__subtext">
            0 sengketa &bull; SOP Terverifikasi
          </div>
        </article>
      </section>

      {/* 3. ROW 2: EYEBROW + 3 KARTU KEUANGAN / ESCROW (LAST 30 DAYS: COLLECTED / SEEN / OUTSTANDING) */}
      <div className="clean-section-eyebrow-row">
        <span className="clean-section-eyebrow">30 HARI TERAKHIR</span>
      </div>

      <section className="clean-financial-cards-grid">
        {/* Fin Card 1: Saldo Siap Cair */}
        <article className="clean-fin-card">
          <div className="clean-fin-card__top">
            <div className="clean-fin-card__label-group">
              <Icon name="wallet" size={15} />
              <span>SALDO SIAP CAIR</span>
            </div>
            <span className="clean-stat-card__dots">&bull;&bull;&bull;</span>
          </div>
          <div className="clean-fin-card__body">
            <strong className="clean-fin-card__amount">
              Rp{availableBalance.toLocaleString('id-ID')}
            </strong>
            <span className="clean-badge clean-badge--mint">
              +Rp98.000
            </span>
          </div>
          <div className="clean-fin-card__subtext">
            Bebas biaya admin transfer ke e-wallet &amp; bank
          </div>
        </article>

        {/* Fin Card 2: Dana Tertahan di Escrow */}
        <article className="clean-fin-card">
          <div className="clean-fin-card__top">
            <div className="clean-fin-card__label-group">
              <Icon name="check" size={15} />
              <span>DANA DI ESCROW</span>
            </div>
            <span className="clean-stat-card__dots">&bull;&bull;&bull;</span>
          </div>
          <div className="clean-fin-card__body">
            <strong className="clean-fin-card__amount clean-fin-card__amount--pink">
              Rp{heldEscrow.toLocaleString('id-ID')}
            </strong>
            <span className="clean-badge clean-badge--pink">
              {activeTask ? '1 Berjalan' : 'Aman'}
            </span>
          </div>
          <div className="clean-fin-card__subtext">
            {activeTask ? `${activeTask.title} &bull; cair setelah konfirmasi` : 'Rekening penampungan resmi Relink'}
          </div>
        </article>

        {/* Fin Card 3: Total Pendapatan Bulan Ini */}
        <article className="clean-fin-card">
          <div className="clean-fin-card__top">
            <div className="clean-fin-card__label-group">
              <Icon name="clock" size={15} />
              <span>TOTAL PENDAPATAN</span>
            </div>
            <span className="clean-stat-card__dots">&bull;&bull;&bull;</span>
          </div>
          <div className="clean-fin-card__body">
            <strong className="clean-fin-card__amount">
              Rp{totalMonthlyEarnings.toLocaleString('id-ID')}
            </strong>
            <span className="clean-badge clean-badge--navy">
              Bulan Ini
            </span>
          </div>
          <div className="clean-fin-card__subtext">
            Akumulasi honor bersih yang telah diterima
          </div>
        </article>
      </section>

      {/* 4. ROW 3: ULTRA-CLEAN PILL BAR CHART (COLLECTED PER DAY ALA REFERENSI) */}
      <div className="clean-section-eyebrow-row">
        <span className="clean-section-eyebrow">STATISTIK JAM KERJA HARIAN</span>
        <span className="clean-section-eyebrow-stat">
          Total {totalHours.toFixed(1)} jam dalam 14 hari terakhir
        </span>
      </div>

      <section className="clean-chart-card">
        <div className="clean-chart-inner">
          <svg
            className="clean-chart-svg"
            preserveAspectRatio="none"
            viewBox="0 0 840 220"
          >
            {/* Garis Grid Horizontal Lembut */}
            <line stroke="#f1f5f9" strokeDasharray="3 3" x1="50" x2="820" y1="35" y2="35" />
            <line stroke="#f1f5f9" strokeDasharray="3 3" x1="50" x2="820" y1="75" y2="75" />
            <line stroke="#f1f5f9" strokeDasharray="3 3" x1="50" x2="820" y1="115" y2="115" />
            <line stroke="#f1f5f9" strokeDasharray="3 3" x1="50" x2="820" y1="155" y2="155" />

            {/* Label Sumbu Y */}
            <text fill="#94a3b8" fontSize="11" textAnchor="end" x="42" y="39">8 Jam</text>
            <text fill="#94a3b8" fontSize="11" textAnchor="end" x="42" y="79">6 Jam</text>
            <text fill="#94a3b8" fontSize="11" textAnchor="end" x="42" y="119">4 Jam</text>
            <text fill="#94a3b8" fontSize="11" textAnchor="end" x="42" y="159">0</text>

            {/* Pill Bar Chart Bars (14 Bars) */}
            {dailyWorkload.map((item, idx) => {
              // Bar width: 26, spacing: 54
              const xPos = 65 + idx * 54
              const maxHours = 8
              const barHeight = Math.max(18, (item.hours / maxHours) * 125)
              const yPos = 160 - barHeight
              const isSelected = hoveredBarIndex === idx

              return (
                <g
                  key={item.date}
                  className="clean-chart-bar-group"
                  onClick={() => setHoveredBarIndex(idx)}
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Invisible hit area */}
                  <rect fill="transparent" height="175" width="48" x={xPos - 11} y="15" />

                  {/* Rounded Pill Bar */}
                  <rect
                    fill={isSelected ? '#0f1b3d' : '#e2e8f0'}
                    height={barHeight}
                    rx="12"
                    style={{
                      transition: 'all 220ms ease',
                    }}
                    width="24"
                    x={xPos}
                    y={yPos}
                  />

                  {/* Label Tanggal / Hari */}
                  <text
                    fill={isSelected ? '#0f1b3d' : '#94a3b8'}
                    fontSize="11"
                    fontWeight={isSelected ? '700' : '500'}
                    textAnchor="middle"
                    x={xPos + 12}
                    y="186"
                  >
                    {item.date}
                  </text>
                </g>
              )
            })}

            {/* Active Floating Tooltip Bubble */}
            {activeDay && (
              (() => {
                const activeX = 65 + hoveredBarIndex * 54 + 12
                const tooltipWidth = 140
                const bubbleX = Math.min(Math.max(activeX - tooltipWidth / 2, 50), 680)

                return (
                  <g
                    className="clean-chart-tooltip"
                    style={{ pointerEvents: 'none', transition: 'all 180ms ease' }}
                    transform={`translate(${bubbleX}, 6)`}
                  >
                    <rect
                      fill="#0f1b3d"
                      height="24"
                      rx="12"
                      style={{ filter: 'drop-shadow(0 2px 6px rgba(15, 27, 61, 0.2))' }}
                      width={tooltipWidth}
                    />
                    <text
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                      x={tooltipWidth / 2}
                      y="16"
                    >
                      {activeDay.day}, {activeDay.date}: {activeDay.hours} Jam (Rp{activeDay.earnings.toLocaleString('id-ID')})
                    </text>
                  </g>
                )
              })()
            )}
          </svg>
        </div>
      </section>

      {/* 5. ROW 4: ALUR TUGAS AKTIF & TABEL AKTIVITAS TERKINI (CLEAN & TIDAK KERAMAIAN) */}
      <div className="clean-bottom-sections-grid">
        {/* Left Column: Alur Tugas Aktif (Escrow Lifecycle) */}
        {activeTask ? (
          <section className="clean-card clean-active-task-card" id="active-task-section">
            <div className="clean-card__header">
              <div>
                <span className="clean-section-eyebrow">TUGAS SEDANG BERJALAN</span>
                <h3 className="clean-card-title">{activeTask.title}</h3>
                <p className="clean-card-subtitle">
                  {activeTask.clientName} &bull; <Icon name="pin" size={12} /> {activeTask.distance} &bull; Estimasi tiba 6 menit
                </p>
              </div>
              <span className="clean-badge clean-badge--mint">
                <Icon name="shield" size={13} /> Escrow {activeTask.escrowRef}
              </span>
            </div>

            {/* 5-Step Progress Tracker */}
            <div className="clean-stepper-row">
              {[
                { step: 1, title: 'Dana Ditahan', desc: `Rp${activeTask.grossHonor.toLocaleString('id-ID')}` },
                { step: 2, title: 'Menuju Lokasi', desc: 'Check-in saat tiba' },
                { step: 3, title: 'Pengerjaan', desc: 'Sesuai SOP checklist' },
                { step: 4, title: 'Review Bukti', desc: 'Konfirmasi Klien' },
                { step: 5, title: 'Dana Cair', desc: `Rp${activeTask.netHonor.toLocaleString('id-ID')}` },
              ].map((s, idx) => {
                const isDone = currentStep >= s.step
                const isCurrent = currentStep === s.step - 1

                return (
                  <div key={s.step} className="clean-stepper-node-wrapper">
                    <div className="clean-stepper-node">
                      <div className={`clean-step-circle ${isDone ? 'clean-step-circle--done' : isCurrent ? 'clean-step-circle--active' : ''}`}>
                        {isDone ? <Icon name="check" size={12} /> : s.step}
                      </div>
                      <div className="clean-step-labels">
                        <strong className={isCurrent ? 'text-pink' : ''}>{s.title}</strong>
                        <small>{s.desc}</small>
                      </div>
                    </div>
                    {idx < 4 && <div className={`clean-step-line ${currentStep > idx ? 'clean-step-line--done' : ''}`} />}
                  </div>
                )
              })}
            </div>

            {/* Action Bar */}
            <div className="clean-active-task-actions">
              <div className="clean-active-task-honor">
                <span className="text-muted">Honor Bersih:</span>
                <strong className="text-pink">Rp{activeTask.netHonor.toLocaleString('id-ID')}</strong>
              </div>

              <div className="clean-active-task-btn-group">
                <a
                  className="clean-btn-pill clean-btn-pill--whatsapp"
                  href={`https://wa.me/${activeTask.clientPhone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(activeTask.clientName)},%20saya%20${encodeURIComponent(workerProfile.name)}%20dari%20Relink.`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon name="chat" size={14} />
                  <span>Chat Klien</span>
                </a>

                <button
                  className="clean-btn-pill clean-btn-pill--sos"
                  onClick={onTriggerSos}
                  type="button"
                >
                  <Icon name="alert" size={14} />
                  <span>SOS</span>
                </button>

                {currentStep === 1 && (
                  <button
                    className="clean-btn-pill clean-btn-pill--primary"
                    onClick={onCheckInArrived}
                    type="button"
                  >
                    <Icon name="pin" size={14} />
                    <span>Check-in di Lokasi</span>
                  </button>
                )}

                {currentStep === 2 && (
                  <button
                    className="clean-btn-pill clean-btn-pill--pink"
                    onClick={onOpenProofModal}
                    type="button"
                  >
                    <Icon name="check" size={14} />
                    <span>Serahkan Bukti Hasil</span>
                  </button>
                )}

                {currentStep === 3 && (
                  <span className="clean-badge clean-badge--navy">
                    <Icon name="clock" size={13} /> Menunggu Review Klien
                  </span>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="clean-card clean-active-task-card">
            <div className="clean-card__header">
              <div>
                <span className="clean-section-eyebrow">STATUS RADAR</span>
                <h3 className="clean-card-title">Siap Menerima Order Baru</h3>
                <p className="clean-card-subtitle">
                  Aktifkan status kerja untuk menerima pesanan UMKM di sekitarmu secara instan.
                </p>
              </div>
              <button
                className="clean-btn-pill clean-btn-pill--pink"
                onClick={() => setCurrentMenu('peluang')}
                type="button"
              >
                Cari Tugas &rarr;
              </button>
            </div>
          </section>
        )}

        {/* Right Column: Perlu Tindakan & Pelatihan */}
        <section className="clean-card clean-action-items-card">
          <div className="clean-card__header">
            <div>
              <span className="clean-section-eyebrow">AGENDA KERJA</span>
              <h3 className="clean-card-title">Perlu Tindakan</h3>
            </div>
            <span className="clean-badge clean-badge--navy">{actionItems.length}</span>
          </div>

          <ul className="clean-action-list">
            {actionItems.map((act) => (
              <li key={act.id} className="clean-action-item">
                <div className={`clean-action-item__icon clean-action-item__icon--${act.tone}`}>
                  <Icon name={act.type === 'video' ? 'star' : act.type === 'review' ? 'check' : 'users'} size={14} />
                </div>
                <div className="clean-action-item__content">
                  <strong>{act.title}</strong>
                  <p>{act.desc}</p>
                </div>
                {act.type === 'video' && onOpenQuizModal && (
                  <button
                    className="clean-btn-small-link"
                    onClick={onOpenQuizModal}
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

      {/* 6. TABEL PELUANG TUGAS & AKTIVITAS TERKINI (CLEAN DATA TABLE) */}
      <section className="clean-card clean-table-card">
        <div className="clean-card__header">
          <div>
            <span className="clean-section-eyebrow">DAFTAR PENUGASAN</span>
            <h3 className="clean-card-title">Peluang Tugas Sekitar</h3>
            <p className="clean-card-subtitle">Pekerjaan mikro terverifikasi escrow dalam radius 1–5 km</p>
          </div>
          <button
            className="clean-btn-pill clean-btn-pill--secondary"
            onClick={() => setCurrentMenu('peluang')}
            type="button"
          >
            Lihat Semua ({availableJobs.length}) &rarr;
          </button>
        </div>

        <div className="clean-table-container">
          <table className="clean-table">
            <thead>
              <tr>
                <th>KODE</th>
                <th>TUGAS / DESKRIPSI</th>
                <th>KLIEN</th>
                <th>JARAK</th>
                <th>STATUS</th>
                <th>HONOR BERSIH</th>
                <th>TINDAKAN</th>
              </tr>
            </thead>
            <tbody>
              {activeTask && (
                <tr className="clean-table__row--highlight">
                  <td><strong>{activeTask.code}</strong></td>
                  <td>
                    <strong className="text-navy">{activeTask.title}</strong>
                    <div className="clean-table__meta">{activeTask.category}</div>
                  </td>
                  <td>{activeTask.clientName}</td>
                  <td>{activeTask.distance}</td>
                  <td>
                    <span className="clean-badge clean-badge--pink">
                      {currentStep === 1 ? 'Menuju Lokasi' : currentStep === 2 ? 'Sedang Dikerjakan' : 'Review Bukti'}
                    </span>
                  </td>
                  <td>
                    <strong className="text-pink">Rp{activeTask.netHonor.toLocaleString('id-ID')}</strong>
                  </td>
                  <td>
                    <button
                      className="clean-btn-small clean-btn-small--pink"
                      onClick={onOpenProofModal}
                      type="button"
                    >
                      Buka SOP
                    </button>
                  </td>
                </tr>
              )}

              {availableJobs.slice(0, 4).map((job) => (
                <tr key={job.id}>
                  <td><strong>{job.code}</strong></td>
                  <td>
                    <strong className="text-navy">{job.title}</strong>
                    <div className="clean-table__meta">{job.category} &bull; {job.tag}</div>
                  </td>
                  <td>{job.clientName}</td>
                  <td>{job.distance}</td>
                  <td>
                    <span className={`clean-badge ${job.locked ? 'clean-badge--navy' : 'clean-badge--mint'}`}>
                      {job.locked ? 'Tier 2' : 'Tersedia'}
                    </span>
                  </td>
                  <td>
                    <strong className="text-navy">Rp{job.netHonor.toLocaleString('id-ID')}</strong>
                  </td>
                  <td>
                    {job.locked ? (
                      <button
                        className="clean-btn-small clean-btn-small--disabled"
                        disabled
                        type="button"
                      >
                        Buka di Tier 2
                      </button>
                    ) : (
                      <button
                        className="clean-btn-small clean-btn-small--primary"
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
      </section>
    </main>
  )
}

export default WorkerBerandaView
