import { useState, useEffect } from 'react'
import relinkIcon from '../../assets/main-relink-1.svg'
import Icon from '../common/Icon.jsx'
import { supabase } from '../../lib/supabaseClient.js'
import {
  initialWorkerProfile,
  initialActiveTask,
  initialAvailableJobs,
  initialWalletData,
} from './workerMockData.js'

import WorkerBerandaView from './views/WorkerBerandaView.jsx'
import PeluangTugasView from './views/PeluangTugasView.jsx'
import TierReputasiView from './views/TierReputasiView.jsx'
import DompetMitraView from './views/DompetMitraView.jsx'
import KeamananSopView from './views/KeamananSopView.jsx'

import AmbilTugasModal from './modals/AmbilTugasModal.jsx'
import ProofHandoverModal from './modals/ProofHandoverModal.jsx'
import TarikDanaModal from './modals/TarikDanaModal.jsx'
import KuisAssessmentModal from './modals/KuisAssessmentModal.jsx'

import '../dashboard-perusahaan/ClientDashboard.css'
import './WorkerDashboard.css'

function WorkerDashboard() {
  const [currentMenu, setCurrentMenu] = useState('beranda') // 'beranda' | 'peluang' | 'jenjang' | 'dompet' | 'keamanan'
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionSuccessMsg, setActionSuccessMsg] = useState('')

  // State Profil Pekerja (dari Supabase / localStorage)
  const [workerProfile, setWorkerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('relink_user')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          ...initialWorkerProfile,
          id: parsed.id || initialWorkerProfile.id,
          name: parsed.full_name || parsed.name || initialWorkerProfile.name,
          email: parsed.email || initialWorkerProfile.email,
          tier: parsed.tier || initialWorkerProfile.tier,
        }
      }
      return initialWorkerProfile
    } catch {
      return initialWorkerProfile
    }
  })

  // State Tugas Aktif & Peluang Tugas
  const [activeTask, setActiveTask] = useState(initialActiveTask)
  const [availableJobs, setAvailableJobs] = useState(initialAvailableJobs)
  const [walletData, setWalletData] = useState(initialWalletData)
  const [isAvailableNow, setIsAvailableNow] = useState(true)

  // State Modals
  const [taskToAccept, setTaskToAccept] = useState(null)
  const [showProofModal, setShowProofModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Sinkronisasi data autentikasi dari Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {}
        setWorkerProfile((prev) => ({
          ...prev,
          id: session.user.id,
          email: session.user.email,
          name: meta.full_name || prev.name,
        }))
      }
    })
  }, [])

  // Handler Toast Notifikasi
  function showToast(msg) {
    setActionSuccessMsg(msg)
    setTimeout(() => setActionSuccessMsg(''), 5000)
  }

  // Handler: Ambil Tugas Baru
  function handleConfirmAcceptTask(task) {
    setIsProcessing(true)
    setTimeout(() => {
      setAvailableJobs((prev) => prev.filter((j) => j.id !== task.id))

      const newTask = {
        id: task.id,
        code: task.code,
        title: task.title,
        category: task.category,
        clientName: task.clientName,
        clientPhone: '0812-9876-5432',
        location: `${task.clientName}, Area Terdekat (${task.distance})`,
        distance: task.distance,
        grossHonor: task.grossHonor,
        commissionRate: 0.08,
        netHonor: task.netHonor,
        status: 'en_route',
        currentStepIndex: 1, // Menuju Lokasi
        isEnRouteChecked: true,
        isInProgressChecked: false,
        escrowRef: `PGW-${Math.floor(100000 + Math.random() * 900000)}`,
        deadline: 'Hari ini, maks. 3 jam',
        checklist: (task.checklist || []).map((c, i) => ({
          id: `c-acc-${i}`,
          text: typeof c === 'string' ? c : c.text,
          done: false,
        })),
        instructions: task.description,
      }

      setActiveTask(newTask)
      setWalletData((prev) => ({
        ...prev,
        heldEscrowBalance: prev.heldEscrowBalance + task.netHonor,
      }))

      setIsProcessing(false)
      setTaskToAccept(null)
      setCurrentMenu('beranda')
      showToast(`Tugas #${task.code} berhasil diambil! Dana honor Rp${task.grossHonor.toLocaleString('id-ID')} terkunci aman di Escrow Relink.`)
    }, 700)
  }

  // Handler: Check-in Tiba di Lokasi Toko
  function handleCheckInArrived() {
    if (!activeTask) return
    setActiveTask((prev) => ({
      ...prev,
      currentStepIndex: 2, // Pengerjaan Berlangsung
      isInProgressChecked: true,
    }))
    showToast(`Check-in berhasil! Anda telah tiba di ${activeTask.clientName}. Silakan mulai mengerjakan checklist.`)
  }

  // Handler: Serah Terima Digital & Pengajuan Pencairan Bukti
  function handleSubmitProof(completedChecklist) {
    setIsProcessing(true)
    setTimeout(() => {
      const earnedNet = activeTask.netHonor
      const gross = activeTask.grossHonor
      const fee = gross - earnedNet

      setWalletData((prev) => ({
        ...prev,
        availableBalance: prev.availableBalance + earnedNet,
        heldEscrowBalance: Math.max(0, prev.heldEscrowBalance - earnedNet),
        monthlyTotalEarnings: prev.monthlyTotalEarnings + earnedNet,
        transactions: [
          {
            id: `TRX-${Math.floor(100 + Math.random() * 900)}`,
            date: 'Hari ini',
            title: `Honor Tugas ${activeTask.code} — ${activeTask.title}`,
            client: activeTask.clientName,
            grossAmount: gross,
            fee: fee,
            netAmount: earnedNet,
            type: 'income',
            status: 'Selesai & Masuk Saldo',
          },
          ...prev.transactions,
        ],
      }))

      setWorkerProfile((prev) => ({
        ...prev,
        completedTasksCount: prev.completedTasksCount + 1,
      }))

      setActiveTask((prev) => ({
        ...prev,
        currentStepIndex: 4, // Dana Cair
        status: 'completed',
        checklist: completedChecklist,
      }))

      setIsProcessing(false)
      setShowProofModal(false)
      showToast(`Bukti kerja tugas ${activeTask.code} berhasil diserahkan! Dana honor Rp${earnedNet.toLocaleString('id-ID')} langsung cair ke Saldo Dompet Anda.`)
    }, 900)
  }

  // Handler: Tarik Dana Dompet
  function handleWithdrawConfirm({ method, accountNumber, accountHolder, amount }) {
    setIsProcessing(true)
    setTimeout(() => {
      setWalletData((prev) => ({
        ...prev,
        availableBalance: prev.availableBalance - amount,
        totalWithdrawn: prev.totalWithdrawn + amount,
        transactions: [
          {
            id: `WD-${Math.floor(100 + Math.random() * 900)}`,
            date: 'Hari ini',
            title: `Penarikan Saldo ke ${method.toUpperCase()} (${accountNumber})`,
            client: `Atas nama: ${accountHolder}`,
            grossAmount: amount,
            fee: 0,
            netAmount: amount,
            type: 'payout',
            status: 'Berhasil Ditransfer',
          },
          ...prev.transactions,
        ],
      }))

      setIsProcessing(false)
      setShowWithdrawModal(false)
      showToast(`Penarikan dana sebesar Rp${amount.toLocaleString('id-ID')} ke ${method.toUpperCase()} berhasil diproses!`)
    }, 800)
  }

  // Handler: Kuis Skenario / Micro-Assessment Selesai
  function handleCompleteQuiz() {
    setWorkerProfile((prev) => ({
      ...prev,
      isRisingStar: true,
      trustScore: 100,
      verifiedStatus: {
        ...prev.verifiedStatus,
        assessment: true,
      },
    }))
    showToast('Lolos Micro-Assessment 100%! Lencana Rising Star aktif di radar UMKM sekitar.')
  }

  // Handler: Trigger SOS Darurat
  function handleTriggerSos() {
    showToast('SINYAL DARURAT DIAKTIFKAN: Titik koordinat GPS Anda telah dibagikan ke Tim Siaga Relink.')
  }

  // Handler: Keluar Akun (Logout)
  async function handleLogout() {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('Logout error', e)
    }
    localStorage.removeItem('relink_user')
    window.location.href = '/masuk?peran=pekerja'
  }

  return (
    <div className="admin-clean-app">
      {/* 1. SIDEBAR NAVY DENGAN PENGELOMPOKAN MENU (KONSISTEN DENGAN DASHBOARD PERUSAHAAN) */}
      <aside
        className={`admin-navy-sidebar${isSidebarExpanded ? ' admin-navy-sidebar--expanded' : ' admin-navy-sidebar--collapsed'}`}
      >
        <button
          aria-label={isSidebarExpanded ? 'Perkecil sidebar' : 'Perbesar sidebar'}
          className="sidebar-collapse-edge-btn"
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          title={isSidebarExpanded ? 'Perkecil Sidebar' : 'Perbesar Sidebar'}
          type="button"
        >
          <Icon name={isSidebarExpanded ? 'chevron-left' : 'chevron-right'} size={14} />
        </button>

        {/* Brand Logo Header */}
        <div className="sidebar-brand-wrapper">
          <button
            aria-label="Relink Mitra, kembali ke beranda dashboard"
            className="sidebar-brand-link"
            onClick={() => setCurrentMenu('beranda')}
            type="button"
          >
            <img alt="Relink Logo" className="sidebar-brand-icon" src={relinkIcon} />
            {isSidebarExpanded && <span className="sidebar-brand-name">Relink Mitra</span>}
          </button>
        </div>

        {/* Menu Navigasi Sidebar */}
        <nav aria-label="Navigasi Menu Pekerja" className="sidebar-nav-scroll">
          <div className="sidebar-group">
            {isSidebarExpanded && <span className="group-label">Menu Utama</span>}

            <button
              className={`sidebar-nav-item${currentMenu === 'beranda' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('beranda')}
              title="Dashboard Beranda Mitra"
              type="button"
            >
              <Icon name="home" size={18} />
              {isSidebarExpanded && <span>Beranda</span>}
            </button>

            <button
              className={`sidebar-nav-item${currentMenu === 'peluang' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('peluang')}
              title="Radar & Bursa Peluang Tugas"
              type="button"
            >
              <Icon name="briefcase" size={18} />
              {isSidebarExpanded && <span>Peluang Tugas</span>}
              {isSidebarExpanded && <span className="nav-counter-pill">{availableJobs.length}</span>}
            </button>

            <button
              className={`sidebar-nav-item${currentMenu === 'jenjang' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('jenjang')}
              title="Jenjang Reputasi & Verifikasi"
              type="button"
            >
              <Icon name="star" size={18} />
              {isSidebarExpanded && <span>Jenjang &amp; Reputasi</span>}
              {isSidebarExpanded && (
                <span className="nav-counter-pill nav-counter-pill--escrow">Tier 1</span>
              )}
            </button>
          </div>

          <div className="sidebar-group">
            {isSidebarExpanded && <span className="group-label">Layanan</span>}

            <button
              className={`sidebar-nav-item${currentMenu === 'dompet' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('dompet')}
              title="Dompet & Penarikan Saldo"
              type="button"
            >
              <Icon name="wallet" size={18} />
              {isSidebarExpanded && <span>Dompet Mitra</span>}
            </button>

            <button
              className={`sidebar-nav-item${currentMenu === 'keamanan' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('keamanan')}
              title="Pusat Keamanan, SOP & Siaga SOS"
              type="button"
            >
              <Icon name="shield" size={18} />
              {isSidebarExpanded && <span>Keamanan &amp; SOP</span>}
            </button>
          </div>

          <div className="sidebar-group sidebar-group--bottom">
            {isSidebarExpanded && <span className="group-label">Pengaturan</span>}

            <button
              className="sidebar-nav-item"
              onClick={() => { window.location.href = '/masuk?peran=umkm' }}
              title="Masuk ke Portal Perusahaan / UMKM"
              type="button"
            >
              <Icon name="users" size={18} />
              {isSidebarExpanded && <span>Portal UMKM</span>}
            </button>

            <button
              className="sidebar-nav-item sidebar-nav-item--logout"
              onClick={handleLogout}
              title="Keluar dari Akun"
              type="button"
            >
              <Icon name="close" size={18} />
              {isSidebarExpanded && <span>Keluar Akun</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* 2. KANVAS UTAMA DENGAN TOPBAR NAVY MENYATU */}
      <div className="admin-body-canvas">
        {/* Sticky Topbar */}
        <header className="admin-navy-topbar">
          <div className="topbar-brand-mobile">
            <button
              aria-label="Relink Mitra, kembali ke beranda dashboard"
              className="topbar-brand-link"
              onClick={() => setCurrentMenu('beranda')}
              type="button"
            >
              <img alt="Relink Logo" className="topbar-brand-icon" src={relinkIcon} />
              <span className="topbar-brand-name">Relink Mitra</span>
            </button>
          </div>

          {/* Kotak Pencarian Global */}
          <div className="topbar-search">
            <Icon name="search" size={16} />
            <input
              aria-label="Cari tugas atau kategori"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas, kategori keahlian, atau toko sekitar..."
              type="text"
              value={searchQuery}
            />
            <span className="search-shortcut-badge">⌘ K</span>
          </div>

          <div className="topbar-actions">
            {/* Toggle Status Siap Kerja Instan di Topbar */}
            <button
              className={`topbar-radar-toggle-pill ${isAvailableNow ? 'topbar-radar-toggle-pill--active' : ''}`}
              onClick={() => setIsAvailableNow(!isAvailableNow)}
              title={isAvailableNow ? 'Radar Aktif: Menerima Order Instan' : 'Radar Nonaktif: Istirahat'}
              type="button"
            >
              <span className={`radar-indicator-dot ${isAvailableNow ? 'radar-indicator-dot--active' : ''}`} />
              <span>{isAvailableNow ? 'Siap Kerja Instan' : 'Offline'}</span>
            </button>

            <button
              aria-label="Notifikasi"
              className="topbar-action-icon"
              type="button"
            >
              <Icon name="bell" size={18} />
              <span className="topbar-notif-dot" />
            </button>

            <button
              aria-label="Pusat Keamanan & SOP"
              className={`topbar-action-icon topbar-action-icon--help${currentMenu === 'keamanan' ? ' topbar-action-icon--active' : ''}`}
              onClick={() => setCurrentMenu('keamanan')}
              title="Pusat Keamanan & SOP"
              type="button"
            >
              <Icon name="shield" size={18} />
            </button>

            {/* Profil User Capsule Identik dengan Dashboard Perusahaan */}
            <div className="topbar-user-wrapper">
              <button
                aria-expanded={showUserDropdown}
                aria-label="Profil dan Pengaturan Akun Mitra"
                className="topbar-user-capsule"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                type="button"
              >
                <div className="topbar-avatar-circle">
                  {(workerProfile.name || 'Mitra').slice(0, 2).toUpperCase()}
                </div>
                <div className="topbar-user-info">
                  <strong>{workerProfile.name}</strong>
                  <small>{workerProfile.tierLabel}</small>
                </div>
                <Icon name="arrow" size={12} />
              </button>

              {showUserDropdown && (
                <div className="topbar-user-dropdown">
                  <div className="dropdown-user-header">
                    <strong>{workerProfile.name}</strong>
                    <small>{workerProfile.email}</small>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowUserDropdown(false)
                      window.location.href = '/masuk?peran=umkm'
                    }}
                    type="button"
                  >
                    <Icon name="users" size={16} />
                    <span>Masuk ke Portal UMKM</span>
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowUserDropdown(false)
                      setCurrentMenu('jenjang')
                    }}
                    type="button"
                  >
                    <Icon name="star" size={16} />
                    <span>Jenjang &amp; Verifikasi</span>
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowUserDropdown(false)
                      setCurrentMenu('dompet')
                    }}
                    type="button"
                  >
                    <Icon name="wallet" size={16} />
                    <span>Dompet &amp; Saldo</span>
                  </button>
                  <button
                    className="dropdown-item dropdown-item--logout"
                    onClick={handleLogout}
                    type="button"
                  >
                    <Icon name="close" size={16} />
                    <span>Keluar Akun (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Notifikasi Toast */}
        {actionSuccessMsg && (
          <div aria-live="polite" className="admin-clean-toast">
            <Icon name="check" size={16} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* MODULAR VIEWS ROUTING */}
        {currentMenu === 'beranda' && (
          <WorkerBerandaView
            activeTask={activeTask}
            availableJobs={availableJobs}
            isAvailableNow={isAvailableNow}
            onCheckInArrived={handleCheckInArrived}
            onOpenAcceptModal={(job) => setTaskToAccept(job)}
            onOpenProofModal={() => setShowProofModal(true)}
            onOpenWithdrawModal={() => setShowWithdrawModal(true)}
            onTriggerSos={handleTriggerSos}
            setCurrentMenu={setCurrentMenu}
            setIsAvailableNow={setIsAvailableNow}
            walletData={walletData}
            workerProfile={workerProfile}
          />
        )}

        {currentMenu === 'peluang' && (
          <PeluangTugasView
            availableJobs={availableJobs}
            onOpenAcceptModal={(job) => setTaskToAccept(job)}
            searchQueryGlobal={searchQuery}
          />
        )}

        {currentMenu === 'jenjang' && (
          <TierReputasiView
            onOpenQuizModal={() => setShowQuizModal(true)}
            workerProfile={workerProfile}
          />
        )}

        {currentMenu === 'dompet' && (
          <DompetMitraView
            onOpenWithdrawModal={() => setShowWithdrawModal(true)}
            walletData={walletData}
          />
        )}

        {currentMenu === 'keamanan' && (
          <KeamananSopView onTriggerSos={handleTriggerSos} />
        )}
      </div>

      {/* 3. MOBILE & TABLET BOTTOM APP NAVIGATION BAR */}
      <nav aria-label="Navigasi Menu Pekerja" className="mobile-bottom-nav">
        <button
          className={`bottom-nav-item${currentMenu === 'beranda' ? ' bottom-nav-item--active' : ''}`}
          onClick={() => {
            setCurrentMenu('beranda')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          type="button"
        >
          <Icon name="home" size={20} />
          <span>Beranda</span>
        </button>

        <button
          className={`bottom-nav-item${currentMenu === 'peluang' ? ' bottom-nav-item--active' : ''}`}
          onClick={() => {
            setCurrentMenu('peluang')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          type="button"
        >
          <div className="bottom-nav-icon-wrap">
            <Icon name="briefcase" size={20} />
            {availableJobs.length > 0 && <span className="bottom-nav-badge">{availableJobs.length}</span>}
          </div>
          <span>Peluang</span>
        </button>

        <button
          className={`bottom-nav-item${currentMenu === 'jenjang' ? ' bottom-nav-item--active' : ''}`}
          onClick={() => {
            setCurrentMenu('jenjang')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          type="button"
        >
          <Icon name="star" size={20} />
          <span>Jenjang</span>
        </button>

        <button
          className={`bottom-nav-item${currentMenu === 'dompet' ? ' bottom-nav-item--active' : ''}`}
          onClick={() => {
            setCurrentMenu('dompet')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          type="button"
        >
          <Icon name="wallet" size={20} />
          <span>Dompet</span>
        </button>

        <button
          className={`bottom-nav-item${currentMenu === 'keamanan' ? ' bottom-nav-item--active' : ''}`}
          onClick={() => {
            setCurrentMenu('keamanan')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          type="button"
        >
          <Icon name="shield" size={20} />
          <span>Keamanan</span>
        </button>
      </nav>

      {/* MODALS */}
      {taskToAccept && (
        <AmbilTugasModal
          isProcessing={isProcessing}
          onClose={() => setTaskToAccept(null)}
          onConfirm={handleConfirmAcceptTask}
          task={taskToAccept}
        />
      )}

      {showProofModal && activeTask && (
        <ProofHandoverModal
          activeTask={activeTask}
          isProcessing={isProcessing}
          onClose={() => setShowProofModal(false)}
          onSubmitProof={handleSubmitProof}
        />
      )}

      {showWithdrawModal && (
        <TarikDanaModal
          availableBalance={walletData.availableBalance}
          isProcessing={isProcessing}
          onClose={() => setShowWithdrawModal(false)}
          onConfirm={handleWithdrawConfirm}
        />
      )}

      {showQuizModal && (
        <KuisAssessmentModal
          onClose={() => setShowQuizModal(false)}
          onCompleteAssessment={handleCompleteQuiz}
        />
      )}
    </div>
  )
}

export default WorkerDashboard
