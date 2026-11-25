import { useState } from 'react'
import Icon from './Icon.jsx'
import './OnboardingScreen.css'

const onboardingByRole = {
  umkm: [
    {
      icon: 'briefcase',
      title: 'Posting tugas usaha',
      description:
        'Jelaskan pekerjaan, anggaran, kriteria hasil, dan tier mitra yang dibutuhkan.',
    },
    {
      icon: 'users',
      title: 'Temukan mitra sekitar',
      description:
        'Gunakan Radar Mitra untuk melihat pekerja lokal dan memilih orang yang sesuai.',
    },
    {
      icon: 'check',
      title: 'Pantau progres tugas',
      description:
        'Kelola tugas lewat Kanban, periksa checklist, dan tinjau bukti serah terima.',
    },
    {
      icon: 'wallet',
      title: 'Kelola pembayaran',
      description:
        'Pantau dana escrow dan riwayat transaksi dari menu Dana Escrow.',
    },
    {
      icon: 'chat',
      title: 'Lihat ringkasan dan bantuan',
      description:
        'Pantau aktivitas dari Beranda, cari panduan di Pusat Bantuan, dan perbarui profil usaha melalui Pengaturan.',
    },
  ],
  pekerja: [
    {
      icon: 'users',
      title: 'Lengkapi profil mitra',
      description:
        'Tambahkan keahlian, area kerja, dan portofolio agar UMKM mengenal kemampuanmu.',
    },
    {
      icon: 'search',
      title: 'Cari peluang tugas',
      description:
        'Jelajahi tugas di sekitar, cek honor dan persyaratan, lalu ambil yang cocok.',
    },
    {
      icon: 'check',
      title: 'Kerjakan dan serahkan',
      description:
        'Ikuti checklist SOP, perbarui progres, lalu kirim bukti pekerjaan untuk ditinjau.',
    },
    {
      icon: 'wallet',
      title: 'Lihat reputasi dan saldo',
      description:
        'Pantau perkembangan tier, rating, dana escrow, serta transaksi di dashboard.',
    },
    {
      icon: 'shield',
      title: 'Chat, SOP, dan bantuan',
      description:
        'Hubungi klien terkait tugas, pelajari panduan keselamatan kerja, atau kontak tim bantuan Relink.',
    },
  ],
}

function OnboardingScreen({ role, onFinish }) {
  const [step, setStep] = useState(0)
  const features = onboardingByRole[role === 'mitra' || role === 'pekerja' ? 'pekerja' : 'umkm']
  const currentFeature = features[step]
  const isLastStep = step === features.length - 1

  return (
    <div className="onboarding-backdrop">
      <section
        aria-labelledby="onboarding-title"
        aria-modal="true"
        className="onboarding-dialog"
        role="dialog"
      >
        <button
          aria-label="Lewati pengenalan"
          className="onboarding-skip"
          onClick={onFinish}
          type="button"
        >
          Lewati
        </button>

        <span className="onboarding-eyebrow">SELAMAT DATANG DI RELINK</span>
        <h1 id="onboarding-title">Kenali fitur utama</h1>
        <p className="onboarding-intro">
          Ikuti pengenalan singkat agar kamu tahu cara mulai menggunakan dashboard.
        </p>

        <div aria-live="polite" className="onboarding-feature">
          <span className="onboarding-feature__icon">
            <Icon name={currentFeature.icon} size={26} />
          </span>
          <span className="onboarding-feature__step">
            FITUR {String(step + 1).padStart(2, '0')} DARI {String(features.length).padStart(2, '0')}
          </span>
          <h2>{currentFeature.title}</h2>
          <p>{currentFeature.description}</p>
        </div>

        <div aria-label={`Langkah ${step + 1} dari ${features.length}`} className="onboarding-progress">
          {features.map((feature, index) => (
            <span
              aria-current={index === step ? 'step' : undefined}
              className={index === step ? 'is-active' : ''}
              key={feature.title}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          {step > 0 && (
            <button
              className="onboarding-button onboarding-button--secondary"
              onClick={() => setStep((value) => value - 1)}
              type="button"
            >
              Kembali
            </button>
          )}
          <button
            className="onboarding-button onboarding-button--primary"
            onClick={() => (isLastStep ? onFinish() : setStep((value) => value + 1))}
            type="button"
          >
            {isLastStep ? 'Mulai gunakan Relink' : 'Lanjut'}
            {!isLastStep && <Icon name="chevron-right" size={16} />}
          </button>
        </div>
      </section>
    </div>
  )
}

export default OnboardingScreen
