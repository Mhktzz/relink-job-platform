import { useState } from 'react'
import Icon from '../../common/Icon.jsx'
import { insertSupportTicketToDb } from '../../../lib/databaseService.js'

function PusatBantuanView({ tasks = [], setActionSuccessMsg, setCurrentMenu }) {
  const [activeGuideCategory, setActiveGuideCategory] = useState('all') // 'all' | 'password' | 'task' | 'kanban' | 'escrow'
  const [searchGuide, setSearchGuide] = useState('')
  const [expandedFaqId, setExpandedFaqId] = useState(1)

  // Form State untuk Pengajuan Bantuan ke CS
  const [ticketCategory, setTicketCategory] = useState('umum')
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketDetails, setTicketDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data Panduan Lengkap Fitur Dashboard Admin
  const featureGuides = [
    {
      id: 'guide-password',
      category: 'password',
      badge: 'Keamanan Akun',
      badgeColor: 'amber',
      icon: 'shield',
      title: 'Cara Mengatur Ulang & Lupa Kata Sandi (Reset Password)',
      summary:
        'Panduan lengkap memulihkan akses akun jika Anda lupa kata sandi atau ingin memperbarui kredensial login dengan standar 4 kriteria keamanan Relink.',
      steps: [
        {
          num: 1,
          title: 'Buka Halaman Masuk & Klik "Lupa kata sandi?"',
          desc: 'Pada formulir masuk (/masuk), klik tautan "Lupa kata sandi?" tepat di atas kolom input kata sandi.',
        },
        {
          num: 2,
          title: 'Masukkan Email Akun Bisnis Terdaftar',
          desc: 'Ketikkan alamat email UMKM yang Anda daftarkan sebelumnya, lalu tekan tombol "Kirim Tautan Pemulihan".',
        },
        {
          num: 3,
          title: 'Buka Kotak Masuk Email & Klik Tautan Reset',
          desc: 'Periksa folder Kotak Masuk atau Spam email Anda. Buka pesan dari Relink dan klik tombol tautan pemulihan untuk membuka halaman reset password.',
        },
        {
          num: 4,
          title: 'Buat Kata Sandi Baru Sesuai 4 Kriteria Keamanan',
          desc: 'Masukkan kata sandi baru. Pastikan seluruh 4 indikator keamanan di bawah kolom password berubah menjadi centang hijau: (1) Minimal 8 karakter, (2) Huruf Besar & Kecil, (3) Angka, dan (4) Simbol (@, #, !).',
        },
        {
          num: 5,
          title: 'Konfirmasi & Simpan Kata Sandi Baru',
          desc: 'Ketik ulang kata sandi yang sama di kolom konfirmasi, kemudian klik "Simpan Kata Sandi Baru". Anda akan langsung diarahkan login ke dashboard.',
        },
      ],
      tip: 'Jika email pemulihan tidak muncul dalam 2 menit, periksa folder Spam/Promotions atau pastikan tidak ada kesalahan pengetikan alamat email.',
      actionLabel: 'Coba Reset Password',
      actionMenu: null,
      actionHref: '/masuk',
    },
    {
      id: 'guide-post-task',
      category: 'task',
      badge: 'Posting Tugas',
      badgeColor: 'pink',
      icon: 'plus',
      title: 'Cara Menambahkan Tugas Baru (Posting Tugas)',
      summary:
        'Langkah-langkah menerbitkan kebutuhan pekerjaan operasional toko ke radar mitra pekerja lokal dalam radius 1–5 km.',
      steps: [
        {
          num: 1,
          title: 'Akses Menu "Posting Tugas"',
          desc: 'Klik menu "+ Posting Tugas" pada bilah navigasi kiri (sidebar) atau tombol shortcut di dashboard beranda.',
        },
        {
          num: 2,
          title: 'Isi Judul & Pilih Kategori Bidang',
          desc: 'Tuliskan judul tugas yang spesifik (contoh: "Packing 200 Boks Kue Lebaran"), lalu pilih kategori: Operasional Toko, Teknis Kasir/POS, atau Administrasi Stok.',
        },
        {
          num: 3,
          title: 'Tentukan Jumlah Pekerja & Opsi Tandem',
          desc: 'Tentukan berapa mitra yang dibutuhkan. Jika Anda memilih ≥ 2 pekerja, sistem otomatis mengaktifkan mode Paket Tandem dengan supervisi mitra lead.',
        },
        {
          num: 4,
          title: 'Pilih Tingkat Keahlian (Tier Requirement)',
          desc: 'Pilih Tier 1 (tugas dasar seperti packing/kebersihan), Tier 2 (stok, kasir & pelayanan), atau Tier 3 (ahli perangkat mesin & penanggung jawab teknis).',
        },
        {
          num: 5,
          title: 'Susun Checklist Kriteria SOP Serah Terima',
          desc: 'Tambahkan butir-butir checklist hasil kerja nyata. Checklist ini menjadi tolok ukur resmi pencairan dana escrow dan perlindungan Garansi 100%.',
        },
        {
          num: 6,
          title: 'Publikasikan Tugas & Kunci Dana Escrow',
          desc: 'Tekan "Posting Tugas Sekarang". Tugas langsung tersimpan ke database Supabase dan dana upah otomatis diamankan di rekening penampung resmi.',
        },
      ],
      tip: 'Semakin jelas butir checklist yang Anda tuliskan, semakin mudah mitra memahami standar hasil kerja yang Anda harapkan.',
      actionLabel: 'Buka Form Posting Tugas',
      actionMenu: 'new_task',
    },
    {
      id: 'guide-data-task',
      category: 'task',
      badge: 'Kelola & Edit Tugas',
      badgeColor: 'mint',
      icon: 'sliders',
      title: 'Cara Mengelola Data Tugas: Melihat Detail, Mengedit, & Menghapus',
      summary:
        'Gunakan menu "Data Tugas" untuk meninjau database pekerjaan, memperbarui butir kriteria atau anggaran, serta menghapus tugas yang dibatalkan.',
      steps: [
        {
          num: 1,
          title: 'Buka Menu "Data Tugas"',
          desc: 'Klik menu "Data Tugas" pada sidebar navigasi. Anda akan melihat tabel seluruh data tugas beserta metrik status ringkas.',
        },
        {
          num: 2,
          title: 'Gunakan Filter Status & Kotak Pencarian',
          desc: 'Saring tugas berdasarkan status: "In Progress", "Review Bukti", atau "Selesai". Anda juga dapat mengetikkan kata kunci ID atau judul pada kotak pencarian.',
        },
        {
          num: 3,
          title: 'Melihat Rincian Penuh (Tombol "Detail")',
          desc: 'Klik tombol "Detail" pada baris tugas untuk membuka modal rincian: lokasi GPS toko, pekerja ditugaskan, alokasi anggaran, checklist SOP, dan bukti foto digital.',
        },
        {
          num: 4,
          title: 'Mengubah Data Tugas (Tombol "Edit")',
          desc: 'Klik tombol "Edit" untuk membuka formulir pembaruan. Anda dapat mengubah judul, kategori, anggaran upah, status papan, maupun menambah/menghapus checklist. Klik "Simpan Perubahan" untuk menyimpan ke Supabase.',
        },
        {
          num: 5,
          title: 'Menghapus Tugas (Tombol "Hapus")',
          desc: 'Klik tombol "Hapus" jika tugas dibatalkan. Konfirmasikan di kotak dialog popup. Tugas akan langsung dihapus dari sistem dan database secara permanen.',
        },
      ],
      tip: 'Tugas yang telah berstatus "Selesai & Dicairkan" sebaiknya tidak dihapus agar riwayat mutasi keuangan tetap tercatat rapi.',
      actionLabel: 'Buka Menu Data Tugas',
      actionMenu: 'data_tugas',
    },
    {
      id: 'guide-kanban',
      category: 'kanban',
      badge: 'Kanban & Verifikasi',
      badgeColor: 'blue',
      icon: 'briefcase',
      title: 'Cara Memantau & Verifikasi Bukti Kerja di Papan Kanban',
      summary:
        'Pantau progres tugas secara visual di 3 kolom kanban dan setujui bukti serah terima dengan Tanda Tangan Digital (TTD).',
      steps: [
        {
          num: 1,
          title: 'Pahami 3 Kolom Papan Kanban',
          desc: 'Kolom "Tugas Saat Ini" menampilkan tugas yang sedang dikerjakan hari ini. Kolom "Tenggat Minggu Ini" menampung tugas review bukti. Kolom "Terlewat / Tuntas" menampilkan riwayat tugas.',
        },
        {
          num: 2,
          title: 'Buka Kartu Tugas Berstatus "Proof Review"',
          desc: 'Ketika mitra selesai bekerja, kartu tugas akan menampilkan lencana hijau "Proof Review". Klik kartu tersebut untuk membuka modal verifikasi bukti serah terima.',
        },
        {
          num: 3,
          title: 'Periksa Foto Ber-Watermark GPS & Waktu',
          desc: 'Periksa foto hasil kerja yang diunggah mitra melalui kamera Relink. Pastikan watermark koordinat GPS dan timestamp waktu sesuai dengan lokasi toko Anda.',
        },
        {
          num: 4,
          title: 'Centang Persetujuan Tanda Tangan Digital (TTD)',
          desc: 'Jika seluruh checklist pekerjaan telah terpenuhi, centang kotak persetujuan tanda tangan digital.',
        },
        {
          num: 5,
          title: 'Setujui & Cairkan Dana Escrow',
          desc: 'Klik tombol "Setujui & Cairkan Dana Escrow". Pembayaran akan langsung diteruskan ke saldo mitra dan transaksi dinyatakan tuntas 100%.',
        },
      ],
      tip: 'Jika hasil kerja belum rapi atau tidak sesuai SOP, Anda dapat mengklik "Ajukan Sengketa" di dalam modal bukti untuk meminta revisi atau mediasi.',
      actionLabel: 'Lihat Papan Kanban',
      actionMenu: 'kanban',
    },
    {
      id: 'guide-escrow',
      category: 'escrow',
      badge: 'Dana Escrow & Garansi',
      badgeColor: 'mint',
      icon: 'shield',
      title: 'Cara Kerja Rekening Escrow, Auto-Release, & Pencairan Dana',
      summary:
        'Bagaimana Relink melindungi 100% dana UMKM sejak pemesanan hingga serah terima selesai menggunakan payment gateway resmi.',
      steps: [
        {
          num: 1,
          title: 'Deposit Terkunci di Rekening Penampung Resmi',
          desc: 'Saat Anda memposting tugas, dana pembayaran ditampung di rekening escrow berlisensi. Mitra tidak dapat menarik dana sebelum pekerjaan selesai.',
        },
        {
          num: 2,
          title: 'Pelacakan Status Dana (Held, Review, Released)',
          desc: 'Buka menu "Dana Escrow" untuk memantau status setiap transaksi. "Held" berarti mitra masih bekerja, "Review" berarti menunggu persetujuan Anda, dan "Released" berarti dana telah dicairkan.',
        },
        {
          num: 3,
          title: 'Pencairan Instan (Lepas Dana Langsung)',
          desc: 'Pada transaksi berstatus "Review", Anda dapat mengklik tombol "Lepas Dana" untuk mencairkan upah ke mitra seketika tanpa menunggu timer.',
        },
        {
          num: 4,
          title: 'Aturan Auto-Release 24–48 Jam',
          desc: 'Jika Anda tidak memberikan respons dalam waktu 48 jam setelah bukti kerja diserahkan, sistem otomatis mencairkan dana demi kepastian upah mitra.',
        },
        {
          num: 5,
          title: 'Pengajuan Mediasi & Klaim Garansi Kepuasan 100%',
          desc: 'Jika terjadi wanprestasi atau ketidaksesuaian SOP, klik "Ajukan Sengketa". Tim Mediasi Relink akan menengahi secara objektif dalam waktu maksimal 48 jam.',
        },
      ],
      tip: 'Unduh rekap mutasi keuangan berformat CSV/PDF melalui tombol "Unduh Rekap Mutasi" di kanan atas halaman Dana Escrow untuk pembukuan tokomu.',
      actionLabel: 'Buka Menu Dana Escrow',
      actionMenu: 'escrow',
    },
  ]

  // Filter Panduan
  const filteredGuides = featureGuides.filter((guide) => {
    const matchCategory = activeGuideCategory === 'all' || guide.category === activeGuideCategory
    const q = searchGuide.toLowerCase().trim()
    const matchSearch =
      !q ||
      guide.title.toLowerCase().includes(q) ||
      guide.summary.toLowerCase().includes(q) ||
      guide.badge.toLowerCase().includes(q) ||
      guide.steps.some((s) => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
    return matchCategory && matchSearch
  })

  // FAQ Praktis
  const quickFaqs = [
    {
      id: 1,
      q: 'Bagaimana jika email reset password tidak kunjung masuk ke kotak masuk?',
      a: 'Tunggu sekitar 1–2 menit, lalu periksa tab Spam atau Promosi di aplikasi email Anda. Pastikan alamat email yang Anda masukkan sama persis dengan email saat mendaftar akun UMKM. Jika batas rate limit tercapai (email rate limit exceeded), tunggu jeda 60 detik sebelum meminta tautan baru.',
    },
    {
      id: 2,
      q: 'Apakah tugas yang baru saja saya buat otomatis tersimpan ke database?',
      a: 'Ya, betul. Setiap kali Anda menekan tombol "Posting Tugas Sekarang", sistem secara real-time mengirimkan query INSERT ke tabel database tasks di Supabase. Data tugas akan tetap tersimpan aman meskipun Anda me-refresh browser atau login di perangkat lain.',
    },
    {
      id: 3,
      q: 'Bisakah saya mengedit checklist atau anggaran setelah tugas diposting?',
      a: 'Bisa. Buka menu "Data Tugas", cari tugas yang ingin diperbarui, lalu klik tombol "Edit". Anda dapat memperbarui judul, kategori, anggaran, tingkat tier, maupun butir checklist SOP serah terima.',
    },
    {
      id: 4,
      q: 'Kapan dana escrow pembayaran dicairkan ke saldo pekerja?',
      a: 'Dana escrow hanya dicairkan setelah Anda memvalidasi bukti foto GPS hasil kerja dan mencentang persetujuan tanda tangan digital di papan Kanban atau tombol "Lepas Dana" di menu Dana Escrow.',
    },
    {
      id: 5,
      q: 'Apa yang terjadi jika saya menghapus tugas di menu Data Tugas?',
      a: 'Tugas akan dihapus secara permanen dari daftar operasional dan database Supabase. Jika tugas tersebut memiliki dana tertahan di Escrow, sistem akan mengembalikan dana deposit ke saldo akun Anda.',
    },
  ]

  // Handler Kirim Tiket
  const handleTicketSubmit = (e) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketDetails.trim()) {
      alert('Mohon isi judul dan rincian pertanyaan Anda secara lengkap.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      insertSupportTicketToDb({
        task: 'Panduan Dashboard',
        category: ticketCategory,
        priority: 'Normal',
        subject: ticketSubject,
        details: ticketDetails,
      })
      setTicketSubject('')
      setTicketDetails('')
      setIsSubmitting(false)

      if (setActionSuccessMsg) {
        setActionSuccessMsg('Pertanyaan Anda telah diterima oleh Tim CS Relink! Kami akan merespons dalam waktu singkat.')
        setTimeout(() => setActionSuccessMsg(''), 5500)
      }
    }, 400)
  }

  return (
    <main className="dashboard-content-flow helpdesk-dashboard-flow">
      {/* 1. Header Section */}
      <div className="content-heading-bar">
        <div>
          <h1>Pusat Bantuan &amp; Panduan Penggunaan</h1>
          <p>Cari Panduan mengenai Fitur Relink</p>
        </div>
        <div className="helpdesk-header-actions">
          <a
            aria-label="Hubungi WhatsApp CS Relink"
            className="btn-whatsapp-support"
            href="https://wa.me/6281234567890?text=Halo%20Tim%20CS%20Relink,%20saya%20butuh%20panduan%20penggunaan%20dashboard%20UMKM"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon name="whatsapp" size={17} />
            <span>Chat CS</span>
          </a>
        </div>
      </div>

      {/* 2. Filter Kategori & Pencarian Tutorial */}
      <section className="faq-section">
        <div className="faq-header-bar">
          {/* Kolom Pencarian Tutorial di Atas */}
          <div className="faq-search-box">
            <Icon name="search" size={18} />
            <input
              aria-label="Cari panduan fitur"
              onChange={(e) => setSearchGuide(e.target.value)}
              placeholder="Cari tutorial panduan fitur (misal: reset password, edit tugas, verifikasi kanban, escrow)..."
              type="text"
              value={searchGuide}
            />
            {searchGuide && (
              <button
                className="btn-clear-search"
                onClick={() => setSearchGuide('')}
                type="button"
              >
                ✕
              </button>
            )}
          </div>

          {/* Tab Filter Kategori di Bawah Kolom Pencarian */}
          <div className="faq-category-tabs">
            <button
              className={`faq-tab-btn${activeGuideCategory === 'all' ? ' faq-tab-btn--active' : ''}`}
              onClick={() => setActiveGuideCategory('all')}
              type="button"
            >
              Semua Panduan ({featureGuides.length})
            </button>
            <button
              className={`faq-tab-btn${activeGuideCategory === 'password' ? ' faq-tab-btn--active' : ''}`}
              onClick={() => setActiveGuideCategory('password')}
              type="button"
            >
              Kata Sandi &amp; Akun
            </button>
            <button
              className={`faq-tab-btn${activeGuideCategory === 'task' ? ' faq-tab-btn--active' : ''}`}
              onClick={() => setActiveGuideCategory('task')}
              type="button"
            >
              Posting &amp; Kelola Tugas
            </button>
            <button
              className={`faq-tab-btn${activeGuideCategory === 'kanban' ? ' faq-tab-btn--active' : ''}`}
              onClick={() => setActiveGuideCategory('kanban')}
              type="button"
            >
              Kanban &amp; Verifikasi
            </button>
            <button
              className={`faq-tab-btn${activeGuideCategory === 'escrow' ? ' faq-tab-btn--active' : ''}`}
              onClick={() => setActiveGuideCategory('escrow')}
              type="button"
            >
              Dana Escrow &amp; Garansi
            </button>
          </div>
        </div>

        {/* 4. Daftar Modul Panduan Fitur Langkah-demi-Langkah */}
        <div className="feature-guides-stack">
          {filteredGuides.length === 0 ? (
            <div className="empty-faq-state">
              <Icon name="search" size={32} />
              <p>Tidak ditemukan panduan untuk kata kunci &ldquo;{searchGuide}&rdquo;.</p>
              <button
                className="btn-reset-filter"
                onClick={() => {
                  setSearchGuide('')
                  setActiveGuideCategory('all')
                }}
                type="button"
              >
                Tampilkan Semua Panduan
              </button>
            </div>
          ) : (
            filteredGuides.map((guide) => (
              <article key={guide.id} className="feature-guide-card">
                <header className="guide-card-header">
                  <div className="guide-card-title-group">
                    <span className={`guide-category-tag guide-category-tag--${guide.badgeColor}`}>
                      <Icon name={guide.icon} size={13} />
                      <span>{guide.badge}</span>
                    </span>
                    <h3>{guide.title}</h3>
                    <p>{guide.summary}</p>
                  </div>
                  {guide.actionMenu && setCurrentMenu && (
                    <button
                      className="btn-guide-action"
                      onClick={() => setCurrentMenu(guide.actionMenu)}
                      type="button"
                    >
                      <span>{guide.actionLabel}</span>
                      <Icon name="arrow-up-right" size={14} />
                    </button>
                  )}
                  {guide.actionHref && (
                    <a
                      className="btn-guide-action"
                      href={guide.actionHref}
                    >
                      <span>{guide.actionLabel}</span>
                      <Icon name="arrow-up-right" size={14} />
                    </a>
                  )}
                </header>

                <div className="guide-steps-stepper">
                  {guide.steps.map((step) => (
                    <div key={step.num} className="guide-step-item">
                      <div className="guide-step-number">{step.num}</div>
                      <div className="guide-step-content">
                        <h4>{step.title}</h4>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {guide.tip && (
                  <div className="guide-tip-banner">
                    <Icon name="star" size={16} />
                    <div>
                      <strong>Tips Relink:</strong> {guide.tip}
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      {/* 5. Tanya Jawab Cepat (Quick FAQ Accordion) */}
      <section className="faq-section">
        <div className="section-header-compact">
          <h3>Pertanyaan Praktis yang Sering Diajukan</h3>
          <p>Jawaban cepat seputar kendala teknis dan operasional dashboard UMKM</p>
        </div>

        <div className="faq-accordion">
          {quickFaqs.map((faq) => {
            const isOpen = expandedFaqId === faq.id
            return (
              <div
                key={faq.id}
                className={`faq-item${isOpen ? ' faq-item--expanded' : ''}`}
              >
                <button
                  aria-expanded={isOpen}
                  className="faq-question-btn"
                  onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                  type="button"
                >
                  <span className="faq-q-text">{faq.q}</span>
                  <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer-panel">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 6. Form Pertanyaan CS Langsung */}
      <section className="ticket-section">
        <div className="ticket-section-header">
          <div>
            <h3>Butuh Bantuan Lebih Lanjut?</h3>
            <p>
              Tuliskan pertanyaan atau kendala yang Anda hadapi. Tim Dukungan Klien Relink akan merespons dalam waktu singkat.
            </p>
          </div>
          <span className="ticket-status-pill">
            <Icon name="shield" size={14} /> Dukungan Resmi UMKM
          </span>
        </div>

        <form className="ticket-form" onSubmit={handleTicketSubmit}>
          <div className="form-row-split">
            <div className="form-group">
              <label htmlFor="ticket-category-select">Topik Fitur</label>
              <select
                id="ticket-category-select"
                onChange={(e) => setTicketCategory(e.target.value)}
                value={ticketCategory}
              >
                <option value="umum">Pertanyaan Umum Dashboard</option>
                <option value="password">Kendala Kata Sandi &amp; Login</option>
                <option value="posting">Posting &amp; Kelola Tugas</option>
                <option value="escrow">Dana Escrow &amp; Pencairan</option>
                <option value="mitra">Pekerja / Kualifikasi Mitra</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ticket-subject-input">Judul Pertanyaan / Kendala</label>
              <input
                id="ticket-subject-input"
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Contoh: Cara mengubah butir checklist pada tugas aktif"
                required
                type="text"
                value={ticketSubject}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ticket-details-input">Rincian Pertanyaan Anda</label>
            <textarea
              id="ticket-details-input"
              onChange={(e) => setTicketDetails(e.target.value)}
              placeholder="Jelaskan kendala atau hal yang ingin Anda tanyakan secara spesifik..."
              required
              rows={4}
              value={ticketDetails}
            />
          </div>

          <div className="ticket-form-footer">
            <small className="ticket-guarantee-note">
              Tim kami memantau pesan setiap hari pukul 07:00 – 22:00 WIB.
            </small>
            <button
              className="btn-submit-ticket"
              disabled={isSubmitting}
              type="submit"
            >
              <Icon name="mail" size={16} />
              <span>{isSubmitting ? 'Mengirimkan...' : 'Kirim Pertanyaan ke CS'}</span>
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default PusatBantuanView
