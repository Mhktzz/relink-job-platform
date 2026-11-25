import { useState } from 'react'
import Icon from '../../common/Icon.jsx'

function TarikDanaModal({ availableBalance, onClose, onConfirm, isProcessing }) {
  const [selectedMethod, setSelectedMethod] = useState('gopay')
  const [accountNumber, setAccountNumber] = useState('0812-3456-7890')
  const [accountHolder, setAccountHolder] = useState('Dimas Prasetyo')
  const [amount, setAmount] = useState(availableBalance > 50000 ? 50000 : availableBalance)
  const [errorMsg, setErrorMsg] = useState('')

  const payoutMethods = [
    { id: 'gopay', name: 'GoPay', type: 'E-Wallet', icon: 'wallet' },
    { id: 'ovo', name: 'OVO', type: 'E-Wallet', icon: 'wallet' },
    { id: 'dana', name: 'DANA', type: 'E-Wallet', icon: 'wallet' },
    { id: 'bca', name: 'Bank BCA', type: 'Transfer Bank', icon: 'briefcase' },
    { id: 'bri', name: 'Bank BRI', type: 'Transfer Bank', icon: 'briefcase' },
    { id: 'mandiri', name: 'Bank Mandiri', type: 'Transfer Bank', icon: 'briefcase' },
  ]

  function handleSubmit(e) {
    e.preventDefault()
    if (amount < 20000) {
      setErrorMsg('Penarikan dana minimum adalah Rp20.000.')
      return
    }
    if (amount > availableBalance) {
      setErrorMsg('Nominal penarikan melebihi saldo tersedia.')
      return
    }
    onConfirm({
      method: selectedMethod,
      accountNumber,
      accountHolder,
      amount: Number(amount),
    })
  }

  return (
    <div aria-modal="true" className="admin-clean-modal-backdrop" role="dialog">
      <div className="admin-clean-modal-box worker-payout-modal">
        <div className="modal-top-bar">
          <div className="modal-title-wrap">
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="wallet" size={18} />
            </div>
            <div>
              <h3>Tarik Saldo Dompet Mitra</h3>
              <small>Pencairan instan tanpa biaya admin transfer</small>
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

        <form className="worker-payout-modal-form" onSubmit={handleSubmit}>
          <div className="modal-body-scroll">
            <div className="payout-balance-overview-card">
              <span>Saldo Tersedia yang Dapat Ditarik</span>
              <strong>Rp{availableBalance.toLocaleString('id-ID')}</strong>
              <small>Bebas biaya admin penarikan ke semua e-wallet &amp; rekening bank</small>
            </div>

            <div className="payout-methods-section">
              <label className="payout-field-label">Pilih Tujuan Pencairan:</label>
              <div className="payout-methods-grid">
                {payoutMethods.map((m) => (
                  <button
                    key={m.id}
                    className={`payout-method-card ${selectedMethod === m.id ? 'payout-method-card--active' : ''}`}
                    onClick={() => setSelectedMethod(m.id)}
                    type="button"
                  >
                    <Icon name={m.icon} size={18} />
                    <div>
                      <strong>{m.name}</strong>
                      <small>{m.type}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="payout-inputs-group">
              <label className="payout-field-label" htmlFor="acc-number">
                Nomor Akun / Nomor HP Terdaftar
              </label>
              <input
                className="payout-text-input"
                id="acc-number"
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Contoh: 08123456789 atau no. rekening"
                required
                type="text"
                value={accountNumber}
              />

              <label className="payout-field-label" htmlFor="acc-holder">
                Nama Pemilik Rekening / Akun E-Wallet
              </label>
              <input
                className="payout-text-input"
                id="acc-holder"
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Nama sesuai KTP / Akun E-Wallet"
                required
                type="text"
                value={accountHolder}
              />

              <label className="payout-field-label" htmlFor="payout-amount">
                Nominal Penarikan (Rp)
              </label>
              <input
                className="payout-text-input"
                id="payout-amount"
                max={availableBalance}
                min={20000}
                onChange={(e) => {
                  setErrorMsg('')
                  setAmount(Number(e.target.value))
                }}
                required
                type="number"
                value={amount}
              />

              <div className="payout-quick-chips">
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => setAmount(Math.min(availableBalance, 50000))}
                >
                  Rp50.000
                </button>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => setAmount(Math.min(availableBalance, 100000))}
                >
                  Rp100.000
                </button>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => setAmount(availableBalance)}
                >
                  Tarik Semua (Rp{availableBalance.toLocaleString('id-ID')})
                </button>
              </div>

              {errorMsg && (
                <div className="payout-error-alert">
                  <Icon name="alert" size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}
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
              className="btn-modal-confirm btn-modal-confirm--payout"
              disabled={isProcessing || availableBalance < 20000}
              type="submit"
            >
              {isProcessing ? (
                <span>Memproses Transfer...</span>
              ) : (
                <>
                  <Icon name="download" size={16} />
                  <span>Tarik Saldo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TarikDanaModal
