import { useState } from 'react'
import Icon from '../../common/Icon.jsx'

function CardDots() {
  return (
    <button className="clean-card-dots-btn" type="button" aria-label="Menu opsi">
      <span className="clean-dot" />
      <span className="clean-dot" />
      <span className="clean-dot" />
    </button>
  )
}

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
  // 14 hari data jam kerja harian
  const dailyWorkload = [
    { date: '11/7', day: 'Sen', hours: 2.5, earnings: 55000 },
    { date: '12/7', day: 'Sel', hours: 3.0, earnings: 70000 },
    { date: '13/7', day: 'Rab', hours: 2.0, earnings: 45000 },
    { date: '14/7', day: 'Kam', hours: 4.0, earnings: 90000 },
    { date: '15/7', day: 'Jum', hours: 3.5, earnings: 80000 },
    { date: '16/7', day: 'Sab', hours: 5.0, earnings: 115000 },
    { date: '17/7', day: 'Min', hours: 6.0, earnings: 135000 },
    { date: '18/7', day: 'Sen', hours: 4.5, earnings: 100000 },
    { date: '19/7', day: 'Sel', hours: 3.0, earnings: 68000 },
    { date: '20/7', day: 'Rab', hours: 7.5, earnings: 165000 }, // Peak / Highlight Bar
    { date: '21/7', day: 'Kam', hours: 4.0, earnings: 92000 },
    { date: '22/7', day: 'Jum', hours: 5.5, earnings: 124000 },
    { date: '23/7', day: 'Sab', hours: 6.5, earnings: 145000 },
    { date: '24/7', day: 'Min', hours: 4.0, earnings: 90000 },
  ]

  const [hoveredBarIndex, setHoveredBarIndex] = useState(9) // Default: 20/7 (active peak bar)

  const currentStep = activeTask?.currentStepIndex || 0
  const totalHours = dailyWorkload.reduce((sum, d) => sum + d.hours, 0)
  const activeDay = dailyWorkload[hoveredBarIndex] || dailyWorkload[9]

  // Nilai metrik
  const activeTasksCount = activeTask ? 1 : 0
  const availableCount = availableJobs.length || 5
  const ratingValue = workerProfile.rating ? Number(workerProfile.rating).toFixed(1) : '5.0'
  const availableBalance = walletData.availableBalance || 145000
  const heldEscrow = walletData.heldEscrowBalance || (activeTask ? activeTask.netHonor || 78200 : 0)
  const totalMonthlyEarnings = availableBalance + heldEscrow

  return (
    <main className="clean-dash-wrapper">
      {/* 1. HEADER (Ala Contoh Gambar Referensi SaaS) */}
      <header className="clean-dash-header">
        <div className="clean-dash-header__intro">
          <span className="clean-dash-eyebrow">RINGKASAN HARI INI</span>
          <h1 className="clean-dash-title">{workerProfile.name || 'Dimas Prasetyo'}, ini ringkasan tugasmu</h1>
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
              <Icon name="briefcase" size={13} />
              <span>TUGAS AKTIF</span>
            </div>
            <CardDots />
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
              <Icon name="pin" size={13} />
              <span>RADAR ORDER</span>
            </div>
            <CardDots />
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
              <Icon name="star" size={13} />
              <span>RATING MITRA</span>
            </div>
            <CardDots />
          </div>
          <div className="clean-stat-card__value">
            {ratingValue}
          </div>
          <div className="clean-stat-card__subtext">
            Tier 1 • {workerProfile.completedTasksCount || 2} ulasan selesai
          </div>
        </article>

        {/* Card 4: Kepatuhan K3 */}
        <article className="clean-stat-card">
          <div className="clean-stat-card__top">
            <div className="clean-stat-card__label-group">
              <Icon name="shield" size={13} />
              <span>KEPATUHAN K3</span>
            </div>
            <CardDots />
          </div>
          <div className="clean-stat-card__value">
            100%
          </div>
          <div className="clean-stat-card__subtext">
            0 sengketa • SOP Terverifikasi
          </div>
        </article>
      </section>

      {/* 3. ROW 2: EYEBROW + 3 KARTU KEUANGAN (LAST 30 DAYS: COLLECTED / SEEN / OUTSTANDING) */}
      <div className="clean-section-eyebrow-row">
        <span className="clean-section-eyebrow">30 HARI TERAKHIR</span>
      </div>

      <section className="clean-financial-cards-grid">
        {/* Fin Card 1: Saldo Siap Cair */}
        <article className="clean-fin-card">
          <div className="clean-fin-card__top">
            <div className="clean-fin-card__label-group">
              <Icon name="wallet" size={14} />
              <span>SALDO SIAP CAIR</span>
            </div>
            <CardDots />
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
              <Icon name="check" size={14} />
              <span>DANA DI ESCROW</span>
            </div>
            <CardDots />
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
            {activeTask ? `${activeTask.title} • cair setelah konfirmasi` : 'Rekening penampungan resmi Relink'}
          </div>
        </article>

        {/* Fin Card 3: Total Pendapatan Bulan Ini */}
        <article className="clean-fin-card">
          <div className="clean-fin-card__top">
            <div className="clean-fin-card__label-group">
              <Icon name="clock" size={14} />
              <span>TOTAL PENDAPATAN</span>
            </div>
            <CardDots />
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

      {/* 4. ROW 3: ULTRA-CLEAN PILL BAR CHART (COLLECTED PER DAY ALA REFERENSI GAMBAR) */}
      <section className="clean-chart-card">
        <div className="clean-chart-card__header">
          <span className="clean-chart-eyebrow">STATISTIK JAM KERJA HARIAN</span>
          <span className="clean-chart-header-stat">
            {activeDay
              ? `${activeDay.day}, ${activeDay.date} • ${activeDay.hours} Jam (Rp${activeDay.earnings.toLocaleString('id-ID')})`
              : `Total ${totalHours.toFixed(1)} jam dalam periode ini`}
          </span>
        </div>

        <div className="clean-chart-inner">
          <svg
            className="clean-chart-svg"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 880 240"
          >
            {/* Garis Grid Horizontal Lembut */}
            <line stroke="#f1f5f9" strokeDasharray="4 4" x1="55" x2="860" y1="45" y2="45" />
            <line stroke="#f1f5f9" strokeDasharray="4 4" x1="55" x2="860" y1="85" y2="85" />
            <line stroke="#f1f5f9" strokeDasharray="4 4" x1="55" x2="860" y1="125" y2="125" />
            <line stroke="#f1f5f9" strokeDasharray="4 4" x1="55" x2="860" y1="165" y2="165" />

            {/* Label Sumbu Y */}
            <text fill="#94a3b8" fontSize="11" textAnchor="end" x="45" y="49">8 Jam</text>
            <text fill="#94a3b8" fontSize="11" textAnchor="end" x="45" y="89">6 Jam</text>
            <text fill="#94a3b8" fontSize="11" textAnchor="end" x="45" y="129">4 Jam</text>
            <text fill="#94a3b8" fontSize="11" textAnchor="end" x="45" y="169">0</text>

            {/* Batang Pill Vertikal (14 Hari) */}
            {dailyWorkload.map((item, idx) => {
              const xPos = 70 + idx * 56
              const maxHours = 8
              const barHeight = Math.max(16, (item.hours / maxHours) * 120)
              const yPos = 168 - barHeight
              const isSelected = hoveredBarIndex === idx

              return (
                <g
                  key={item.date}
                  className="clean-chart-bar-group"
                  onClick={() => setHoveredBarIndex(idx)}
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Area sentuh transparan */}
                  <rect fill="transparent" height="180" width="50" x={xPos - 12} y="15" />

                  {/* Batang bentuk pill vertikal */}
                  <rect
                    fill={isSelected ? '#0f1b3d' : '#e8edf3'}
                    height={barHeight}
                    rx="11"
                    style={{
                      transition: 'all 200ms ease',
                    }}
                    width="22"
                    x={xPos}
                    y={yPos}
                  />

                  {/* Label Tanggal Sumbu X */}
                  <text
                    fill={isSelected ? '#0f1b3d' : '#94a3b8'}
                    fontSize="11"
                    fontWeight={isSelected ? '700' : '500'}
                    textAnchor="middle"
                    x={xPos + 11}
                    y="198"
                  >
                    {item.date}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </section>

      {/* 5. ROW 4: ALUR TUGAS AKTIF & AGENDA PERLU TINDAKAN */}
      <div className="clean-bottom-sections-grid">
        {/* Kolom Kiri: Alur Transaksi Escrow Interaktif */}
        {activeTask ? (
          <section className="clean-card clean-active-task-card" id="active-task-section">
            <div className="clean-card__header">
              <div>
                <span className="clean-section-eyebrow">TUGAS SEDANG BERJALAN</span>
                <h3 className="clean-card-title">{activeTask.title}</h3>
                <p className="clean-card-subtitle">
                  {activeTask.clientName} • <Icon name="pin" size={12} /> {activeTask.distance} • Estimasi tiba 6 menit
                </p>
              </div>
              <span className="clean-badge clean-badge--mint">
                <Icon name="shield" size={13} /> Escrow {activeTask.escrowRef}
              </span>
            </div>

            {/* Stepper 5 Tahap Transparan */}
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

            {/* Baris Tombol Aksi */}
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

        {/* Kolom Kanan: Agenda Perlu Tindakan */}
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

      {/* 6. TABEL PELUANG TUGAS SEKITAR */}
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
                    <div className="clean-table__meta">{job.category} • {job.tag}</div>
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
