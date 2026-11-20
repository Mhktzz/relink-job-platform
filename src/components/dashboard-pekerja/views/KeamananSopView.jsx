import Icon from '../../common/Icon.jsx'

function KeamananSopView({ onTriggerSos }) {
  return (
    <main className="dashboard-content-flow worker-dashboard-flow">
      {/* 1. Header Section */}
      <div className="content-heading-bar">
        <div>
          <h1>Pusat Keamanan, SOP &amp; Siaga SOS Darurat</h1>
          <p>
            Keselamatan dan kenyamanan Anda adalah prioritas utama Relink. Akses protokol keselamatan kerja, panduan SOP, dan bantuan darurat 24/7.
          </p>
        </div>
      </div>

      {/* 2. Tombol Siaga Darurat SOS (FR-306) */}
      <section className="worker-sos-hero-card">
        <div className="sos-hero-content">
          <div className="sos-icon-pulse-wrap">
            <Icon name="alert" size={32} />
          </div>
          <div>
            <h3>Tombol Siaga SOS &amp; Berbagi Lokasi Realtime</h3>
            <p>
              Gunakan tombol ini saat menghadapi bahaya, kecelakaan kerja, atau situasi darurat di lokasi UMKM. Sistem akan membagikan koordinat GPS terakhir Anda ke Tim Siaga Relink dan nomor kontak darurat keluarga Anda.
            </p>
          </div>
        </div>
        <button
          className="btn-trigger-sos-giant"
          onClick={onTriggerSos}
          type="button"
        >
          <Icon name="alert" size={20} />
          <span>AKTIFKAN SINYAL SOS DARURAT</span>
        </button>
      </section>

      {/* 3. 3 Pilar Perlindungan Mitra di Relink */}
      <div className="summary-metrics-grid worker-safety-grid">
        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Proteksi Dana Escrow 100%</span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="shield" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>Tanpa Risiko Gagal Bayar</strong>
          </div>
          <small className="metric-sub-note">
            Klien telah menyetorkan 100% dana ke payment gateway sebelum Anda mulai bekerja. Anda dijamin menerima honor sesuai kesepakatan.
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Auto-Release 24–48 Jam</span>
            <div className="metric-icon-bubble metric-icon-bubble--warn">
              <Icon name="clock" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>Pencairan Otomatis</strong>
          </div>
          <small className="metric-sub-note">
            Jika bukti kerja telah Anda serahkan dan klien tidak merespons dalam 24–48 jam, sistem escrow Relink akan mencairkan dana otomatis ke saldo Anda.
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Mediasi Adil Tim Relink</span>
            <div className="metric-icon-bubble metric-icon-bubble--blue">
              <Icon name="users" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>Perlindungan Bebas Biaya</strong>
          </div>
          <small className="metric-sub-note">
            Jika terjadi perbedaan pendapat dengan klien, Tim Mediasi Relink akan memeriksa checklist SOP dan foto bukti hasil kerja secara objektif.
          </small>
        </div>
      </div>

      {/* 4. Standar Operasional Prosedur (SOP) Kerja Lapangan */}
      <section className="worker-sop-guide-card">
        <h3>Panduan SOP Kerja Lapangan (K3 &amp; Etika)</h3>
        <div className="sop-steps-list">
          <div className="sop-step-item">
            <span className="sop-step-number">01</span>
            <div className="sop-step-text">
              <strong>Konfirmasi Sebelum Berangkat</strong>
              <p>
                Hubungi pemilik UMKM melalui WhatsApp via aplikasi untuk memastikan lokasi dan ketersediaan peralatan di tempat.
              </p>
            </div>
          </div>

          <div className="sop-step-item">
            <span className="sop-step-number">02</span>
            <div className="sop-step-text">
              <strong>Check-in GPS Tiba di Lokasi</strong>
              <p>
                Tekan tombol &quot;Saya Sudah Tiba di Lokasi Toko&quot; di aplikasi agar status tugas diperbarui dan klien mengetahui kehadiran Anda.
              </p>
            </div>
          </div>

          <div className="sop-step-item">
            <span className="sop-step-number">03</span>
            <div className="sop-step-text">
              <strong>Pengerjaan Sesuai Acceptance Checklist</strong>
              <p>
                Fokus menyelesaikan poin-poin checklist yang disepakati. Selalu utamakan keselamatan kerja dan kebersihan area toko setelah selesai.
              </p>
            </div>
          </div>

          <div className="sop-step-item">
            <span className="sop-step-number">04</span>
            <div className="sop-step-text">
              <strong>Serah Terima &amp; Ambil Foto Bukti</strong>
              <p>
                Ajak klien memeriksa hasil kerja secara langsung, rekam foto bukti kerja ber-watermark di aplikasi, dan ajukan pencairan dana escrow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Kontak CS Bantuan WhatsApp */}
      <section className="worker-cs-contact-card">
        <div className="cs-contact-content">
          <div className="cs-icon-bubble">
            <Icon name="whatsapp" size={24} />
          </div>
          <div>
            <h3>Butuh Bantuan Kendala Operasional?</h3>
            <p>Tim Customer Support Relink siap membantu Anda melalui chat WhatsApp resmi.</p>
          </div>
        </div>
        <a
          className="btn-chat-cs-wa"
          href="https://wa.me/6281234567890?text=Halo%20CS%20Relink,%20saya%20Mitra%20Pekerja%20butuh%20bantuan%20terkait%20operasional%20tugas."
          rel="noopener noreferrer"
          target="_blank"
        >
          <Icon name="whatsapp" size={16} />
          <span>Chat CS Bantuan (WhatsApp)</span>
        </a>
      </section>
    </main>
  )
}

export default KeamananSopView
