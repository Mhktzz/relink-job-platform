import { useState } from 'react'
import Icon from '../common/Icon.jsx'
import './WorkerVerification.css'

export function WorkerVerificationBanner({ isComplete, onAction }) {
  return (
    <section
      aria-label="Kelengkapan data mitra"
      className={`worker-verification-banner${isComplete ? ' worker-verification-banner--complete' : ''}`}
    >
      <div className="worker-verification-banner__icon">
        <Icon name={isComplete ? 'check' : 'shield'} size={20} />
      </div>
      <div className="worker-verification-banner__content">
        <span className="clean-section-eyebrow">
          {isComplete ? 'PROFIL LENGKAP' : 'LANGKAH PERTAMA MITRA'}
        </span>
        <h3>
          {isComplete
            ? 'Data diri sudah dilengkapi'
            : 'Lengkapi data diri untuk mulai bekerja'}
        </h3>
        <p>
          {isComplete
            ? 'Kamu bisa mulai mencari pekerjaan yang tersedia untuk Tier 1.'
            : 'Lengkapi nama lengkap, domisili, status perkawinan, NIK, dan nama ibu kandung sebelum mencari tugas Tier 1.'}
        </p>
      </div>
      <button
        className="clean-btn-pill clean-btn-pill--pink"
        onClick={onAction}
        type="button"
      >
        {isComplete ? 'Cari Tugas Tier 1' : 'Lengkapi Data & Verifikasi'}
        <Icon name="arrow" size={14} />
      </button>
    </section>
  )
}

function WorkerVerificationView({
  workerName = '',
  isDemoAccount = false,
  lookupError = '',
  isSubmitting = false,
  onSubmit,
  onBack,
}) {
  const [form, setForm] = useState({
    fullName: workerName,
    domicile: '',
    maritalStatus: '',
    nik: '',
    motherName: '',
    consent: false,
  })
  const [submitError, setSubmitError] = useState('')

  function updateField(event) {
    const { name, value, checked, type } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    if (!/^\d{16}$/.test(form.nik)) {
      setSubmitError('NIK harus terdiri dari 16 angka.')
      return
    }

    try {
      await onSubmit({
        fullName: form.fullName.trim(),
        domicile: form.domicile.trim(),
        maritalStatus: form.maritalStatus,
        nik: form.nik,
        motherName: form.motherName.trim(),
      })
    } catch (error) {
      setSubmitError(error.message || 'Data belum berhasil dikirim. Silakan coba lagi.')
    }
  }

  return (
    <main className="clean-dash-wrapper">
      <header className="clean-dash-header">
        <div className="clean-dash-header__intro">
          <span className="clean-dash-eyebrow">DATA MITRA</span>
          <h1 className="clean-dash-title">Lengkapi data diri &amp; verifikasi</h1>
          <p className="clean-dash-subtitle">
            Data ini diperlukan sebelum kamu mulai mencari pekerjaan Tier 1.
          </p>
        </div>
      </header>

      <section className="clean-card worker-verification-form-card">
        {isDemoAccount && (
          <div className="worker-verification-notice worker-verification-notice--demo">
            <Icon name="shield" size={18} />
            <p>
              Akun demo: formulir ini hanya simulasi. Gunakan data fiktif; data formulir
              tidak dikirim atau disimpan. Jangan masukkan data pribadi yang sebenarnya.
            </p>
          </div>
        )}

        <div className="worker-verification-form-heading">
          <h2>Informasi yang dibutuhkan</h2>
          <p>Isi sesuai data diri kamu. Semua kolom wajib diisi.</p>
        </div>

        {lookupError && (
          <p className="worker-verification-error" role="alert">
            {lookupError}
          </p>
        )}
        {submitError && (
          <p className="worker-verification-error" role="alert">
            {submitError}
          </p>
        )}

        <form className="worker-verification-form" onSubmit={handleSubmit}>
          <label className="worker-verification-field">
            <span>Nama lengkap</span>
            <input
              autoComplete="name"
              maxLength={120}
              name="fullName"
              onChange={updateField}
              required
              type="text"
              value={form.fullName}
            />
          </label>

          <label className="worker-verification-field">
            <span>Domisili</span>
            <input
              autoComplete="address-level2"
              maxLength={160}
              name="domicile"
              onChange={updateField}
              placeholder="Contoh: Kecamatan, Kota"
              required
              type="text"
              value={form.domicile}
            />
          </label>

          <label className="worker-verification-field">
            <span>Status perkawinan</span>
            <select
              name="maritalStatus"
              onChange={updateField}
              required
              value={form.maritalStatus}
            >
              <option value="">Pilih status</option>
              <option value="belum_menikah">Belum menikah</option>
              <option value="menikah">Menikah</option>
              <option value="cerai_hidup">Cerai hidup</option>
              <option value="cerai_mati">Cerai mati</option>
            </select>
          </label>

          <label className="worker-verification-field">
            <span>NIK</span>
            <input
              autoComplete="off"
              inputMode="numeric"
              maxLength={16}
              minLength={16}
              name="nik"
              onChange={(event) => {
                const nextValue = event.target.value.replace(/\D/g, '').slice(0, 16)
                setForm((current) => ({ ...current, nik: nextValue }))
                setSubmitError('')
              }}
              pattern="\d{16}"
              placeholder="16 angka"
              required
              type="text"
              value={form.nik}
            />
          </label>

          <label className="worker-verification-field">
            <span>Nama ibu kandung</span>
            <input
              autoComplete="off"
              maxLength={120}
              name="motherName"
              onChange={updateField}
              required
              type="text"
              value={form.motherName}
            />
          </label>

          <label className="worker-verification-consent">
            <input
              checked={form.consent}
              name="consent"
              onChange={updateField}
              required
              type="checkbox"
            />
            <span>
              Saya menyetujui penggunaan data ini untuk keperluan verifikasi akun Relink.
            </span>
          </label>

          <div className="worker-verification-notice">
            <Icon name="lock" size={16} />
            <p>
              Data verifikasi hanya dapat diakses melalui akun kamu dan tidak ditampilkan
              pada profil publik.
            </p>
          </div>

          <div className="worker-verification-form-actions">
            <button
              className="clean-btn-pill clean-btn-pill--secondary"
              onClick={onBack}
              type="button"
            >
              Kembali
            </button>
            <button
              className="clean-btn-pill clean-btn-pill--pink"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim & Cari Tugas Tier 1'}
              {!isSubmitting && <Icon name="arrow" size={14} />}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default WorkerVerificationView
