import Icon from '../../common/Icon.jsx'

function DompetMitraView({ walletData, onOpenWithdrawModal }) {
  return (
    <main className="dashboard-content-flow worker-dashboard-flow">
      {/* 1. Header Section */}
      <div className="content-heading-bar">
        <div>
          <h1>Dompet Mitra &amp; Riwayat Pencairan</h1>
          <p>
            Kelola pendapatan hasil tugas mikro Anda. Dana cair secara instan ke e-wallet atau rekening bank Anda tanpa potongan biaya admin penarikan.
          </p>
        </div>
        <div className="escrow-header-actions">
          <button
            className="btn-download-recap"
            onClick={onOpenWithdrawModal}
            type="button"
          >
            <Icon name="download" size={15} />
            <span>Tarik Saldo Sekarang</span>
          </button>
        </div>
      </div>

      {/* 2. 3 Kartu Saldo Utama */}
      <div className="summary-metrics-grid worker-wallet-metrics-grid">
        <div className="metric-box-card metric-box-card--wallet-primary">
          <div className="metric-box-card__header">
            <span>Saldo Tersedia yang Dapat Ditarik</span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="wallet" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>Rp{(walletData.availableBalance || 0).toLocaleString('id-ID')}</strong>
            <span className="metric-trend metric-trend--good">Siap Dicairkan</span>
          </div>
          <small className="metric-sub-note">Bebas biaya transfer ke GoPay, OVO, DANA, BCA, Mandiri, BRI</small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Dana Tertahan di Rekening Escrow</span>
            <div className="metric-icon-bubble metric-icon-bubble--warn">
              <Icon name="shield" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong className="text-pink">Rp{(walletData.heldEscrowBalance || 0).toLocaleString('id-ID')}</strong>
            <span className="metric-trend metric-trend--warn">Sedang Berjalan</span>
          </div>
          <small className="metric-sub-note">Otomatis masuk saldo dompet segera setelah serah terima tugas disetujui</small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Total Penghasilan Bulan Ini</span>
            <div className="metric-icon-bubble metric-icon-bubble--blue">
              <Icon name="chart" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>Rp{(walletData.monthlyTotalEarnings || 0).toLocaleString('id-ID')}</strong>
            <span className="metric-trend metric-trend--good">+100% dari Bulan Lalu</span>
          </div>
          <small className="metric-sub-note">Total akumulasi pencairan bersih dan dana aktif</small>
        </div>
      </div>

      {/* 3. Banner Transparansi Potongan Komisi Relink */}
      <div className="cold-start-info-banner">
        <div className="metric-icon-bubble metric-icon-bubble--mint">
          <Icon name="shield" size={18} />
        </div>
        <div className="cold-start-info-text">
          <strong>Transparansi Bagi Hasil Adil (Fair Sharing Policy)</strong>
          <p>
            Relink hanya memotong komisi platform sebesar 8% pada Tier 1 untuk pemeliharaan server dan asuransi garansi perlindungan sengketa. Seluruh honor bersih 92% ditransfer utuh ke dompet Anda tanpa biaya tersembunyi.
          </p>
        </div>
      </div>

      {/* 4. Tabel Riwayat Mutasi Transaksi */}
      <section className="worker-transactions-section">
        <div className="section-header-flex">
          <div>
            <h3>Riwayat Transaksi &amp; Pencairan Dana</h3>
            <small className="text-muted">Daftar transaksi penerimaan honor dan penarikan saldo ke rekening/e-wallet</small>
          </div>
        </div>

        <div className="worker-transactions-table-wrap">
          <table className="worker-transactions-table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Keterangan / Tugas</th>
                <th>Honor Bruto</th>
                <th>Komisi Platform</th>
                <th>Nominal Bersih</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(walletData.transactions || []).map((trx) => (
                <tr key={trx.id}>
                  <td>
                    <span className="trx-code-badge">{trx.id}</span>
                  </td>
                  <td>{trx.date}</td>
                  <td>
                    <strong>{trx.title}</strong>
                    <div className="text-muted text-small">{trx.client}</div>
                  </td>
                  <td>
                    {trx.type === 'payout' ? '-' : `Rp${trx.grossAmount.toLocaleString('id-ID')}`}
                  </td>
                  <td className="text-muted">
                    {trx.type === 'payout' ? 'Gratis' : `-Rp${trx.fee.toLocaleString('id-ID')}`}
                  </td>
                  <td>
                    <strong className={trx.type === 'income' ? 'text-mint' : 'text-navy'}>
                      {trx.type === 'income' ? '+' : '-'}Rp{trx.netAmount.toLocaleString('id-ID')}
                    </strong>
                  </td>
                  <td>
                    <span className="trx-status-pill trx-status-pill--success">
                      <Icon name="check" size={12} />
                      <span>{trx.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default DompetMitraView
