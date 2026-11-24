import { useState } from 'react'
import Icon from '../../common/Icon.jsx'

function PekerjaanSayaView({
  activeTask = null,
  workerProfile = {},
  actionItems = [],
  upcomingSchedule = [],
  onCheckInArrived,
  onOpenProofModal,
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
      {/* 1. HEADER (Simple & Clean) */}
      <header className="clean-dash-header">
        <div className="clean-dash-header__intro">
          <span className="clean-dash-eyebrow">MANAJEMEN PENUGASAN</span>
          <h1 className="clean-dash-title">Pekerjaan Saya</h1>
          <p className="clean-dash-subtitle">
            Kelola penugasan aktif, konfirmasi kedatangan lokasi, dan serahkan laporan hasil kerja.
          </p>
        </div>
        <div className="clean-dash-header__actions">
          <span className="clean-badge clean-badge--mint">
            <Icon name="shield" size={13} /> 100% Terlindungi Escrow
          </span>
        </div>
      </header>

      {/* 2. PILL FILTER TABS (Style Seragam dengan Bursa Peluang) */}
      <div className="clean-peluang-tabs" style={{ marginBottom: '22px' }}>
        <button
          className={`clean-peluang-tab-btn ${activeTab === 'aktif' ? 'clean-peluang-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('aktif')}
          type="button"
        >
          <span>Tugas Berjalan</span>
          <span style={{ opacity: 0.75, fontSize: '11px', marginLeft: '2px' }}>({activeTask ? 1 : 0})</span>
        </button>

        <button
          className={`clean-peluang-tab-btn ${activeTab === 'agenda' ? 'clean-peluang-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('agenda')}
          type="button"
        >
          <span>Jadwal &amp; Agenda</span>
          <span style={{ opacity: 0.75, fontSize: '11px', marginLeft: '2px' }}>({upcomingSchedule.length})</span>
        </button>

        <button
          className={`clean-peluang-tab-btn ${activeTab === 'riwayat' ? 'clean-peluang-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('riwayat')}
          type="button"
        >
          <span>Riwayat Selesai</span>
          <span style={{ opacity: 0.75, fontSize: '11px', marginLeft: '2px' }}>({completedHistory.length})</span>
        </button>
      </div>

      {/* 3. KONTEN TAB */}

      {/* TAB 1: TUGAS SEDANG BERJALAN */}
      {activeTab === 'aktif' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTask ? (
            <>
              {/* Card Utama Alur Transaksi Escrow */}
              <section className="clean-card clean-active-task-card" id="active-task-section">
                {/* Header Card */}
                <div className="clean-card__header" style={{ marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="clean-badge clean-badge--navy">
                        {activeTask.category || 'Operasional'}
                      </span>
                      <span className="clean-badge clean-badge--mint">
                        <Icon name="shield" size={12} /> Escrow {activeTask.escrowRef}
                      </span>
                    </div>
                    <h2 className="clean-card-title" style={{ fontSize: '19px', margin: '0 0 6px' }}>
                      {activeTask.title}
                    </h2>
                    <p className="clean-card-subtitle" style={{ margin: 0 }}>
                      Klien: <strong>{activeTask.clientName}</strong> • <Icon name="pin" size={12} /> {activeTask.distance} • Estimasi tiba 6 menit
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'block' }}>
                      Honor Bersih Anda
                    </span>
                    <strong className="text-pink" style={{ fontSize: '22px', fontWeight: 800 }}>
                      Rp{activeTask.netHonor?.toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>

                {/* Stepper 5 Tahap */}
                <div className="clean-stepper-row" style={{ margin: '18px 0 22px' }}>
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

                {/* Footer Baris Aksi */}
                <div className="clean-active-task-actions" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <div className="clean-active-task-honor">
                    <span className="text-muted" style={{ fontSize: '12.5px' }}>Kode:</span>
                    <strong className="text-navy" style={{ fontSize: '13px' }}>#{activeTask.code || activeTask.id}</strong>
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

                    {currentStep === 1 && (
                      <button
                        className="clean-btn-pill clean-btn-pill--primary"
                        onClick={onCheckInArrived}
                        type="button"
                      >
                        <Icon name="pin" size={14} />
                        <span>Check-in di Lokasi</span>
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
                      <span className="clean-badge clean-badge--navy" style={{ padding: '8px 14px', fontSize: '12.5px' }}>
                        <Icon name="clock" size={13} /> Menunggu Review Klien
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Rincian Petunjuk Kerja & Alamat Klien (Clean 2-Column Grid) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
                <section className="clean-card" style={{ padding: '20px 24px' }}>
                  <span className="clean-section-eyebrow" style={{ marginBottom: '6px' }}>LOKASI &amp; KONTAK</span>
                  <h3 className="clean-card-title" style={{ fontSize: '15px', marginBottom: '12px' }}>Alamat UMKM Klien</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <Icon name="pin" size={16} />
                      <div>
                        <strong>{activeTask.clientName}</strong>
                        <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '12.5px', lineHeight: 1.45 }}>
                          Jl. Tebet Barat Raya No. 42, RT 05 / RW 03, Jakarta Selatan (Sebelah Apotek K-24)
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid #f8fafc' }}>
                      <Icon name="phone" size={15} />
                      <span style={{ fontSize: '12.5px' }}>{activeTask.clientPhone || '0812-9876-5432'} (PIC: Bpk. Haryanto)</span>
                    </div>
                  </div>
                </section>

                <section className="clean-card" style={{ padding: '20px 24px' }}>
                  <span className="clean-section-eyebrow" style={{ marginBottom: '6px' }}>STANDAR OPERASIONAL</span>
                  <h3 className="clean-card-title" style={{ fontSize: '15px', marginBottom: '12px' }}>SOP Pengerjaan</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--mint)', fontWeight: 800 }}>✓</span>
                      <span>Hadir tepat waktu dan check-in saat tiba di lokasi</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--mint)', fontWeight: 800 }}>✓</span>
                      <span>Ambil foto kondisi sebelum dan sesudah pekerjaan</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--mint)', fontWeight: 800 }}>✓</span>
                      <span>Konfirmasi hasil kerja ke penanggung jawab toko</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--mint)', fontWeight: 800 }}>✓</span>
                      <span>Kirim bukti lewat tombol Serahkan Bukti Hasil</span>
                    </div>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="clean-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(15, 27, 61, 0.04)',
                  color: 'var(--navy)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <Icon name="briefcase" size={24} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 6px' }}>
                Belum Ada Pekerjaan yang Sedang Berjalan
              </h3>
              <p style={{ color: '#64748b', fontSize: '13.5px', maxWidth: '420px', margin: '0 auto 18px' }}>
                Ambil tugas mikro terdekat di sekitarmu dengan jaminan pembayaran aman lewat rekening escrow resmi.
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
        <section className="clean-card">
          <div className="clean-card__header" style={{ marginBottom: '16px' }}>
            <div>
              <span className="clean-section-eyebrow">AGENDA PENUGASAN</span>
              <h3 className="clean-card-title" style={{ fontSize: '16px' }}>Jadwal Tugas Mendatang</h3>
            </div>
            <span className="clean-badge clean-badge--navy">{upcomingSchedule.length} Agenda</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingSchedule.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #edf2f7',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      padding: '6px 10px',
                      background: '#e9eff6',
                      borderRadius: '8px',
                      color: 'var(--navy)',
                      fontWeight: 700,
                      fontSize: '11.5px',
                    }}
                  >
                    {item.time}
                  </div>
                  <div>
                    <strong style={{ fontSize: '13.5px', color: 'var(--navy)', display: 'block' }}>
                      {item.title}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {item.client} • {item.distance}
                    </span>
                  </div>
                </div>
                <span className="clean-badge clean-badge--mint" style={{ fontSize: '11px', padding: '3px 8px' }}>
                  Terkonfirmasi
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: RIWAYAT PEKERJAAN SELESAI */}
      {activeTab === 'riwayat' && (
        <section className="clean-card">
          <div className="clean-card__header" style={{ marginBottom: '16px' }}>
            <div>
              <span className="clean-section-eyebrow">RIWAYAT PENYELESAIAN</span>
              <h3 className="clean-card-title" style={{ fontSize: '16px' }}>Pekerjaan yang Telah Selesai</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {completedHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #edf2f7',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '3px' }}>
                    <span className="clean-badge clean-badge--mint" style={{ fontSize: '11px', padding: '2px 7px' }}>
                      {item.status}
                    </span>
                    <small style={{ color: '#94a3b8' }}>{item.date}</small>
                  </div>
                  <strong style={{ fontSize: '14px', color: 'var(--navy)', display: 'block' }}>
                    {item.title}
                  </strong>
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                    {item.client} • Durasi: {item.duration} • Rating: ⭐ {item.rating.toFixed(1)}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-muted" style={{ fontSize: '11px', display: 'block' }}>Honor Cair</span>
                  <strong className="text-pink" style={{ fontSize: '15px' }}>
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
