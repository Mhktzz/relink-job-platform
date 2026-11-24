import Icon from '../../common/Icon.jsx'
import cashierPhoto from '../../../assets/cashier.jpg'

function KanbanView({
  searchQuery,
  setSearchQuery,
  setCurrentMenu,
  currentTasks,
  dueWeekTasks,
  overdueTasks,
  setSelectedProofTask,
  setShowProofModal,
  onOpenTaskDetail,
  onEditTask,
  onDeleteTask,
  onMoveStatus,
}) {
  return (
    <main className="dashboard-content-flow">
      {/* 1. Header Bar */}
      <div className="content-heading-bar">
        <div>
          <h1>Kanban Tugas &amp; Serah Terima</h1>
          <p>Pantau Progres Harian Seluruh Task</p>
        </div>
        <div className="kanban-action-bar">
          <div className="task-search-pill">
            <Icon name="search" size={14} />
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas di papan kanban..."
              type="text"
              value={searchQuery}
            />
          </div>
          <button
            className="btn-create-pill"
            onClick={() => setCurrentMenu('new_task')}
            type="button"
          >
            <Icon name="plus" size={14} />
            <span>Posting Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* 2. 3-COLUMN KANBAN BOARD */}
      <div className="task-columns-grid">
        {/* ======================================================== */}
        {/* KOLOM 1: Sedang Berjalan (In Progress) */}
        {/* ======================================================== */}
        <div className="kanban-column">
          <div className="kanban-column__header">
            <div className="column-title">
              <strong>Sedang Berjalan</strong>
              <span className="column-status-sub">In Progress</span>
              <span className="column-counter">{currentTasks.length}</span>
            </div>
            <button
              aria-label="Tambah tugas baru"
              className="btn-column-add"
              onClick={() => setCurrentMenu('new_task')}
              title="Posting Tugas Baru"
              type="button"
            >
              +
            </button>
          </div>

          <p className="column-sub-note">
            Memantau progres harian tugas yang sedang dikerjakan mitra beserta waktu pengerjaannya.
          </p>

          <div className="kanban-card-stack">
            {currentTasks.length === 0 ? (
              <div className="empty-column-box">
                <Icon name="briefcase" size={24} />
                <p>Tidak ada tugas yang sedang berjalan</p>
              </div>
            ) : (
              currentTasks.map((task) => (
                <article className="kanban-card kanban-card--interactive" key={task.id}>
                  <div className="kanban-card__top">
                    <span className="card-code-pill">{task.code || task.id}</span>
                    <span className="card-status-pill">{task.statusBadge || 'In Progress'}</span>
                  </div>
                  <h3
                    className="kanban-card__title kanban-card__title--clickable"
                    onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                    title="Klik untuk melihat Detail Tugas & SOP"
                  >
                    {task.title}
                  </h3>
                  <p className="kanban-card__desc">{task.description}</p>

                  <div className="kanban-card__meta">
                    <span className={`priority-tag priority-tag--${(task.priority || 'medium').toLowerCase()}`}>
                      {task.priority || 'Normal'}
                    </span>
                    <span className="card-date">{task.dateRange || 'Sedang Dikerjakan'}</span>
                  </div>

                  <div className="kanban-card__footer">
                    <div className="worker-mini">
                      <img
                        alt={task.workerName || 'Mitra'}
                        className="worker-mini-avatar"
                        src={task.workerPhoto || cashierPhoto}
                      />
                      <span>{task.workerName || 'Mitra Pekerja'}</span>
                    </div>
                    <div className="kanban-footer-right">
                      <button
                        className="btn-card-detail-pill"
                        onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                        title="Lihat Detail & Checklist Tugas"
                        type="button"
                      >
                        <Icon name="eye" size={13} />
                        <span>Detail</span>
                      </button>
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
                  </div>

                  <div className="kanban-worker-status-badge">
                    <Icon name="clock" size={11} />
                    <span>Dikerjakan oleh {task.workerName || 'Mitra'} (Menunggu bukti kerja)</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* KOLOM 2: Tunggu Review (Proof Review) [Tempat Mitra Submit Draft] */}
        {/* ======================================================== */}
        <div className="kanban-column kanban-column--review">
          <div className="kanban-column__header">
            <div className="column-title">
              <strong>Tunggu Review</strong>
              <span className="column-status-sub column-status-sub--warn">Proof Review</span>
              <span className="column-counter column-counter--warn">{dueWeekTasks.length}</span>
            </div>
            <button
              aria-label="Tambah tugas baru"
              className="btn-column-add"
              onClick={() => setCurrentMenu('new_task')}
              title="Posting Tugas Baru"
              type="button"
            >
              +
            </button>
          </div>

          <div className="column-draft-badge-row">
            <span className="column-draft-badge">
              <Icon name="shield" size={12} />
              <span>Tempat Mitra Submit Draft</span>
            </span>
          </div>

          <p className="column-sub-note">
            Ketika pekerja selesai mengunggah bukti kerja (foto lapangan ber-GPS &amp; checklist SOP selesai), kartu tugas otomatis berpindah ke kolom ini.
          </p>

          <div className="kanban-card-stack">
            {dueWeekTasks.length === 0 ? (
              <div className="empty-column-box empty-column-box--review">
                <Icon name="check" size={24} />
                <p>Belum ada draft serah terima yang menunggu review</p>
                <small>Tugas pekerja yang selesai akan otomatis tampil di sini.</small>
              </div>
            ) : (
              dueWeekTasks.map((task) => (
                <article
                  className="kanban-card kanban-card--needs-approval"
                  key={task.id}
                >
                  <div className="kanban-card__top">
                    <span className="card-code-pill">{task.code || task.id}</span>
                    <span className="card-status-pill card-status-pill--warn">
                      {task.statusBadge || 'Proof Review'}
                    </span>
                  </div>
                  <h3
                    className="kanban-card__title kanban-card__title--clickable"
                    onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                    title="Klik untuk melihat Detail Tugas & Hasil Serah Terima"
                  >
                    {task.title}
                  </h3>
                  <p className="kanban-card__desc">{task.description}</p>

                  <div className="kanban-card__meta">
                    <span className={`priority-tag priority-tag--${(task.priority || 'high').toLowerCase()}`}>
                      Siap Verifikasi
                    </span>
                    <span className="card-date">{task.dateRange || 'Menunggu Persetujuan'}</span>
                  </div>

                  {/* Tombol Tinjau Bukti & Verifikasi Serah Terima */}
                  <div className="card-approval-box">
                    <div className="gps-watermark-snippet">
                      <Icon name="pin" size={13} />
                      <small>
                        GPS: {task.proofData?.gpsLocation || '-7.4241, 109.2425 (Verified)'}
                      </small>
                    </div>

                    <div className="card-action-dual-row">
                      <button
                        className="btn-review-proof"
                        onClick={() => {
                          const enrichedTask = {
                            ...task,
                            proofData: task.proofData || {
                              photoUrl: cashierPhoto,
                              gpsLocation: '-7.4241, 109.2425 (Toko UMKM Terverifikasi)',
                              timestamp: 'Hari ini, Waktu Penyerahan Selesai',
                              note: 'Seluruh butir checklist SOP serah terima pekerjaan harian telah saya selesaikan dengan lengkap.',
                            },
                            acceptanceChecklist:
                              Array.isArray(task.acceptanceChecklist) && task.acceptanceChecklist.length > 0
                                ? task.acceptanceChecklist
                                : [
                                    { id: 'c1', text: 'Tugas diselesaikan sesuai instruksi operasional toko', done: true },
                                    { id: 'c2', text: 'Area kerja telah dirapikan & diserahterimakan', done: true },
                                  ],
                          }
                          setSelectedProofTask(enrichedTask)
                          setShowProofModal(true)
                        }}
                        type="button"
                      >
                        <Icon name="check" size={15} />
                        <span>Tinjau Bukti</span>
                      </button>

                      <button
                        className="btn-view-deliverables"
                        onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                        title="Lihat Berkas Foto & PDF Dokumen Hasil Kerja"
                        type="button"
                      >
                        <Icon name="file-text" size={13} />
                        <span>Lihat Berkas / Detail</span>
                      </button>
                    </div>

                    <div className="worker-mini worker-mini--compact">
                      <img
                        alt={task.workerName || 'Mitra'}
                        className="worker-mini-avatar"
                        src={task.workerPhoto || cashierPhoto}
                      />
                      <span>Diajukan oleh {task.workerName || 'Mitra'}</span>
                      <div className="kanban-footer-right" style={{ marginLeft: 'auto' }}>
                        {onEditTask && (
                          <button
                            className="btn-card-action-icon"
                            onClick={() => onEditTask(task)}
                            title="Edit Tugas"
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
                    </div>

                    {onMoveStatus && (
                      <button
                        className="btn-kanban-stage-move"
                        onClick={() => onMoveStatus(task.id, 'In Progress')}
                        title="Kembalikan status tugas ke Sedang Berjalan"
                        type="button"
                      >
                        <span>← Minta Revisi Mitra</span>
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* KOLOM 3: Selesai (Completed) */}
        {/* ======================================================== */}
        <div className="kanban-column">
          <div className="kanban-column__header">
            <div className="column-title">
              <strong>Selesai</strong>
              <span className="column-status-sub column-status-sub--good">Completed</span>
              <span className="column-counter column-counter--good">{overdueTasks.length}</span>
            </div>
            <button
              aria-label="Tambah tugas baru"
              className="btn-column-add"
              onClick={() => setCurrentMenu('new_task')}
              title="Posting Tugas Baru"
              type="button"
            >
              +
            </button>
          </div>

          <p className="column-sub-note">
            Tugas yang sudah Anda setujui dan dananya telah dicairkan ke saldo pekerja.
          </p>

          <div className="kanban-card-stack">
            {overdueTasks.length === 0 ? (
              <div className="empty-column-box">
                <Icon name="check" size={24} />
                <p>Belum ada riwayat tugas selesai</p>
              </div>
            ) : (
              overdueTasks.map((task) => (
                <article className="kanban-card kanban-card--done" key={task.id}>
                  <div className="kanban-card__top">
                    <span className="card-code-pill">{task.code || task.id}</span>
                    <span className="card-status-pill card-status-pill--success">
                      Completed
                    </span>
                  </div>
                  <h3
                    className="kanban-card__title kanban-card__title--clickable"
                    onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                    title="Klik untuk melihat Detail & Dokumen Selesai"
                  >
                    {task.title}
                  </h3>
                  <p className="kanban-card__desc">{task.description}</p>

                  <div className="kanban-card__meta">
                    <span className="priority-tag priority-tag--low">Selesai &amp; Cair</span>
                    <span className="card-date">{task.dateRange || 'Serah Terima Selesai'}</span>
                  </div>

                  <div className="kanban-card__footer">
                    <div className="worker-mini">
                      <img
                        alt={task.workerName || 'Mitra'}
                        className="worker-mini-avatar"
                        src={task.workerPhoto || cashierPhoto}
                      />
                      <span>{task.workerName || 'Mitra Pekerja'}</span>
                    </div>
                    <div className="kanban-footer-right">
                      <button
                        className="btn-card-detail-pill"
                        onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                        title="Lihat Rekap & Berkas Selesai"
                        type="button"
                      >
                        <Icon name="file-text" size={13} />
                        <span>Rekap</span>
                      </button>
                      {onEditTask && (
                        <button
                          className="btn-card-action-icon"
                          onClick={() => onEditTask(task)}
                          title="Edit Tugas"
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
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default KanbanView
