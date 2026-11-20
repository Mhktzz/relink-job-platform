import Icon from '../../common/Icon.jsx'

function AmbilTugasModal({ task, onClose, onConfirm, isProcessing }) {
  if (!task) return null

  return (
    <div aria-modal="true" className="admin-clean-modal-backdrop" role="dialog">
      <div className="admin-clean-modal-box worker-task-accept-modal">
        <div className="modal-top-bar">
          <div className="modal-title-wrap">
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="briefcase" size={18} />
            </div>
            <div>
              <h3>Konfirmasi Ambil Tugas</h3>
              <small>Tinjau detail tugas dan kesepakatan checklist hasil kerja</small>
            </div>
          </div>
          <button
            aria-label="Tutup modal"
            className="modal-close-btn"
            disabled={isProcessing}
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="modal-body-scroll">
          <div className="worker-task-highlight-box">
            <div className="worker-task-highlight-header">
              <span className="task-tag-chip task-tag-chip--pink">{task.category}</span>
              <span className="task-tag-chip task-tag-chip--mint">{task.distance} dari lokasimu</span>
            </div>
            <h4 className="worker-task-title">{task.title}</h4>
            <p className="worker-task-desc">{task.description}</p>
            <div className="worker-task-client-row">
              <Icon name="pin" size={14} />
              <span>Pemesan: <strong>{task.clientName}</strong> &bull; Estimasi durasi: {task.duration}</span>
            </div>
          </div>

          <div className="worker-earnings-breakdown-card">
            <h5>Rincian Estimasi Penghasilan (Transparan)</h5>
            <div className="earnings-row">
              <span>Honor Kotor Tugas</span>
              <span>Rp{task.grossHonor.toLocaleString('id-ID')}</span>
            </div>
            <div className="earnings-row text-muted">
              <span>Komisi Platform (Tier 1 &bull; 8%)</span>
              <span>-Rp{(task.grossHonor - task.netHonor).toLocaleString('id-ID')}</span>
            </div>
            <div className="earnings-divider" />
            <div className="earnings-row earnings-row--total">
              <strong>Penghasilan Bersih (Masuk Saldo Dompet)</strong>
              <strong className="text-pink">Rp{task.netHonor.toLocaleString('id-ID')}</strong>
            </div>
            <small className="escrow-secured-note">
              <Icon name="shield" size={14} /> Dana honor sebesar Rp{task.grossHonor.toLocaleString('id-ID')} sudah 100% diamankan di Escrow Relink.
            </small>
          </div>

          <div className="worker-acceptance-criteria-section">
            <h5>Checklist Hasil yang Harus Dipenuhi (SOP):</h5>
            <ul className="criteria-list">
              {(task.checklist || []).map((item) => (
                <li key={item.id || item.text} className="criteria-item">
                  <Icon name="check-circle" size={16} className="text-mint" />
                  <span>{typeof item === 'string' ? item : item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="modal-footer-actions">
          <button
            className="btn-modal-cancel"
            disabled={isProcessing}
            onClick={onClose}
            type="button"
          >
            Kembali
          </button>
          <button
            className="btn-modal-confirm btn-modal-confirm--accept"
            disabled={isProcessing}
            onClick={() => onConfirm(task)}
            type="button"
          >
            {isProcessing ? (
              <span>Mengunci Tugas...</span>
            ) : (
              <>
                <Icon name="bolt" size={16} />
                <span>Terima Tugas &amp; Mulai Berangkat</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AmbilTugasModal
