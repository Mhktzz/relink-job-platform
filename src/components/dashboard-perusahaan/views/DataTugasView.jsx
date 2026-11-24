import { useState } from 'react'
import Icon from '../../common/Icon.jsx'
import {
  updateTaskInDb,
  deleteTaskFromDb,
  markTaskAsDeleted,
  isTaskActive,
  getDeletedTaskIds,
} from '../../../lib/databaseService.js'
import TaskDetailModal from '../modals/TaskDetailModal.jsx'

function DataTugasView({
  tasks,
  setTasks,
  setCurrentMenu,
  setActionSuccessMsg,
  setSelectedProofTask,
  setShowProofModal,
  onOpenTaskDetail,
  onEditTask,
  onDeleteTask,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'In Progress' | 'Proof Review' | 'Completed'

  // Modal States
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Edit Form Fields State
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('operasional')
  const [editTier, setEditTier] = useState('Tier 1')
  const [editBudget, setEditBudget] = useState(85000)
  const [editStatus, setEditStatus] = useState('In Progress')
  const [editChecklist, setEditChecklist] = useState([])
  const [newChecklistText, setNewChecklistText] = useState('')

  // Hitung Metrik Ringkas
  const totalCount = tasks.length
  const inProgressCount = tasks.filter((t) => t.statusBadge === 'In Progress' || t.column === 'current').length
  const proofReviewCount = tasks.filter((t) => t.statusBadge === 'Proof Review' || t.column === 'due_week' || t.status === 'review').length
  const completedCount = tasks.filter((t) => t.statusBadge === 'Completed' || t.column === 'overdue' || t.status === 'completed').length

  // Filter Data Tugas
  const filteredTasks = tasks.filter((task) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (task.title || '').toLowerCase().includes(q) ||
      (task.id || '').toLowerCase().includes(q) ||
      (task.code || '').toLowerCase().includes(q) ||
      (task.workerName || '').toLowerCase().includes(q)

    let matchesStatus = true
    if (statusFilter !== 'all') {
      if (statusFilter === 'In Progress') {
        matchesStatus = task.statusBadge === 'In Progress' || task.column === 'current'
      } else if (statusFilter === 'Proof Review') {
        matchesStatus = task.statusBadge === 'Proof Review' || task.status === 'review'
      } else if (statusFilter === 'Completed') {
        matchesStatus = task.statusBadge === 'Completed' || task.status === 'completed'
      }
    }

    return matchesSearch && matchesStatus
  })

  // Buka Modal Edit
  function openEditModal(task) {
    setTaskToEdit(task)
    setEditTitle(task.title || '')
    setEditCategory(task.category === 'Teknis & Perangkat' || task.category === 'teknis' ? 'teknis' : task.category === 'Administrasi' || task.category === 'administrasi' ? 'administrasi' : 'operasional')
    setEditTier(task.tier || 'Tier 1')
    setEditBudget(task.budget || 85000)
    setEditStatus(task.statusBadge || 'In Progress')

    // Parse checklist
    let cl = []
    if (Array.isArray(task.acceptanceChecklist)) {
      cl = task.acceptanceChecklist.map((c) => (typeof c === 'string' ? c : c.text))
    } else if (Array.isArray(task.checklist)) {
      cl = task.checklist.map((c) => (typeof c === 'string' ? c : c.text || c))
    }
    setEditChecklist(cl.length > 0 ? cl : ['Tugas diselesaikan sesuai instruksi operasional'])
    setNewChecklistText('')
  }

  // Simpan Perubahan Edit Tugas
  async function handleSaveEdit(e) {
    e.preventDefault()
    if (!editTitle.trim()) {
      alert('Judul tugas tidak boleh kosong.')
      return
    }

    setIsProcessing(true)

    const updatedData = {
      title: editTitle.trim(),
      category: editCategory,
      tier: editTier,
      budget: Number(editBudget),
      status: editStatus,
      checklist: editChecklist,
    }

    // 1. Simpan ke Database Supabase
    await updateTaskInDb(taskToEdit.id, updatedData)

    // 2. Perbarui state lokal tasks
    setTasks((prev) =>
      prev.map((item) => {
        if (item.id === taskToEdit.id) {
          return {
            ...item,
            title: editTitle.trim(),
            category: editCategory === 'teknis' ? 'Teknis & Perangkat' : editCategory === 'administrasi' ? 'Administrasi' : 'Operasional Toko',
            tier: editTier,
            budget: Number(editBudget),
            statusBadge: editStatus,
            column:
              editStatus === 'Completed'
                ? 'overdue'
                : editStatus === 'Proof Review'
                  ? 'due_week'
                  : 'current',
            acceptanceChecklist: editChecklist.map((txt, idx) => ({
              id: `c-edit-${idx}`,
              text: txt,
              done: item.acceptanceChecklist?.[idx]?.done || false,
            })),
            checklist: editChecklist,
          }
        }
        return item
      })
    )

    setIsProcessing(false)
    setTaskToEdit(null)
    if (setActionSuccessMsg) {
      setActionSuccessMsg(`Perubahan data tugas ${taskToEdit.id} berhasil disimpan ke database!`)
      setTimeout(() => setActionSuccessMsg(''), 5000)
    }
  }

  // Hapus Tugas
  async function handleConfirmDelete() {
    if (!taskToDelete) return

    setIsProcessing(true)
    const target = taskToDelete

    // 1. Tandai ID tugas ke daftar blacklist terhapus (tombstone)
    markTaskAsDeleted([target.id, target.db_id, target.code, target.task_code, target])

    // 2. Hapus dari Supabase Database
    await deleteTaskFromDb(target)

    // 3. Hapus dari state lokal dan sinkronkan ke localStorage
    const deletedIds = getDeletedTaskIds()
    setTasks((prev) => {
      const updated = prev.filter((item) => isTaskActive(item, deletedIds))
      try {
        localStorage.setItem('relink_tasks', JSON.stringify(updated))
      } catch {}
      return updated
    })

    setIsProcessing(false)
    const deletedId = target.code || target.id
    setTaskToDelete(null)
    if (selectedTaskDetail?.id === target.id || selectedTaskDetail?.code === target.code) {
      setSelectedTaskDetail(null)
    }

    if (setActionSuccessMsg) {
      setActionSuccessMsg(`Tugas ${deletedId} telah berhasil dihapus permanen dari sistem dan database.`)
      setTimeout(() => setActionSuccessMsg(''), 5000)
    }
  }

  // Tambah item checklist saat edit
  function handleAddEditChecklist() {
    if (newChecklistText.trim()) {
      setEditChecklist([...editChecklist, newChecklistText.trim()])
      setNewChecklistText('')
    }
  }

  // Hapus item checklist saat edit
  function handleRemoveEditChecklist(indexToRemove) {
    setEditChecklist(editChecklist.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <main className="dashboard-content-flow data-tugas-flow">
      {/* 1. Header Section */}
      <div className="content-heading-bar">
        <div>
          <h1>Manajemen Data Tugas</h1>
          <p>
            Kelola seluruh rekam jejak tugas operasional tokomu. Anda dapat melihat rincian pekerjaan, memperbarui data, maupun menghapus tugas secara terkontrol.
          </p>
        </div>
        <div className="escrow-header-actions">
          <button
            className="btn-create-task-primary btn-action-primary"
            onClick={() => setCurrentMenu('new_task')}
            type="button"
          >
            <Icon name="plus" size={16} />
            <span>Posting Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Metrik Ringkasan Tugas */}
      <div className="summary-metrics-grid data-tugas-metrics-grid">
        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Total Semua Tugas</span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="briefcase" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>{totalCount} Tugas</strong>
          </div>
          <small className="metric-sub-note">Seluruh tugas UMKM aktif di sistem</small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Sedang Dikerjakan</span>
            <div className="metric-icon-bubble metric-icon-bubble--warn">
              <Icon name="bolt" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>{inProgressCount} Tugas</strong>
          </div>
          <small className="metric-sub-note">Mitra sedang bekerja di lokasi</small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Menunggu Review Bukti</span>
            <div className="metric-icon-bubble metric-icon-bubble--warn">
              <Icon name="clock" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong className="text-pink">{proofReviewCount} Tugas</strong>
          </div>
          <small className="metric-sub-note">Bukti foto & GPS siap divalidasi</small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Selesai & Dicairkan</span>
            <div className="metric-icon-bubble metric-icon-bubble--good">
              <Icon name="check" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>{completedCount} Tugas</strong>
          </div>
          <small className="metric-sub-note">Pekerjaan disetujui & dana cair</small>
        </div>
      </div>

      {/* 3. Filter & Tabel Data Tugas */}
      <section className="escrow-ledger-section data-tugas-table-card">
        <div className="escrow-ledger-header">
          <div className="escrow-filter-tabs">
            <button
              className={`escrow-tab-btn${statusFilter === 'all' ? ' escrow-tab-btn--active' : ''}`}
              onClick={() => setStatusFilter('all')}
              type="button"
            >
              Semua ({totalCount})
            </button>
            <button
              className={`escrow-tab-btn${statusFilter === 'In Progress' ? ' escrow-tab-btn--active' : ''}`}
              onClick={() => setStatusFilter('In Progress')}
              type="button"
            >
              In Progress ({inProgressCount})
            </button>
            <button
              className={`escrow-tab-btn${statusFilter === 'Proof Review' ? ' escrow-tab-btn--active' : ''}`}
              onClick={() => setStatusFilter('Proof Review')}
              type="button"
            >
              Review Bukti ({proofReviewCount})
            </button>
            <button
              className={`escrow-tab-btn${statusFilter === 'Completed' ? ' escrow-tab-btn--active' : ''}`}
              onClick={() => setStatusFilter('Completed')}
              type="button"
            >
              Selesai ({completedCount})
            </button>
          </div>

          <div className="escrow-search-box">
            <Icon name="search" size={15} />
            <input
              aria-label="Cari tugas"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID, kode, judul, atau mitra..."
              type="text"
              value={searchQuery}
            />
            {searchQuery && (
              <button
                className="btn-clear-escrow-search"
                onClick={() => setSearchQuery('')}
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabel Data Tugas */}
        <div className="escrow-table-wrapper">
          <table className="escrow-table data-tugas-table">
            <thead>
              <tr>
                <th>Kode & ID</th>
                <th>Judul & Kategori</th>
                <th>Pekerja Ditugaskan</th>
                <th>Tier & Anggaran</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td className="empty-escrow-row" colSpan={6}>
                    Tidak ada tugas yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const statusNormalized =
                    task.statusBadge === 'Proof Review' || task.status === 'review'
                      ? 'review'
                      : task.statusBadge === 'Completed' || task.status === 'completed'
                        ? 'completed'
                        : 'in_progress'

                  const badgeColor =
                    statusNormalized === 'review'
                      ? 'mint'
                      : statusNormalized === 'completed'
                        ? 'blue'
                        : 'amber'

                  const statusText =
                    statusNormalized === 'review'
                      ? 'Proof Review'
                      : statusNormalized === 'completed'
                        ? 'Completed'
                        : 'In Progress'

                  return (
                    <tr key={task.id}>
                      <td>
                        <strong className="tx-code">{task.id}</strong>
                        <small className="tx-date">{task.code || '#TGS'}</small>
                        <span className="task-deadline-tag">{task.dueDate || 'Hari ini'}</span>
                      </td>
                      <td>
                        <div className="data-task-title-cell">
                          <strong>{task.title}</strong>
                          <div className="data-task-meta-tags">
                            <span className="data-task-category-badge">{task.category || 'Operasional'}</span>
                            {task.isTandem && <span className="data-task-tandem-badge">Tandem 2 Org</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="tx-worker-cell">
                          <img
                            alt={task.workerName || 'Mitra'}
                            className="tx-worker-avatar"
                            src={task.workerPhoto || task.proofData?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          />
                          <div>
                            <strong>{task.workerName || 'Mitra Relink'}</strong>
                            <small>{task.location || 'Toko Kue Bu Rina'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className="tx-amount">Rp{(Number(task.budget) || 0).toLocaleString('id-ID')}</strong>
                        <small className="tier-tag">{task.tier || 'Tier 1'}</small>
                      </td>
                      <td>
                        <span className={`escrow-status-pill escrow-status-pill--${badgeColor}`}>
                          {statusNormalized === 'review' && <Icon name="clock" size={12} />}
                          {statusNormalized === 'in_progress' && <Icon name="bolt" size={12} />}
                          {statusNormalized === 'completed' && <Icon name="check" size={12} />}
                          <span>{statusText}</span>
                        </span>
                      </td>
                      <td>
                        <div className="data-task-actions">
                          {/* Tombol Detail */}
                          <button
                            className="btn-action-view"
                            onClick={() => {
                              if (onOpenTaskDetail) {
                                onOpenTaskDetail(task)
                              } else {
                                setSelectedTaskDetail(task)
                              }
                            }}
                            title="Lihat Detail Tugas di Halaman Utama"
                            type="button"
                          >
                            <Icon name="eye" size={14} />
                            <span>Detail</span>
                          </button>

                          {/* Tombol Edit */}
                          <button
                            className="btn-action-edit"
                            onClick={() => (onEditTask ? onEditTask(task) : openEditModal(task))}
                            title="Edit Data Tugas"
                            type="button"
                          >
                            <Icon name="edit" size={14} />
                            <span>Edit</span>
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            className="btn-action-delete"
                            onClick={() => (onDeleteTask ? onDeleteTask(task) : setTaskToDelete(task))}
                            title="Hapus Tugas"
                            type="button"
                          >
                            <Icon name="trash" size={14} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. MODAL: LIHAT DETAIL TUGAS & HASIL PEKERJAAN (PDF/GAMBAR) */}
      {/* ======================================================== */}
      {selectedTaskDetail && (
        <TaskDetailModal
          onClose={() => setSelectedTaskDetail(null)}
          onEditTask={(task) => openEditModal(task)}
          onOpenProofModal={(task) => {
            if (setSelectedProofTask && setShowProofModal) {
              setSelectedProofTask(task)
              setShowProofModal(true)
            }
          }}
          setCurrentMenu={setCurrentMenu}
          task={selectedTaskDetail}
        />
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: EDIT DATA TUGAS */}
      {/* ======================================================== */}
      {taskToEdit && (
        <div aria-modal="true" className="proof-modal-overlay" role="dialog">
          <div className="proof-modal-card task-edit-modal-card">
            <header className="proof-modal-header">
              <div>
                <h2>Edit Data Tugas #{taskToEdit.id}</h2>
                <small>Ubah informasi judul, kategori, anggaran, atau checklist tugas</small>
              </div>
              <button
                aria-label="Tutup modal edit"
                className="btn-close-modal"
                disabled={isProcessing}
                onClick={() => setTaskToEdit(null)}
                type="button"
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleSaveEdit}>
              <div className="task-edit-modal-body">
                <div className="form-group">
                  <label htmlFor="edit-task-title">Judul Tugas</label>
                  <input
                    id="edit-task-title"
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    type="text"
                    value={editTitle}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="edit-task-category">Kategori Tugas</label>
                    <select
                      id="edit-task-category"
                      onChange={(e) => setEditCategory(e.target.value)}
                      value={editCategory}
                    >
                      <option value="operasional">Operasional Toko &amp; Packing</option>
                      <option value="teknis">Teknis, Kasir &amp; POS</option>
                      <option value="administrasi">Administrasi &amp; Input Stok</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-task-tier">Kebutuhan Tingkat Tier</label>
                    <select
                      id="edit-task-tier"
                      onChange={(e) => setEditTier(e.target.value)}
                      value={editTier}
                    >
                      <option value="Tier 1">Tier 1 (Tugas Dasar &amp; Ringan)</option>
                      <option value="Tier 2">Tier 2 (Stok, Kasir &amp; Pelayanan)</option>
                      <option value="Tier 3">Tier 3 (Teknis Mesin &amp; Perangkat)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="edit-task-budget">Anggaran Upah Tugas (Rp)</label>
                    <input
                      id="edit-task-budget"
                      min="20000"
                      onChange={(e) => setEditBudget(e.target.value)}
                      required
                      step="5000"
                      type="number"
                      value={editBudget}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-task-status">Status Papan</label>
                    <select
                      id="edit-task-status"
                      onChange={(e) => setEditStatus(e.target.value)}
                      value={editStatus}
                    >
                      <option value="In Progress">In Progress (Sedang Dikerjakan)</option>
                      <option value="Proof Review">Proof Review (Menunggu Validasi)</option>
                      <option value="Completed">Completed (Tuntas Selesai)</option>
                    </select>
                  </div>
                </div>

                {/* Edit Checklist Items */}
                <div className="form-group">
                  <label>Poin Checklist Kriteria SOP</label>
                  <div className="edit-checklist-container">
                    {editChecklist.map((item, idx) => (
                      <div key={idx} className="edit-checklist-item-row">
                        <span>{idx + 1}. {item}</span>
                        <button
                          aria-label={`Hapus kriteria ${idx + 1}`}
                          className="btn-remove-checklist-item"
                          onClick={() => handleRemoveEditChecklist(idx)}
                          type="button"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div className="edit-add-checklist-input-wrap">
                      <input
                        onChange={(e) => setNewChecklistText(e.target.value)}
                        placeholder="Tambah butir kriteria baru..."
                        type="text"
                        value={newChecklistText}
                      />
                      <button
                        className="btn-add-checklist-item"
                        onClick={handleAddEditChecklist}
                        type="button"
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="escrow-modal-footer">
                <button
                  className="btn-modal-cancel"
                  disabled={isProcessing}
                  onClick={() => setTaskToEdit(null)}
                  type="button"
                >
                  Batal
                </button>
                <button
                  className="btn-modal-submit-pink"
                  disabled={isProcessing}
                  type="submit"
                >
                  {isProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: KONFIRMASI HAPUS TUGAS */}
      {/* ======================================================== */}
      {taskToDelete && (
        <div aria-modal="true" className="proof-modal-overlay" role="dialog">
          <div className="proof-modal-card task-delete-modal-card">
            <header className="proof-modal-header">
              <div>
                <h2>Hapus Tugas #{taskToDelete.id}?</h2>
                <small>Konfirmasi tindakan penghapusan tugas</small>
              </div>
              <button
                aria-label="Tutup modal konfirmasi"
                className="btn-close-modal"
                disabled={isProcessing}
                onClick={() => setTaskToDelete(null)}
                type="button"
              >
                ✕
              </button>
            </header>

            <div className="task-delete-modal-body">
              <div className="delete-warning-box">
                <Icon name="alert" size={24} />
                <div>
                  <strong>Apakah Anda yakin ingin menghapus tugas ini?</strong>
                  <p>
                    Tugas <strong>&ldquo;{taskToDelete.title}&rdquo;</strong> ({taskToDelete.id}) akan dihapus secara permanen dari daftar operasional dan database Supabase.
                  </p>
                </div>
              </div>
              <p className="delete-sub-notice">
                Tindakan ini tidak dapat dibatalkan. Jika tugas sudah memiliki dana tertahan di rekening Escrow, silakan periksa mutasi terkait di menu Dana Escrow.
              </p>
            </div>

            <footer className="escrow-modal-footer">
              <button
                className="btn-modal-cancel"
                disabled={isProcessing}
                onClick={() => setTaskToDelete(null)}
                type="button"
              >
                Batal
              </button>
              <button
                className="btn-confirm-delete-task"
                disabled={isProcessing}
                onClick={handleConfirmDelete}
                type="button"
              >
                {isProcessing ? 'Menghapus...' : 'Ya, Hapus Tugas'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  )
}

export default DataTugasView
