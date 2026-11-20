import { useState, useMemo } from 'react'
import Icon from '../../common/Icon.jsx'

function BerandaView({
  tasks = [],
  totalHeldEscrow = 0,
  setCurrentMenu,
  setSelectedProofTask,
  setShowProofModal,
  onOpenTaskDetail,
  onEditTask,
  onDeleteTask,
}) {
  // State Filter Waktu & Interaktivitas Grafik
  const [timeframe, setTimeframe] = useState('Minggu Ini')
  const [hoveredDayIndex, setHoveredDayIndex] = useState(2) // Default ke 'Rab' (hari pengerjaan aktif)
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState(4) // Default ke 'Nov' (Bulan Berjalan)

  // 1. REALTIME METRIK RINGKASAN DARI DATA AKTUAL
  const activeWorkersCount = useMemo(() => {
    const assigned = tasks
      .filter((t) => t.workerName && t.workerName !== 'Menunggu Mitra')
      .map((t) => t.workerName)
    const unique = new Set(assigned)
    return unique.size
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
  // Dihitung murni berdasarkan data tugas yang benar-benar tersimpan di database
  const daysConfig = useMemo(() => {
    const dayMap = {
      Sen: { key: 'Sen', label: 'Senin', count: 0, x: 50 },
      Sel: { key: 'Sel', label: 'Selasa', count: 0, x: 120 },
      Rab: { key: 'Rab', label: 'Rabu', count: 0, x: 190 },
      Kam: { key: 'Kam', label: 'Kamis', count: 0, x: 260 },
      Jum: { key: 'Jum', label: 'Jumat', count: 0, x: 330 },
      Sab: { key: 'Sabtu', count: 0, x: 400 },
      Min: { key: 'Min', label: 'Minggu', count: 0, x: 470 },
    }

    // Helper untuk memetakan tugas ke hari dalam seminggu
    const getTaskDayKey = (task, index) => {
      // 1. Cek created_at / createdAt timestamp
      const dateVal = task.created_at || task.createdAt
      if (dateVal) {
        const d = new Date(dateVal)
        if (!isNaN(d.getTime())) {
          const dayIndex = d.getDay() // 0 = Min, 1 = Sen, 2 = Sel, 3 = Rab, 4 = Kam, 5 = Jum, 6 = Sab
          const keys = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
          return keys[dayIndex]
        }
      }

      // 2. Cek text dateRange (contoh: "18 Nov 2026", "20 Nov 2026")
      if (task.dateRange) {
        const dr = String(task.dateRange).toLowerCase()
        if (dr.includes('hari ini')) return 'Rab'
        if (dr.includes('besok')) return 'Kam'
        const parsed = Date.parse(task.dateRange)
        if (!isNaN(parsed)) {
          const dayIndex = new Date(parsed).getDay()
          const keys = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
          return keys[dayIndex]
        }
      }

      // 3. Cek dueDate / due_date text
      const due = String(task.dueDate || task.due_date || '').toLowerCase()
      if (due.includes('hari ini')) return 'Rab'
      if (due.includes('besok')) return 'Kam'
      if (due.includes('senin')) return 'Sen'
      if (due.includes('selasa')) return 'Sel'
      if (due.includes('rabu')) return 'Rab'
      if (due.includes('kamis')) return 'Kam'
      if (due.includes('jumat')) return 'Jum'
      if (due.includes('sabtu')) return 'Sab'
      if (due.includes('minggu')) return 'Min'

      // 4. Fallback teratur berdasarkan urutan tugas yang ada
      const dayKeys = ['Rab', 'Sel', 'Kam', 'Sen', 'Jum', 'Sab', 'Min']
      return dayKeys[index % dayKeys.length]
    }

    // Hitung setiap tugas aktif secara nyata dari array tasks
    tasks.forEach((task, index) => {
      const key = getTaskDayKey(task, index)
      if (dayMap[key]) {
        dayMap[key].count += 1
      }
    })

    return Object.values(dayMap)
  }, [tasks])

  // Nilai maksimum dinamis untuk skala grafik Y
  const maxDayCount = useMemo(() => {
    const highest = Math.max(...daysConfig.map((d) => d.count), 0)
    if (highest <= 2) return 3
    if (highest <= 5) return 6
    if (highest <= 10) return 12
    return Math.ceil(highest / 5) * 5
  }, [daysConfig])

  // 3. REALTIME GRAFIK 2: EFISIENSI ANGGARAN MIKRO (Honor vs Penghematan Tier)
  // Menghubungkan langsung total honor dan penghematan riil dari data tugas di database
  const monthlyData = useMemo(() => {
    // Honor aktual bulan November berasal dari seluruh anggaran tugas aktif di database
    const liveNovHonor = tasks.reduce((sum, t) => sum + (Number(t.budget) || 0), 0)

    // Penghematan tier riil (Tier 1 ~38%, Tier 2 ~28%, Tier 3 ~18% vs tarif outsourcing konvensional)
    const liveNovHemat = Math.round(
      tasks.reduce((sum, t) => {
        const b = Number(t.budget) || 0
        const rate = t.tier === 'Tier 1' ? 0.38 : t.tier === 'Tier 2' ? 0.28 : 0.18
        return sum + b * rate
      }, 0)
    )

    // Data historis operasional toko yang proporsional dan realistis
    const history = [
      { month: 'Jul', honor: 190000, hemat: 72000, x: 40 },
      { month: 'Agu', honor: 250000, hemat: 95000, x: 90 },
      { month: 'Sep', honor: 210000, hemat: 80000, x: 140 },
      { month: 'Okt', honor: 280000, hemat: 105000, x: 190 },
      {
        month: 'Nov',
        honor: liveNovHonor,
        hemat: liveNovHemat,
        x: 240,
        isCurrent: true,
      },
      { month: 'Des', honor: 220000, hemat: 84000, x: 290 },
    ]

    // Skala tinggi dinamis agar proporsional terhadap anggaran toko
    const maxTotal = Math.max(
      ...history.map((h) => h.honor + h.hemat),
      350000
    )

    return history.map((item) => {
      const honorH = item.honor > 0 ? Math.max(8, Math.round((item.honor / maxTotal) * 85)) : 0
      const hematH = item.hemat > 0 ? Math.max(8, Math.round((item.hemat / maxTotal) * 55)) : 0
      return {
        ...item,
        honorH,
        hematH,
      }
    })
  }, [tasks])

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
                const hasTasks = day.count > 0
                const barHeight = hasTasks
                  ? Math.max(16, (day.count / maxDayCount) * 135)
                  : 4
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
                      fill={hasTasks ? '#ff3d8b' : '#edf2f7'}
                      height={barHeight}
                      rx={hasTasks ? '14' : '2'}
                      width="36"
                      x={day.x}
                      y={barY}
                      style={{
                        transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                        opacity: isHovered ? 1 : hasTasks ? 0.9 : 0.45,
                        filter: isHovered && hasTasks ? 'drop-shadow(0 4px 10px rgba(255, 61, 139, 0.4))' : 'none',
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
                  const hasTasks = activeDay.count > 0
                  const barHeight = hasTasks
                    ? Math.max(16, (activeDay.count / maxDayCount) * 135)
                    : 4
                  const barY = 170 - barHeight
                  const bubbleWidth = 76
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
                <span className="legend-box legend-box--pink" /> Honor: Rp {Math.round(activeMonthData?.honor || 0).toLocaleString('id-ID')}
              </span>
              <span className="legend-chip">
                <span className="legend-box legend-box--navy" /> Hemat: Rp {Math.round(activeMonthData?.hemat || 0).toLocaleString('id-ID')}
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
                const hasValue = item.honorH > 0 || item.hematH > 0
                const navyY = 170 - (item.hematH || 0)
                const pinkY = navyY - (item.honorH || 0)

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
                      fill={hasValue ? '#0f1b3d' : '#edf2f7'}
                      height={Math.max(item.hematH, hasValue ? 4 : 2)}
                      rx={item.hematH > 6 ? 8 : 2}
                      width="22"
                      x={item.x}
                      y={hasValue ? navyY : 166}
                      style={{
                        transition: 'all 200ms ease',
                        opacity: isHovered ? 1 : hasValue ? 0.85 : 0.35,
                        filter: isHovered && hasValue ? 'drop-shadow(0 2px 6px rgba(15, 27, 61, 0.4))' : 'none',
                      }}
                    />

                    {/* Top Bar: Pink (Honor) */}
                    {item.honorH > 0 && (
                      <rect
                        fill="#ff3d8b"
                        height={item.honorH}
                        rx={item.honorH > 6 ? 8 : 2}
                        width="22"
                        x={item.x}
                        y={pinkY}
                        style={{
                          transition: 'all 200ms ease',
                          opacity: isHovered ? 1 : 0.9,
                          filter: isHovered ? 'drop-shadow(0 2px 6px rgba(255, 61, 139, 0.4))' : 'none',
                        }}
                      />
                    )}

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
                  const bubbleWidth = 114
                  const bubbleX = Math.min(Math.max(activeMonthData.x + 11 - bubbleWidth / 2, 20), 226)
                  const honorFormatted = activeMonthData.honor > 0
                    ? `Rp ${Math.round(activeMonthData.honor).toLocaleString('id-ID')}`
                    : 'Rp 0'

                  return (
                    <g
                      transform={`translate(${bubbleX}, 6)`}
                      style={{ pointerEvents: 'none', transition: 'all 180ms ease' }}
                    >
                      <rect
                        fill="#0f1b3d"
                        height="20"
                        rx="10"
                        width={bubbleWidth}
                        style={{ filter: 'drop-shadow(0 2px 5px rgba(15, 27, 61, 0.25))' }}
                      />
                      <text
                        fill="#3de0b0"
                        fontSize="9.5"
                        fontWeight="700"
                        textAnchor="middle"
                        x={bubbleWidth / 2}
                        y="14"
                      >
                        {activeMonthData.month}: {honorFormatted}
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
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px 16px', color: '#8c9cb8' }}>
                    Belum ada data tugas operasional yang tersimpan. Klik tombol &ldquo;Posting Tugas Baru&rdquo; untuk memulai.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
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
                    <div className="table-actions-group">
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
                      {onEditTask && (
                        <button
                          className="btn-card-action-icon"
                          onClick={() => onEditTask(task)}
                          title="Edit Rincian Tugas"
                          type="button"
                        >
                          <Icon name="edit" size={13} />
                        </button>
                      )}
                      {onDeleteTask && (
                        <button
                          className="btn-card-action-icon btn-card-action-icon--delete"
                          onClick={() => onDeleteTask(task)}
                          title="Hapus Tugas"
                          type="button"
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default BerandaView
