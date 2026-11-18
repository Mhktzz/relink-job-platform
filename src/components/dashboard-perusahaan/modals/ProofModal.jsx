import cashierPhoto from '../../../assets/cashier.jpg'

function ProofModal({
  selectedProofTask,
  setShowProofModal,
  signatureApproved,
  setSignatureApproved,
  handleApproveProof,
}) {
  if (!selectedProofTask) return null

  return (
    <div aria-modal="true" className="proof-modal-overlay" role="dialog">
      <div className="proof-modal-card">
        <header className="proof-modal-header">
          <div>
            <h2>Verifikasi Hasil Kerja & Serah Terima</h2>
            <small>ID Tugas: {selectedProofTask.id} · {selectedProofTask.title}</small>
          </div>
          <button
            aria-label="Tutup modal"
            className="btn-close-modal"
            onClick={() => setShowProofModal(false)}
            type="button"
          >
            ✕
          </button>
        </header>

        <div className="proof-modal-body">
          <div className="proof-photo-section">
            <h3>Foto Hasil Kerja (Kamera Ber-Watermark Otomatis)</h3>
            <div className="proof-photo-wrapper">
              <img
                alt="Bukti foto pengerjaan"
                className="proof-photo-img"
                src={selectedProofTask.proofData?.photoUrl || cashierPhoto}
              />
              <div className="proof-watermark">
                <div>GPS: {selectedProofTask.proofData?.gpsLocation}</div>
                <div>Waktu: {selectedProofTask.proofData?.timestamp}</div>
                <div>Status: Validated by Relink Camera</div>
              </div>
            </div>
            <p className="proof-note">
              <strong>Catatan dari {selectedProofTask.workerName}:</strong>{' '}
              "{selectedProofTask.proofData?.note}"
            </p>
          </div>

          <div className="proof-checklist-section">
            <h3>Pemeriksaan Kriteria Penerimaan (Checklist)</h3>
            <ul className="modal-checklist">
              {selectedProofTask.acceptanceChecklist.map((c) => (
                <li className="modal-checklist__item" key={c.id}>
                  <span className="check-icon">✓</span>
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>

            <div className="signature-box">
              <h4>Tanda Tangan Digital Persetujuan</h4>
              <div className="mock-signature-pad">
                <span>Tertanda secara digital oleh Bu Rina (Toko Kue Rina)</span>
                <small>IP: 180.252.xxx.xxx · Enkripsi SHA-256</small>
              </div>
              <label className="checkbox-signature-label">
                <input
                  checked={signatureApproved}
                  onChange={(e) => setSignatureApproved(e.target.checked)}
                  type="checkbox"
                />
                <span>
                  Saya menyatakan hasil pekerjaan telah sesuai kriteria dan menyetujui dana escrow sebesar{' '}
                  <strong>Rp{selectedProofTask.budget.toLocaleString('id-ID')}</strong> dicairkan ke mitra.
                </span>
              </label>
            </div>
          </div>
        </div>

        <footer className="proof-modal-footer">
          <button
            className="button button--outline-dark button--sm"
            onClick={() => {
              alert('Sengketa diajukan. Tim mediasi Relink akan meninjau dalam waktu maksimal 48 jam.')
              setShowProofModal(false)
            }}
            type="button"
          >
            Ajukan Sengketa / Komplain
          </button>

          <button
            className="button button--pink button--lg"
            disabled={!signatureApproved}
            onClick={() => handleApproveProof(selectedProofTask)}
            type="button"
          >
            Setujui & Cairkan Dana Escrow
          </button>
        </footer>
      </div>
    </div>
  )
}

export default ProofModal
