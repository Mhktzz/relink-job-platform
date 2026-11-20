import { useState, useEffect } from 'react'

function EditTaskModal({ task, onClose, onSave, isProcessing = false }) {
  if (!task) return null

  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('operasional')
  const [editTier, setEditTier] = useState('Tier 1')
  const [editBudget, setEditBudget] = useState(85000)
  const [editStatus, setEditStatus] = useState('In Progress')
  const [editChecklist, setEditChecklist] = useState([])
  const [newChecklistText, setNewChecklistText] = useState('')

  useEffect(() => {
    if (task) {
      setEditTitle(task.title || '')
      const catLower = (task.category || '').toLowerCase()
      setEditCategory(
        catLower.includes('teknis') || catLower === 'kasir'
          ? 'teknis'
          : catLower.includes('admin') || catLower === 'inventaris'
          ? 'administrasi'
          : 'operasional'
      )
      setEditTier(task.tier || 'Tier 1')
      setEditBudget(task.budget || 85000)
      setEditStatus(task.statusBadge || task.status || 'In Progress')

      let cl = []
      if (Array.isArray(task.acceptanceChecklist) && task.acceptanceChecklist.length > 0) {
        cl = task.acceptanceChecklist.map((c) => (typeof c === 'string' ? c : c.text))
      } else if (Array.isArray(task.checklist) && task.checklist.length > 0) {
        cl = task.checklist.map((c) => (typeof c === 'string' ? c : c.text || c))
      } else {
        cl = ['Tugas diselesaikan sesuai instruksi operasional toko', 'Area kerja dirapikan']
      }
      setEditChecklist(cl)
      setNewChecklistText('')
    }
  }, [task])

  function handleAddChecklist() {
    if (newChecklistText.trim()) {
      setEditChecklist([...editChecklist, newChecklistText.trim()])
      setNewChecklistText('')
    }
  }

  function handleRemoveChecklist(idxToRemove) {
    setEditChecklist(editChecklist.filter((_, idx) => idx !== idxToRemove))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!editTitle.trim()) {
      alert('Judul tugas tidak boleh kosong.')
      return
    }

    onSave(task.id, {
      title: editTitle.trim(),
      category: editCategory,
      tier: editTier,
      budget: Number(editBudget),
      status: editStatus,
      checklist: editChecklist,
    })
  }

  return (
    <div aria-modal="true" className="proof-modal-overlay" role="dialog">
      <div className="proof-modal-card task-edit-modal-card">
        <header className="proof-modal-header">
          <div>
            <h2>Edit Data Tugas #{task.code || task.id}</h2>
            <small>Ubah informasi judul, kategori, anggaran, atau checklist tugas</small>
          </div>
          <button
            aria-label="Tutup modal edit"
            className="btn-close-modal"
            disabled={isProcessing}
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit}>
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
                  <option value="Open">Open (Lowongan Terbuka)</option>
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
                      onClick={() => handleRemoveChecklist(idx)}
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
                    onClick={handleAddChecklist}
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
              onClick={onClose}
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
  )
}

export default EditTaskModal
