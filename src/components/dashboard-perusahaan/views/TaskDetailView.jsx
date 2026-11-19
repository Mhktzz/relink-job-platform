import { useState } from 'react'
import Icon from '../../common/Icon.jsx'
import cashierPhoto from '../../../assets/cashier.jpg'
import technicianPhoto from '../../../assets/technician.jpg'

function TaskDetailView({
  task,
  onBack,
  previousMenu = 'kanban',
  onOpenProofModal,
  onEditTask,
  setCurrentMenu,
}) {
  if (!task) return null

  // Normalisasi Status: 'Open' | 'In Progress' | 'Proof Review' | 'Completed'
  const rawStatus = (task.statusBadge || task.status || '').toLowerCase()
  let normalizedStatus = 'In Progress'
  if (rawStatus.includes('open') || task.column === 'open') {
    normalizedStatus = 'Open'
  } else if (
    rawStatus.includes('review') ||
    task.column === 'due_week' ||
    rawStatus.includes('tunggu')
  ) {
    normalizedStatus = 'Proof Review'
  } else if (
    rawStatus.includes('complete') ||
    task.column === 'overdue' ||
    rawStatus.includes('selesai')
  ) {
    normalizedStatus = 'Completed'
  } else {
    normalizedStatus = 'In Progress'
  }

  // Active Tab: Jika status sudah Proof Review atau Completed, default buka tab hasil pekerjaan
  const hasDeliverables =
    normalizedStatus === 'Proof Review' ||
    normalizedStatus === 'Completed' ||
    Boolean(task.proofData)
  const [activeTab, setActiveTab] = useState(
    hasDeliverables ? 'deliverables' : 'instructions'
  )

  // Sub-modal State untuk Preview Dokumen & Preview Foto Full
  const [activeDocPreview, setActiveDocPreview] = useState(null)
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false)

  // Label Menu Asal untuk Tombol Kembali
  const getPreviousMenuLabel = () => {
    switch (previousMenu) {
      case 'kanban':
        return 'Papan Kanban'
      case 'data_tugas':
        return 'Data Tugas'
      case 'beranda':
        return 'Beranda'
      case 'escrow':
        return 'Dana Escrow'
      default:
        return 'Menu Sebelumnya'
    }
  }

  // Data lampiran dokumen serah terima mitra (PDF & Dokumen)
  const documentList = task.proofData?.documents || [
    {
      id: 'doc-1',
      name: `Laporan_Serah_Terima_${task.id || 'TSK'}.pdf`,
      type: 'pdf',
      size: '1.4 MB',
      uploadedAt:
        task.proofData?.timestamp || task.dateRange || '19 Nov 2026, 11:18 WIB',
      description:
        'Laporan resmi berita acara penyelesaian tugas dan kepatuhan SOP operasional.',
    },
    {
      id: 'doc-2',
      name: `Checklist_Fisik_Dan_K3_${task.code || '878901'}.pdf`,
      type: 'pdf',
      size: '820 KB',
      uploadedAt:
        task.proofData?.timestamp || task.dateRange || '19 Nov 2026, 11:15 WIB',
      description:
        'Formulir inspeksi hasil checklist fisik yang telah ditandatangani mitra.',
    },
    {
      id: 'doc-3',
      name: `Berita_Acara_Pekerjaan.docx`,
      type: 'doc',
      size: '420 KB',
      uploadedAt:
        task.proofData?.timestamp || task.dateRange || '19 Nov 2026, 11:12 WIB',
      description:
        'Salinan dokumen berita acara serah terima pekerjaan harian toko.',
    },
  ]

  // Data Foto Bukti Lapangan
  const proofPhoto =
    task.proofData?.photoUrl ||
    (task.category?.toLowerCase().includes('teknis')
      ? technicianPhoto
      : cashierPhoto)
  const gpsLocation =
    task.proofData?.gpsLocation ||
    '-7.4241, 109.2425 (Lokasi Toko UMKM Terverifikasi)'
  const submitTimestamp =
    task.proofData?.timestamp || '19 Nov 2026, 11:20 WIB'
  const workerNote =
    task.proofData?.note ||
    'Semua tahapan checklist pekerjaan operasional dan kriteria serah terima telah saya selesaikan dengan teliti dan rapi.'

  // Parse checklist
  let checklistItems = []
  if (
    Array.isArray(task.acceptanceChecklist) &&
    task.acceptanceChecklist.length > 0
  ) {
    checklistItems = task.acceptanceChecklist.map((c, i) =>
      typeof c === 'object'
        ? c
        : {
            id: `c-${i}`,
            text: c,
            done:
              normalizedStatus === 'Proof Review' ||
              normalizedStatus === 'Completed',
          }
    )
  } else if (Array.isArray(task.checklist) && task.checklist.length > 0) {
    checklistItems = task.checklist.map((c, i) =>
      typeof c === 'object'
        ? c
        : {
            id: `c-${i}`,
            text: c,
            done:
              normalizedStatus === 'Proof Review' ||
              normalizedStatus === 'Completed',
          }
    )
  } else {
    checklistItems = [
      {
        id: 'c-1',
        text: 'Tugas diselesaikan sesuai instruksi operasional toko',
        done: true,
      },
      {
        id: 'c-2',
        text: 'Area kerja telah dirapikan & diserahterimakan',
        done: true,
      },
    ]
  }

  // Stepper Status Stages
  const stages = [
    { key: 'Open', label: '1. Open', desc: 'Lowongan Terbuka' },
    { key: 'In Progress', label: '2. In Progress', desc: 'Sedang Dikerjakan' },
    { key: 'Proof Review', label: '3. Proof Review', desc: 'Tunggu Review' },
    { key: 'Completed', label: '4. Completed', desc: 'Selesai & Cair' },
  ]

  const getStageState = (stageKey) => {
    const order = ['Open', 'In Progress', 'Proof Review', 'Completed']
    const currentIndex = order.indexOf(normalizedStatus)
    const stageIndex = order.indexOf(stageKey)
    if (stageIndex < currentIndex) return 'is-done'
    if (stageIndex === currentIndex) return 'is-current'
    return 'is-pending'
  }

  return (
    <main className="dashboard-content-flow task-detail-page-flow">
      {/* ======================================================== */}
      {/* 1. TOP NAVIGATION / BREADCRUMB BAR */}
      {/* ======================================================== */}
      <div className="task-detail-top-nav">
        <button
          className="btn-back-to-menu"
          onClick={onBack}
          title={`Kembali ke ${getPreviousMenuLabel()}`}
          type="button"
        >
          <span className="back-arrow-icon">←</span>
          <span>Kembali ke {getPreviousMenuLabel()}</span>
        </button>

        <div className="task-detail-nav-actions">
          {normalizedStatus === 'Proof Review' && onOpenProofModal && (
            <button
              className="btn-nav-action-pink"
              onClick={() => onOpenProofModal(task)}
              type="button"
            >
              <Icon name="check" size={14} />
              <span>Tinjau Bukti &amp; Lepas Escrow</span>
            </button>
          )}

          {normalizedStatus === 'Open' && setCurrentMenu && (
            <button
              className="btn-nav-action-pink"
              onClick={() => setCurrentMenu('radar')}
              type="button"
            >
              <Icon name="pin" size={14} />
              <span>Cari Mitra di Radar</span>
            </button>
          )}

          {normalizedStatus === 'In Progress' && setCurrentMenu && (
            <button
              className="btn-nav-action-navy"
              onClick={() => setCurrentMenu('kanban')}
              type="button"
            >
              <Icon name="briefcase" size={14} />
              <span>Lihat di Kanban</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. HERO HEADER SECTION */}
      {/* ======================================================== */}
      <div className="task-detail-page-header">
        <div className="task-detail-header-left">
          <div className="task-detail-meta-pill-row">
            <span
              className={`task-status-badge task-status-badge--${normalizedStatus
                .toLowerCase()
                .replace(/\s+/g, '-')}`}
            >
              {normalizedStatus === 'Proof Review'
                ? 'Tunggu Review'
                : normalizedStatus === 'In Progress'
                ? 'Sedang Berjalan'
                : normalizedStatus === 'Open'
                ? 'Lowongan Terbuka'
                : 'Selesai & Cair'}
            </span>
            <span className="task-code-tag">{task.code || task.id}</span>
            <span className="task-category-tag">
              {task.category || 'Operasional Toko'}
            </span>
          </div>
          <h1 className="task-detail-main-title">{task.title}</h1>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. LIFECYCLE STEPPER: Open -> In Progress -> Proof Review -> Completed */}
      {/* ======================================================== */}
      <div className="task-lifecycle-stepper-container">
        <div className="task-lifecycle-stepper">
          {stages.map((stage, idx) => {
            const state = getStageState(stage.key)
            return (
              <div key={stage.key} className={`stepper-node ${state}`}>
                <div className="stepper-indicator">
                  <div className="stepper-dot">
                    {state === 'is-done' ? (
                      <Icon name="check" size={12} />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  {idx < stages.length - 1 && <div className="stepper-line" />}
                </div>
                <div className="stepper-text">
                  <strong>{stage.label}</strong>
                  <small>{stage.desc}</small>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TAB NAVIGATION: Instruksi Tugas vs Hasil Pekerjaan Mitra */}
      {/* ======================================================== */}
      <div className="task-detail-tabs-bar">
        <button
          className={`task-detail-tab-btn ${
            activeTab === 'instructions' ? 'task-detail-tab-btn--active' : ''
          }`}
          onClick={() => setActiveTab('instructions')}
          type="button"
        >
          <Icon name="briefcase" size={16} />
          <span>Task Yang Harus Dikerjakan &amp; SOP</span>
        </button>

        <button
          className={`task-detail-tab-btn ${
            activeTab === 'deliverables' ? 'task-detail-tab-btn--active' : ''
          }`}
          onClick={() => setActiveTab('deliverables')}
          type="button"
        >
          <Icon name="file-text" size={16} />
          <span>Hasil Pekerjaan Mitra (PDF / Gambar / Dokumen)</span>
          {hasDeliverables && (
            <span className="tab-available-badge">
              <Icon name="check" size={11} /> Tersedia
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 5. TAB CONTENT BODY */}
      {/* ======================================================== */}
      <div className="task-detail-main-body">
        {activeTab === 'instructions' ? (
          /* ======================================================== */
          /* TAB 1: TASK YANG HARUS DIKERJAKAN & SOP */
          /* ======================================================== */
          <div className="task-tab-content-flow">
            {/* Highlight Ringkasan Anggaran & Mitra */}
            <div className="task-info-highlight-card">
              <div className="task-highlight-item">
                <span className="highlight-label">Anggaran Upah Escrow</span>
                <strong className="highlight-budget">
                  Rp{(Number(task.budget) || 0).toLocaleString('id-ID')}
                </strong>
                <small className="highlight-sub-note">
                  <Icon name="shield" size={12} /> 100% Proteksi Rekening Escrow
                </small>
              </div>

              <div className="task-highlight-item">
                <span className="highlight-label">Tingkat Keahlian</span>
                <div className="tier-badge-wrap">
                  <span className="tier-tag tier-tag--highlight">
                    {task.tier || 'Tier 1'}
                  </span>
                </div>
                <small className="highlight-sub-note">
                  Standar Kualifikasi SOP Relink
                </small>
              </div>

              <div className="task-highlight-item">
                <span className="highlight-label">Pekerja Ditugaskan</span>
                {task.workerName ? (
                  <div className="worker-inline-badge">
                    <img
                      alt={task.workerName}
                      className="worker-avatar-small"
                      src={task.workerPhoto || technicianPhoto}
                    />
                    <div>
                      <strong>{task.workerName}</strong>
                      <small>Rating 4.9 · Terverifikasi</small>
                    </div>
                  </div>
                ) : (
                  <div>
                    <strong className="text-muted">Belum ada mitra</strong>
                    <small className="highlight-sub-note">
                      Siap dihubungi via Radar
                    </small>
                  </div>
                )}
              </div>

              <div className="task-highlight-item">
                <span className="highlight-label">Lokasi &amp; Tenggat</span>
                <strong>{task.location || 'Toko UMKM, Tebet Barat'}</strong>
                <small className="highlight-sub-note">
                  <Icon name="clock" size={12} /> {task.dateRange || 'Hari ini'}
                </small>
              </div>
            </div>

            {/* Deskripsi Tugas */}
            <div className="task-content-section-box">
              <h4>
                <Icon name="sliders" size={16} /> Deskripsi Tugas Operasional
              </h4>
              <p className="task-full-description">
                {task.description ||
                  'Pekerjaan operasional toko lokal dengan standar mutu dan proteksi Rekening Escrow Relink. Mitra bertanggung jawab menyelesaikan seluruh instruksi kerja harian sesuai checklist kriteria serah terima.'}
              </p>
            </div>

            {/* Checklist SOP Serah Terima yang Harus Dikerjakan */}
            <div className="task-content-section-box">
              <div className="section-title-between">
                <h4>
                  <Icon name="check-circle" size={16} /> Checklist Kriteria
                  Serah Terima (SOP)
                </h4>
                <span className="checklist-counter-badge">
                  {checklistItems.filter((c) => c.done).length} dari{' '}
                  {checklistItems.length} Selesai
                </span>
              </div>
              <p className="checklist-subtext">
                Mitra wajib menyelesaikan setiap butir checklist ini sebagai
                syarat sah pencairan dana escrow.
              </p>

              <div className="task-detail-checklist-grid">
                {checklistItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`checklist-item-card ${
                      item.done ? 'checklist-item-card--done' : ''
                    }`}
                  >
                    <div className="checklist-item-check-bubble">
                      {item.done ? (
                        <Icon name="check" size={14} />
                      ) : (
                        <span>○</span>
                      )}
                    </div>
                    <div className="checklist-item-text">
                      <strong>{item.text}</strong>
                      <small>
                        {item.done
                          ? 'Terverifikasi selesai oleh pekerja'
                          : 'Wajib diselesaikan di lokasi kerja'}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* TAB 2: HASIL PEKERJAAN MITRA (FOTO GPS & DOKUMEN / PDF) */
          /* ======================================================== */
          <div className="task-tab-content-flow">
            {!hasDeliverables ? (
              /* Jika belum submit bukti */
              <div className="deliverables-empty-state">
                <div className="deliverables-empty-icon">
                  <Icon name="clock" size={32} />
                </div>
                <h3>Pekerja Sedang Menjalankan Tugas</h3>
                <p>
                  Saat ini status tugas adalah{' '}
                  <strong>{normalizedStatus}</strong>. Setelah pekerja
                  menyelesaikan instruksi kerja di lokasi dan mengunggah foto
                  lapangan ber-GPS serta dokumen lampiran, seluruh hasil
                  pekerjaan akan otomatis tampil di sini untuk Anda tinjau.
                </p>
                <div className="empty-state-hint-card">
                  <Icon name="shield" size={16} />
                  <span>
                    Dana upah Anda tetap aman terkunci di{' '}
                    <strong>Rekening Escrow</strong> dan tidak akan dicairkan
                    sebelum Anda menyetujui hasil kerja mitra.
                  </span>
                </div>
              </div>
            ) : (
              /* Jika pekerja SUDAH submit bukti (Proof Review / Completed) */
              <div className="deliverables-full-view">
                {/* Banner Status Serah Terima */}
                <div
                  className={`deliverables-status-banner deliverables-status-banner--${
                    normalizedStatus === 'Completed' ? 'completed' : 'review'
                  }`}
                >
                  <div className="status-banner-left">
                    <div className="status-banner-icon">
                      <Icon
                        name={
                          normalizedStatus === 'Completed' ? 'check' : 'shield'
                        }
                        size={18}
                      />
                    </div>
                    <div>
                      <h4>
                        {normalizedStatus === 'Completed'
                          ? 'Hasil Pekerjaan Telah Diverifikasi & Selesai'
                          : 'Mitra Telah Mengajukan Draft Serah Terima (Tunggu Review)'}
                      </h4>
                      <p>
                        {normalizedStatus === 'Completed'
                          ? 'Seluruh foto bukti, dokumen PDF, dan checklist telah disetujui. Dana escrow telah dilepas ke saldo mitra.'
                          : 'Silakan periksa foto GPS asli dan lampiran dokumen laporan di bawah ini sebelum menandatangani persetujuan.'}
                      </p>
                    </div>
                  </div>
                  {normalizedStatus === 'Proof Review' && onOpenProofModal && (
                    <button
                      className="btn-banner-action-pink"
                      onClick={() => onOpenProofModal(task)}
                      type="button"
                    >
                      <Icon name="check" size={14} />
                      <span>Tinjau &amp; Lepas Dana</span>
                    </button>
                  )}
                </div>

                {/* 1. HASIL FOTO LAPANGAN DENGAN WATERMARK KAMERA GPS */}
                <div className="deliverables-card-section">
                  <div className="section-title-between">
                    <h4>
                      <Icon name="image" size={16} /> 1. Bukti Foto Lapangan
                      (Kamera Watermark GPS)
                    </h4>
                    <span className="verified-badge-mini">
                      <Icon name="shield" size={12} /> Validated by Relink Camera
                    </span>
                  </div>

                  <div className="deliverables-photo-layout">
                    <div className="photo-preview-container">
                      <img
                        alt="Hasil Pekerjaan Mitra"
                        className="deliverable-main-img"
                        onClick={() => setIsPhotoZoomed(true)}
                        src={proofPhoto}
                        title="Klik untuk memperbesar foto"
                      />
                      <div className="photo-watermark-overlay">
                        <div className="wm-row">
                          <Icon name="pin" size={12} />
                          <span>GPS: {gpsLocation}</span>
                        </div>
                        <div className="wm-row">
                          <Icon name="clock" size={12} />
                          <span>Waktu: {submitTimestamp}</span>
                        </div>
                        <div className="wm-row">
                          <Icon name="shield" size={12} />
                          <span>Kamera: Anti-Spoofing Verified</span>
                        </div>
                      </div>
                      <button
                        className="btn-zoom-overlay"
                        onClick={() => setIsPhotoZoomed(true)}
                        title="Perbesar Foto"
                        type="button"
                      >
                        <Icon name="eye" size={16} />
                      </button>
                    </div>

                    <div className="photo-details-panel">
                      <div className="photo-meta-box">
                        <span className="meta-box-label">Mitra Pengunggah</span>
                        <strong>{task.workerName || 'Mitra Pekerja'}</strong>
                        <small>Kualifikasi {task.tier || 'Tier 1'}</small>
                      </div>
                      <div className="photo-meta-box">
                        <span className="meta-box-label">
                          Koordinat GPS Lapangan
                        </span>
                        <strong>{gpsLocation}</strong>
                        <small>Tervalidasi berada di radius lokasi tugas</small>
                      </div>
                      <div className="photo-meta-box">
                        <span className="meta-box-label">
                          Catatan Pengerjaan dari Mitra
                        </span>
                        <blockquote className="worker-quote-bubble">
                          &ldquo;{workerNote}&rdquo;
                        </blockquote>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. LAMPIRAN DOKUMEN & LAPORAN (PDF / DOCX) */}
                <div className="deliverables-card-section">
                  <div className="section-title-between">
                    <h4>
                      <Icon name="file-text" size={16} /> 2. Berkas Dokumen &amp;
                      Laporan Serah Terima (PDF / Dokumen)
                    </h4>
                    <span className="doc-count-pill">
                      {documentList.length} Berkas Tersedia
                    </span>
                  </div>
                  <p className="section-sub-info">
                    Berikut adalah dokumen pendukung resmi yang diunggah mitra,
                    termasuk berita acara serah terima, rekap formulir SOP, dan
                    checklist fisik.
                  </p>

                  <div className="documents-file-grid">
                    {documentList.map((doc) => (
                      <div key={doc.id} className="document-file-card">
                        <div className="doc-file-icon-wrap doc-file-icon-wrap--pdf">
                          <Icon name="file-text" size={22} />
                          <span className="doc-extension-tag">
                            {doc.type.toUpperCase()}
                          </span>
                        </div>

                        <div className="doc-file-info">
                          <strong>{doc.name}</strong>
                          <p>{doc.description}</p>
                          <div className="doc-meta-row">
                            <span>{doc.size}</span>
                            <span>·</span>
                            <span>Diunggah: {doc.uploadedAt}</span>
                          </div>
                        </div>

                        <div className="doc-file-actions">
                          <button
                            className="btn-doc-preview"
                            onClick={() => setActiveDocPreview(doc)}
                            title="Lihat / Preview Dokumen"
                            type="button"
                          >
                            <Icon name="eye" size={14} />
                            <span>Lihat Dokumen</span>
                          </button>
                          <a
                            className="btn-doc-download"
                            download={doc.name}
                            href="#unduh"
                            onClick={(e) => {
                              e.preventDefault()
                              alert(`Memulai unduhan dokumen ${doc.name}...`)
                            }}
                            title="Unduh File"
                          >
                            <Icon name="download" size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. VERIFIKASI TANDA TANGAN DIGITAL MITRA */}
                <div className="deliverables-card-section deliverables-signature-section">
                  <div className="signature-card-box">
                    <div className="signature-card-left">
                      <Icon name="check-circle" size={24} />
                      <div>
                        <strong>
                          Tanda Tangan Digital Mitra Telah Terverifikasi
                        </strong>
                        <p>
                          Mitra {task.workerName || 'Pekerja'} telah
                          menandatangani pakta penyelesaian tugas secara digital
                          pada {submitTimestamp} sesuai standar audit Relink.
                        </p>
                      </div>
                    </div>
                    <div className="digital-signature-badge">
                      <span className="sign-stamp">VERIFIED SIGNATURE</span>
                      <span className="sign-name">
                        {task.workerName || 'Mitra Pekerja'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 6. BOTTOM ACTION FOOTER */}
      {/* ======================================================== */}
      <footer className="task-detail-bottom-bar">
        <div className="footer-left-actions">
          <button className="btn-footer-back" onClick={onBack} type="button">
            ← Kembali ke {getPreviousMenuLabel()}
          </button>
          {onEditTask && normalizedStatus !== 'Completed' && (
            <button
              className="btn-modal-edit-action"
              onClick={() => onEditTask(task)}
              type="button"
            >
              <Icon name="edit" size={14} />
              <span>Edit Data Tugas</span>
            </button>
          )}
        </div>

        <div className="footer-right-actions">
          {normalizedStatus === 'Proof Review' && onOpenProofModal && (
            <button
              className="btn-modal-submit-pink"
              onClick={() => onOpenProofModal(task)}
              type="button"
            >
              <Icon name="check" size={16} />
              <span>Tinjau Bukti &amp; Lepas Escrow</span>
            </button>
          )}

          {normalizedStatus === 'Open' && setCurrentMenu && (
            <button
              className="btn-modal-submit-pink"
              onClick={() => setCurrentMenu('radar')}
              type="button"
            >
              <Icon name="pin" size={16} />
              <span>Cari Mitra di Radar</span>
            </button>
          )}

          {normalizedStatus === 'In Progress' && setCurrentMenu && (
            <button
              className="btn-modal-action-navy"
              onClick={() => setCurrentMenu('kanban')}
              type="button"
            >
              <Icon name="briefcase" size={15} />
              <span>Pantau di Papan Kanban</span>
            </button>
          )}

          {normalizedStatus === 'Completed' && (
            <span className="completed-check-tag">
              <Icon name="check-circle" size={16} /> Pekerjaan Telah Selesai
              &amp; Upah Dicairkan
            </span>
          )}
        </div>
      </footer>

      {/* ======================================================== */}
      {/* MODAL POPUP PREVIEW DOKUMEN / PDF VIEWER */}
      {/* ======================================================== */}
      {activeDocPreview && (
        <div
          aria-modal="true"
          className="doc-preview-modal-overlay"
          role="dialog"
        >
          <div className="doc-preview-modal-card">
            <header className="doc-preview-header">
              <div className="doc-preview-title-wrap">
                <div className="doc-icon-badge">
                  <Icon name="file-text" size={18} />
                </div>
                <div>
                  <h3>{activeDocPreview.name}</h3>
                  <small>
                    Ukuran: {activeDocPreview.size} · Diunggah:{' '}
                    {activeDocPreview.uploadedAt}
                  </small>
                </div>
              </div>
              <div className="doc-preview-header-actions">
                <button
                  className="btn-preview-download"
                  onClick={() => alert(`Mengunduh ${activeDocPreview.name}...`)}
                  type="button"
                >
                  <Icon name="download" size={14} />
                  <span>Unduh File</span>
                </button>
                <button
                  aria-label="Tutup preview dokumen"
                  className="btn-close-modal"
                  onClick={() => setActiveDocPreview(null)}
                  type="button"
                >
                  ✕
                </button>
              </div>
            </header>

            {/* Simulated Clean Document / PDF Viewer Page */}
            <div className="doc-preview-sheet-scroll">
              <div className="doc-a4-page">
                <div className="doc-paper-header">
                  <div className="doc-brand">
                    <h2>RELINK JOB PLATFORM</h2>
                    <p>
                      Berita Acara Serah Terima &amp; Verifikasi Hasil Pekerjaan
                      UMKM
                    </p>
                  </div>
                  <div className="doc-stamp-box">
                    <span>OFFICIAL RELINK SOP</span>
                    <small>STATUS: VERIFIED</small>
                  </div>
                </div>

                <div className="doc-meta-table">
                  <div className="doc-meta-row-item">
                    <span>ID Tugas:</span>
                    <strong>{task.id}</strong>
                  </div>
                  <div className="doc-meta-row-item">
                    <span>Kode Referensi:</span>
                    <strong>{task.code || '#878901'}</strong>
                  </div>
                  <div className="doc-meta-row-item">
                    <span>Nama Tugas:</span>
                    <strong>{task.title}</strong>
                  </div>
                  <div className="doc-meta-row-item">
                    <span>Kategori / Tier:</span>
                    <strong>
                      {task.category} ({task.tier || 'Tier 1'})
                    </strong>
                  </div>
                  <div className="doc-meta-row-item">
                    <span>Nama Mitra Pekerja:</span>
                    <strong>{task.workerName || 'Mitra Relink'}</strong>
                  </div>
                  <div className="doc-meta-row-item">
                    <span>Lokasi Verifikasi GPS:</span>
                    <strong>{gpsLocation}</strong>
                  </div>
                  <div className="doc-meta-row-item">
                    <span>Tanggal &amp; Waktu:</span>
                    <strong>{submitTimestamp}</strong>
                  </div>
                  <div className="doc-meta-row-item">
                    <span>Status Proteksi Dana:</span>
                    <strong>Rekening Escrow Relink Terlindungi 100%</strong>
                  </div>
                </div>

                <div className="doc-section-divider">
                  <h4>HASIL PENGECEKAN CHECKLIST KRITERIA SERAH TERIMA</h4>
                </div>

                <div className="doc-checklist-paper-list">
                  {checklistItems.map((c, i) => (
                    <div key={i} className="doc-checklist-paper-row">
                      <span className="doc-check-box">☑</span>
                      <span className="doc-check-label">{c.text}</span>
                      <span className="doc-check-status">[TERPENUHI]</span>
                    </div>
                  ))}
                </div>

                <div className="doc-section-divider">
                  <h4>CATATAN PELAKSANAAN DARI MITRA</h4>
                </div>
                <p className="doc-notes-paragraph">
                  &ldquo;{workerNote}&rdquo;
                </p>

                <div className="doc-paper-footer-signatures">
                  <div className="signature-col">
                    <p>Diserahkan oleh Mitra Pekerja:</p>
                    <div className="signature-draw-placeholder">
                      <span className="sign-pen-mark">
                        {task.workerName || 'Mitra Pekerja'}
                      </span>
                    </div>
                    <strong>{task.workerName || 'Mitra Pekerja'}</strong>
                    <small>Terverifikasi KTP &amp; Kamera GPS</small>
                  </div>
                  <div className="signature-col">
                    <p>Disetujui oleh Klien UMKM:</p>
                    <div className="signature-draw-placeholder">
                      <span className="sign-pen-mark sign-pen-mark--client">
                        Relink Escrow Verified
                      </span>
                    </div>
                    <strong>Pemilik Usaha / Klien UMKM</strong>
                    <small>Otorisasi Tanda Tangan Digital</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL POPUP ZOOM FOTO LENGKAP */}
      {/* ======================================================== */}
      {isPhotoZoomed && (
        <div
          aria-modal="true"
          className="image-zoom-modal-overlay"
          onClick={() => setIsPhotoZoomed(false)}
          role="dialog"
        >
          <div
            className="image-zoom-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Tutup zoom foto"
              className="btn-close-zoom"
              onClick={() => setIsPhotoZoomed(false)}
              type="button"
            >
              ✕
            </button>
            <img
              alt="Foto Bukti Zoom"
              className="zoomed-proof-image"
              src={proofPhoto}
            />
            <div className="zoom-caption-bar">
              <div>
                <strong>Foto Bukti Lapangan: {task.title}</strong>
                <p>
                  GPS: {gpsLocation} · Waktu: {submitTimestamp}
                </p>
              </div>
              <a
                className="btn-download-zoom"
                download={`Bukti_${task.id}.jpg`}
                href={proofPhoto}
              >
                <Icon name="download" size={15} /> Unduh Foto
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default TaskDetailView
