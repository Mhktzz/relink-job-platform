import { useState } from 'react'
import Icon from '../../common/Icon.jsx'
import { insertSupportTicketToDb } from '../../../lib/databaseService.js'

function PusatBantuanView({ tasks = [], setActionSuccessMsg, setCurrentMenu }) {
  const [activeFaqCategory, setActiveFaqCategory] = useState('all') // 'all' | 'garansi' | 'escrow' | 'mitra' | 'tandem'
  const [searchFaq, setSearchFaq] = useState('')
  const [expandedFaqId, setExpandedFaqId] = useState(1) // FAQ 1 terbuka by default

  // Form State untuk Pengajuan Tiket Bantuan / Pengaduan
  const [ticketCategory, setTicketCategory] = useState('kualitas')
  const [ticketTaskId, setTicketTaskId] = useState(tasks[0]?.id || 'UMUM')
  const [ticketPriority, setTicketPriority] = useState('normal')
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketDetails, setTicketDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Riwayat Tiket Sengketa & Bantuan Mock
  const [submittedTickets, setSubmittedTickets] = useState([
    {
      id: 'TK-8421',
      date: 'Hari Ini, 14:20 WIB',
      category: 'Garansi & Kualitas',
      task: 'Packing & Labeling 500 Toples',
      subject: 'Pemeriksaan Checklist Toples Bocor',
      status: 'Dalam Mediasi (Maks 48 Jam)',
      priority: 'Tinggi',
      statusType: 'process',
    },
    {
      id: 'TK-8390',
      date: '16 Nov 2026',
      category: 'Konfirmasi Escrow',
      task: 'Bongkar Muat Bahan Baku 2 Ton',
      subject: 'Klarifikasi Auto-Release Dana',
      status: 'Selesai (Dana Terverifikasi)',
      priority: 'Normal',
      statusType: 'resolved',
    },
  ])

  // Data FAQ Komprehensif
  const faqData = [
    {
      id: 1,
      category: 'garansi',
      question: 'Bagaimana ketentuan Garansi Kepuasan 100% untuk Klien UMKM?',
      answer:
        'Setiap tugas dilindungi oleh Garansi Kepuasan 100% Relink. Garansi dievaluasi secara objektif berdasarkan checklist kriteria hasil (acceptance criteria) yang telah disepakati Klien dan Mitra sebelum pekerjaan dimulai. Jika Mitra tidak menyelesaikan checklist yang disepakati, Klien berhak menolak bukti kerja dan mengajukan mediasi tanpa kehilangan dana pembayaran.',
      badge: 'FR-502 Proteksi Garansi',
    },
    {
      id: 2,
      category: 'garansi',
      question: 'Berapa lama proses mediasi sengketa oleh Tim Relink?',
      answer:
        'Tim mediasi independen Relink menjamin keputusan maksimal dalam 48 jam kalender sejak pengaduan diajukan. Tim kami meneliti foto bukti digital ber-watermark GPS, timestamp check-in/out, rekaman log chat dalam aplikasi, dan checklist awal untuk menghasilkan keputusan yang adil.',
      badge: 'FR-601 Mediasi 48 Jam',
    },
    {
      id: 3,
      category: 'garansi',
      question: 'Apa saja opsi keputusan dan resolusi dari tim mediasi?',
      answer:
        'Terdapat 3 opsi resolusi resmi: (1) Pengembalian dana penuh (100% refund) jika Mitra wanprestasi total, (2) Pengembalian dana parsial sesuai persentase volume checklist yang tuntas, atau (3) Pengiriman Mitra pengganti Tier 3 (spesialis berpengalaman) tanpa biaya tambahan untuk menyelesaikan sisa pekerjaan.',
      badge: 'Resolusi Fleksibel',
    },
    {
      id: 4,
      category: 'escrow',
      question: 'Kapan dana escrow pembayaran dicairkan ke Mitra?',
      answer:
        'Dana pembayaran hanya dicairkan setelah Klien memeriksa bukti kerja digital (foto bukti + tanda tangan digital) dan menekan tombol konfirmasi cairkan dana. Jika Klien tidak merespons dalam waktu 48 jam setelah bukti diserahkan, sistem akan menjalankan auto-release otomatis demi kepastian upah pekerja.',
      badge: 'FR-404 Escrow Auto-Release',
    },
    {
      id: 5,
      category: 'escrow',
      question: 'Apakah ada potongan atau biaya admin saat mengajukan klaim garansi?',
      answer:
        'Tidak ada biaya tambahan. Layanan mediasi sengketa dan perlindungan garansi kepuasan merupakan fasilitas bawaan dari platform Relink bagi seluruh Klien UMKM terverifikasi.',
      badge: 'Bebas Biaya Sengketa',
    },
    {
      id: 6,
      category: 'mitra',
      question: 'Bagaimana cara Relink memverifikasi keahlian Mitra tanpa ijazah?',
      answer:
        'Relink menggunakan 3 pilar validasi keterampilan non-formal: (1) Micro-assessment studi kasus SOP & keselamatan kerja, (2) Portofolio video langsung dari kamera aplikasi dengan watermark GPS dan timestamp anti-spoofing, dan (3) Community vouching dari mantan pelanggan atau UMKM sekitar.',
      badge: 'FR-104 & FR-105 Verifikasi',
    },
    {
      id: 7,
      category: 'mitra',
      question: 'Apa perbedaan antara Mitra Tier 1, Tier 2, dan Tier 3?',
      answer:
        'Tier 1 adalah mitra terverifikasi identitas dan SOP keselamatan yang ideal untuk tugas harian dengan tarif ekonomis. Tier 2 adalah pekerja teruji dengan >10 tugas selesai dan rating ≥4.7. Tier 3 adalah mitra ahli berpengalaman yang dapat memimpin tim serta menjamin kendali mutu (QC).',
      badge: '3-Tier Reputation System',
    },
    {
      id: 8,
      category: 'tandem',
      question: 'Kapan saya sebaiknya menggunakan Paket Tandem?',
      answer:
        'Fitur Paket Tandem otomatis disarankan saat Anda membutuhkan ≥ 2 pekerja sekaligus untuk tugas intensif (seperti bongkar muat kargo, restock stok toko, atau event akhir pekan). Paket ini menyertakan 1 Lead Tier 3 yang bertanggung jawab atas supervisi dan QC tim di lokasi.',
      badge: 'FR-203 Paket Tandem',
    },
  ]

  // Filter FAQ berdasarkan kategori & search
  const filteredFaqs = faqData.filter((item) => {
    const matchCategory = activeFaqCategory === 'all' || item.category === activeFaqCategory
    const matchSearch =
      searchFaq.trim() === '' ||
      item.question.toLowerCase().includes(searchFaq.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchFaq.toLowerCase())
    return matchCategory && matchSearch
  })

  // Handler Kirim Tiket
  const handleTicketSubmit = (e) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketDetails.trim()) {
      alert('Mohon isi judul dan rincian kendala secara lengkap.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      const newTicket = {
        id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
        date: 'Baru Saja',
        category:
          ticketCategory === 'kualitas'
            ? 'Garansi & Kualitas'
            : ticketCategory === 'escrow'
              ? 'Escrow & Pembayaran'
              : ticketCategory === 'mitra'
                ? 'Absensi / Perilaku'
                : 'Bantuan Sistem',
        task: ticketTaskId === 'UMUM' ? 'Pertanyaan Akun Umum' : `Tugas #${ticketTaskId}`,
        subject: ticketSubject,
        status: 'Dalam Antrean Investigasi',
        priority: ticketPriority === 'urgent' ? 'Mendesak' : 'Normal',
        statusType: 'process',
      }

      setSubmittedTickets([newTicket, ...submittedTickets])
      insertSupportTicketToDb({
        task: newTicket.task,
        category: ticketCategory,
        priority: newTicket.priority,
        subject: ticketSubject,
        details: ticketDetails,
      })
      setTicketSubject('')
      setTicketDetails('')
      setIsSubmitting(false)

      if (setActionSuccessMsg) {
        setActionSuccessMsg(`Tiket ${newTicket.id} berhasil diajukan! Tim Mediasi Relink akan meninjau dalam maks. 48 jam.`)
        setTimeout(() => setActionSuccessMsg(''), 5500)
      }
    }, 450)
  }

  return (
    <main className="dashboard-content-flow helpdesk-dashboard-flow">
      {/* 1. Header Section */}
      <div className="content-heading-bar">
        <div>
          <h1>Pusat Bantuan & Layanan Garansi Relink</h1>
          <p>
            Dukungan operasional 24/7 untuk UMKM: panduan klaim Garansi Kepuasan 100%, mediasi sengketa netral maks. 48 jam, dan pendampingan tugas.
          </p>
        </div>
        <div className="helpdesk-header-actions">
          <a
            aria-label="Hubungi WhatsApp Mediasi Relink"
            className="btn-whatsapp-support"
            href="https://wa.me/6281234567890?text=Halo%20Tim%20Mediasi%20Relink,%20saya%20butuh%20bantuan%20terkait%20tugas%20UMKM"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="wa-pulse-dot" />
            <Icon name="mail" size={16} />
            <span>Chat Mediasi CS (WhatsApp)</span>
          </a>
        </div>
      </div>

      {/* 2. 4 Kartu Metrik & Proteksi Layanan */}
      <div className="summary-metrics-grid helpdesk-metrics-grid">
        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Garansi Kepuasan 100%</span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="shield" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>Proteksi Aktif</strong>
            <span className="metric-trend metric-trend--good">Checklist Terlindungi</span>
          </div>
          <small className="metric-sub-note">
            Penggantian mitra Tier 3 atau 100% refund jika tidak sesuai SOP
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Standar Mediasi Relink</span>
            <div className="metric-icon-bubble metric-icon-bubble--amber">
              <Icon name="clock" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>&le; 48 Jam Kerja</strong>
            <span className="metric-trend metric-trend--neutral">Netral & Transparan</span>
          </div>
          <small className="metric-sub-note">
            Investigasi rekaman GPS, timestamp foto, & log chat aplikasi
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Client Trust Score Anda</span>
            <div className="metric-icon-bubble metric-icon-bubble--pink">
              <Icon name="star" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>98 / 100</strong>
            <span className="metric-trend metric-trend--good">Status Prima</span>
          </div>
          <small className="metric-sub-note">
            Akses klaim instan tanpa penundaan verifikasi akun
          </small>
        </div>

        <div className="metric-box-card">
          <div className="metric-box-card__header">
            <span>Tiket Bantuan Aktif</span>
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="check" size={16} />
            </div>
          </div>
          <div className="metric-box-card__body">
            <strong>{submittedTickets.filter((t) => t.statusType === 'process').length} Berjalan</strong>
            <span className="metric-trend metric-trend--good">Terkendali</span>
          </div>
          <small className="metric-sub-note">
            Seluruh tugas operasional lainnya berjalan tanpa sanggahan
          </small>
        </div>
      </div>

      {/* 3. Kartu Alur Mediasi 3 Langkah (FR-601 Visual Stepper) */}
      <section className="escrow-lifecycle-card helpdesk-workflow-card">
        <div className="escrow-lifecycle-header">
          <div>
            <h3>Alur Mediasi & Klaim Garansi 3 Langkah</h3>
            <small>Transparan, adil bagi UMKM dan pekerja lokal tanpa proses birokrasi rumit</small>
          </div>
          <span className="escrow-verified-pill">
            <Icon name="shield" size={13} />
            Standar SOP Perlindungan FR-601
          </span>
        </div>

        <div className="escrow-steps-grid">
          <div className="escrow-step-item">
            <div className="escrow-step-num">1</div>
            <strong>Ajukan Sanggahan Bukti</strong>
            <p>
              Jika hasil kerja melenceng dari checklist, klik tombol sanggahan di menu Escrow sebelum 48 jam. Dana pembayaran otomatis ditahan.
            </p>
          </div>

          <div className="escrow-step-item escrow-step-item--highlight">
            <div className="escrow-step-num escrow-step-num--highlight">2</div>
            <strong>Investigasi Netral &le; 48 Jam</strong>
            <p>
              Tim Relink menelaah foto watermark GPS, log absensi di lokasi UMKM, serta checklist awal yang telah disetujui bersama.
            </p>
          </div>

          <div className="escrow-step-item">
            <div className="escrow-step-num">3</div>
            <strong>Resolusi & Garansi Penuh</strong>
            <p>
              Pilihan solusi adil: pengembalian dana (refund penuh/parsial) atau pengiriman Mitra pengganti Tier 3 tanpa biaya tambahan.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Split Grid: Formulir Pengajuan Tiket & FAQ Interaktif */}
      <div className="helpdesk-split-grid">
        {/* Kolom Kiri: Formulir Pengajuan Tiket Bantuan */}
        <section className="helpdesk-ticket-card">
          <div className="ticket-card-header">
            <div className="ticket-card-header__title">
              <div className="ticket-icon-wrap">
                <Icon name="mail" size={18} />
              </div>
              <div>
                <h3>Buat Tiket Bantuan & Mediasi</h3>
                <small>Pengaduan Anda akan ditangani langsung oleh konsultan operasional Relink</small>
              </div>
            </div>
            <span className="ticket-badge-fast">Respon &lt; 15 Menit</span>
          </div>

          <form className="helpdesk-ticket-form" onSubmit={handleTicketSubmit}>
            <div className="form-row-split">
              <div className="ticket-field-group">
                <label htmlFor="ticket-category">Kategori Masalah</label>
                <select
                  id="ticket-category"
                  onChange={(e) => setTicketCategory(e.target.value)}
                  value={ticketCategory}
                >
                  <option value="kualitas">Garansi & Kualitas Kerja (Checklist)</option>
                  <option value="escrow">Rekening Escrow & Pembayaran</option>
                  <option value="mitra">Ketidakhadiran / Absensi Mitra</option>
                  <option value="teknis">Pertanyaan Umum & Bantuan Teknis</option>
                </select>
              </div>

              <div className="ticket-field-group">
                <label htmlFor="ticket-priority">Tingkat Urgensi</label>
                <select
                  id="ticket-priority"
                  onChange={(e) => setTicketPriority(e.target.value)}
                  value={ticketPriority}
                >
                  <option value="normal">Normal (Operasional Rutin)</option>
                  <option value="urgent">Mendesak (Tugas Sedang Berjalan)</option>
                </select>
              </div>
            </div>

            <div className="ticket-field-group">
              <label htmlFor="ticket-task">Pilih Tugas Terkait (Opsional)</label>
              <select
                id="ticket-task"
                onChange={(e) => setTicketTaskId(e.target.value)}
                value={ticketTaskId}
              >
                <option value="UMUM">Bantuan Umum / Akun UMKM</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    #{t.id} - {t.title} ({t.worker})
                  </option>
                ))}
              </select>
            </div>

            <div className="ticket-field-group">
              <label htmlFor="ticket-subject">Judul Pengaduan</label>
              <input
                id="ticket-subject"
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Contoh: Mitra tidak menyelesaikan checklist perapian rak gudang..."
                required
                type="text"
                value={ticketSubject}
              />
            </div>

            <div className="ticket-field-group">
              <label htmlFor="ticket-details">Detail Kendala & Lampiran Bukti</label>
              <textarea
                id="ticket-details"
                onChange={(e) => setTicketDetails(e.target.value)}
                placeholder="Jelaskan secara rinci item checklist yang tidak sesuai atau kendala yang dihadapi..."
                required
                rows={4}
                value={ticketDetails}
              />
            </div>

            <div className="ticket-form-footer">
              <small className="ticket-guarantee-note">
                <Icon name="shield" size={14} />
                Dilindungi Sistem Kepercayaan & Garansi Relink
              </small>
              <button
                className="btn-submit-ticket"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <span>Mengirim Tiket...</span>
                ) : (
                  <>
                    <Icon name="check" size={16} />
                    <span>Kirim Tiket Pengaduan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Daftar Tiket Pengaduan Aktif */}
          <div className="submitted-tickets-box">
            <h4>Riwayat Pengaduan Terakhir</h4>
            <div className="tickets-list">
              {submittedTickets.map((t) => (
                <div className="ticket-list-item" key={t.id}>
                  <div className="ticket-list-item__left">
                    <div className="ticket-id-tag">{t.id}</div>
                    <div className="ticket-info">
                      <strong>{t.subject}</strong>
                      <div className="ticket-meta-row">
                        <span>{t.task}</span>
                        <span className="meta-dot">&bull;</span>
                        <span>{t.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ticket-list-item__right">
                    <span
                      className={`ticket-status-pill ticket-status-pill--${t.statusType}`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kolom Kanan: Tanya Jawab Populer (FAQ) Interaktif */}
        <section className="helpdesk-faq-card">
          <div className="faq-card-header">
            <div>
              <h3>Tanya Jawab Populer (FAQ)</h3>
              <small>Temukan jawaban cepat seputar garansi, pembayaran escrow, dan sistem tier</small>
            </div>
          </div>

          {/* Search FAQ */}
          <div className="faq-search-bar">
            <Icon name="search" size={16} />
            <input
              aria-label="Cari pertanyaan"
              onChange={(e) => setSearchFaq(e.target.value)}
              placeholder="Cari kata kunci (contoh: garansi, refund, tandem, escrow)..."
              type="text"
              value={searchFaq}
            />
            {searchFaq && (
              <button
                aria-label="Bersihkan pencarian"
                className="faq-clear-search"
                onClick={() => setSearchFaq('')}
                type="button"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>

          {/* Kategori Tab Filter */}
          <div className="faq-category-pills">
            <button
              className={`faq-pill-btn${activeFaqCategory === 'all' ? ' faq-pill-btn--active' : ''}`}
              onClick={() => setActiveFaqCategory('all')}
              type="button"
            >
              Semua Pertanyaan
            </button>
            <button
              className={`faq-pill-btn${activeFaqCategory === 'garansi' ? ' faq-pill-btn--active' : ''}`}
              onClick={() => setActiveFaqCategory('garansi')}
              type="button"
            >
              Garansi & Mediasi
            </button>
            <button
              className={`faq-pill-btn${activeFaqCategory === 'escrow' ? ' faq-pill-btn--active' : ''}`}
              onClick={() => setActiveFaqCategory('escrow')}
              type="button"
            >
              Dana Escrow
            </button>
            <button
              className={`faq-pill-btn${activeFaqCategory === 'mitra' ? ' faq-pill-btn--active' : ''}`}
              onClick={() => setActiveFaqCategory('mitra')}
              type="button"
            >
              Mitra & Tier
            </button>
            <button
              className={`faq-pill-btn${activeFaqCategory === 'tandem' ? ' faq-pill-btn--active' : ''}`}
              onClick={() => setActiveFaqCategory('tandem')}
              type="button"
            >
              Paket Tandem
            </button>
          </div>

          {/* Accordion List */}
          <div className="faq-accordion-container">
            {filteredFaqs.length === 0 ? (
              <div className="faq-empty-state">
                <Icon name="alert" size={24} />
                <p>Tidak ditemukan pertanyaan dengan kata kunci "{searchFaq}".</p>
                <button
                  className="btn-faq-reset"
                  onClick={() => {
                    setSearchFaq('')
                    setActiveFaqCategory('all')
                  }}
                  type="button"
                >
                  Tampilkan Semua FAQ
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id
                return (
                  <div
                    className={`faq-item-card${isExpanded ? ' faq-item-card--open' : ''}`}
                    key={faq.id}
                  >
                    <button
                      aria-expanded={isExpanded}
                      className="faq-question-btn"
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      type="button"
                    >
                      <div className="faq-question-text">
                        <span className="faq-category-tag">{faq.badge}</span>
                        <strong>{faq.question}</strong>
                      </div>
                      <div className={`faq-chevron-icon${isExpanded ? ' faq-chevron-icon--rotated' : ''}`}>
                        <Icon name="chevron-right" size={16} />
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="faq-answer-body">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Quick Help Card Banner */}
          <div className="faq-contact-card">
            <div className="faq-contact-card__info">
              <Icon name="bell" size={20} />
              <div>
                <strong>Butuh Penjelasan Langsung?</strong>
                <p>Tim pendampingan UMKM Relink siap membantu penjadwalan atau briefing mitra di toko Anda.</p>
              </div>
            </div>
            <button
              className="btn-call-consultant"
              onClick={() => {
                if (setCurrentMenu) {
                  setCurrentMenu('escrow')
                }
              }}
              type="button"
            >
              <span>Periksa Status Escrow</span>
              <Icon name="arrow" size={14} />
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default PusatBantuanView
