import { useState } from 'react'
import Icon from '../../common/Icon.jsx'

function KuisAssessmentModal({ onClose, onCompleteAssessment }) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [isFinished, setIsFinished] = useState(false)

  const questions = [
    {
      id: 1,
      scenario: 'Studi Kasus 1: Pengecekan Mesin Kasir Toko',
      question:
        'Saat tiba di toko klien, printer thermal kasir tidak mengeluarkan kertas struk. Apa langkah pertama yang benar sesuai SOP Relink?',
      options: [
        { id: 'a', text: 'Langsung membongkar baut rangka printer tanpa memeriksa sumber listrik.' },
        { id: 'b', text: 'Meminta izin pemilik toko, mencabut kabel power, dan memeriksa apakah rol penarik tersangkut atau habis kertas struk.', correct: true },
        { id: 'c', text: 'Menghubungi customer service pabrik printer dan meninggalkan lokasi kerja.' },
      ],
    },
    {
      id: 2,
      scenario: 'Studi Kasus 2: Komunikasi & Checklist Acceptance Criteria',
      question:
        'Pemilik usaha meminta pekerjaan tambahan di luar checklist yang disepakati saat pemesanan. Bagaimana sikap terbaik Mitra Relink?',
      options: [
        { id: 'a', text: 'Menerima dengan sopan, jelaskan bahwa checklist utama akan diselesaikan dulu, lalu arahkan klien untuk menambah tugas mikro baru di aplikasi agar dana terlindungi escrow.', correct: true },
        { id: 'b', text: 'Menolak secara kasar dan langsung membatalkan pekerjaan seketika.' },
        { id: 'c', text: 'Mengerjakan seluruh permintaan tanpa kompensasi dan tanpa perlindungan garansi.' },
      ],
    },
    {
      id: 3,
      scenario: 'Studi Kasus 3: Keselamatan Kerja & Prosedur Serah Terima',
      question:
        'Sebelum meminta klien menandatangani formulir digital serah terima hasil kerja, apa yang wajib dipastikan oleh Mitra?',
      options: [
        { id: 'a', text: 'Area kerja telah rapi, fungsi alat telah diuji coba bersama klien, dan checklist telah diverifikasi.', correct: true },
        { id: 'b', text: 'Cukup mengirim pesan WhatsApp tanpa perlu menunjukkan hasil fisik kepada klien.' },
        { id: 'c', text: 'Meminta uang tunai langsung dari kasir toko sebelum bukti diunggah.' },
      ],
    },
  ]

  const currentQ = questions[currentQuestionIdx]
  const isSelected = selectedAnswers[currentQ.id] !== undefined

  function handleSelectOption(optionId) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }))
  }

  function handleNext() {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1)
    } else {
      setIsFinished(true)
    }
  }

  return (
    <div aria-modal="true" className="admin-clean-modal-backdrop" role="dialog">
      <div className="admin-clean-modal-box worker-quiz-modal">
        <div className="modal-top-bar">
          <div className="modal-title-wrap">
            <div className="metric-icon-bubble metric-icon-bubble--mint">
              <Icon name="star" size={18} />
            </div>
            <div>
              <h3>In-App Micro-Assessment Keahlian</h3>
              <small>Uji skenario SOP &amp; Keselamatan Kerja untuk membuka lencana Rising Star</small>
            </div>
          </div>
          <button
            aria-label="Tutup modal"
            className="modal-close-btn"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="modal-body-scroll">
          {!isFinished ? (
            <div className="quiz-container">
              <div className="quiz-progress-bar-wrap">
                <div
                  className="quiz-progress-bar-fill"
                  style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                />
              </div>
              <div className="quiz-header-counter">
                <span className="quiz-counter-text">
                  Pertanyaan {currentQuestionIdx + 1} dari {questions.length}
                </span>
                <span className="quiz-timer-pill">
                  <Icon name="clock" size={12} /> Timer Aktif
                </span>
              </div>

              <div className="quiz-question-card">
                <span className="quiz-scenario-tag">{currentQ.scenario}</span>
                <h4 className="quiz-question-title">{currentQ.question}</h4>

                <div className="quiz-options-list">
                  {currentQ.options.map((opt) => (
                    <button
                      key={opt.id}
                      className={`quiz-option-btn ${selectedAnswers[currentQ.id] === opt.id ? 'quiz-option-btn--selected' : ''}`}
                      onClick={() => handleSelectOption(opt.id)}
                      type="button"
                    >
                      <span className="quiz-option-bullet">{opt.id.toUpperCase()}</span>
                      <span className="quiz-option-label">{opt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="quiz-success-result">
              <div className="quiz-success-icon-wrap">
                <Icon name="check-circle" size={48} className="text-mint" />
              </div>
              <h3>Luar Biasa! Skor Penilaian 100% Sempurna</h3>
              <p>
                Anda telah memahami standar SOP keahlian dan keselamatan kerja Relink dengan sangat baik. Lencana <strong>Rising Star</strong> Anda kini aktif di radar rekomendasi UMKM sekitar!
              </p>
              <div className="quiz-benefits-box">
                <div className="benefit-item">
                  <Icon name="shield" size={16} className="text-mint" />
                  <span>Prioritas Order Pertama untuk Tugas Ringan</span>
                </div>
                <div className="benefit-item">
                  <Icon name="bolt" size={16} className="text-pink" />
                  <span>Pin Radar Berdenyut &quot;Siap Kerja Instan&quot;</span>
                </div>
                <div className="benefit-item">
                  <Icon name="star" size={16} className="text-amber" />
                  <span>Progres Naik ke Tier 2 Bertambah +20%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer-actions">
          {!isFinished ? (
            <>
              <button className="btn-modal-cancel" onClick={onClose} type="button">
                Batal
              </button>
              <button
                className="btn-modal-confirm"
                disabled={!isSelected}
                onClick={handleNext}
                type="button"
              >
                <span>{currentQuestionIdx < questions.length - 1 ? 'Lanjut Soal Berikutnya' : 'Selesai & Lihat Skor'}</span>
                <Icon name="arrow" size={14} />
              </button>
            </>
          ) : (
            <button
              className="btn-modal-confirm btn-modal-confirm--accept"
              onClick={() => {
                onCompleteAssessment()
                onClose()
              }}
              style={{ width: '100%' }}
              type="button"
            >
              <Icon name="check" size={16} />
              <span>Simpan Lencana Terverifikasi ke Profil</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default KuisAssessmentModal
