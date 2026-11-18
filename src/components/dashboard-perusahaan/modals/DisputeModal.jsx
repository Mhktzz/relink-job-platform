import Icon from '../../common/Icon.jsx'

function DisputeModal({
  selectedEscrow,
  setShowDisputeModal,
  disputeReason,
  setDisputeReason,
  handleReportDispute,
}) {
  if (!selectedEscrow) return null

  return (
    <div aria-modal="true" className="proof-modal-overlay" role="dialog">
      <div className="proof-modal-card dispute-modal-card">
        <header className="proof-modal-header">
          <div>
            <h2>Ajukan Perbaikan / Garansi Relink</h2>
            <small>Transaksi #{selectedEscrow.id} · Mitra: {selectedEscrow.workerName}</small>
          </div>
          <button
            aria-label="Tutup modal"
            className="btn-close-modal"
            onClick={() => setShowDisputeModal(false)}
            type="button"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleReportDispute}>
          <div className="dispute-modal-body">
            <div className="escrow-modal-alert escrow-modal-alert--warn">
              <Icon name="shield" size={18} />
              <div>
                <strong>Perlindungan Garansi 100% Relink</strong>
                <p>
                  Dana di escrow akan tetap ditahan selama proses penyelesaian. Mitra akan diberi waktu untuk memperbaiki hasil kerja atau tim mediasi Relink akan memutuskan pengembalian dana penuh.
                </p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="disputeReason">Kriteria yang Belum Sesuai atau Kendala</label>
              <textarea
                id="disputeReason"
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Contoh: Boks kue masih kurang 10 boks dan segel stiker belum tertempel rapi sesuai checklist serah terima..."
                required
                rows={4}
                value={disputeReason}
              />
            </div>
          </div>

          <footer className="escrow-modal-footer">
            <button
              className="button button--secondary"
              onClick={() => setShowDisputeModal(false)}
              type="button"
            >
              Batal
            </button>
            <button className="button button--pink" type="submit">
              Kirim Laporan ke Tim Mediasi
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export default DisputeModal
