import Icon from '../../common/Icon.jsx'

function EscrowDetailModal({
  selectedEscrow,
  setShowEscrowModal,
  setSelectedEscrow,
  setShowDisputeModal,
  handleReleaseEscrow,
  isReleasingEscrow = false,
}) {
  if (!selectedEscrow) return null

  return (
    <div aria-modal="true" className="proof-modal-overlay" role="dialog">
      <div className="proof-modal-card escrow-modal-card">
        <header className="proof-modal-header">
          <div>
            <h2>Rincian Transaksi Escrow #{selectedEscrow.id}</h2>
            <small>Ref Gateway: {selectedEscrow.paymentGatewayRef} · ID Tugas: {selectedEscrow.taskId}</small>
          </div>
          <button
            aria-label="Tutup modal"
            className="btn-close-modal"
            onClick={() => {
              setShowEscrowModal(false)
              setSelectedEscrow(null)
            }}
            type="button"
          >
            ✕
          </button>
        </header>

        <div className="escrow-modal-body">
          {/* Status Banner */}
          {selectedEscrow.status === 'review' && (
            <div className="escrow-modal-alert escrow-modal-alert--warn">
              <Icon name="clock" size={18} />
              <div>
                <strong>Bukti Kerja Siap Ditinjau</strong>
                <p>
                  Mitra telah menyelesaikan tugas dan mengunggah checklist serah terima. Dana otomatis cair dalam <strong>{selectedEscrow.autoReleaseHoursLeft} jam</strong> jika tidak ada sanggahan.
                </p>
              </div>
            </div>
          )}

          {selectedEscrow.status === 'held' && (
            <div className="escrow-modal-alert escrow-modal-alert--info">
              <Icon name="shield" size={18} />
              <div>
                <strong>Dana Aman di Penampungan</strong>
                <p>Dana 100% terkunci di rekening escrow Relink. Mitra sedang melaksanakan tugas di lokasi.</p>
              </div>
            </div>
          )}

          {selectedEscrow.status === 'released' && (
            <div className="escrow-modal-alert escrow-modal-alert--success">
              <Icon name="check" size={18} />
              <div>
                <strong>Dana Telah Berhasil Dicairkan</strong>
                <p>Pembayaran telah diterima oleh Mitra. Kriteria serah terima telah terpenuhi secara penuh.</p>
              </div>
            </div>
          )}

          {selectedEscrow.status === 'disputed' && (
            <div className="escrow-modal-alert escrow-modal-alert--danger">
              <Icon name="alert" size={18} />
              <div>
                <strong>Proteksi Garansi Relink Aktif</strong>
                <p>Laporan kendala sedang diproses oleh Tim Mediasi Relink dengan jaminan penyelesaian maks. 48 jam.</p>
              </div>
            </div>
          )}

          {/* Rincian Transaksi Grid */}
          <div className="escrow-detail-grid">
            <div className="escrow-detail-box">
              <span className="detail-box-label">Tugas Terkait</span>
              <strong>{selectedEscrow.taskTitle}</strong>
              <div className="tx-worker-mini">
                <img alt={selectedEscrow.workerName} src={selectedEscrow.workerPhoto} />
                <span>{selectedEscrow.workerName} ({selectedEscrow.tier})</span>
              </div>
            </div>

            <div className="escrow-detail-box">
              <span className="detail-box-label">Status Checklist Serah Terima</span>
              <strong>{selectedEscrow.checklistSummary}</strong>
              <small>Waktu dibuat: {selectedEscrow.createdAt}</small>
            </div>
          </div>

          {/* Tabel Rincian Biaya */}
          <div className="escrow-cost-breakdown">
            <h4>Rincian Alokasi Dana Escrow</h4>
            <div className="cost-row">
              <span>Upah Tugas Mitra (100% ke pekerja)</span>
              <strong>Rp{((Number(selectedEscrow.amount) || 0) - (Number(selectedEscrow.platformFee) || 0)).toLocaleString('id-ID')}</strong>
            </div>
            <div className="cost-row">
              <span>Biaya Layanan & Payment Gateway (5%)</span>
              <span>Rp{(Number(selectedEscrow.platformFee) || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="cost-row">
              <span>Iuran Perlindungan & Garansi Relink</span>
              <span>Rp{(Number(selectedEscrow.guaranteeFee || selectedEscrow.guaranteeFund) || 1500).toLocaleString('id-ID')}</span>
            </div>
            <div className="cost-row cost-row--total">
              <strong>Total Dana Terproteksi</strong>
              <strong className="text-pink">Rp{(Number(selectedEscrow.amount) || 0).toLocaleString('id-ID')}</strong>
            </div>
          </div>
        </div>

        <footer className="escrow-modal-footer">
          <button
            className="button button--secondary"
            onClick={() => {
              setShowEscrowModal(false)
              setSelectedEscrow(null)
            }}
            type="button"
          >
            Tutup
          </button>

          {selectedEscrow.status === 'review' && (
            <div className="escrow-action-btn-group">
              <button
                className="button button--secondary button--danger-text"
                onClick={() => setShowDisputeModal(true)}
                type="button"
              >
                <Icon name="alert" size={15} />
                <span>Minta Perbaikan / Komplain</span>
              </button>
              <button
                className="button button--pink"
                onClick={() => handleReleaseEscrow(selectedEscrow)}
                disabled={isReleasingEscrow}
                type="button"
              >
                <Icon name="check" size={16} />
                <span>{isReleasingEscrow ? 'Memproses...' : 'Setujui & Lepaskan Dana'}</span>
              </button>
            </div>
          )}

          {selectedEscrow.status === 'released' && (
            <button
              className="button button--pink"
              onClick={() => alert(`Mengunduh Bukti Pembayaran Resmi ${selectedEscrow.id} (PDF)...`)}
              type="button"
            >
              <Icon name="download" size={16} />
              <span>Unduh Bukti Transaksi (PDF)</span>
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

export default EscrowDetailModal
