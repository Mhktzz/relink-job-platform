import { useState } from 'react'
import Icon from '../../common/Icon.jsx'

function PekerjaanSayaView({
  activeTask = null,
  workerProfile = {},
  actionItems = [],
  upcomingSchedule = [],
  onCheckInArrived,
  onOpenProofModal,
  onTriggerSos,
  setCurrentMenu,
}) {
  const [activeTab, setActiveTab] = useState('aktif') // 'aktif' | 'agenda' | 'riwayat'

  const currentStep = activeTask?.currentStepIndex || 0

  const completedHistory = [
    {
      id: 'TASK-HIST-01',
      title: 'Setting Jaringan WiFi & Mesin Kasir POS Toko',
      client: 'Kopi Kenangan Senopati',
      date: '22 Nov 2026',
      duration: '3.5 Jam',
      honor: 155000,
      rating: 5.0,
      status: 'Selesai & Dana Cair',
    },
    {
      id: 'TASK-HIST-02',
      title: 'Bantu Stock Opname & Labeling 120 Kardus Kue',
      client: 'Dapur Cokelat Tebet',
      date: '19 Nov 2026',
      duration: '4.0 Jam',
      honor: 140000,
      rating: 5.0,
      status: 'Selesai & Dana Cair',
    },
  ]

  return (
    <main className="clean-dash-wrapper">
      {/* 1. HEADER HALAMAN */}
      <header className="clean-dash-header">
        <div className="clean-dash-header__intro">
          <span className="clean-dash-eyebrow">MANAJEMEN PENUGASAN</span>
          <h1 className="clean-dash-title">Pekerjaan Saya</h1>
          <p className="clean-dash-subtitle">
            Pantau status penugasan aktif, check-in lokasi, kepatuhan SOP, dan serahkan laporan bukti hasil kerja.
          </p>
        </div>
        <div className="clean-dash-header__actions">
          <span className="clean-badge clean-badge--mint">
            <Icon name="shield" size={14} /> 100% Terlindungi Escrow
          </span>
          <button
            className="clean-btn-pill clean-btn-pill--sos"
            onClick={onTriggerSos}
            type="button"
          >
            <Icon name="alert" size={14} /> Siaga SOS
          </button>
        </div>
      </header>

      {/* 2. FILTER TAB NAVIGASI */}
      <div className="clean-filters-bar" style={{ marginBottom: '24px' }}>
        <div className="clean-pill-tabs">
          <button
            className={`clean-pill-tab ${activeTab === 'aktif' ? 'clean-pill-tab--active' : ''}`}
            onClick={() => setActiveTab('aktif')}
            type="button"
          >
            Tugas Berjalan ({activeTask ? 1 : 0})
          </button>
          <button
            className={`clean-pill-tab ${activeTab === 'agenda' ? 'clean-pill-tab--active' : ''}`}
            onClick={() => setActiveTab('agenda')}
            type="button"
          >
            Jadwal &amp; Agenda ({upcomingSchedule.length})
          </button>
          <button
            className={`clean-pill-tab ${activeTab === 'riwayat' ? 'clean-pill-tab--active' : ''}`}
            onClick={() => setActiveTab('riwayat')}
            type="button"
          >
            Riwayat Selesai ({completedHistory.length})
          </button>
        </div>
      </div>

      {/* TAB 1: TUGAS SEDANG BERJALAN */}
      {activeTab === 'aktif' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeTask ? (
            <>
              {/* Card Utama Alur Transaksi Escrow Interaktif */}
              <section className="clean-card clean-active-task-card" id="active-task-section">
                <div className="clean-card__header">
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="clean-badge clean-badge--navy">
                        {activeTask.category || 'Operasional Toko'}
                      </span>
                      <span className="clean-badge clean-badge--mint">
                        <Icon name="shield" size={13} /> Escrow {activeTask.escrowRef}
                      </span>
                    </div>
                    <h2 className="clean-card-title" style={{ fontSize: '20px', marginTop: '4px' }}>
                      {activeTask.title}
                    </h2>
                    <p className="clean-card-subtitle">
                      Klien: <strong>{activeTask.clientName}</strong> • <Icon name="pin" size={12} /> {activeTask.distance} • Estimasi tiba 6 menit
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>Honor Bersih Anda</span>
                    <strong className="text-pink" style={{ fontSize: '24px', fontWeight: 800 }}>
                      Rp{activeTask.netHonor?.toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>

                {/* Stepper 5 Tahap Transparan */}
                <div className="clean-stepper-row" style={{ marginTop: '16px', marginBottom: '20px' }}>
                  {[
                    { step: 1, title: 'Dana Ditahan', desc: `Rp${activeTask.grossHonor?.toLocaleString('id-ID')}` },
                    { step: 2, title: 'Menuju Lokasi', desc: 'Check-in saat tiba' },
                    { step: 3, title: 'Pengerjaan', desc: 'Sesuai SOP checklist' },
                    { step: 4, title: 'Review Bukti', desc: 'Konfirmasi Klien' },
                    { step: 5, title: 'Dana Cair', desc: `Rp${activeTask.netHonor?.toLocaleString('id-ID')}` },
                  ].map((s, idx) => {
                    const isDone = currentStep >= s.step
                    const isCurrent = currentStep === s.step - 1

                    return (
                      <div key={s.step} className="clean-stepper-node-wrapper">
                        <div className="clean-stepper-node">
                          <div className={`clean-step-circle ${isDone ? 'clean-step-circle--done' : isCurrent ? 'clean-step-circle--active' : ''}`}>
                            {isDone ? <Icon name="check" size={12} /> : s.step}
                          </div>
                          <div className="clean-step-labels">
                            <strong className={isCurrent ? 'text-pink' : ''}>{s.title}</strong>
                            <small>{s.desc}</small>
                          </div>
                        </div>
                        {idx < 4 && <div className={`clean-step-line ${currentStep > idx ? 'clean-step-line--done' : ''}`} />}
                      </div>
                    )
                  })}
                </div>

                {/* Baris Tombol Aksi Kerja */}
                <div className="clean-active-task-actions" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <div className="clean-active-task-honor">
                    <span className="text-muted">Kode Tugas:</span>
                    <strong className="text-navy">{activeTask.code || activeTask.id}</strong>
                  </div>

                  <div className="clean-active-task-btn-group">
                    {activeTask.clientPhone && (
                      <a
                        className="clean-btn-pill clean-btn-pill--whatsapp"
                        href={`https://wa.me/${activeTask.clientPhone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(activeTask.clientName)},%20saya%20${encodeURIComponent(workerProfile.name || 'Mitra')}%20dari%20Relink%20terkait%20tugas%20${encodeURIComponent(activeTask.title)}.`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Icon name="chat" size={14} />
                        <span>Chat Klien</span>
                      </a>
                    )}

                    <button
                      className="clean-btn-pill clean-btn-pill--sos"
                      onClick={onTriggerSos}
                      type="button"
                    >
                      <Icon name="alert" size={14} />
                      <span>SOS</span>
                    </button>

                    {currentStep === 1 && (
                      <button
                        className="clean-btn-pill clean-btn-pill--primary"
                        onClick={onCheckInArrived}
                        type="button"
                      >
                        <Icon name="pin" size={14} />
                        <span>Saya Sudah Tiba (Check-in)</span>
                      </button>
                    )}

                    {currentStep === 2 && (
                      <button
                        className="clean-btn-pill clean-btn-pill--pink"
                        onClick={onOpenProofModal}
                        type="button"
                      >
                        <Icon name="check" size={14} />
                        <span>Serahkan Bukti Hasil</span>
                      </button>
                    )}

                    {currentStep === 3 && (
                      <span className="clean-badge clean-badge--navy" style={{ padding: '8px 16px', fontSize: '13px' }}>
                        <Icon name="clock" size={14} /> Menunggu Review Klien
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Rincian Petunjuk Kerja & Alamat Klien */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                <section className="clean-card">
                  <div className="clean-card__header">
                    <div>
                      <span className="clean-section-eyebrow">LOKASI &amp; KONTAK</span>
                      <h3 className="clean-card-title">Alamat UMKM Klien</h3>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#475569' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Icon name="pin" size={16} />
                      <div>
                        <strong>{activeTask.clientName}</strong>
                        <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                          Jl. Tebet Barat Raya No. 42, RT 05 / RW 03, Jakarta Selatan (Patokan sebelah Apotek K-24)
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Icon name="phone" size={16} />
                      <span>{activeTask.clientPhone || '0812-9876-5432'} (PIC: Bpk. Haryanto)</span>
                    </div>
                  </div>
                </section>

                <section className="clean-card">
                  <div className="clean-card__header">
                    <div>
                      <span className="clean-section-eyebrow">STANDAR OPERASIONAL</span>
                      <h3 className="clean-card-title">SOP Checklist Pengerjaan</h3>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'var(--mint)', fontWeight: 800 }}>✓</span>
                      <span>Datang tepat waktu dan tunjukkan kartu identitas Relink Mitra</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'var(--mint)', fontWeight: 800 }}>✓</span>
                      <span>Ambil foto kondisi sebelum memulai pengerjaan</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'var(--mint)', fontWeight: 800 }}>✓</span>
                      <span>Foto hasil kerja akhir dan minta paraf/konfirmasi penanggung jawab</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'var(--mint)', fontWeight: 800 }}>✓</span>
                      <span>Upload bukti hasil kerja langsung lewat tombol Serahkan Bukti</span>
                    </div>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="clean-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(15, 27, 61, 0.05)',
                  color: 'var(--navy)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Icon name="briefcase" size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 8px' }}>
                Belum Ada Pekerjaan yang Sedang Berjalan
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '440px', margin: '0 auto 20px' }}>
                Anda sedang tidak memiliki tugas aktif saat ini. Buka radar peluang tugas untuk mengambil pekerjaan terdekat dengan jaminan escrow.
              </p>
              <button
                className="clean-btn-pill clean-btn-pill--primary"
                onClick={() => setCurrentMenu('peluang')}
                type="button"
              >
                Cari Peluang Tugas di Sekitar &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JADWAL & AGENDA KERJA */}
      {activeTab === 'agenda' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="clean-card">
            <div className="clean-card__header">
              <div>
                <span className="clean-section-eyebrow">AGENDA PENUGASAN</span>
                <h3 className="clean-card-title">Jadwal Tugas Mendatang</h3>
              </div>
              <span className="clean-badge clean-badge--navy">{upcomingSchedule.length} Agenda</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingSchedule.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #edf2f7',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        padding: '8px 12px',
                        background: '#e9eff6',
                        borderRadius: '10px',
                        color: 'var(--navy)',
                        fontWeight: 700,
                        fontSize: '12px',
                        textAlign: 'center',
                      }}
                    >
                      {item.time}
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--navy)', display: 'block' }}>
                        {item.title}
                      </strong>
                      <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                        {item.client} • {item.distance}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="clean-badge clean-badge--mint">Terkonfirmasi</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: RIWAYAT PEKERJAAN SELESAI */}
      {activeTab === 'riwayat' && (
        <section className="clean-card">
          <div className="clean-card__header">
            <div>
              <span className="clean-section-eyebrow">RIWAYAT PENYELESAIAN</span>
              <h3 className="clean-card-title">Pekerjaan yang Telah Selesai</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completedHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: '14px',
                  background: '#f8fafc',
                  border: '1px solid #edf2f7',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="clean-badge clean-badge--mint">{item.status}</span>
                    <small style={{ color: '#94a3b8' }}>{item.date}</small>
                  </div>
                  <strong style={{ fontSize: '14.5px', color: 'var(--navy)', display: 'block' }}>
                    {item.title}
                  </strong>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {item.client} • Durasi: {item.duration} • Rating: ⭐ {item.rating.toFixed(1)}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>Honor Cair</span>
                  <strong className="text-pink" style={{ fontSize: '16px' }}>
                    Rp{item.honor.toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default PekerjaanSayaView
