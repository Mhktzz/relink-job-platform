import Icon from '../../common/Icon.jsx'

function BerandaView({
  tasks,
  totalHeldEscrow,
  setCurrentMenu,
  setSelectedProofTask,
  setShowProofModal,
  onOpenTaskDetail,
}) {
  return (
    <main className="dashboard-content-flow">
      {/* Header Judul & Date Picker */}
      <div className="content-heading-bar">
        <div>
          <h1>Aktivitas Usaha & Tugas</h1>
          <p>Ringkasan operasional micro-job harian dan efisiensi pengeluaran toko.</p>
        </div>
        <div className="date-filter-capsule">
          <Icon name="clock" size={14} />
          <span>18 Nov 2026 - Hari ini</span>
        </div>
      </div>

      {/* 4 KARTU STATISTIK UTAMA (Persis seperti gambar referensi) */}
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
            <span className="metric-trend metric-trend--up">↑ 4.8%</span>
          </div>
          <small className="metric-sub-note">Bulan lalu: 18 tugas</small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Mitra Bekerja</span>
            <div className="metric-icon-bubble">
              <Icon name="users" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>8 Orang</strong>
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
            <strong className="text-pink">1 Tugas</strong>
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

      {/* BAGIAN GRAFIK UTAMA (Bar Chart Oranye/Pink & Double Stack Chart) */}
      <div className="charts-split-grid">
        {/* Grafik Batang Kiri: Analisis Aktivitas Harian */}
        <div className="analytics-card">
          <div className="analytics-card__header">
            <div>
              <h3>Statistik Beban Tugas Mingguan</h3>
              <small>Jumlah pengerjaan tugas mikro per hari</small>
            </div>
            <div className="timeframe-selector">
              <span>Minggu Ini</span>
              <Icon name="arrow" size={12} />
            </div>
          </div>

          <div className="chart-drawing-box">
            <svg className="chart-svg-main" viewBox="0 0 540 200">
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="30" x2="520" y1="30" y2="30" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="30" x2="520" y1="80" y2="80" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="30" x2="520" y1="130" y2="130" />
              <line stroke="#edf2f7" x1="30" x2="520" y1="170" y2="170" />

              <text fill="#8c9cb8" fontSize="10" x="10" y="34">30</text>
              <text fill="#8c9cb8" fontSize="10" x="10" y="84">20</text>
              <text fill="#8c9cb8" fontSize="10" x="10" y="134">10</text>
              <text fill="#8c9cb8" fontSize="10" x="10" y="174">0</text>

              {/* Batang-batang hari (Senin - Minggu) */}
              <rect fill="#ff3d8b" height="90" rx="14" width="36" x="50" y="80" />
              <text fill="#5c6c8d" fontSize="11" fontWeight="600" x="56" y="190">Sen</text>

              <rect fill="#ff3d8b" height="60" rx="14" width="36" x="120" y="110" />
              <text fill="#5c6c8d" fontSize="11" fontWeight="600" x="126" y="190">Sel</text>

              <rect fill="#ff3d8b" height="130" rx="14" width="36" x="190" y="40" />
              <text fill="#5c6c8d" fontSize="11" fontWeight="600" x="196" y="190">Rab</text>
              <g transform="translate(178, 14)">
                <rect fill="#0f1b3d" height="20" rx="10" width="60" />
                <text fill="#fff" fontSize="10" fontWeight="700" textAnchor="middle" x="30" y="14">28 Tugas</text>
              </g>

              <rect fill="#ff3d8b" height="70" rx="14" width="36" x="260" y="100" />
              <text fill="#5c6c8d" fontSize="11" fontWeight="600" x="266" y="190">Kam</text>

              <rect fill="#ff3d8b" height="100" rx="14" width="36" x="330" y="70" />
              <text fill="#5c6c8d" fontSize="11" fontWeight="600" x="338" y="190">Jum</text>

              <rect fill="#ff3d8b" height="135" rx="14" width="36" x="400" y="35" />
              <text fill="#5c6c8d" fontSize="11" fontWeight="600" x="408" y="190">Sab</text>

              <rect fill="#ff3d8b" height="85" rx="14" width="36" x="470" y="85" />
              <text fill="#5c6c8d" fontSize="11" fontWeight="600" x="478" y="190">Min</text>
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
              <span className="legend-chip"><span className="legend-box legend-box--pink" /> Honor</span>
              <span className="legend-chip"><span className="legend-box legend-box--navy" /> Hemat</span>
            </div>
          </div>

          <div className="chart-drawing-box">
            <svg className="chart-svg-main" viewBox="0 0 360 200">
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="20" x2="340" y1="30" y2="30" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="20" x2="340" y1="80" y2="80" />
              <line stroke="#edf2f7" strokeDasharray="3 3" x1="20" x2="340" y1="130" y2="130" />
              <line stroke="#edf2f7" x1="20" x2="340" y1="170" y2="170" />

              {/* Stack bars */}
              <rect fill="#0f1b3d" height="40" rx="8" width="22" x="40" y="130" />
              <rect fill="#ff3d8b" height="50" rx="8" width="22" x="40" y="75" />
              <text fill="#5c6c8d" fontSize="10" x="42" y="188">Jul</text>

              <rect fill="#0f1b3d" height="60" rx="8" width="22" x="90" y="110" />
              <rect fill="#ff3d8b" height="55" rx="8" width="22" x="90" y="50" />
              <text fill="#5c6c8d" fontSize="10" x="92" y="188">Agu</text>

              <rect fill="#0f1b3d" height="50" rx="8" width="22" x="140" y="120" />
              <rect fill="#ff3d8b" height="45" rx="8" width="22" x="140" y="70" />
              <text fill="#5c6c8d" fontSize="10" x="142" y="188">Sep</text>

              <rect fill="#0f1b3d" height="80" rx="8" width="22" x="190" y="90" />
              <rect fill="#ff3d8b" height="50" rx="8" width="22" x="190" y="35" />
              <text fill="#5c6c8d" fontSize="10" x="192" y="188">Okt</text>

              <rect fill="#0f1b3d" height="95" rx="8" width="22" x="240" y="75" />
              <rect fill="#ff3d8b" height="40" rx="8" width="22" x="240" y="30" />
              <text fill="#5c6c8d" fontSize="10" x="242" y="188">Nov</text>

              <rect fill="#0f1b3d" height="70" rx="8" width="22" x="290" y="100" />
              <rect fill="#ff3d8b" height="35" rx="8" width="22" x="290" y="60" />
              <text fill="#5c6c8d" fontSize="10" x="292" y="188">Des</text>
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
                      <span>{task.workerName}</span>
                    </div>
                  </td>
                  <td><span className="table-category-badge">{task.category}</span></td>
                  <td>
                    <span className={`table-status-pill table-status-pill--${task.statusBadge.toLowerCase().replace(' ', '-')}`}>
                      {task.statusBadge}
                    </span>
                  </td>
                  <td><strong>Rp{task.budget.toLocaleString('id-ID')}</strong></td>
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
