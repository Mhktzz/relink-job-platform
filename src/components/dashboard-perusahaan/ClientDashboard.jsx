import { useState, useEffect } from 'react'
import relinkIcon from '../../assets/main-relink-1.svg'
import Icon from '../common/Icon.jsx'
import technicianPhoto from '../../assets/technician.jpg'
import {
  initialNearbyWorkers,
  initialTaskBoard,
  initialEscrowTransactions,
} from './mockData.js'
import {
  fetchTasksFromDb,
  insertTaskToDb,
  fetchEscrowFromDb,
  updateEscrowStatusInDb,
  updateTaskInDb,
  deleteTaskFromDb,
} from '../../lib/databaseService.js'
import { supabase } from '../../lib/supabaseClient.js'
import BerandaView from './views/BerandaView.jsx'
import KanbanView from './views/KanbanView.jsx'
import RadarMitraView from './views/RadarMitraView.jsx'
import PostingTugasView from './views/PostingTugasView.jsx'
import DanaEscrowView from './views/DanaEscrowView.jsx'
import PusatBantuanView from './views/PusatBantuanView.jsx'
import DataTugasView from './views/DataTugasView.jsx'
import ProofModal from './modals/ProofModal.jsx'
import EscrowDetailModal from './modals/EscrowDetailModal.jsx'
import DisputeModal from './modals/DisputeModal.jsx'
import TaskDetailView from './views/TaskDetailView.jsx'
import EditTaskModal from './modals/EditTaskModal.jsx'
import DeleteTaskModal from './modals/DeleteTaskModal.jsx'
import './ClientDashboard.css'

function ClientDashboard() {
  const [currentMenu, setCurrentMenu] = useState('beranda') // 'beranda' | 'kanban' | 'data_tugas' | 'radar' | 'new_task' | 'escrow' | 'bantuan' | 'task_detail'
  const [previousMenu, setPreviousMenu] = useState('kanban')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  // Inisialisasi tasks dari localStorage agar aksi hapus/edit bertahan saat refresh
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('relink_tasks')
      if (saved !== null) {
        return JSON.parse(saved)
      }
      return initialTaskBoard
    } catch {
      return initialTaskBoard
    }
  })

  // Sinkronisasi persistensi setiap ada perubahan tasks
  useEffect(() => {
    try {
      localStorage.setItem('relink_tasks', JSON.stringify(tasks))
    } catch (e) {
      console.warn('Gagal sinkron tasks ke localStorage:', e)
    }
  }, [tasks])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProofTask, setSelectedProofTask] = useState(null)
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null)
  const [signatureApproved, setSignatureApproved] = useState(false)
  const [showProofModal, setShowProofModal] = useState(false)
  const [actionSuccessMsg, setActionSuccessMsg] = useState('')

  // State Modal Edit & Hapus Tugas Global (Dinamis untuk semua tampilan)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [isProcessingTask, setIsProcessingTask] = useState(false)

  // Navigasi ke Detail Task di Main Section (bukan modal overlay)
  const handleOpenTaskDetail = (task, fromMenu = 'kanban') => {
    setSelectedTaskForDetail(task)
    setPreviousMenu(fromMenu)
    setCurrentMenu('task_detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handler: Simpan Edit Tugas secara Global & Dinamis
  async function handleSaveEditTask(taskId, updatedFields) {
    setIsProcessingTask(true)
    await updateTaskInDb(taskId, updatedFields)
    setTasks((prev) =>
      prev.map((item) => {
        if (item.id === taskId || item.task_code === taskId) {
          const updated = {
            ...item,
            title: updatedFields.title,
            category:
              updatedFields.category === 'teknis'
                ? 'Teknis & Perangkat'
                : updatedFields.category === 'administrasi'
                ? 'Administrasi'
                : 'Operasional Toko',
            tier: updatedFields.tier,
            budget: Number(updatedFields.budget),
            statusBadge: updatedFields.status,
            column:
              updatedFields.status === 'Completed'
                ? 'overdue'
                : updatedFields.status === 'Proof Review'
                ? 'due_week'
                : 'current',
            checklist: updatedFields.checklist,
            acceptanceChecklist: updatedFields.checklist.map((txt, idx) => ({
              id: `c-edit-${idx}`,
              text: txt,
              done: item.acceptanceChecklist?.[idx]?.done || false,
            })),
          }
          if (selectedTaskForDetail?.id === taskId) {
            setSelectedTaskForDetail(updated)
          }
          return updated
        }
        return item
      })
    )
    setIsProcessingTask(false)
    setTaskToEdit(null)
    setActionSuccessMsg(`Perubahan data tugas #${taskId} berhasil disimpan!`)
    setTimeout(() => setActionSuccessMsg(''), 5000)
  }

  // Handler: Hapus Tugas secara Global & Dinamis
  async function handleConfirmDeleteTask(taskId) {
    setIsProcessingTask(true)
    await deleteTaskFromDb(taskId)
    const updated = tasks.filter(
      (item) => item.id !== taskId && item.code !== taskId && item.task_code !== taskId
    )
    setTasks(updated)
    try {
      localStorage.setItem('relink_tasks', JSON.stringify(updated))
    } catch (e) {
      console.warn('Gagal simpan ke localStorage:', e)
    }
    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail(null)
      setCurrentMenu(previousMenu || 'kanban')
    }
    setIsProcessingTask(false)
    setTaskToDelete(null)
    setActionSuccessMsg(`Tugas #${taskId} berhasil dihapus dari sistem!`)
    setTimeout(() => setActionSuccessMsg(''), 5000)
  }

  // Handler: Toggle Checklist SOP secara Dinamis
  async function handleToggleChecklistItem(taskId, checklistIdx) {
    setTasks((prev) =>
      prev.map((item) => {
        if (item.id === taskId || item.task_code === taskId) {
          const currentList = item.acceptanceChecklist || []
          const updatedList = currentList.map((c, i) =>
            i === checklistIdx ? { ...c, done: !c.done } : c
          )
          const updated = { ...item, acceptanceChecklist: updatedList }
          if (selectedTaskForDetail?.id === taskId) {
            setSelectedTaskForDetail(updated)
          }
          updateTaskInDb(taskId, {
            checklist: updatedList.map((c) => (typeof c === 'string' ? c : c.text)),
          })
          return updated
        }
        return item
      })
    )
  }

  // Handler: Geser Status Papan Tugas Dinamis (misal di Kanban)
  async function handleMoveTaskStatus(taskId, newStatus) {
    const columnMapping = {
      Open: 'current',
      'In Progress': 'current',
      'Proof Review': 'due_week',
      Completed: 'overdue',
    }
    setTasks((prev) =>
      prev.map((item) => {
        if (item.id === taskId || item.task_code === taskId) {
          const updated = {
            ...item,
            statusBadge: newStatus,
            column: columnMapping[newStatus] || 'current',
          }
          if (selectedTaskForDetail?.id === taskId) {
            setSelectedTaskForDetail(updated)
          }
          updateTaskInDb(taskId, { status: newStatus })
          return updated
        }
        return item
      })
    )
    setActionSuccessMsg(`Status tugas #${taskId} dialihkan ke ${newStatus}!`)
    setTimeout(() => setActionSuccessMsg(''), 4000)
  }

  // State Rekening Escrow & Proteksi Transaksi (FR-401, FR-404, FR-501)
  const [escrowTransactions, setEscrowTransactions] = useState(initialEscrowTransactions)
  const [escrowFilterTab, setEscrowFilterTab] = useState('all')
  const [escrowSearchQuery, setEscrowSearchQuery] = useState('')
  const [selectedEscrow, setSelectedEscrow] = useState(null)
  const [showEscrowModal, setShowEscrowModal] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')

  // State Pengguna Aktif (dari Supabase / localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('relink_user')
      return saved
        ? JSON.parse(saved)
        : { business_name: 'Toko Kue Bu Rina', full_name: 'Bu Rina', role: 'klien' }
    } catch {
      return { business_name: 'Toko Kue Bu Rina', full_name: 'Bu Rina', role: 'klien' }
    }
  })
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Handler Keluar Akun (Logout)
  async function handleLogout() {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('Logout error', e)
    }
    localStorage.removeItem('relink_user')
    window.location.href = '/masuk?peran=umkm'
  }

  // Sinkronisasi data awal dari Supabase Database (dengan fallback data lokal)
  useEffect(() => {
    let isMounted = true

    // Cek session Supabase secara dinamis
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && isMounted) {
        const meta = session.user.user_metadata || {}
        setCurrentUser((prev) => ({
          ...prev,
          id: session.user.id,
          email: session.user.email,
          business_name: meta.business_name || prev.business_name,
          full_name: meta.full_name || prev.full_name,
        }))
      }
    })

    async function loadDataFromSupabase() {
      try {
        const [dbTasks, dbEscrow] = await Promise.all([
          fetchTasksFromDb(),
          fetchEscrowFromDb(),
        ])
        if (isMounted) {
          if (Array.isArray(dbTasks)) {
            const savedLocal = localStorage.getItem('relink_tasks')
            if (dbTasks.length > 0) {
              setTasks(dbTasks)
              localStorage.setItem('relink_tasks', JSON.stringify(dbTasks))
            } else if (savedLocal !== null) {
              // Jika di DB kosong dan di localStorage ada status (misal user sudah hapus semua jadi [])
              setTasks(JSON.parse(savedLocal))
            } else {
              setTasks([])
            }
          }
          if (Array.isArray(dbEscrow) && dbEscrow.length > 0) {
            setEscrowTransactions(dbEscrow)
          }
        }
      } catch (err) {
        console.warn('[Relink Supabase] Menggunakan data lokal cadangan:', err)
      }
    }
    loadDataFromSupabase()

    // Realtime Supabase Channel untuk Sinkronisasi Otomatis Data Tugas & Escrow
    let realtimeChannel = null
    try {
      realtimeChannel = supabase
        .channel('relink_realtime_dashboard')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          async () => {
            const freshTasks = await fetchTasksFromDb()
            if (isMounted && Array.isArray(freshTasks)) {
              setTasks(freshTasks)
              localStorage.setItem('relink_tasks', JSON.stringify(freshTasks))
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'escrow_transactions' },
          async () => {
            const freshEscrow = await fetchEscrowFromDb()
            if (isMounted && freshEscrow?.length > 0) setEscrowTransactions(freshEscrow)
          }
        )
        .subscribe()
    } catch (e) {
      console.warn('[Relink] Realtime subscription init error:', e)
    }

    return () => {
      isMounted = false
      if (realtimeChannel) supabase.removeChannel(realtimeChannel)
    }
  }, [])

  // Form State untuk Buat Tugas Baru
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState('operasional')
  const [newTaskWorkersNeeded, setNewTaskWorkersNeeded] = useState(1)
  const [newTaskIsTandem, setNewTaskIsTandem] = useState(false)
  const [newTaskChecklist, setNewTaskChecklist] = useState([
    'Tugas diselesaikan sesuai instruksi operasional',
    'Area kerja dibersihkan setelah selesai',
  ])
  const [newChecklistInput, setNewChecklistInput] = useState('')
  const [selectedTierLevel, setSelectedTierLevel] = useState('tier_1')

  const baseRate = newTaskCategory === 'teknis' ? 95000 : newTaskCategory === 'operasional' ? 50000 : 45000
  const estimatedBudget = newTaskIsTandem
    ? Math.round((baseRate * 1.5 + baseRate * 0.8 * (newTaskWorkersNeeded - 1)) * 1.0)
    : baseRate * newTaskWorkersNeeded

  // Filter tugas untuk Kanban
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentTasks = filteredTasks.filter(
    (t) =>
      (t.column === 'current' || t.statusBadge === 'In Progress') &&
      t.statusBadge !== 'Proof Review' &&
      t.statusBadge !== 'Completed' &&
      t.status !== 'review' &&
      t.status !== 'completed'
  )
  const dueWeekTasks = filteredTasks.filter(
    (t) => t.column === 'due_week' || t.statusBadge === 'Proof Review' || t.status === 'review'
  )
  const overdueTasks = filteredTasks.filter(
    (t) => t.column === 'overdue' || t.statusBadge === 'Completed' || t.status === 'completed'
  )

  // Handler: Approve Bukti Kerja & TTD
  function handleApproveProof(taskToApprove) {
    if (!signatureApproved) {
      alert('Silakan centang persetujuan tanda tangan digital sebelum mencairkan dana.')
      return
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskToApprove.id
          ? { ...t, column: 'overdue', statusBadge: 'Completed', status: 'completed' }
          : t,
      ),
    )
    setShowProofModal(false)
    setSelectedProofTask(null)
    setSignatureApproved(false)
    setActionSuccessMsg(`Dana tugas ${taskToApprove.id} sebesar Rp${taskToApprove.budget.toLocaleString('id-ID')} telah berhasil dicairkan ke saldo Mitra!`)
    setTimeout(() => setActionSuccessMsg(''), 5000)
  }

  // Handler: Lepas Dana Escrow Langsung
  function handleReleaseEscrow(escrowItem) {
    updateEscrowStatusInDb(escrowItem.id, 'released')
    setEscrowTransactions((prev) =>
      prev.map((item) =>
        item.id === escrowItem.id
          ? {
              ...item,
              status: 'released',
              statusLabel: 'Selesai & Dicairkan',
              statusBadgeColor: 'blue',
              autoReleaseHoursLeft: null,
            }
          : item,
      ),
    )
    setShowEscrowModal(false)
    setSelectedEscrow(null)
    setActionSuccessMsg(
      `Dana Escrow ${escrowItem.id} sebesar Rp${escrowItem.amount.toLocaleString(
        'id-ID',
      )} telah berhasil dicairkan langsung ke saldo Mitra ${escrowItem.workerName}!`,
    )
    setTimeout(() => setActionSuccessMsg(''), 5000)
  }

  // Handler: Ajukan Sengketa / Klaim Garansi 100% Relink
  function handleReportDispute(e) {
    e.preventDefault()
    if (!disputeReason.trim()) {
      alert('Silakan tuliskan kriteria yang belum sesuai atau kendala yang dihadapi.')
      return
    }
    setEscrowTransactions((prev) =>
      prev.map((item) =>
        item.id === selectedEscrow.id
          ? {
              ...item,
              status: 'disputed',
              statusLabel: 'Dalam Mediasi Tim Relink',
              statusBadgeColor: 'pink',
              checklistSummary: `Laporan: ${disputeReason}`,
            }
          : item,
      ),
    )
    setShowDisputeModal(false)
    setShowEscrowModal(false)
    setDisputeReason('')
    setActionSuccessMsg(
      `Laporan kendala transaksi ${selectedEscrow.id} telah diterima. Garansi Perlindungan UMKM aktif — Tim Mediasi Relink akan menengahi dalam maks. 48 jam.`,
    )
    setTimeout(() => setActionSuccessMsg(''), 6000)
  }

  // Perhitungan Data Escrow
  const totalHeldEscrow = (escrowTransactions || [])
    .filter((t) => t?.status === 'held' || t?.status === 'review' || t?.status === 'under_review')
    .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0)
  const totalReviewEscrow = (escrowTransactions || [])
    .filter((t) => t?.status === 'review' || t?.status === 'under_review')
    .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0)
  const reviewCount = (escrowTransactions || []).filter(
    (t) => t?.status === 'review' || t?.status === 'under_review'
  ).length
  const heldCount = (escrowTransactions || []).filter((t) => t?.status === 'held').length
  const releasedCount = (escrowTransactions || []).filter((t) => t?.status === 'released').length
  const disputeCount = (escrowTransactions || []).filter((t) => t?.status === 'disputed').length

  const filteredEscrowTransactions = (escrowTransactions || []).filter((tx) => {
    if (!tx) return false
    const matchesTab =
      escrowFilterTab === 'all'
        ? true
        : tx.status === escrowFilterTab || (escrowFilterTab === 'review' && tx.status === 'under_review')
    const q = (escrowSearchQuery || '').toLowerCase()
    const id = (tx.id || '').toLowerCase()
    const taskTitle = (tx.taskTitle || '').toLowerCase()
    const workerName = (tx.workerName || tx.mitraName || '').toLowerCase()
    const paymentGatewayRef = (tx.paymentGatewayRef || '').toLowerCase()
    const matchesQuery =
      id.includes(q) ||
      taskTitle.includes(q) ||
      workerName.includes(q) ||
      paymentGatewayRef.includes(q)
    return matchesTab && matchesQuery
  })

  // Handler: Buat Tugas Baru
  function handleCreateTask(e) {
    e.preventDefault()
    if (!newTaskTitle.trim()) {
      alert('Judul tugas tidak boleh kosong.')
      return
    }

    const createdTask = {
      id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
      code: `#8789${Math.floor(10 + Math.random() * 90)}`,
      statusBadge: 'In Progress',
      title: newTaskTitle,
      category: newTaskCategory === 'teknis' ? 'Teknis & Perangkat' : 'Operasional Toko',
      description: 'Tugas baru diposting ke radar mitra sekitar dalam radius 1–5 km.',
      priority: 'Urgent',
      tier: selectedTierLevel === 'tier_3' ? 'Tier 3' : selectedTierLevel === 'tier_2' ? 'Tier 2' : 'Tier 1',
      column: 'current',
      workerName: 'Mitra Terdekat',
      workerPhoto: technicianPhoto,
      budget: estimatedBudget,
      dateRange: 'Hari ini',
      acceptanceChecklist: newTaskChecklist.map((item, idx) => ({
        id: `c-new-${idx}`,
        text: item,
        done: false,
      })),
      proofData: null,
    }

    setTasks([createdTask, ...tasks])
    insertTaskToDb({
      title: newTaskTitle,
      category: newTaskCategory,
      tier: selectedTierLevel === 'tier_3' ? 'Tier 3' : selectedTierLevel === 'tier_2' ? 'Tier 2' : 'Tier 1',
      budget: estimatedBudget,
      workersNeeded: newTaskWorkersNeeded,
      isTandem: newTaskIsTandem,
      checklist: newTaskChecklist,
      clientId: currentUser?.id,
    })
    setNewTaskTitle('')
    setNewTaskWorkersNeeded(1)
    setNewTaskIsTandem(false)
    setCurrentMenu('kanban')
    setActionSuccessMsg(`Tugas baru berhasil diposting! Dana Rp${estimatedBudget.toLocaleString('id-ID')} diamankan di Escrow Relink.`)
    setTimeout(() => setActionSuccessMsg(''), 5000)
  }

  function addChecklistItem() {
    if (newChecklistInput.trim()) {
      setNewTaskChecklist([...newTaskChecklist, newChecklistInput.trim()])
      setNewChecklistInput('')
    }
  }

  function removeChecklistItem(idx) {
    setNewTaskChecklist(newTaskChecklist.filter((_, i) => i !== idx))
  }

  return (
    <div className="admin-clean-app">
      {/* 1. SIDEBAR NAVY DENGAN PENGELOMPOKAN MENU */}
      <aside className={`admin-navy-sidebar${isSidebarExpanded ? ' admin-navy-sidebar--expanded' : ' admin-navy-sidebar--collapsed'}`}>
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
            aria-label="Relink Admin, kembali ke beranda dashboard"
            className="sidebar-brand-link"
            onClick={() => setCurrentMenu('beranda')}
            type="button"
          >
            <img
              alt="Relink Logo"
              className="sidebar-brand-icon"
              src={relinkIcon}
            />
            {isSidebarExpanded && <span className="sidebar-brand-name">Relink Admin</span>}
          </button>
        </div>

        {/* Menu Navigasi Berkelompok */}
        <nav className="sidebar-categories">
          <div className="sidebar-group">
            {isSidebarExpanded && <span className="group-label">Menu Utama</span>}
            <button
              className={`sidebar-nav-item${currentMenu === 'beranda' || (currentMenu === 'task_detail' && previousMenu === 'beranda') ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('beranda')}
              title="Dashboard Beranda"
              type="button"
            >
              <Icon name="home" size={18} />
              {isSidebarExpanded && <span>Beranda</span>}
            </button>

            <button
              className={`sidebar-nav-item${currentMenu === 'kanban' || (currentMenu === 'task_detail' && previousMenu === 'kanban') ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('kanban')}
              title="Kanban Tugas"
              type="button"
            >
              <Icon name="briefcase" size={18} />
              {isSidebarExpanded && <span>Kanban Tugas</span>}
              {isSidebarExpanded && <span className="nav-counter-pill">{tasks.length}</span>}
            </button>

            <button
              className={`sidebar-nav-item${currentMenu === 'data_tugas' || (currentMenu === 'task_detail' && previousMenu === 'data_tugas') ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('data_tugas')}
              title="Manajemen & Kelola Data Tugas"
              type="button"
            >
              <Icon name="sliders" size={18} />
              {isSidebarExpanded && <span>Data Tugas</span>}
              {isSidebarExpanded && <span className="nav-counter-pill">{tasks.length}</span>}
            </button>

            <button
              className={`sidebar-nav-item${currentMenu === 'radar' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('radar')}
              title="Radar Mitra Terdekat"
              type="button"
            >
              <Icon name="pin" size={18} />
              {isSidebarExpanded && <span>Radar Mitra</span>}
            </button>

            <button
              className={`sidebar-nav-item${currentMenu === 'new_task' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('new_task')}
              title="Posting Tugas Baru"
              type="button"
            >
              <Icon name="plus" size={18} />
              {isSidebarExpanded && <span>Posting Tugas</span>}
            </button>
          </div>

          <div className="sidebar-group">
            {isSidebarExpanded && <span className="group-label">Layanan</span>}
            <button
              className={`sidebar-nav-item${currentMenu === 'escrow' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('escrow')}
              title="Dana Escrow & Proteksi Transaksi"
              type="button"
            >
              <Icon name="shield" size={18} />
              {isSidebarExpanded && <span>Dana Escrow</span>}
              {isSidebarExpanded && (
                <span className="nav-counter-pill nav-counter-pill--escrow">
                  {reviewCount + heldCount}
                </span>
              )}
            </button>

            <button
              className={`sidebar-nav-item${currentMenu === 'bantuan' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('bantuan')}
              title="Pusat Bantuan & Layanan Garansi"
              type="button"
            >
              <Icon name="users" size={18} />
              {isSidebarExpanded && <span>Pusat Bantuan</span>}
            </button>
          </div>

          <div className="sidebar-group sidebar-group--bottom">
            {isSidebarExpanded && <span className="group-label">Pengaturan</span>}
            <button
              className="sidebar-nav-item"
              onClick={() => alert('Menu Pengaturan: Konfigurasi profil UMKM, jam operasional, dan staf toko.')}
              title="Pengaturan"
              type="button"
            >
              <Icon name="settings" size={18} />
              {isSidebarExpanded && <span>Pengaturan</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* 2. KONTEN KANVAS UTAMA */}
      <div className="admin-body-canvas">
        {/* TOP BAR NAVY MENYATU DENGAN SIDEBAR (STICKY TOP) */}
        <header className="admin-navy-topbar">
          <div className="topbar-brand-mobile">
            <button
              aria-label="Relink Admin, kembali ke beranda dashboard"
              className="topbar-brand-link"
              onClick={() => setCurrentMenu('beranda')}
              type="button"
            >
              <img
                alt="Relink Logo"
                className="topbar-brand-icon"
                src={relinkIcon}
              />
              <span className="topbar-brand-name">Relink Admin</span>
            </button>
          </div>

          <div className="topbar-search">
            <Icon name="search" size={16} />
            <input
              aria-label="Cari tugas atau mitra"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, task, or mitra..."
              type="text"
              value={searchQuery}
            />
            <span className="search-shortcut-badge">⌘ K</span>
          </div>

          <div className="topbar-actions">
            <button aria-label="Notifikasi" className="topbar-action-icon" type="button">
              <Icon name="bell" size={18} />
              <span className="topbar-notif-dot" />
            </button>

            <button
              aria-label="Pusat Bantuan"
              className={`topbar-action-icon topbar-action-icon--help${currentMenu === 'bantuan' ? ' topbar-action-icon--active' : ''}`}
              onClick={() => setCurrentMenu('bantuan')}
              title="Pusat Bantuan & Layanan Garansi"
              type="button"
            >
              <Icon name="shield" size={18} />
            </button>

            <div className="topbar-user-wrapper">
              <button
                aria-expanded={showUserMenu}
                aria-label="Profil dan Pengaturan Akun"
                className="topbar-user-capsule"
                onClick={() => setShowUserMenu(!showUserMenu)}
                type="button"
              >
                <div className="topbar-avatar-circle">
                  {(currentUser.business_name || 'UMKM').slice(0, 2).toUpperCase()}
                </div>
                <div className="topbar-user-info">
                  <strong>{currentUser.business_name || 'Toko Kue Bu Rina'}</strong>
                  <small>{currentUser.full_name || 'Admin UMKM'}</small>
                </div>
                <Icon name="arrow" size={12} />
              </button>

              {showUserMenu && (
                <div className="topbar-user-dropdown">
                  <div className="dropdown-user-header">
                    <strong>{currentUser.business_name}</strong>
                    <small>{currentUser.email || 'Akun UMKM Terverifikasi'}</small>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowUserMenu(false)
                      setCurrentMenu('bantuan')
                    }}
                    type="button"
                  >
                    <Icon name="users" size={16} />
                    <span>Pusat Bantuan & SOP</span>
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

        {/* NOTIFIKASI TOAST */}
        {actionSuccessMsg && (
          <div aria-live="polite" className="admin-clean-toast">
            <Icon name="check" size={16} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODULAR VIEWS PER MENU */}
        {/* ======================================================== */}
        {currentMenu === 'beranda' && (
          <BerandaView
            escrowTransactions={escrowTransactions}
            onDeleteTask={setTaskToDelete}
            onEditTask={setTaskToEdit}
            onOpenTaskDetail={(task) => handleOpenTaskDetail(task, 'beranda')}
            setCurrentMenu={setCurrentMenu}
            setSelectedProofTask={setSelectedProofTask}
            setShowProofModal={setShowProofModal}
            tasks={tasks}
            totalHeldEscrow={totalHeldEscrow}
          />
        )}

        {currentMenu === 'kanban' && (
          <KanbanView
            currentTasks={currentTasks}
            dueWeekTasks={dueWeekTasks}
            onDeleteTask={setTaskToDelete}
            onEditTask={setTaskToEdit}
            onMoveStatus={handleMoveTaskStatus}
            onOpenTaskDetail={(task) => handleOpenTaskDetail(task, 'kanban')}
            overdueTasks={overdueTasks}
            searchQuery={searchQuery}
            setCurrentMenu={setCurrentMenu}
            setSelectedProofTask={setSelectedProofTask}
            setSearchQuery={setSearchQuery}
            setShowProofModal={setShowProofModal}
          />
        )}

        {currentMenu === 'data_tugas' && (
          <DataTugasView
            onDeleteTask={setTaskToDelete}
            onEditTask={setTaskToEdit}
            onOpenTaskDetail={(task) => handleOpenTaskDetail(task, 'data_tugas')}
            setActionSuccessMsg={setActionSuccessMsg}
            setCurrentMenu={setCurrentMenu}
            setSelectedProofTask={setSelectedProofTask}
            setShowProofModal={setShowProofModal}
            setTasks={setTasks}
            tasks={tasks}
          />
        )}

        {currentMenu === 'task_detail' && selectedTaskForDetail && (
          <TaskDetailView
            onBack={() => {
              setCurrentMenu(previousMenu || 'kanban')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onDeleteTask={setTaskToDelete}
            onEditTask={setTaskToEdit}
            onOpenProofModal={(task) => {
              setSelectedProofTask(task)
              setShowProofModal(true)
            }}
            onToggleChecklist={handleToggleChecklistItem}
            previousMenu={previousMenu}
            setCurrentMenu={setCurrentMenu}
            task={selectedTaskForDetail}
          />
        )}

        {currentMenu === 'radar' && (
          <RadarMitraView
            setCurrentMenu={setCurrentMenu}
            setNewTaskTitle={setNewTaskTitle}
            workers={initialNearbyWorkers}
          />
        )}

        {currentMenu === 'new_task' && (
          <PostingTugasView
            addChecklistItem={addChecklistItem}
            estimatedBudget={estimatedBudget}
            handleCreateTask={handleCreateTask}
            newChecklistInput={newChecklistInput}
            newTaskCategory={newTaskCategory}
            newTaskChecklist={newTaskChecklist}
            newTaskTitle={newTaskTitle}
            newTaskWorkersNeeded={newTaskWorkersNeeded}
            removeChecklistItem={removeChecklistItem}
            selectedTierLevel={selectedTierLevel}
            setCurrentMenu={setCurrentMenu}
            setNewChecklistInput={setNewChecklistInput}
            setNewTaskCategory={setNewTaskCategory}
            setNewTaskIsTandem={setNewTaskIsTandem}
            setNewTaskTitle={setNewTaskTitle}
            setNewTaskWorkersNeeded={setNewTaskWorkersNeeded}
            setSelectedTierLevel={setSelectedTierLevel}
          />
        )}

        {currentMenu === 'escrow' && (
          <DanaEscrowView
            disputeCount={disputeCount}
            escrowFilterTab={escrowFilterTab}
            escrowSearchQuery={escrowSearchQuery}
            escrowTransactions={escrowTransactions}
            filteredEscrowTransactions={filteredEscrowTransactions}
            handleReleaseEscrow={handleReleaseEscrow}
            heldCount={heldCount}
            releasedCount={releasedCount}
            reviewCount={reviewCount}
            setEscrowFilterTab={setEscrowFilterTab}
            setEscrowSearchQuery={setEscrowSearchQuery}
            setSelectedEscrow={setSelectedEscrow}
            setShowEscrowModal={setShowEscrowModal}
            totalHeldEscrow={totalHeldEscrow}
            totalReviewEscrow={totalReviewEscrow}
          />
        )}

        {currentMenu === 'bantuan' && (
          <PusatBantuanView
            setActionSuccessMsg={setActionSuccessMsg}
            setCurrentMenu={setCurrentMenu}
            tasks={tasks}
          />
        )}
      </div>

      {/* 3. MOBILE & TABLET BOTTOM APP NAVIGATION BAR */}
      <nav aria-label="Navigasi Menu Aplikasi" className="mobile-bottom-nav">
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
          className={`bottom-nav-item${currentMenu === 'kanban' ? ' bottom-nav-item--active' : ''}`}
          onClick={() => {
            setCurrentMenu('kanban')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          type="button"
        >
          <div className="bottom-nav-icon-wrap">
            <Icon name="briefcase" size={20} />
            {tasks.length > 0 && <span className="bottom-nav-badge">{tasks.length}</span>}
          </div>
          <span>Kanban</span>
        </button>

        <button
          className={`bottom-nav-item bottom-nav-item--center${currentMenu === 'new_task' ? ' bottom-nav-item--active' : ''}`}
          onClick={() => {
            setCurrentMenu('new_task')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          title="Posting Tugas Baru"
          type="button"
        >
          <div className="bottom-nav-fab">
            <Icon name="plus" size={20} />
          </div>
          <span>Posting</span>
        </button>

        <button
          className={`bottom-nav-item${currentMenu === 'radar' ? ' bottom-nav-item--active' : ''}`}
          onClick={() => {
            setCurrentMenu('radar')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          type="button"
        >
          <Icon name="pin" size={20} />
          <span>Radar</span>
        </button>

        <button
          className={`bottom-nav-item${currentMenu === 'escrow' ? ' bottom-nav-item--active' : ''}`}
          onClick={() => {
            setCurrentMenu('escrow')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          type="button"
        >
          <div className="bottom-nav-icon-wrap">
            <Icon name="shield" size={20} />
            {reviewCount + heldCount > 0 && (
              <span className="bottom-nav-badge bottom-nav-badge--mint">
                {reviewCount + heldCount}
              </span>
            )}
          </div>
          <span>Escrow</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* MODULAR MODALS */}
      {/* ======================================================== */}
      {showProofModal && selectedProofTask && (
        <ProofModal
          handleApproveProof={handleApproveProof}
          selectedProofTask={selectedProofTask}
          setShowProofModal={setShowProofModal}
          setSignatureApproved={setSignatureApproved}
          signatureApproved={signatureApproved}
        />
      )}

      {showEscrowModal && selectedEscrow && (
        <EscrowDetailModal
          handleReleaseEscrow={handleReleaseEscrow}
          selectedEscrow={selectedEscrow}
          setSelectedEscrow={setSelectedEscrow}
          setShowDisputeModal={setShowDisputeModal}
          setShowEscrowModal={setShowEscrowModal}
        />
      )}

      {showDisputeModal && selectedEscrow && (
        <DisputeModal
          disputeReason={disputeReason}
          handleReportDispute={handleReportDispute}
          selectedEscrow={selectedEscrow}
          setDisputeReason={setDisputeReason}
          setShowDisputeModal={setShowDisputeModal}
        />
      )}

      {/* MODAL GLOBAL: EDIT TUGAS DINAMIS */}
      {taskToEdit && (
        <EditTaskModal
          isProcessing={isProcessingTask}
          onClose={() => setTaskToEdit(null)}
          onSave={handleSaveEditTask}
          task={taskToEdit}
        />
      )}

      {/* MODAL GLOBAL: HAPUS TUGAS DINAMIS */}
      {taskToDelete && (
        <DeleteTaskModal
          isProcessing={isProcessingTask}
          onClose={() => setTaskToDelete(null)}
          onConfirm={handleConfirmDeleteTask}
          task={taskToDelete}
        />
      )}
    </div>
  )
}

export default ClientDashboard
