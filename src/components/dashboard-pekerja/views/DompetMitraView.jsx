import Icon from '../../common/Icon.jsx'

function DompetMitraView({ walletData, onOpenWithdrawModal }) {
  return (
    <main className="dashboard-content-flow">
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

      {/* 2. 3 Kartu Saldo Utama (Summary Metrics Grid) */}
      <div className="summary-metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-box-card" style={{ border: '2px solid var(--mint)' }}>
          <div className="metric-box-card__header">
            <span>Saldo Siap Tarik (Dompet)</span>
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
            <span className="metric-trend metric-trend--warn">Tugas Berjalan</span>
          </div>
          <small className="metric-sub-note">Otomatis masuk saldo dompet segera setelah serah terima disetujui</small>
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
      <div className="escrow-lifecycle-card" style={{ marginBottom: '28px', padding: '22px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="metric-icon-bubble metric-icon-bubble--mint" style={{ width: '44px', height: '44px' }}>
            <Icon name="shield" size={20} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: 'var(--navy)' }}>
              Transparansi Bagi Hasil Adil (Fair Sharing Policy)
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-muted)', lineHeight: '1.45' }}>
              Relink hanya memotong komisi platform sebesar 8% pada Tier 1 untuk pemeliharaan server dan asuransi garansi perlindungan sengketa. Seluruh honor bersih 92% ditransfer utuh ke dompet Anda tanpa biaya tersembunyi.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Tabel Riwayat Mutasi Transaksi (Menggunakan Recent Orders Card & Clean Data Table dari Dashboard Perusahaan) */}
      <div className="recent-orders-card">
        <div className="recent-orders-card__header">
          <div>
            <h3>Riwayat Mutasi &amp; Pencairan Dana</h3>
            <small>Daftar transaksi penerimaan honor tugas dan penarikan saldo ke rekening/e-wallet</small>
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="clean-data-table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Keterangan / Tugas</th>
                <th>Honor Bruto</th>
                <th>Komisi Relink</th>
                <th>Nominal Bersih</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(walletData.transactions || []).length === 0 && (
                <tr>
                  <td colSpan="7" className="text-muted">
                    Belum ada transaksi. Dana akan tercatat di sini setelah pekerjaan selesai dan disetujui UMKM.
                  </td>
                </tr>
              )}
              {(walletData.transactions || []).map((trx) => (
                <tr key={trx.id}>
                  <td>
                    <strong>{trx.id}</strong>
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
                    <strong className={trx.type === 'income' ? 'text-pink' : 'text-navy'}>
                      {trx.type === 'income' ? '+' : '-'}Rp{trx.netAmount.toLocaleString('id-ID')}
                    </strong>
                  </td>
                  <td>
                    <span className="table-status-pill table-status-pill--completed">
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default DompetMitraView
