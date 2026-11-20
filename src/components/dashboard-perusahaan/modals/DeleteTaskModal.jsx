import Icon from '../../common/Icon.jsx'

function DeleteTaskModal({ task, onClose, onConfirm, isProcessing = false }) {
  if (!task) return null

  return (
    <div aria-modal="true" className="proof-modal-overlay" role="dialog">
      <div className="proof-modal-card task-delete-modal-card">
        <header className="proof-modal-header">
          <div>
            <h2>Hapus Tugas {task.code ? (task.code.startsWith('#') ? task.code : `#${task.code}`) : `#${task.id}`}?</h2>
            <small>Konfirmasi tindakan penghapusan tugas</small>
          </div>
          <button
            aria-label="Tutup modal konfirmasi"
            className="btn-close-modal"
            disabled={isProcessing}
            onClick={onClose}
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
                Tugas <strong>&ldquo;{task.title}&rdquo;</strong> ({task.code || task.id}) akan dihapus secara permanen dari daftar operasional dan database Supabase.
              </p>
            </div>
          </div>
          <p className="delete-sub-notice">
            Tindakan ini tidak dapat dibatalkan. Jika tugas sudah memiliki dana tertahan di rekening Escrow, pencairan dapat disesuaikan di menu Dana Escrow.
          </p>
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
            className="btn-confirm-delete-task"
            disabled={isProcessing}
            onClick={() => onConfirm(task)}
            type="button"
          >
            {isProcessing ? 'Menghapus...' : 'Ya, Hapus Tugas'}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default DeleteTaskModal
