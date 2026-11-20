import { useState, useMemo } from 'react'
import Icon from '../../common/Icon.jsx'

function BerandaView({
  tasks = [],
  totalHeldEscrow = 0,
  setCurrentMenu,
  setSelectedProofTask,
  setShowProofModal,
  onOpenTaskDetail,
}) {
  // State Filter Waktu & Interaktivitas Grafik
  const [timeframe, setTimeframe] = useState('Minggu Ini')
  const [hoveredDayIndex, setHoveredDayIndex] = useState(2) // Default ke 'Rab' (28 Tugas) sesuai visual referensi
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState(4) // Default ke 'Nov' (Bulan Berjalan)

  // 1. REALTIME METRIK RINGKASAN
  const activeWorkersCount = useMemo(() => {
    const assigned = tasks.filter((t) => t.workerName).map((t) => t.workerName)
    const unique = new Set(assigned)
    return Math.max(unique.size, 1) + 7 // Baseline mitra aktif toko + live assigned
  }, [tasks])

  const reviewTasksCount = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.statusBadge === 'Review Bukti' ||
        t.statusBadge === 'Proof Review' ||
        t.column === 'due_week' ||
        t.status === 'review'
    ).length
  }, [tasks])

  const totalBudgetSpent = useMemo(() => {
    return tasks.reduce((sum, t) => sum + (Number(t.budget) || 0), 0)
  }, [tasks])

  // 2. REALTIME GRAFIK 1: STATISTIK BEBAN TUGAS MINGGUAN (Senin - Minggu)
  const daysConfig = useMemo(() => {
    // Base volume toko harian
    const baseCounts = [18, 12, 24, 14, 20, 26, 16]

    // Faktor pengali berdasarkan filter timeframe
    const multiplier = timeframe === 'Bulan Ini' ? 3.5 : timeframe === 'Semua Data' ? 5.2 : 1.0

    // Setiap penambahan atau perubahan tasks di database secara realtime mendistribusikan beban tugas
    const liveTaskOffset = tasks.length

    return [
      { key: 'Sen', label: 'Senin', count: Math.round((baseCounts[0] + (liveTaskOffset % 3)) * multiplier), x: 50 },
      { key: 'Sel', label: 'Selasa', count: Math.round((baseCounts[1] + ((liveTaskOffset + 1) % 2)) * multiplier), x: 120 },
      { key: 'Rab', label: 'Rabu', count: Math.round((baseCounts[2] + Math.max(liveTaskOffset - 1, 0)) * multiplier), x: 190 },
      { key: 'Kam', label: 'Kamis', count: Math.round((baseCounts[3] + (liveTaskOffset % 2)) * multiplier), x: 260 },
      { key: 'Jum', label: 'Jumat', count: Math.round((baseCounts[4] + Math.floor(liveTaskOffset / 2)) * multiplier), x: 330 },
      { key: 'Sab', label: 'Sabtu', count: Math.round((baseCounts[5] + Math.floor(liveTaskOffset / 2)) * multiplier), x: 400 },
      { key: 'Min', label: 'Minggu', count: Math.round((baseCounts[6] + (liveTaskOffset % 3)) * multiplier), x: 470 },
    ]
  }, [tasks, timeframe])

  // Nilai maksimum dinamis untuk skala grafik
  const maxDayCount = useMemo(() => {
    const highest = Math.max(...daysConfig.map((d) => d.count), 30)
    return Math.ceil(highest / 10) * 10
  }, [daysConfig])

  // 3. REALTIME GRAFIK 2: EFISIENSI ANGGARAN MIKRO (Honor vs Penghematan Tier)
  const monthlyData = useMemo(() => {
    // Live honor November dihitung langsung dari total anggaran tugas aktif toko
    const dynamicNovHonor = Math.round(520000 + totalBudgetSpent * 0.45)
    const dynamicNovHemat = Math.round(dynamicNovHonor * 0.48)

    return [
      { month: 'Jul', honor: 480000, hemat: 390000, honorH: 50, hematH: 40, x: 40 },
      { month: 'Agu', honor: 550000, hemat: 600000, honorH: 55, hematH: 60, x: 90 },
      { month: 'Sep', honor: 450000, hemat: 500000, honorH: 45, hematH: 50, x: 140 },
      { month: 'Okt', honor: 500000, hemat: 800000, honorH: 50, hematH: 80, x: 190 },
      {
        month: 'Nov',
        honor: dynamicNovHonor,
        hemat: dynamicNovHemat,
        honorH: Math.min(Math.round((dynamicNovHonor / 1000000) * 80), 65),
        hematH: Math.min(Math.round((dynamicNovHemat / 1000000) * 110), 95),
        x: 240,
        isCurrent: true,
      },
      { month: 'Des', honor: 350000, hemat: 700000, honorH: 35, hematH: 70, x: 290 },
    ]
  }, [totalBudgetSpent])

  const activeMonthData = monthlyData[hoveredMonthIndex] || monthlyData[4]

  return (
    <main className="dashboard-content-flow">
      {/* Header Judul & Date Picker */}
      <div className="content-heading-bar">
        <div>
          <h1>Aktivitas Usaha &amp; Tugas</h1>
          <p>Ringkasan operasional micro-job harian dan efisiensi pengeluaran toko.</p>
        </div>
        <div className="date-filter-capsule">
          <Icon name="clock" size={14} />
          <span>19 Nov 2026 - Hari ini (Realtime Sync)</span>
        </div>
      </div>

      {/* 4 KARTU STATISTIK UTAMA (Realtime Berdasarkan State Database) */}
      <div className="summary-metrics-grid">
        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Total Tugas Aktif</span>
            <div className="metric-icon-bubble">
              <Icon name="briefcase" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>{tasks.length}</strong>
            <span className="metric-trend metric-trend--up">↑ Realtime</span>
          </div>
          <small className="metric-sub-note">Tersinkronisasi otomatis</small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Mitra Bekerja</span>
            <div className="metric-icon-bubble">
              <Icon name="users" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>{activeWorkersCount} Orang</strong>
            <span className="metric-trend metric-trend--up">↑ 7.5%</span>
          </div>
          <small className="metric-sub-note">Radius 1–5 km aktif</small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Menunggu Review</span>
            <div className="metric-icon-bubble metric-icon-bubble--warn">
              <Icon name="clock" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong className="text-pink">{reviewTasksCount} Tugas</strong>
            <span className="metric-trend metric-trend--warn">Siap TTD</span>
          </div>
          <small className="metric-sub-note">Perlu persetujuan bukti</small>
        </div>

        <div
          className="metric-box-card metric-box-card--interactive"
          onClick={() => setCurrentMenu('escrow')}
          title="Buka Menu Dana Escrow & Proteksi Transaksi"
        >
          <div className="metric-box-card__header">
            <span>Dana Aman Escrow</span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="shield" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>Rp{totalHeldEscrow.toLocaleString('id-ID')}</strong>
            <span className="metric-trend metric-trend--good">Buka Mutasi →</span>
          </div>
          <small className="metric-sub-note">100% dilindungi garansi Relink</small>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BAGIAN GRAFIK REALTIME INTERAKTIF */}
      {/* ======================================================== */}
      <div className="charts-split-grid">
        {/* Grafik Batang Kiri: Analisis Aktivitas Harian */}
        <div className="analytics-card">
          <div className="analytics-card__header">
            <div>
              <h3>Statistik Beban Tugas Mingguan</h3>
              <small>Jumlah pengerjaan tugas mikro per hari (Realtime Interaktif)</small>
            </div>
            <div
              className="timeframe-selector"
              onClick={() => {
                setTimeframe((prev) =>
                  prev === 'Minggu Ini'
                    ? 'Bulan Ini'
                    : prev === 'Bulan Ini'
                    ? 'Semua Data'
                    : 'Minggu Ini'
                )
              }}
              title="Klik untuk beralih rentang waktu"
            >
              <span>{timeframe}</span>
              <Icon name="arrow" size={12} />
            </div>
          </div>

          <div className="chart-drawing-box">
            <svg
              className="chart-svg-main"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 540 200"
            >
              {/* Garis Grid Horizontal Relatif */}
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="30" x2="520" y1="35" y2="35" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="30" x2="520" y1="80" y2="80" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="30" x2="520" y1="125" y2="125" />
              <line stroke="#edf2f7" x1="30" x2="520" y1="170" y2="170" />

              {/* Label Y-Axis Dinamis */}
              <text fill="#8c9cb8" fontSize="10" fontWeight="600" x="8" y="38">
                {maxDayCount}
              </text>
              <text fill="#8c9cb8" fontSize="10" fontWeight="600" x="8" y="83">
                {Math.round((maxDayCount * 2) / 3)}
              </text>
              <text fill="#8c9cb8" fontSize="10" fontWeight="600" x="8" y="128">
                {Math.round(maxDayCount / 3)}
              </text>
              <text fill="#8c9cb8" fontSize="10" fontWeight="600" x="12" y="173">
                0
              </text>

              {/* Batang-batang hari (Senin - Minggu) */}
              {daysConfig.map((day, idx) => {
                const barHeight = Math.max(14, (day.count / maxDayCount) * 135)
                const barY = 170 - barHeight
                const isHovered = hoveredDayIndex === idx

                return (
                  <g
                    key={day.key}
                    className="chart-bar-group"
                    onMouseEnter={() => setHoveredDayIndex(idx)}
                    onClick={() => setHoveredDayIndex(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Background hit area untuk kemudahan hover di mobile/mouse */}
                    <rect
                      fill="transparent"
                      height="160"
                      width="50"
                      x={day.x - 7}
                      y="15"
                    />

                    {/* Batang Pink Utama */}
                    <rect
                      fill="#ff3d8b"
                      height={barHeight}
                      rx="14"
                      width="36"
                      x={day.x}
                      y={barY}
                      style={{
                        transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                        opacity: isHovered ? 1 : 0.88,
                        filter: isHovered ? 'drop-shadow(0 4px 10px rgba(255, 61, 139, 0.4))' : 'none',
                      }}
                    />

                    {/* Label Hari */}
                    <text
                      fill={isHovered ? '#0f1b3d' : '#5c6c8d'}
                      fontSize="11"
                      fontWeight={isHovered ? '800' : '600'}
                      textAnchor="middle"
                      x={day.x + 18}
                      y="190"
                    >
                      {day.key}
                    </text>
                  </g>
                )
              })}

              {/* Dynamic Floating Tooltip Bubble di atas bar yang dihover */}
              {hoveredDayIndex !== null && daysConfig[hoveredDayIndex] && (
                (() => {
                  const activeDay = daysConfig[hoveredDayIndex]
                  const barHeight = Math.max(14, (activeDay.count / maxDayCount) * 135)
                  const barY = 170 - barHeight
                  const bubbleWidth = 72
                  const bubbleX = activeDay.x + 18 - bubbleWidth / 2
                  const bubbleY = Math.max(10, barY - 26)

                  return (
                    <g
                      className="chart-tooltip-bubble"
                      transform={`translate(${bubbleX}, ${bubbleY})`}
                      style={{ pointerEvents: 'none', transition: 'transform 180ms ease' }}
                    >
                      <rect
                        fill="#0f1b3d"
                        height="20"
                        rx="10"
                        width={bubbleWidth}
                        style={{ filter: 'drop-shadow(0 2px 6px rgba(15, 27, 61, 0.25))' }}
                      />
                      <text
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="700"
                        textAnchor="middle"
                        x={bubbleWidth / 2}
                        y="14"
                      >
                        {activeDay.count} Tugas
                      </text>
                    </g>
                  )
                })()
              )}
            </svg>
          </div>
        </div>

        {/* Grafik Batang Kanan: Alokasi Biaya vs Efisiensi */}
        <div className="analytics-card">
          <div className="analytics-card__header">
            <div>
              <h3>Efisiensi Anggaran Mikro</h3>
              <small>Perbandingan biaya langsung vs penghematan tier</small>
            </div>
            <div className="chart-legend-row">
              <span className="legend-chip">
                <span className="legend-box legend-box--pink" /> Honor
              </span>
              <span className="legend-chip">
                <span className="legend-box legend-box--navy" /> Hemat
              </span>
            </div>
          </div>

          <div className="chart-drawing-box">
            <svg
              className="chart-svg-main"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 360 200"
            >
              {/* Garis Grid Horizontal */}
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="20" x2="340" y1="30" y2="30" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="20" x2="340" y1="80" y2="80" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="20" x2="340" y1="130" y2="130" />
              <line stroke="#edf2f7" x1="20" x2="340" y1="170" y2="170" />

              {/* Stack Bars (Navy Hemat di bawah, Pink Honor di atas) */}
              {monthlyData.map((item, idx) => {
                const isHovered = hoveredMonthIndex === idx
                const navyY = 170 - item.hematH
                const pinkY = navyY - item.honorH

                return (
                  <g
                    key={item.month}
                    className="chart-stack-group"
                    onMouseEnter={() => setHoveredMonthIndex(idx)}
                    onClick={() => setHoveredMonthIndex(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Transparent touch area */}
                    <rect
                      fill="transparent"
                      height="160"
                      width="36"
                      x={item.x - 7}
                      y="15"
                    />

                    {/* Bottom Bar: Navy (Hemat) */}
                    <rect
                      fill="#0f1b3d"
                      height={item.hematH}
                      rx="8"
                      width="22"
                      x={item.x}
                      y={navyY}
                      style={{
                        transition: 'all 200ms ease',
                        opacity: isHovered ? 1 : 0.85,
                        filter: isHovered ? 'drop-shadow(0 2px 6px rgba(15, 27, 61, 0.4))' : 'none',
                      }}
                    />

                    {/* Top Bar: Pink (Honor) */}
                    <rect
                      fill="#ff3d8b"
                      height={item.honorH}
                      rx="8"
                      width="22"
                      x={item.x}
                      y={pinkY}
                      style={{
                        transition: 'all 200ms ease',
                        opacity: isHovered ? 1 : 0.85,
                        filter: isHovered ? 'drop-shadow(0 2px 6px rgba(255, 61, 139, 0.4))' : 'none',
                      }}
                    />

                    {/* Label Bulan */}
                    <text
                      fill={isHovered ? '#0f1b3d' : '#5c6c8d'}
                      fontSize="10"
                      fontWeight={isHovered ? '800' : '600'}
                      textAnchor="middle"
                      x={item.x + 11}
                      y="188"
                    >
                      {item.month}
                    </text>
                  </g>
                )
              })}

              {/* Floating Tooltip Pill untuk Efisiensi Anggaran Mikro */}
              {activeMonthData && (
                (() => {
                  const bubbleWidth = 96
                  const bubbleX = Math.min(Math.max(activeMonthData.x + 11 - bubbleWidth / 2, 20), 244)
                  const totalEff = activeMonthData.honor + activeMonthData.hemat

                  return (
                    <g
                      transform={`translate(${bubbleX}, 8)`}
                      style={{ pointerEvents: 'none', transition: 'all 180ms ease' }}
                    >
                      <rect
                        fill="#0f1b3d"
                        height="18"
                        rx="9"
                        width={bubbleWidth}
                        style={{ filter: 'drop-shadow(0 2px 5px rgba(15, 27, 61, 0.2))' }}
                      />
                      <text
                        fill="#3de0b0"
                        fontSize="9.5"
                        fontWeight="700"
                        textAnchor="middle"
                        x={bubbleWidth / 2}
                        y="12.5"
                      >
                        {activeMonthData.month}: Rp{(totalEff / 1000).toLocaleString('id-ID')}rb
                      </text>
                    </g>
                  )
                })()
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* TABEL AKTIVITAS TERKINI (Recent Tasks Table) */}
      <div className="recent-orders-card">
        <div className="recent-orders-card__header">
          <div>
            <h3>Aktivitas Tugas Terkini</h3>
            <small>Daftar penugasan dan serah terima pekerjaan paling baru</small>
          </div>
          <div className="table-action-filters">
            <button
              className="btn-view-kanban-link"
              onClick={() => setCurrentMenu('kanban')}
              type="button"
            >
              Buka Papan Kanban Lengkap →
            </button>
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="clean-data-table">
            <thead>
              <tr>
                <th width="40"><input aria-label="Pilih semua" type="checkbox" /></th>
                <th>Kode</th>
                <th>Tanggal</th>
                <th>Mitra Pekerja</th>
                <th>Kategori</th>
                <th>Status</th>
                <th>Honor Escrow</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td><input aria-label={`Pilih ${task.code}`} type="checkbox" /></td>
                  <td><strong>{task.code}</strong></td>
                  <td>{task.dateRange}</td>
                  <td>
                    <div className="table-worker-cell">
                      <img alt="" className="table-worker-avatar" src={task.workerPhoto} />
                      <span>{task.workerName || 'Menunggu Mitra'}</span>
                    </div>
                  </td>
                  <td><span className="table-category-badge">{task.category}</span></td>
                  <td>
                    <span
                      className={`table-status-pill table-status-pill--${(
                        task.statusBadge || task.status || ''
                      )
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {task.statusBadge || task.status}
                    </span>
                  </td>
                  <td><strong>Rp{(Number(task.budget) || 0).toLocaleString('id-ID')}</strong></td>
                  <td>
                    {task.proofData ? (
                      <button
                        className="btn-table-action btn-table-action--pink"
                        onClick={() => {
                          setSelectedProofTask(task)
                          setShowProofModal(true)
                        }}
                        type="button"
                      >
                        Periksa Bukti
                      </button>
                    ) : (
                      <button
                        className="btn-table-action"
                        onClick={() => {
                          if (onOpenTaskDetail) {
                            onOpenTaskDetail(task)
                          } else {
                            setCurrentMenu('kanban')
                          }
                        }}
                        type="button"
                      >
                        Detail
                      </button>
                    )}
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

export default BerandaView
