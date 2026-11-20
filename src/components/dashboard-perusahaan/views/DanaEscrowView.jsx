import Icon from '../../common/Icon.jsx'

function DanaEscrowView({
  totalHeldEscrow,
  totalReviewEscrow,
  reviewCount,
  heldCount,
  releasedCount,
  disputeCount,
  disputedAmount = 0,
  totalReleasedAmount = 0,
  totalGuaranteeBalance = 500000,
  escrowTransactions,
  escrowFilterTab,
  setEscrowFilterTab,
  escrowSearchQuery,
  setEscrowSearchQuery,
  filteredEscrowTransactions,
  setSelectedEscrow,
  setShowEscrowModal,
  handleReleaseEscrow,
}) {
  return (
    <main className="dashboard-content-flow escrow-dashboard-flow">
      {/* 1. Header Section */}
      <div className="content-heading-bar">
        <div>
          <h1>Rekening Escrow &amp; Proteksi Transaksi</h1>
          <p>
            Dana pembayaran tugas Anda ditampung secara aman di payment gateway berlisensi dan hanya dicairkan setelah bukti kerja diverifikasi.
          </p>
        </div>
        <div className="escrow-header-actions">
          <button
            className="btn-download-recap"
            onClick={() => alert('Mengunduh Laporan Rekap Mutasi Escrow format CSV/PDF...')}
            type="button"
          >
            <Icon name="download" size={15} />
            <span>Unduh Rekap Mutasi</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Kartu Metrik Escrow Utama (Dinamis Sesuai Data Realtime) */}
      <div className="summary-metrics-grid escrow-metrics-grid">
        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Dana Tertahan di Escrow</span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="shield" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>Rp{(totalHeldEscrow || 0).toLocaleString('id-ID')}</strong>
            <span className="metric-trend metric-trend--good">
              {(totalHeldEscrow || 0) > 0 ? 'Tersimpan Aman' : 'Rekening Bersih'}
            </span>
          </div>
          <small className="metric-sub-note">
            {(heldCount || 0) + (reviewCount || 0) > 0
              ? `${(heldCount || 0) + (reviewCount || 0)} tugas sedang aktif dalam penampungan`
              : 'Tidak ada dana tugas yang tertahan'}
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Menunggu Review Bukti</span>
            <div className="metric-icon-bubble metric-icon-bubble--warn">
              <Icon name="clock" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong className="text-pink">Rp{(totalReviewEscrow || 0).toLocaleString('id-ID')}</strong>
            <span className="metric-trend metric-trend--warn">{reviewCount || 0} Tugas</span>
          </div>
          <small className="metric-sub-note">
            {(reviewCount || 0) > 0
              ? 'Auto-release 24–48 jam jika disetujui'
              : 'Tidak ada berkas menunggu persetujuan'}
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Total Dicairkan Bulan Ini</span>
            <div className="metric-icon-bubble metric-icon-bubble--good">
              <Icon name="check" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>Rp{(totalReleasedAmount || 0).toLocaleString('id-ID')}</strong>
            <span className="metric-trend metric-trend--good">
              {releasedCount || 0} Tugas Tuntas
            </span>
          </div>
          <small className="metric-sub-note">
            {(disputeCount || 0) > 0
              ? `${disputeCount} sengketa sedang dalam mediasi`
              : (releasedCount || 0) > 0
              ? '100% tanpa sengketa pending'
              : 'Belum ada pencairan dana bulan ini'}
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Saldo Dana Garansi</span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="star" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>Rp{(totalGuaranteeBalance || 0).toLocaleString('id-ID')}</strong>
            <span className="metric-trend metric-trend--good">
              {(disputeCount || 0) > 0 ? `${disputeCount} Klaim Mediasi` : 'Siap Klaim'}
            </span>
          </div>
          <small className="metric-sub-note">
            {(disputeCount || 0) > 0
              ? `Klaim garansi Rp${(disputedAmount || 0).toLocaleString('id-ID')} diproses tim`
              : 'Perlindungan ganti rugi mitra batal'}
          </small>
        </div>
      </div>

      {/* 3. Kartu Alur Transaksi Escrow Interaktif (4-Tahap Stepper) */}
      <section className="escrow-lifecycle-card">
        <div className="escrow-lifecycle-header">
          <div>
            <h3>Alur Keamanan Pembayaran Escrow Relink</h3>
            <small>Bagaimana dana dan hak UMKM dilindungi sejak pemesanan hingga serah terima selesai</small>
          </div>
          <span className="escrow-verified-pill">
            <Icon name="shield" size={14} /> Terverifikasi Payment Gateway Berlisensi
          </span>
        </div>

        <div className="escrow-steps-grid">
          <div className="escrow-step-item">
            <div className="escrow-step-num">1</div>
            <h4>Deposit Terkunci</h4>
            <p>UMKM menyetujui tugas. Biaya ditahan di rekening penampung resmi. Mitra belum bisa mengambil dana.</p>
          </div>
          <div className="escrow-step-connector" />
          <div className="escrow-step-item">
            <div className="escrow-step-num">2</div>
            <h4>Mitra Mengerjakan</h4>
            <p>Mitra hadir di lokasi dan mengerjakan tugas sesuai checklist SOP dan standar K3.</p>
          </div>
          <div className="escrow-step-connector" />
          <div className="escrow-step-item">
            <div className="escrow-step-num">3</div>
            <h4>Bukti Foto GPS</h4>
            <p>Mitra mengunggah foto ber-watermark koordinat lokasi & waktu sebagai bukti kerja sah.</p>
          </div>
          <div className="escrow-step-connector" />
          <div className="escrow-step-item escrow-step-item--highlight">
            <div className="escrow-step-num">4</div>
            <h4>Pencairan / Garansi</h4>
            <p>UMKM setuju → dana cair ke mitra. Jika tidak sesuai → ajukan revisi atau garansi refund penuh.</p>
          </div>
        </div>
      </section>

      {/* 4. Tabel Daftar Transaksi Escrow (Ledger) */}
      <section className="escrow-ledger-section">
        <div className="escrow-ledger-header">
          <div className="escrow-filter-tabs">
            <button
              className={`escrow-tab-btn${escrowFilterTab === 'all' ? ' escrow-tab-btn--active' : ''}`}
              onClick={() => setEscrowFilterTab('all')}
              type="button"
            >
              Semua ({escrowTransactions.length})
            </button>
            <button
              className={`escrow-tab-btn${escrowFilterTab === 'review' ? ' escrow-tab-btn--active' : ''}`}
              onClick={() => setEscrowFilterTab('review')}
              type="button"
            >
              Menunggu Review ({reviewCount})
            </button>
            <button
              className={`escrow-tab-btn${escrowFilterTab === 'held' ? ' escrow-tab-btn--active' : ''}`}
              onClick={() => setEscrowFilterTab('held')}
              type="button"
            >
              Tertahan ({heldCount})
            </button>
            <button
              className={`escrow-tab-btn${escrowFilterTab === 'released' ? ' escrow-tab-btn--active' : ''}`}
              onClick={() => setEscrowFilterTab('released')}
              type="button"
            >
              Dicairkan ({releasedCount})
            </button>
            <button
              className={`escrow-tab-btn${escrowFilterTab === 'disputed' ? ' escrow-tab-btn--active' : ''}`}
              onClick={() => setEscrowFilterTab('disputed')}
              type="button"
            >
              Garansi / Dispute ({disputeCount})
            </button>
          </div>

          <div className="escrow-search-box">
            <Icon name="search" size={15} />
            <input
              aria-label="Cari transaksi escrow"
              onChange={(e) => setEscrowSearchQuery(e.target.value)}
              placeholder="Cari ID transaksi, mitra, atau tugas..."
              type="text"
              value={escrowSearchQuery}
            />
            {escrowSearchQuery && (
              <button
                className="btn-clear-escrow-search"
                onClick={() => setEscrowSearchQuery('')}
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabel Mutasi Escrow */}
        <div className="escrow-table-wrapper">
          <table className="escrow-table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tugas & Mitra</th>
                <th>Nominal Escrow</th>
                <th>Status Penampungan</th>
                <th>Batas Review</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filteredEscrowTransactions.length === 0 ? (
                <tr>
                  <td className="empty-escrow-row" colSpan={6}>
                    Tidak ada transaksi escrow pada filter ini.
                  </td>
                </tr>
              ) : (
                filteredEscrowTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <strong className="tx-code">{tx.id}</strong>
                      <small className="tx-date">{tx.createdAt}</small>
                      <span className="tx-pgw">{tx.paymentGatewayRef}</span>
                    </td>
                    <td>
                      <div className="tx-worker-cell">
                        <img alt={tx.workerName} className="tx-worker-avatar" src={tx.workerPhoto} />
                        <div>
                          <strong>{tx.taskTitle}</strong>
                          <small>{tx.workerName} · <span className="tier-tag">{tx.tier}</span></small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong className="tx-amount">Rp{(Number(tx.amount) || 0).toLocaleString('id-ID')}</strong>
                      <small className="tx-fee-note">Proteksi Garansi: Rp{(Number(tx.guaranteeFee || tx.guaranteeFund) || 1500).toLocaleString('id-ID')}</small>
                    </td>
                    <td>
                      <span className={`escrow-status-pill escrow-status-pill--${tx.statusBadgeColor}`}>
                        {tx.status === 'review' && <Icon name="clock" size={12} />}
                        {tx.status === 'held' && <Icon name="shield" size={12} />}
                        {tx.status === 'released' && <Icon name="check" size={12} />}
                        {tx.status === 'disputed' && <Icon name="alert" size={12} />}
                        <span>{tx.statusLabel}</span>
                      </span>
                    </td>
                    <td>
                      {tx.autoReleaseHoursLeft ? (
                        <div className="auto-release-timer">
                          <span className="timer-badge">{tx.autoReleaseHoursLeft} Jam Tersisa</span>
                          <small>Auto-release</small>
                        </div>
                      ) : tx.status === 'released' ? (
                        <span className="tx-settled-text">Tuntas Dicairkan</span>
                      ) : tx.status === 'held' ? (
                        <span className="tx-working-text">Pengerjaan</span>
                      ) : (
                        <span className="tx-disputed-text">Ditangani Relink</span>
                      )}
                    </td>
                    <td>
                      <div className="tx-action-cell">
                        <button
                          className="btn-escrow-detail"
                          onClick={() => {
                            setSelectedEscrow(tx)
                            setShowEscrowModal(true)
                          }}
                          type="button"
                        >
                          Rincian
                        </button>
                        {tx.status === 'review' && (
                          <button
                            className="btn-escrow-quick-release"
                            onClick={() => handleReleaseEscrow(tx)}
                            title="Cairkan dana sekarang"
                            type="button"
                          >
                            Lepas Dana
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default DanaEscrowView
