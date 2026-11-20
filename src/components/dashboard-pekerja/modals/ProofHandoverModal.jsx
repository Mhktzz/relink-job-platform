import { useState } from 'react'
import Icon from '../../common/Icon.jsx'

function ProofHandoverModal({ activeTask, onClose, onSubmitProof, isProcessing }) {
  const [checklist, setChecklist] = useState(
    (activeTask?.checklist || []).map((item) => ({
      ...item,
      done: item.done !== undefined ? item.done : true,
    }))
  )
  const [photoUploaded, setPhotoUploaded] = useState(true)
  const [clientSignatureAccepted, setClientSignatureAccepted] = useState(false)
  const [workNotes, setWorkNotes] = useState('Pekerjaan telah selesai rapi dan sudah diuji coba bersama pemilik toko.')

  const allChecklistDone = checklist.every((item) => item.done)
  const canSubmit = allChecklistDone && photoUploaded && clientSignatureAccepted

  function toggleChecklist(id) {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    )
  }

  return (
    <div aria-modal="true" className="admin-clean-modal-backdrop" role="dialog">
      <div className="admin-clean-modal-box worker-proof-modal">
        <div className="modal-top-bar">
          <div className="modal-title-wrap">
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="shield" size={18} />
            </div>
            <div>
              <h3>Serah Terima Digital (Proof-of-Work)</h3>
              <small>Unggah bukti kerja &amp; checklist untuk pencairan otomatis dana escrow</small>
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
          <div className="proof-task-info-card">
            <div className="proof-task-info-header">
              <span className="task-tag-chip task-tag-chip--pink">{activeTask?.category}</span>
              <span className="escrow-badge">
                <Icon name="shield" size={12} /> Escrow #{activeTask?.escrowRef}
              </span>
            </div>
            <h4>{activeTask?.title}</h4>
            <p className="text-muted">Klien: {activeTask?.clientName} &bull; {activeTask?.location}</p>
          </div>

          {/* 1. Checklist SOP Konfirmasi */}
          <div className="proof-section-box">
            <div className="proof-section-title">
              <Icon name="check-circle" size={16} className="text-mint" />
              <strong>1. Checklist Hasil Kerja (Wajib Dicentang Lengkap)</strong>
            </div>
            <p className="text-muted text-small">
              Pastikan seluruh kriteria yang disepakati dengan UMKM telah selesai dikerjakan:
            </p>
            <div className="proof-checklist-group">
              {checklist.map((item) => (
                <label key={item.id} className="proof-checklist-label">
                  <input
                    checked={item.done}
                    onChange={() => toggleChecklist(item.id)}
                    type="checkbox"
                  />
                  <span className={item.done ? 'checklist-text--done' : 'checklist-text'}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Foto Bukti Hasil Kerja Ber-watermark */}
          <div className="proof-section-box">
            <div className="proof-section-title">
              <Icon name="image" size={16} className="text-mint" />
              <strong>2. Foto Bukti Hasil Pekerjaan (Terverifikasi GPS)</strong>
            </div>
            <div className="proof-photo-preview-box">
              <div className="proof-photo-mock">
                <div className="proof-watermark-stamp">
                  <span>GPS: -6.1754, 106.8272 &bull; Jakarta Pusat</span>
                  <span>Waktu: 20 Nov 2026, 15:42 WIB &bull; Relink Cam</span>
                </div>
                <div className="proof-photo-center-badge">
                  <Icon name="check-circle" size={24} />
                  <span>Foto Hasil Kerja Berhasil Direkam</span>
                </div>
              </div>
              <button
                className="btn-retake-photo"
                onClick={() => alert('Fitur kamera aplikasi: Foto hasil kerja telah diperbarui dengan cap waktu valid.')}
                type="button"
              >
                <Icon name="image" size={14} /> Ambil Ulang Foto
              </button>
            </div>
          </div>

          {/* 3. Catatan Penyelesaian */}
          <div className="proof-section-box">
            <label className="proof-section-title" htmlFor="work-notes">
              <Icon name="file-text" size={16} className="text-mint" />
              <strong>3. Catatan Penyelesaian untuk Klien</strong>
            </label>
            <textarea
              className="proof-notes-input"
              id="work-notes"
              onChange={(e) => setWorkNotes(e.target.value)}
              rows={2}
              value={workNotes}
            />
          </div>

          {/* 4. Tanda Tangan Digital Klien */}
          <div className="proof-agreement-box">
            <label className="proof-agreement-label">
              <input
                checked={clientSignatureAccepted}
                onChange={(e) => setClientSignatureAccepted(e.target.checked)}
                type="checkbox"
              />
              <span>
                <strong>Saya mengonfirmasi bahwa pekerjaan telah diserahkan</strong> dan telah dicek bersama pemilik usaha ({activeTask?.clientName}). Klien memiliki waktu 24–48 jam untuk konfirmasi akhir atau dana akan dicairkan otomatis oleh sistem escrow.
              </span>
            </label>
          </div>
        </div>

        <div className="modal-footer-actions">
          <button
            className="btn-modal-cancel"
            disabled={isProcessing}
            onClick={onClose}
            type="button"
          >
            Batal
          </button>
          <button
            className="btn-modal-confirm btn-modal-confirm--submit-proof"
            disabled={!canSubmit || isProcessing}
            onClick={() => onSubmitProof(checklist, workNotes)}
            type="button"
          >
            {isProcessing ? (
              <span>Mengirim Bukti...</span>
            ) : (
              <>
                <Icon name="check" size={16} />
                <span>Kirim Bukti &amp; Ajukan Pencairan Dana</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProofHandoverModal
