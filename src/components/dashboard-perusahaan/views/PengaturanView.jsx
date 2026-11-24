import { useState } from 'react'
import Icon from '../../common/Icon.jsx'
import './PengaturanView.css'

function PengaturanView({ currentUser = {}, onUpdateProfile, setActionSuccessMsg, setCurrentMenu }) {
  const [activeTab, setActiveTab] = useState('profil') // 'profil' | 'operasional' | 'legalitas' | 'escrow' | 'keamanan'

  // State Profil Toko & Pemilik
  const [businessName, setBusinessName] = useState(currentUser.business_name || 'Toko Kue Bu Rina')
  const [ownerName, setOwnerName] = useState(currentUser.full_name || 'Bu Rina Wati')
  const [category, setCategory] = useState('Kuliner & Kue Tradisional')
  const [phone, setPhone] = useState('081234567890')
  const [email, setEmail] = useState(currentUser.email || 'burina@tokokue.id')
  const [bio, setBio] = useState(
    'Toko spesialis kue basah tradisional, jajanan pasar higienis, dan aneka snack box catering untuk kebutuhan kantor & acara lokal.'
  )

  // State Operasional & Jangkauan Radar
  const [address, setAddress] = useState('Jl. Balai Pustaka Timur No. 14B, Rawamangun')
  const [city, setCity] = useState('Jakarta Timur, DKI Jakarta 13220')
  const [radarRadius, setRadarRadius] = useState('3') // km
  const [operatingDays, setOperatingDays] = useState('Senin - Sabtu')
  const [operatingHours, setOperatingHours] = useState('07:30 - 17:30 WIB')
  const [locationNote, setLocationNote] = useState('Masuk dari gapura timur, ruko cat hijau tosca sebelah minimarket.')

  // State Legalitas Usaha (NIB / FR-207)
  const [nib, setNib] = useState('1289000341829')
  const [skuNumber, setSkuNumber] = useState('503/024/SKU/XI/2026')
  const [taxId, setTaxId] = useState('82.912.441.2-003.000')

  // State Rekening & Preferensi Escrow (FR-401, FR-404)
  const [bankName, setBankName] = useState('Bank Central Asia (BCA)')
  const [accountNumber, setAccountNumber] = useState('8820192831')
  const [accountHolder, setAccountHolder] = useState('Rina Wati')
  const [autoReleaseHours, setAutoReleaseHours] = useState('24') // 24 atau 48 jam
  const [whatsappNotif, setWhatsappNotif] = useState(true)

  // State Ubah Kata Sandi
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordNotice, setPasswordNotice] = useState('')

  // Handler Simpan Profil
  function handleSaveSettings(e) {
    if (e) e.preventDefault()

    const updatedUser = {
      ...currentUser,
      business_name: businessName.trim() || currentUser.business_name,
      full_name: ownerName.trim() || currentUser.full_name,
      phone: phone.trim(),
      email: email.trim(),
    }

    if (onUpdateProfile) {
      onUpdateProfile(updatedUser)
    } else {
      try {
        localStorage.setItem('relink_user', JSON.stringify(updatedUser))
      } catch {}
      if (setActionSuccessMsg) {
        setActionSuccessMsg('Pengaturan UMKM berhasil disimpan!')
        setTimeout(() => setActionSuccessMsg(''), 4000)
      }
    }
  }

  // Handler Simpan Kata Sandi Baru
  function handleSavePassword(e) {
    e.preventDefault()
    if (!newPassword) {
      setPasswordNotice('Harap masukkan kata sandi baru.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordNotice('Kata sandi baru minimal 8 karakter.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice('Konfirmasi kata sandi belum sesuai.')
      return
    }

    setPasswordNotice('Kata sandi baru berhasil diperbarui!')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPasswordNotice(''), 4000)
  }

  return (
    <main className="dashboard-content-flow pengaturan-dashboard-flow">
      {/* 1. Content Heading Bar Standar Dashboard */}
      <div className="content-heading-bar">
        <div>
          <span className="clean-section-eyebrow">PENGATURAN UMKM</span>
          <h1>Pengaturan &amp; Profil Bisnis</h1>
          <p>Kelola identitas toko, jam &amp; radius radar mitra, legalitas NIB, rekening escrow, dan keamanan akun.</p>
        </div>
        <div className="pengaturan-header-actions">
          <button
            className="btn-create-task-primary btn-action-primary"
            onClick={handleSaveSettings}
            type="button"
          >
            <Icon name="check" size={16} />
            <span>Simpan Semua Perubahan</span>
          </button>
        </div>
      </div>

      {/* 2. Capsule Pill Tabs Bar */}
      <div className="pengaturan-tabs-wrapper">
        <nav aria-label="Kategori Pengaturan" className="pengaturan-tabs-bar">
          <button
            className={`pengaturan-tab-btn ${activeTab === 'profil' ? 'pengaturan-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('profil')}
            type="button"
          >
            <Icon name="briefcase" size={15} />
            <span>Profil Toko &amp; Usaha</span>
          </button>

          <button
            className={`pengaturan-tab-btn ${activeTab === 'operasional' ? 'pengaturan-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('operasional')}
            type="button"
          >
            <Icon name="clock" size={15} />
            <span>Jam &amp; Lokasi Radar</span>
          </button>

          <button
            className={`pengaturan-tab-btn ${activeTab === 'legalitas' ? 'pengaturan-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('legalitas')}
            type="button"
          >
            <Icon name="shield" size={15} />
            <span>Verifikasi &amp; Legalitas NIB</span>
          </button>

          <button
            className={`pengaturan-tab-btn ${activeTab === 'escrow' ? 'pengaturan-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('escrow')}
            type="button"
          >
            <Icon name="wallet" size={15} />
            <span>Rekening &amp; Escrow</span>
          </button>

          <button
            className={`pengaturan-tab-btn ${activeTab === 'keamanan' ? 'pengaturan-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('keamanan')}
            type="button"
          >
            <Icon name="lock" size={15} />
            <span>Keamanan &amp; Sesi</span>
          </button>
        </nav>
      </div>

      {/* 3. Konten Tab Aktif */}

      {/* TAB 1: PROFIL TOKO & USAHA */}
      {activeTab === 'profil' && (
        <section className="pengaturan-card-section">
          <div className="pengaturan-card-header">
            <div>
              <h2>Profil Usaha &amp; Identitas Toko</h2>
              <p>Informasi ini ditampilkan kepada mitra sekitar saat menerima tugas dari tempat usaha Anda.</p>
            </div>
          </div>

          {/* Profile Banner Card */}
          <div className="pengaturan-profile-banner">
            <div className="pengaturan-avatar-box">
              <span className="pengaturan-avatar-initials">
                {(businessName || 'UMKM').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="pengaturan-profile-info">
              <div className="pengaturan-profile-title-row">
                <h3>{businessName}</h3>
                <span className="pengaturan-verified-badge">
                  <Icon name="check" size={12} />
                  <span>Akun UMKM Terverifikasi Relink</span>
                </span>
              </div>
              <div className="pengaturan-profile-meta-row">
                <span>{category}</span>
                <span className="meta-separator">&bull;</span>
                <span>{city}</span>
              </div>
            </div>
          </div>

          <form className="pengaturan-form-grid" onSubmit={handleSaveSettings}>
            <div className="pengaturan-form-group">
              <label htmlFor="input-biz-name">Nama Toko / Usaha</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="briefcase" size={16} className="pengaturan-input-icon" />
                <input
                  id="input-biz-name"
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Contoh: Toko Kue Bu Rina"
                  type="text"
                  value={businessName}
                />
              </div>
              <span className="pengaturan-field-hint">Nama brand usaha yang terlihat di radar mitra sekitar.</span>
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="input-owner-name">Nama Pemilik / Penanggung Jawab</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="users" size={16} className="pengaturan-input-icon" />
                <input
                  id="input-owner-name"
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Nama sesuai KTP"
                  type="text"
                  value={ownerName}
                />
              </div>
              <span className="pengaturan-field-hint">Nama yang tertera pada dokumen tanda tangan serah terima.</span>
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="select-biz-category">Kategori Bidang Usaha</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="sliders" size={16} className="pengaturan-input-icon" />
                <select
                  id="select-biz-category"
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                >
                  <option value="Kuliner & Kue Tradisional">Kuliner &amp; Kue Tradisional</option>
                  <option value="Ritel & Toko Kelontong">Ritel &amp; Toko Kelontong</option>
                  <option value="Jasa Kebersihan & Laundry">Jasa Kebersihan &amp; Laundry</option>
                  <option value="Konveksi, Sablon & Jahit">Konveksi, Sablon &amp; Jahit</option>
                  <option value="Bengkel & Reparasi Alat">Bengkel &amp; Reparasi Alat</option>
                  <option value="Event, Bazar & Katering">Event, Bazar &amp; Katering</option>
                </select>
              </div>
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="input-biz-phone">Nomor WhatsApp / HP Toko</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="whatsapp" size={16} className="pengaturan-input-icon text-mint" />
                <input
                  id="input-biz-phone"
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  type="tel"
                  value={phone}
                />
              </div>
              <span className="pengaturan-field-hint">Digunakan untuk koordinasi check-in mitra di lokasi toko.</span>
            </div>

            <div className="pengaturan-form-group pengaturan-form-grid--full">
              <label htmlFor="input-biz-email">Alamat Email Bisnis</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="mail" size={16} className="pengaturan-input-icon" />
                <input
                  id="input-biz-email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@emailbisnis.com"
                  type="email"
                  value={email}
                />
              </div>
              <span className="pengaturan-field-hint">Untuk menerima bukti invoice dan mutasi rekening escrow.</span>
            </div>

            <div className="pengaturan-form-group pengaturan-form-grid--full">
              <label htmlFor="textarea-biz-bio">Deskripsi Singkat Usaha (Bio Profil)</label>
              <textarea
                id="textarea-biz-bio"
                onChange={(e) => setBio(e.target.value)}
                placeholder="Jelaskan spesialisasi toko dan jam sibuk operasional..."
                rows={3}
                value={bio}
              />
              <span className="pengaturan-field-hint">Membantu calon mitra memahami jenis bantuan operasional yang dibutuhkan.</span>
            </div>

            <div className="pengaturan-actions-row pengaturan-form-grid--full">
              <button className="btn-create-task-primary btn-action-primary" type="submit">
                <Icon name="check" size={16} />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 2: JAM & LOKASI RADAR */}
      {activeTab === 'operasional' && (
        <section className="pengaturan-card-section">
          <div className="pengaturan-card-header">
            <div>
              <h2>Lokasi Kerja &amp; Radius Radar Mitra</h2>
              <p>Tentukan titik lokasi operasional toko agar mitra terdekat dalam radius 1–5 km dapat dipanggil cepat.</p>
            </div>
          </div>

          <form className="pengaturan-form-grid" onSubmit={handleSaveSettings}>
            <div className="pengaturan-form-group pengaturan-form-grid--full">
              <label htmlFor="input-address">Alamat Fisik Toko / Titik Kerja</label>
              <textarea
                id="input-address"
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat lengkap lokasi kerja mitra..."
                rows={2}
                value={address}
              />
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="input-city">Kota / Kabupaten &amp; Kode Pos</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="pin" size={16} className="pengaturan-input-icon" />
                <input
                  id="input-city"
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: Jakarta Timur, DKI Jakarta 13220"
                  type="text"
                  value={city}
                />
              </div>
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="select-radius">Radius Radar Pencarian Mitra Sekitar</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="sliders" size={16} className="pengaturan-input-icon" />
                <select
                  id="select-radius"
                  onChange={(e) => setRadarRadius(e.target.value)}
                  value={radarRadius}
                >
                  <option value="1">1 km (Prioritas Sangat Dekat &amp; Siap Kerja Cepat)</option>
                  <option value="3">3 km (Rekomendasi Terbaik — Rata-rata 14 Mitra Aktif)</option>
                  <option value="5">5 km (Jangkauan Luas Seluruh Kecamatan Sekitar)</option>
                  <option value="10">10 km (Maksimal Wilayah Kota / Kabupaten)</option>
                </select>
              </div>
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="input-days">Hari Operasional Toko</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="clock" size={16} className="pengaturan-input-icon" />
                <input
                  id="input-days"
                  onChange={(e) => setOperatingDays(e.target.value)}
                  placeholder="Contoh: Senin - Sabtu"
                  type="text"
                  value={operatingDays}
                />
              </div>
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="input-hours">Jam Operasional Toko</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="clock" size={16} className="pengaturan-input-icon" />
                <input
                  id="input-hours"
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="Contoh: 08:00 - 17:00 WIB"
                  type="text"
                  value={operatingHours}
                />
              </div>
            </div>

            <div className="pengaturan-form-group pengaturan-form-grid--full">
              <label htmlFor="input-note">Petunjuk Tambahan Menemukan Lokasi</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="pin" size={16} className="pengaturan-input-icon" />
                <input
                  id="input-note"
                  onChange={(e) => setLocationNote(e.target.value)}
                  placeholder="Contoh: Sebelah minimarket, ruko cat hijau nomor 14B."
                  type="text"
                  value={locationNote}
                />
              </div>
              <span className="pengaturan-field-hint">Petunjuk ini tertera pada panduan navigasi GPS saat mitra menuju toko Anda.</span>
            </div>

            <div className="pengaturan-actions-row pengaturan-form-grid--full">
              <button className="btn-create-task-primary btn-action-primary" type="submit">
                <Icon name="check" size={16} />
                <span>Simpan Pengaturan Operasional</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 3: VERIFIKASI & LEGALITAS NIB */}
      {activeTab === 'legalitas' && (
        <section className="pengaturan-card-section">
          <div className="pengaturan-card-header">
            <div>
              <h2>Verifikasi &amp; Legalitas Usaha (FR-207)</h2>
              <p>Kelola nomor legalitas resmi bisnis untuk meningkatkan kepercayaan mitra dan proteksi dana garansi.</p>
            </div>
          </div>

          <div className="legalitas-status-grid">
            <div className="legalitas-card legalitas-card--highlight">
              <div className="legalitas-card-top">
                <strong>Status Akun Klien</strong>
                <span className="legalitas-badge legalitas-badge--verified">
                  <Icon name="check" size={12} />
                  <span>Terverifikasi Resmi</span>
                </span>
              </div>
              <p>Akun bisnis Anda telah memenuhi verifikasi identitas KTP dan foto tempat usaha resmi Relink.</p>
            </div>

            <div className="legalitas-card">
              <div className="legalitas-card-top">
                <strong>Perlindungan Garansi Escrow</strong>
                <span className="legalitas-badge legalitas-badge--verified">
                  <Icon name="shield" size={12} />
                  <span>Proteksi Aktif 100%</span>
                </span>
              </div>
              <p>Hak klaim mediasi sengketa 100% dan perlindungan ganti rugi mitra batal hingga Rp500.000.</p>
            </div>
          </div>

          <form className="pengaturan-form-grid" onSubmit={handleSaveSettings}>
            <div className="pengaturan-form-group">
              <label htmlFor="input-nib">Nomor Induk Berusaha (NIB OSS)</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="shield" size={16} className="pengaturan-input-icon" />
                <input
                  id="input-nib"
                  onChange={(e) => setNib(e.target.value)}
                  placeholder="13 digit NIB resmi OSS"
                  type="text"
                  value={nib}
                />
              </div>
              <span className="pengaturan-field-hint">NIB mempercepat akses penempatan tugas bernilai tinggi.</span>
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="input-sku">Nomor SKU / Surat Izin Usaha Lokal</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="file-text" size={16} className="pengaturan-input-icon" />
                <input
                  id="input-sku"
                  onChange={(e) => setSkuNumber(e.target.value)}
                  placeholder="Nomor surat keterangan usaha kelurahan"
                  type="text"
                  value={skuNumber}
                />
              </div>
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="input-tax">Nomor Pokok Wajib Pajak (NPWP Usaha/Pribadi)</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="file-text" size={16} className="pengaturan-input-icon" />
                <input
                  id="input-tax"
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="15 atau 16 digit NPWP"
                  type="text"
                  value={taxId}
                />
              </div>
            </div>

            <div className="pengaturan-form-group">
              <label>Status Dokumen KTP Penanggung Jawab</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="users" size={16} className="pengaturan-input-icon" />
                <input
                  disabled
                  type="text"
                  value="KTP Terverifikasi (NIK: 3175********0002 — Bu Rina Wati)"
                />
              </div>
            </div>

            <div className="pengaturan-actions-row pengaturan-form-grid--full">
              <button className="btn-create-task-primary btn-action-primary" type="submit">
                <Icon name="check" size={16} />
                <span>Simpan Legalitas Usaha</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 4: REKENING & ESCROW */}
      {activeTab === 'escrow' && (
        <section className="pengaturan-card-section">
          <div className="pengaturan-card-header">
            <div>
              <h2>Rekening Penampung &amp; Preferensi Escrow (FR-401 &amp; FR-404)</h2>
              <p>Atur rekening bank untuk pengembalian dana sengketa serta batas waktu auto-release persetujuan tugas.</p>
            </div>
          </div>

          <form className="pengaturan-form-grid" onSubmit={handleSaveSettings}>
            <div className="pengaturan-form-group">
              <label htmlFor="select-bank">Nama Bank Penerima</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="wallet" size={16} className="pengaturan-input-icon" />
                <select
                  id="select-bank"
                  onChange={(e) => setBankName(e.target.value)}
                  value={bankName}
                >
                  <option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option>
                  <option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option>
                  <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                </select>
              </div>
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="input-acc-num">Nomor Rekening Bank</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="wallet" size={16} className="pengaturan-input-icon" />
                <input
                  id="input-acc-num"
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Contoh: 8820192831"
                  type="text"
                  value={accountNumber}
                />
              </div>
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="input-acc-holder">Nama Pemilik Rekening (Atas Nama)</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="users" size={16} className="pengaturan-input-icon" />
                <input
                  id="input-acc-holder"
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Nama sesuai buku tabungan"
                  type="text"
                  value={accountHolder}
                />
              </div>
              <span className="pengaturan-field-hint">Harus sesuai dengan identitas KTP pemilik akun terdaftar.</span>
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="select-auto-release">Batas Waktu Auto-Release Review Bukti (FR-404)</label>
              <div className="pengaturan-input-wrapper">
                <Icon name="clock" size={16} className="pengaturan-input-icon" />
                <select
                  id="select-auto-release"
                  onChange={(e) => setAutoReleaseHours(e.target.value)}
                  value={autoReleaseHours}
                >
                  <option value="24">24 Jam (Standar Relink — Menjamin kepastian mitra)</option>
                  <option value="48">48 Jam (Maksimal — Cocok untuk pekerjaan multi-hari)</option>
                </select>
              </div>
              <span className="pengaturan-field-hint">Jika bukti Proof-of-Work tidak direview hingga batas ini, dana otomatis dicairkan.</span>
            </div>

            <div className="pengaturan-form-grid--full">
              <div className="pengaturan-toggle-row">
                <div className="pengaturan-toggle-label">
                  <strong>Notifikasi Otomatis WhatsApp Real-Time</strong>
                  <span>Kirim peringatan instan ke nomor WhatsApp saat mitra tiba di toko dan saat bukti tugas diunggah.</span>
                </div>
                <button
                  aria-checked={whatsappNotif}
                  className={`toggle-switch-pill${whatsappNotif ? ' toggle-switch-pill--active' : ''}`}
                  onClick={() => setWhatsappNotif(!whatsappNotif)}
                  role="switch"
                  type="button"
                >
                  <span className="toggle-switch-handle" />
                </button>
              </div>
            </div>

            <div className="pengaturan-actions-row pengaturan-form-grid--full">
              <button className="btn-create-task-primary btn-action-primary" type="submit">
                <Icon name="check" size={16} />
                <span>Simpan Preferensi Escrow</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 5: KEAMANAN & SESI */}
      {activeTab === 'keamanan' && (
        <section className="pengaturan-card-section">
          <div className="pengaturan-card-header">
            <div>
              <h2>Keamanan Akun &amp; Sesi Login</h2>
              <p>Perbarui kata sandi akun dan tinjau proteksi keamanan sesi otomatis.</p>
            </div>
          </div>

          <div className="pengaturan-toggle-row">
            <div className="pengaturan-toggle-label">
              <strong>Proteksi Idle Auto-Logout (10 Menit)</strong>
              <span>Sesi dashboard akan otomatis logout jika ditinggalkan lebih dari 10 menit demi melindungi dana escrow dan data usaha.</span>
            </div>
            <div className="pengaturan-verified-badge">
              <Icon name="shield" size={13} />
              <span>Proteksi Aktif</span>
            </div>
          </div>

          <form className="pengaturan-form-grid" onSubmit={handleSavePassword}>
            <div className="pengaturan-form-group">
              <label htmlFor="input-new-pass">Kata Sandi Baru</label>
              <div className="auth-password-input-wrap">
                <input
                  id="input-new-pass"
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter kombinasi"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                />
                <button
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  type="button"
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
                </button>
              </div>
            </div>

            <div className="pengaturan-form-group">
              <label htmlFor="input-confirm-pass">Konfirmasi Kata Sandi Baru</label>
              <div className="auth-password-input-wrap">
                <input
                  id="input-confirm-pass"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                />
              </div>
              {newPassword && confirmPassword && newPassword === confirmPassword && (
                <span className="auth-field-success" role="status">
                  <Icon name="check" size={13} />
                  <span>Password Sudah Sesuai</span>
                </span>
              )}
            </div>

            {passwordNotice && (
              <div className="pengaturan-form-grid--full">
                <div className="auth-message auth-message--info" role="status">
                  {passwordNotice}
                </div>
              </div>
            )}

            <div className="pengaturan-actions-row pengaturan-form-grid--full">
              <button className="btn-create-task-primary btn-action-primary" type="submit">
                <Icon name="shield" size={16} />
                <span>Ubah Kata Sandi</span>
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  )
}

export default PengaturanView
