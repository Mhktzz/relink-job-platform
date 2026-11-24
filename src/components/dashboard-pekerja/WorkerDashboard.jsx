import { useState, useEffect } from 'react'
import relinkIcon from '../../assets/main-relink-1.svg'
import relinkDarkLogo from '../../assets/main-relink-dark.svg'
import Icon from '../common/Icon.jsx'
import { supabase } from '../../lib/supabaseClient.js'
import {
  fetchTasksFromDb,
  isTaskActive,
  getDeletedTaskIds,
} from '../../lib/databaseService.js'
import {
  initialWorkerProfile,
  initialActiveTask,
  initialAvailableJobs,
  initialWalletData,
  initialActionItems,
  initialUpcomingSchedule,
} from './workerMockData.js'

import WorkerBerandaView from './views/WorkerBerandaView.jsx'
import PekerjaanSayaView from './views/PekerjaanSayaView.jsx'
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
  const [currentMenu, setCurrentMenu] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const menuFromUrl = urlParams.get('menu')
      if (menuFromUrl) return menuFromUrl
      const saved = sessionStorage.getItem('relink_worker_menu')
      return saved || 'beranda'
    } catch {
      return 'beranda'
    }
  }) // 'beranda' | 'peluang' | 'jenjang' | 'dompet' | 'keamanan'
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionSuccessMsg, setActionSuccessMsg] = useState('')

  // Sinkronisasi menu aktif ke sessionStorage & URL query agar saat refresh tetap di halaman tersebut
  useEffect(() => {
    try {
      sessionStorage.setItem('relink_worker_menu', currentMenu)
      const url = new URL(window.location)
      if (url.searchParams.get('menu') !== currentMenu) {
        url.searchParams.set('menu', currentMenu)
        window.history.replaceState({}, '', url)
      }
    } catch {}
  }, [currentMenu])

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
  const actionItems = initialActionItems
  const upcomingSchedule = initialUpcomingSchedule
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

  // Helper: Mapping tugas postingan perusahaan/admin ke format peluang tugas pekerja
  function mapTaskToAvailableJob(task) {
    const budget = Number(task.budget) || 50000
    const netHonor = Math.round(budget * 0.92) // Potongan komisi platform 8% transparan
    const rawId = task.id || task.task_code || `TSK-${Math.floor(100 + Math.random() * 900)}`
    const code = task.code || (String(rawId).startsWith('#') ? rawId : `#${rawId}`)

    return {
      id: rawId,
      code: code,
      title: task.title || 'Tugas Baru UMKM Sekitar',
      category: task.category || 'Operasional Toko',
      tag: task.tier === 'Tier 2' ? 'Buka di Tier 2' : 'Instan (Tier 1)',
      locked: task.tier === 'Tier 2' || task.tier === 'Tier 3',
      clientName: task.business_name || task.clientName || 'Toko UMKM Terdaftar',
      distance: task.distance || '0.9 km',
      duration: task.duration || 'Sekitar 2–3 jam',
      grossHonor: budget,
      netHonor: netHonor,
      tierRequired: task.tier || 'Tier 1',
      priority: task.priority || 'Normal',
      urgent: task.priority === 'Urgent' || task.priority === 'High',
      checklistSummary: `${(task.acceptanceChecklist || task.checklist || []).length} butir SOP checklist`,
      description: task.description || 'Pekerjaan mikro terverifikasi escrow dari UMKM terdaftar.',
      checklist: (task.acceptanceChecklist || task.checklist || []).map((c, i) => ({
        id: typeof c === 'object' && c.id ? c.id : `chk-${i}`,
        text: typeof c === 'object' ? c.text : String(c),
      })),
    }
  }

  // Sinkronisasi tugas dari Database Supabase & LocalStorage (relink_tasks)
  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      try {
        const deletedIds = getDeletedTaskIds()
        const dbTasks = await fetchTasksFromDb()

        let localTasks = []
        try {
          const saved = localStorage.getItem('relink_tasks')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed)) {
              localTasks = parsed.filter((t) => isTaskActive(t, deletedIds))
            }
          }
        } catch {}

        const combinedMap = new Map()

        // 1. Masukkan tugas dari postingan perusahaan (local storage & database)
        ;[...localTasks, ...dbTasks].forEach((t) => {
          if (!t) return
          const tid = String(t.id || t.task_code || '')
          if (
            tid &&
            !combinedMap.has(tid) &&
            isTaskActive(t, deletedIds) &&
            t.status !== 'completed' &&
            t.column !== 'overdue' &&
            tid !== activeTask?.id
          ) {
            combinedMap.set(tid, mapTaskToAvailableJob(t))
          }
        })

        // 2. Tambahkan tugas default jika belum diambil
        initialAvailableJobs.forEach((job) => {
          if (!combinedMap.has(job.id) && job.id !== activeTask?.id) {
            combinedMap.set(job.id, job)
          }
        })

        if (isMounted) {
          setAvailableJobs(Array.from(combinedMap.values()))
        }

        // Deteksi persetujuan review dari klien jika tugas aktif sedang dalam tahap review (step 3)
        if (activeTask && activeTask.currentStepIndex === 3) {
          const matched = [...localTasks, ...dbTasks].find(
            (t) =>
              t &&
              (t.id === activeTask.id ||
                t.task_code === activeTask.id ||
                t.code === activeTask.code ||
                t.id === activeTask.code)
          )
          if (
            matched &&
            (matched.status === 'completed' ||
              matched.column === 'overdue' ||
              matched.statusBadge === 'Completed')
          ) {
            const earnedNet = activeTask.netHonor || 180000
            const gross = activeTask.grossHonor || 200000
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
            }))

            showToast(`Hasil kerja disetujui klien! Dana honor Rp${earnedNet.toLocaleString('id-ID')} telah cair ke Saldo Dompet.`)
          }
        }
      } catch (e) {
        console.warn('Gagal sinkron tugas pekerja:', e)
      }
    }

    loadTasks()

    // Dengarkan event perubahan tugas dari dashboard perusahaan
    function handleSyncEvent() {
      loadTasks()
    }

    window.addEventListener('storage', handleSyncEvent)
    window.addEventListener('relink_tasks_updated', handleSyncEvent)

    // Dengarkan event realtime Supabase postgres_changes
    const channel = supabase
      .channel('relink_worker_task_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadTasks()
      })
      .subscribe()

    return () => {
      isMounted = false
      window.removeEventListener('storage', handleSyncEvent)
      window.removeEventListener('relink_tasks_updated', handleSyncEvent)
      supabase.removeChannel(channel)
    }
  }, [activeTask])

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

      // Perbarui status tugas di relink_tasks agar tersinkron ke dashboard perusahaan
      try {
        const saved = localStorage.getItem('relink_tasks')
        if (saved) {
          const parsed = JSON.parse(saved)
          const updated = parsed.map((item) => {
            if (item.id === task.id || item.task_code === task.id || item.code === task.code) {
              return {
                ...item,
                workerName: workerProfile.name || 'Dimas Prasetyo',
                status: 'in_progress',
                statusBadge: 'In Progress',
                column: 'current',
              }
            }
            return item
          })
          localStorage.setItem('relink_tasks', JSON.stringify(updated))
          window.dispatchEvent(new CustomEvent('relink_tasks_updated', { detail: updated }))
        }
      } catch (e) {
        console.warn('Gagal update task accepted:', e)
      }

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
  // Handler: Serah Terima Digital & Pengajuan Pencairan Bukti (Ajukan ke Review)
  function handleSubmitProof(completedChecklist, workNotes, proofData) {
    setIsProcessing(true)
    setTimeout(() => {
      const updatedProof = proofData || {
        note: workNotes || 'Pekerjaan selesai rapi dan sudah diperiksa bersama UMKM.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        gpsLocation: '-6.1754, 106.8272 (Verified)',
      }

      setActiveTask((prev) => ({
        ...prev,
        currentStepIndex: 3, // Tahap 4: Review Bukti (Menunggu Review Klien)
        status: 'review',
        statusBadge: 'Proof Review',
        proofSubmitted: true,
        proofData: updatedProof,
        checklist: completedChecklist,
      }))

      // Perbarui status tugas di relink_tasks agar otomatis pindah ke kolom Tunggu Review pada dashboard perusahaan
      try {
        const saved = localStorage.getItem('relink_tasks')
        if (saved) {
          const parsed = JSON.parse(saved)
          const updated = parsed.map((item) => {
            if (
              item.id === activeTask.id ||
              item.task_code === activeTask.id ||
              item.code === activeTask.code ||
              item.id === activeTask.code
            ) {
              return {
                ...item,
                status: 'review',
                statusBadge: 'Proof Review',
                column: 'due_week',
                proofSubmitted: true,
                proofData: updatedProof,
              }
            }
            return item
          })
          localStorage.setItem('relink_tasks', JSON.stringify(updated))
          window.dispatchEvent(new CustomEvent('relink_tasks_updated', { detail: updated }))
        }
      } catch (e) {
        console.warn('Gagal sinkron pengajuan review:', e)
      }

      setIsProcessing(false)
      setShowProofModal(false)
      showToast(`Bukti kerja tugas #${activeTask.code} berhasil dikirim! Tugas telah diajukan ke review klien.`)
    }, 800)
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
    <div className="admin-clean-app worker-dashboard">
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
              className={`sidebar-nav-item${currentMenu === 'pekerjaan-saya' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('pekerjaan-saya')}
              title="Pekerjaan Saya yang Sedang Berjalan"
              type="button"
            >
              <Icon name="briefcase" size={18} />
              {isSidebarExpanded && <span>Pekerjaan Saya</span>}
              {isSidebarExpanded && activeTask && (
                <span className="nav-counter-pill nav-counter-pill--escrow">1</span>
              )}
            </button>

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
              className="sidebar-nav-item"
              onClick={() => {
                if (activeTask?.clientPhone) {
                  window.open(
                    `https://wa.me/${activeTask.clientPhone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(activeTask.clientName)},%20saya%20${encodeURIComponent(workerProfile.name)}%20dari%20Relink%20terkait%20tugas%20${encodeURIComponent(activeTask.title)}.`,
                    '_blank'
                  )
                } else {
                  showToast('Belum ada chat aktif dari pemesan tugas.')
                }
              }}
              title="Chat dengan Klien & Tim Relink"
              type="button"
            >
              <Icon name="chat" size={18} />
              {isSidebarExpanded && <span>Chat</span>}
              {isSidebarExpanded && <span className="nav-counter-pill">2</span>}
            </button>

            <button
              className={`sidebar-nav-item${currentMenu === 'keamanan' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('keamanan')}
              title="Pusat Keamanan, SOP & Siaga SOS"
              type="button"
            >
              <Icon name="shield" size={18} />
              {isSidebarExpanded && <span>Keamanan &amp; SOS</span>}
            </button>
          </div>

          <div className="sidebar-group sidebar-group--bottom">
            {isSidebarExpanded && <span className="group-label">Pengaturan</span>}

            <button
              className="sidebar-nav-item sidebar-nav-item--logout"
              onClick={handleLogout}
              title="Keluar dari Akun"
              type="button"
            >
              <Icon name="logout" size={18} />
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
              <img alt="Relink" className="topbar-brand-icon" src={relinkIcon} />
              <span className="topbar-brand-name">Mitra</span>
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
            {/* Toggle Status Online / Offline di Topbar */}
            <button
              className={`topbar-radar-toggle-pill ${isAvailableNow ? 'topbar-radar-toggle-pill--active' : ''}`}
              aria-label={isAvailableNow ? 'Ubah status ke Offline' : 'Ubah status ke Online'}
              onClick={() => setIsAvailableNow(!isAvailableNow)}
              title={isAvailableNow ? 'Status: Online' : 'Status: Offline'}
              type="button"
            >
              <span>{isAvailableNow ? 'Online' : 'Offline'}</span>
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
                <Icon
                  className={`topbar-chevron ${showUserDropdown ? 'topbar-chevron--open' : ''}`}
                  name="chevron-down"
                  size={14}
                />
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
                    <Icon name="logout" size={16} />
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
            actionItems={actionItems}
            activeTask={activeTask}
            availableJobs={availableJobs}
            isAvailableNow={isAvailableNow}
            onCheckInArrived={handleCheckInArrived}
            onOpenAcceptModal={(job) => setTaskToAccept(job)}
            onOpenProofModal={() => setShowProofModal(true)}
            onOpenQuizModal={() => setShowQuizModal(true)}
            onOpenWithdrawModal={() => setShowWithdrawModal(true)}
            onTriggerSos={handleTriggerSos}
            setCurrentMenu={setCurrentMenu}
            setIsAvailableNow={setIsAvailableNow}
            upcomingSchedule={upcomingSchedule}
            walletData={walletData}
            workerProfile={workerProfile}
          />
        )}

        {currentMenu === 'pekerjaan-saya' && (
          <PekerjaanSayaView
            actionItems={actionItems}
            activeTask={activeTask}
            onCheckInArrived={handleCheckInArrived}
            onOpenProofModal={() => setShowProofModal(true)}
            onTriggerSos={handleTriggerSos}
            setCurrentMenu={setCurrentMenu}
            upcomingSchedule={upcomingSchedule}
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
          className={`bottom-nav-item${currentMenu === 'pekerjaan-saya' ? ' bottom-nav-item--active' : ''}`}
          onClick={() => {
            setCurrentMenu('pekerjaan-saya')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          type="button"
        >
          <div className="bottom-nav-icon-wrap">
            <Icon name="briefcase" size={20} />
            {activeTask && <span className="bottom-nav-badge">1</span>}
          </div>
          <span>Tugas</span>
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
