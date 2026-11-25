import { useState } from 'react'
import Icon from '../../common/Icon.jsx'

function ProofHandoverModal({ activeTask, onClose, onSubmitProof, isProcessing }) {
  const [checklist, setChecklist] = useState(
    (activeTask?.checklist || []).map((item) => ({
      ...item,
      done: item.done !== undefined ? item.done : true,
    }))
  )
  const [uploadedFile, setUploadedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [clientSignatureAccepted, setClientSignatureAccepted] = useState(false)
  const [workNotes, setWorkNotes] = useState('Pekerjaan telah selesai rapi dan sudah diuji coba bersama pemilik toko.')

  const allChecklistDone = checklist.every((item) => item.done)
  const canSubmit = allChecklistDone && Boolean(uploadedFile) && clientSignatureAccepted

  function toggleChecklist(id) {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    )
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const rawDataUrl = ev.target?.result
        if (typeof rawDataUrl !== 'string') return
        // Kompres pratinjau gambar agar ringan disimpan ke localStorage tanpa QuotaExceededError
        const img = new Image()
        img.onload = () => {
          try {
            const maxDim = 900
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
            const canvas = document.createElement('canvas')
            canvas.width = Math.max(1, Math.round(img.width * scale))
            canvas.height = Math.max(1, Math.round(img.height * scale))
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            setPreviewUrl(canvas.toDataURL('image/jpeg', 0.72))
          } catch {
            setPreviewUrl(rawDataUrl)
          }
        }
        img.onerror = () => setPreviewUrl(rawDataUrl)
        img.src = rawDataUrl
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl('')
    }
  }

  function handleRemoveFile() {
    setUploadedFile(null)
    setPreviewUrl('')
  }

  function handleSubmit() {
    if (!canSubmit || isProcessing) return
    if (onSubmitProof) {
      onSubmitProof(checklist, workNotes, {
        fileName: uploadedFile?.name || 'bukti-kerja.jpg',
        fileSize: uploadedFile?.size || 0,
        photoUrl: previewUrl,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        gpsLocation: '-6.1754, 106.8272 (Verified)',
        note: workNotes,
      })
    }
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
              <small>Unggah bukti kerja &amp; checklist sebelum mengajukan ke review klien</small>
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
                <Icon name="shield" size={12} /> Escrow #{activeTask?.escrowRef || '8841'}
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

          {/* 2. Foto / File Bukti Hasil Kerja */}
          <div className="proof-section-box">
            <div className="proof-section-title">
              <Icon name="image" size={16} className="text-mint" />
              <strong>2. Foto / Berkas Bukti Pekerjaan (Wajib Diunggah)</strong>
            </div>

            <input
              accept="image/*,.pdf,.zip"
              id="proof-file-input"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              type="file"
            />

            {!uploadedFile ? (
              <div
                className="proof-upload-dropzone"
                onClick={() => document.getElementById('proof-file-input')?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    document.getElementById('proof-file-input')?.click()
                  }
                }}
              >
                <div className="proof-upload-icon-circle">
                  <Icon name="upload" size={24} />
                </div>
                <strong>Unggah Foto atau Berkas Bukti Pekerjaan</strong>
                <p className="text-muted text-small">
                  Pilih foto hasil kerja dari galeri/kamera atau berkas bukti kerja (JPG, PNG, PDF maks. 10MB)
                </p>
                <button
                  className="btn-browse-file"
                  onClick={(e) => {
                    e.stopPropagation()
                    document.getElementById('proof-file-input')?.click()
                  }}
                  type="button"
                >
                  <Icon name="image" size={14} />
                  <span>Pilih File Bukti</span>
                </button>
              </div>
            ) : (
              <div className="proof-uploaded-container">
                <div className="proof-photo-mock proof-photo-mock--active">
                  {previewUrl ? (
                    <img
                      alt="Pratinjau Bukti Kerja"
                      className="proof-photo-img-preview"
                      src={previewUrl}
                    />
                  ) : (
                    <div className="proof-file-doc-preview">
                      <Icon name="file-text" size={32} />
                      <span className="proof-file-name">{uploadedFile.name}</span>
                    </div>
                  )}
                  <div className="proof-watermark-stamp">
                    <span>GPS: -6.1754, 106.8272 &bull; Jakarta Timur</span>
                    <span>Waktu: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</span>
                  </div>
                  <div className="proof-photo-center-badge">
                    <Icon name="check-circle" size={18} />
                    <span>File Bukti Siap Dilampirkan</span>
                  </div>
                </div>

                <div className="proof-file-meta-row">
                  <div className="proof-file-info">
                    <span className="proof-file-filename">{uploadedFile.name}</span>
                    <span className="proof-file-filesize">
                      ({(uploadedFile.size / 1024).toFixed(1)} KB) &bull; Terverifikasi
                    </span>
                  </div>
                  <div className="proof-file-actions">
                    <button
                      className="btn-retake-photo"
                      onClick={() => document.getElementById('proof-file-input')?.click()}
                      type="button"
                    >
                      <Icon name="refresh" size={13} />
                      <span>Ganti File</span>
                    </button>
                    <button
                      className="btn-remove-file"
                      onClick={handleRemoveFile}
                      type="button"
                    >
                      <Icon name="trash" size={13} />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
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

          {/* Peringatan jika belum upload file bukti */}
          {!uploadedFile && (
            <div className="proof-warning-banner">
              <Icon name="alert" size={16} />
              <span>Wajib melampirkan foto/file bukti pekerjaan terlebih dahulu sebelum mengajukan ke review.</span>
            </div>
          )}
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
            onClick={handleSubmit}
            title={!uploadedFile ? 'Harap unggah bukti pekerjaan terlebih dahulu' : 'Ajukan tugas ke review klien'}
            type="button"
          >
            {isProcessing ? (
              <span>Mengajukan ke Review...</span>
            ) : (
              <>
                <Icon name="check" size={16} />
                <span>Ajukan ke Review</span>
                <Icon name="arrow" size={12} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProofHandoverModal
