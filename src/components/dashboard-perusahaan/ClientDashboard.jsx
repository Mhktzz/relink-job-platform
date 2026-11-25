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
  getDeletedTaskIds,
  markTaskAsDeleted,
  unmarkDeletedTask,
  isTaskActive,
} from '../../lib/databaseService.js'
import { supabase } from '../../lib/supabaseClient.js'
import BerandaView from './views/BerandaView.jsx'
import KanbanView from './views/KanbanView.jsx'
import RadarMitraView from './views/RadarMitraView.jsx'
import PostingTugasView from './views/PostingTugasView.jsx'
import DanaEscrowView from './views/DanaEscrowView.jsx'
import PusatBantuanView from './views/PusatBantuanView.jsx'
import DataTugasView from './views/DataTugasView.jsx'
import PengaturanView from './views/PengaturanView.jsx'
import ProofModal from './modals/ProofModal.jsx'
import EscrowDetailModal from './modals/EscrowDetailModal.jsx'
import DisputeModal from './modals/DisputeModal.jsx'
import TaskDetailView from './views/TaskDetailView.jsx'
import EditTaskModal from './modals/EditTaskModal.jsx'
import DeleteTaskModal from './modals/DeleteTaskModal.jsx'
import OnboardingScreen from '../common/OnboardingScreen.jsx'
import { completeOnboarding, getStoredUser, hasPendingOnboarding, isDemoUser } from '../../lib/userSession.js'
import { fetchUserSettings, saveUserSettings } from '../../lib/userSettingsService.js'
import './ClientDashboard.css'

function ClientDashboard() {
  const storedUser = getStoredUser()
  const demoAccount = isDemoUser(storedUser)
  const [showOnboarding, setShowOnboarding] = useState(() => hasPendingOnboarding(storedUser))

  const [currentMenu, setCurrentMenu] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const menuFromUrl = urlParams.get('menu')
      if (menuFromUrl) return menuFromUrl
      const saved = sessionStorage.getItem('relink_client_menu')
      return saved || 'beranda'
    } catch {
      return 'beranda'
    }
  }) // 'beranda' | 'kanban' | 'data_tugas' | 'radar' | 'new_task' | 'escrow' | 'bantuan' | 'task_detail'
  const [previousMenu, setPreviousMenu] = useState('kanban')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  // Sinkronisasi menu aktif ke sessionStorage & URL query agar saat refresh tetap di halaman tersebut
  useEffect(() => {
    try {
      sessionStorage.setItem('relink_client_menu', currentMenu)
      const url = new URL(window.location)
      if (url.searchParams.get('menu') !== currentMenu) {
        url.searchParams.set('menu', currentMenu)
        window.history.replaceState({}, '', url)
      }
    } catch {}
  }, [currentMenu])

  // Inisialisasi tasks dari localStorage agar aksi hapus/edit bertahan saat refresh
  const [tasks, setTasks] = useState(() => {
    try {
      const deletedIds = getDeletedTaskIds()
      const saved = localStorage.getItem('relink_tasks')
      if (saved !== null) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (task) =>
              isTaskActive(task, deletedIds) &&
              (demoAccount || String(task.client_id) === String(storedUser?.id))
          )
        }
      }
      return demoAccount
        ? initialTaskBoard.filter((t) => isTaskActive(t, deletedIds))
        : []
    } catch {
      return []
    }
  })

  // Sinkronisasi persistensi setiap ada perubahan tasks
  useEffect(() => {
    try {
      localStorage.setItem('relink_tasks', JSON.stringify(tasks))
      window.dispatchEvent(new CustomEvent('relink_tasks_updated', { detail: tasks }))
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
  const [releaseSuccess, setReleaseSuccess] = useState(null)
  const [isReleasingEscrow, setIsReleasingEscrow] = useState(false)

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

  // Handler: Hapus Tugas secara Global & Dinamis (Permanen di Supabase & Local)
  async function handleConfirmDeleteTask(taskOrId) {
    setIsProcessingTask(true)
    const isObj = typeof taskOrId === 'object' && taskOrId !== null
    const targetId = isObj ? taskOrId.id : taskOrId
    const targetDbId = isObj ? taskOrId.db_id : null
    const targetCode = isObj ? (taskOrId.task_code || taskOrId.code) : null
    const displayLabel = targetCode || targetId

    // 1. Catat ke daftar ID yang terhapus permanen (tombstone)
    markTaskAsDeleted([targetId, targetDbId, targetCode, taskOrId])

    // 2. Filter state lokal dan perbarui relink_tasks di localStorage
    const deletedIds = getDeletedTaskIds()
    const updated = tasks.filter((item) => isTaskActive(item, deletedIds))
    setTasks(updated)
    try {
      localStorage.setItem('relink_tasks', JSON.stringify(updated))
    } catch (e) {
      console.warn('Gagal simpan ke localStorage:', e)
    }

    // Bersihkan juga transaksi escrow yang terikat dengan tugas yang dihapus
    const targetTitle = isObj ? taskOrId.title : null
    setEscrowTransactions((prev) =>
      prev.filter(
        (e) =>
          e.taskId !== targetId &&
          e.taskId !== targetDbId &&
          e.taskId !== targetCode &&
          (!targetTitle || e.taskTitle !== targetTitle)
      )
    )

    // 3. Eksekusi penghapusan di Supabase
    await deleteTaskFromDb(taskOrId)

    if (
      selectedTaskForDetail?.id === targetId ||
      (targetDbId && selectedTaskForDetail?.db_id === targetDbId) ||
      (targetCode && selectedTaskForDetail?.code === targetCode)
    ) {
      setSelectedTaskForDetail(null)
      setCurrentMenu(previousMenu || 'kanban')
    }

    setIsProcessingTask(false)
    setTaskToDelete(null)
    setActionSuccessMsg(`Tugas #${String(displayLabel).replace(/^#/, '')} berhasil dihapus permanen dari sistem!`)
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
    if (newStatus === 'Proof Review') {
      const currentTask = tasks.find((t) => t.id === taskId || t.task_code === taskId)
      if (!currentTask?.proofSubmitted && !currentTask?.proofData) {
        setActionSuccessMsg('Tugas tidak dapat dipindahkan: Mitra pekerja harus mengirimkan bukti kerja terlebih dahulu.')
        setTimeout(() => setActionSuccessMsg(''), 4000)
        return
      }
    }

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
  const [escrowTransactions, setEscrowTransactions] = useState(
    demoAccount ? initialEscrowTransactions : []
  )
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
  const [accountSettings, setAccountSettings] = useState(null)
  const [settingsLoaded, setSettingsLoaded] = useState(demoAccount)
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

  // Handler Perbarui Profil & Pengaturan UMKM
  async function handleUpdateProfile(updatedData, settings) {
    const updatedUser = {
      ...currentUser,
      ...updatedData,
    }

    if (demoAccount) {
      setCurrentUser(updatedUser)
      setAccountSettings(settings)
      return
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const authUser = sessionData.session?.user
    if (!authUser || authUser.id !== currentUser.id) {
      throw new Error('Sesi login tidak valid. Silakan masuk kembali sebelum menyimpan pengaturan.')
    }

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: authUser.id,
        user_id: authUser.id,
        full_name: updatedUser.full_name,
        business_name: updatedUser.business_name,
        phone: updatedUser.phone,
        role: 'klien',
      },
      { onConflict: 'id' }
    )
    if (profileError) throw profileError

    await saveUserSettings(authUser.id, settings)
    setCurrentUser(updatedUser)
    setAccountSettings(settings)
    try {
      localStorage.setItem('relink_user', JSON.stringify(updatedUser))
    } catch (error) {
      console.warn('Profil tersimpan di Supabase, tetapi cache lokal gagal diperbarui:', error)
    }
    setActionSuccessMsg('Profil dan pengaturan toko berhasil diperbarui!')
    setTimeout(() => setActionSuccessMsg(''), 4000)
  }

  // Sinkronisasi data awal dari Supabase Database (dengan fallback data lokal)
  useEffect(() => {
    let isMounted = true

    // Cek session Supabase secara dinamis
    async function loadAccountData() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        const authUser = sessionData.session?.user

        if (!authUser || demoAccount) {
          if (isMounted) setSettingsLoaded(true)
          return
        }

        const [{ data: profile, error: profileError }, settings] = await Promise.all([
          supabase
            .from('profiles')
            .select('full_name, business_name, phone, role')
            .eq('id', authUser.id)
            .maybeSingle(),
          fetchUserSettings(authUser.id),
        ])
        if (profileError) throw profileError

        if (isMounted) {
          const meta = authUser.user_metadata || {}
          setCurrentUser((prev) => ({
            ...prev,
            id: authUser.id,
            email: authUser.email,
            business_name: profile?.business_name || meta.business_name || prev.business_name,
            full_name: profile?.full_name || meta.full_name || prev.full_name,
            phone: profile?.phone || meta.phone || prev.phone,
            role: profile?.role || prev.role,
          }))
          setAccountSettings(settings)
        }
      } catch (error) {
        console.error('Gagal memuat profil dan pengaturan dari Supabase:', error)
        if (isMounted) {
          setActionSuccessMsg('Pengaturan belum dapat dimuat dari Supabase. Periksa konfigurasi dan tabel database.')
        }
      } finally {
        if (isMounted) setSettingsLoaded(true)
      }
    }

    loadAccountData()

    async function loadDataFromSupabase() {
      try {
        const [dbTasks, dbEscrow] = await Promise.all([
          fetchTasksFromDb({
            clientId: demoAccount ? null : currentUser?.id,
            includeMockData: demoAccount,
          }),
          fetchEscrowFromDb({
            clientId: demoAccount ? null : currentUser?.id,
            includeMockData: demoAccount,
          }),
        ])
        if (isMounted) {
          if (Array.isArray(dbTasks)) {
            const deletedIds = getDeletedTaskIds()
            const activeDbTasks = dbTasks.filter((t) => isTaskActive(t, deletedIds))
            const savedLocal = localStorage.getItem('relink_tasks')

            if (savedLocal !== null) {
              try {
                const parsed = JSON.parse(savedLocal).filter(
                  (t) =>
                    isTaskActive(t, deletedIds) &&
                    (demoAccount || String(t.client_id) === String(currentUser?.id))
                )
                const merged = new Map()
                ;[...activeDbTasks, ...parsed].forEach((task) => {
                  merged.set(String(task.id || task.task_code), task)
                })
                const accountTasks = Array.from(merged.values())
                setTasks(accountTasks)
                localStorage.setItem('relink_tasks', JSON.stringify(accountTasks))
              } catch {
                setTasks(activeDbTasks)
                localStorage.setItem('relink_tasks', JSON.stringify(activeDbTasks))
              }
            } else {
              setTasks(activeDbTasks)
              localStorage.setItem('relink_tasks', JSON.stringify(activeDbTasks))
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
            const freshTasks = await fetchTasksFromDb({
              clientId: demoAccount ? null : currentUser?.id,
              includeMockData: demoAccount,
            })
            if (isMounted && Array.isArray(freshTasks)) {
              const deletedIds = getDeletedTaskIds()
              const active = freshTasks.filter(
                (t) =>
                  isTaskActive(t, deletedIds) &&
                  (demoAccount || String(t.client_id) === String(currentUser?.id))
              )
              setTasks(active)
              localStorage.setItem('relink_tasks', JSON.stringify(active))
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'escrow_transactions' },
          async () => {
            const freshEscrow = await fetchEscrowFromDb({
              clientId: demoAccount ? null : currentUser?.id,
              includeMockData: demoAccount,
            })
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
  }, [currentUser?.id, demoAccount])

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

  function markTaskCompletedLocally(task) {
    if (!task) return

    const identifiers = [task.id, task.db_id, task.task_code, task.code]
      .filter(Boolean)
      .map((value) => String(value).replace(/^#/, ''))
    const updatedTasks = tasks.map((item) => {
      const itemIdentifiers = [item.id, item.db_id, item.task_code, item.code]
        .filter(Boolean)
        .map((value) => String(value).replace(/^#/, ''))
      const matches = identifiers.some((identifier) => itemIdentifiers.includes(identifier))
        || item.title === task.title

      return matches
        ? { ...item, column: 'overdue', statusBadge: 'Completed', status: 'completed' }
        : item
    })

    setTasks(updatedTasks)
    try {
      localStorage.setItem('relink_tasks', JSON.stringify(updatedTasks))
      window.dispatchEvent(new CustomEvent('relink_tasks_updated', { detail: updatedTasks }))
    } catch (error) {
      console.warn('Gagal menyinkronkan tugas selesai ke dashboard mitra:', error)
    }
  }

  // Handler: Approve Bukti Kerja & TTD
  async function handleApproveProof(taskToApprove) {
    if (!signatureApproved) {
      alert('Silakan centang persetujuan tanda tangan digital sebelum mencairkan dana.')
      return
    }

    const relatedEscrow = escrowTransactions.find(
      (item) =>
        item.taskId === taskToApprove.id ||
        item.taskId === taskToApprove.db_id ||
        item.taskId === taskToApprove.task_code ||
        item.taskTitle === taskToApprove.title
    )

    try {
      if (!demoAccount) {
        if (relatedEscrow) {
          const escrowResult = await updateEscrowStatusInDb(relatedEscrow.id, 'released')
          if (!escrowResult.success) throw new Error('Status dana escrow gagal diperbarui.')
        }

        const taskResult = await updateTaskInDb(
          taskToApprove.db_id || taskToApprove.id || taskToApprove.task_code,
          { status: 'completed' }
        )
        if (!taskResult.success) throw new Error(taskResult.error || 'Status pekerjaan gagal diperbarui.')
      }

      markTaskCompletedLocally(taskToApprove)
      setEscrowTransactions((prev) =>
        prev.map((item) =>
          item.taskId === taskToApprove.id ||
          item.taskId === taskToApprove.db_id ||
          item.taskId === taskToApprove.task_code ||
          item.taskTitle === taskToApprove.title
            ? {
                ...item,
                status: 'released',
                statusLabel: 'Selesai & Dicairkan',
                statusBadgeColor: 'blue',
                autoReleaseHoursLeft: null,
              }
            : item
        )
      )

      setShowProofModal(false)
      setSelectedProofTask(null)
      setSignatureApproved(false)
      setReleaseSuccess({
        taskTitle: taskToApprove.title,
        workerName: taskToApprove.workerName || relatedEscrow?.workerName || 'Mitra',
        amount: Number(relatedEscrow?.amount || taskToApprove.budget) || 0,
      })
    } catch (error) {
      console.error('[Relink Escrow] Gagal menyelesaikan pekerjaan:', error)
      alert(`Pekerjaan belum dapat diselesaikan: ${error.message}`)
    }
  }

  // Handler: Lepas Dana Escrow Langsung
  async function handleReleaseEscrow(escrowItem) {
    if (isReleasingEscrow) return
    setIsReleasingEscrow(true)

    try {
      const relatedTask = tasks.find((task) =>
        task.id === escrowItem.taskId ||
        task.db_id === escrowItem.taskId ||
        task.task_code === escrowItem.taskId ||
        task.title === escrowItem.taskTitle
      )

      if (!demoAccount) {
        const escrowResult = await updateEscrowStatusInDb(escrowItem.id, 'released')
        if (!escrowResult.success) throw new Error('Status dana escrow gagal diperbarui.')

        const taskId = relatedTask?.db_id || relatedTask?.id || escrowItem.taskId
        if (taskId) {
          const taskResult = await updateTaskInDb(taskId, { status: 'completed' })
          if (!taskResult.success) throw new Error(taskResult.error || 'Status pekerjaan gagal diperbarui.')
        }
      }

      markTaskCompletedLocally(
        relatedTask || { id: escrowItem.taskId, title: escrowItem.taskTitle }
      )
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
            : item
        )
      )
      setShowEscrowModal(false)
      setSelectedEscrow(null)
      setReleaseSuccess({
        taskTitle: escrowItem.taskTitle,
        workerName: escrowItem.workerName || 'Mitra',
        amount: Number(escrowItem.amount) || 0,
      })
    } catch (error) {
      console.error('[Relink Escrow] Gagal melepas dana:', error)
      alert(`Dana belum berhasil dilepas: ${error.message}`)
    } finally {
      setIsReleasingEscrow(false)
    }
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

  // Perhitungan Data Escrow Dinamis
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

  const releasedEscrowAmount = (escrowTransactions || [])
    .filter((t) => t?.status === 'released')
    .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0)
  const additionalCompletedTasksAmount = (tasks || [])
    .filter((task) => task.column === 'overdue' || task.statusBadge === 'Completed' || task.status === 'completed')
    .filter((task) => !(escrowTransactions || []).some((tx) => tx.id === task.id || tx.taskId === task.id || tx.taskTitle === task.title))
    .reduce((sum, task) => sum + (Number(task.budget) || 0), 0)
  const totalReleasedAmount = releasedEscrowAmount + additionalCompletedTasksAmount

  const disputedAmount = (escrowTransactions || [])
    .filter((t) => t?.status === 'disputed')
    .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0)

  // Saldo Dana Garansi (pool garansi awal Rp500.000 + kontribusi proteksi garansi 5% per tugas aktif/selesai - klaim sengketa)
  const accumulatedGuaranteeFee = Math.round(
    (tasks || []).reduce((sum, task) => sum + (Number(task.budget) || 0) * 0.05, 0)
  )
  const totalGuaranteeBalance = Math.max(0, 500000 + accumulatedGuaranteeFee - disputedAmount)

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

    const generatedCode = `TSK-${Math.floor(100 + Math.random() * 900)}`
    unmarkDeletedTask(generatedCode)

    const createdTask = {
      id: generatedCode,
      task_code: generatedCode,
      client_id: currentUser?.id,
      code: `#${generatedCode}`,
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
    // Tambahkan pencatatan dana ke rekening escrow secara dinamis
    const newEscrow = {
      id: generatedCode,
      taskId: generatedCode,
      taskTitle: newTaskTitle,
      workerName: 'Mitra Terdekat (Pencarian)',
      amount: estimatedBudget,
      date: 'Hari ini',
      status: 'held',
      statusLabel: 'Tertahan di Escrow Relink',
      statusBadgeColor: 'mint',
      paymentGatewayRef: `PGW-${Math.floor(100000 + Math.random() * 900000)}`,
      releaseCondition: 'Otomatis cair setelah checklist diterima & bukti disetujui UMKM',
      checklistSummary: `${newTaskChecklist.length} butir acceptance criteria aktif`,
    }
    setEscrowTransactions((prev) => [newEscrow, ...prev])
    insertTaskToDb({
      taskCode: generatedCode,
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
    setActionSuccessMsg(`Tugas baru #${generatedCode} berhasil diposting! Dana Rp${estimatedBudget.toLocaleString('id-ID')} diamankan di Escrow Relink.`)
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
      {showOnboarding && (
        <OnboardingScreen
          onFinish={async () => {
            try {
              await completeOnboarding(currentUser)
              setShowOnboarding(false)
            } catch (error) {
              console.error('Gagal menyimpan penyelesaian onboarding UMKM:', error)
              setActionSuccessMsg(error.message || 'Status onboarding gagal disimpan.')
            }
          }}
          role="umkm"
        />
      )}
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
              className={`sidebar-nav-item${currentMenu === 'pengaturan' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('pengaturan')}
              title="Pengaturan Profil UMKM, Jam Operasional & Escrow"
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
                <Icon
                  className={`topbar-chevron ${showUserMenu ? 'topbar-chevron--open' : ''}`}
                  name="chevron-down"
                  size={14}
                />
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
                      setCurrentMenu('pengaturan')
                    }}
                    type="button"
                  >
                    <Icon name="settings" size={16} />
                    <span>Pengaturan Toko &amp; Akun</span>
                  </button>
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
                    <Icon name="logout" size={16} />
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
            isDemoAccount={demoAccount}
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
            disputedAmount={disputedAmount}
            escrowFilterTab={escrowFilterTab}
            escrowSearchQuery={escrowSearchQuery}
            escrowTransactions={escrowTransactions}
            filteredEscrowTransactions={filteredEscrowTransactions}
            handleReleaseEscrow={handleReleaseEscrow}
            isReleasingEscrow={isReleasingEscrow}
            heldCount={heldCount}
            releasedCount={releasedCount}
            reviewCount={reviewCount}
            setEscrowFilterTab={setEscrowFilterTab}
            setEscrowSearchQuery={setEscrowSearchQuery}
            setSelectedEscrow={setSelectedEscrow}
            setShowEscrowModal={setShowEscrowModal}
            totalGuaranteeBalance={totalGuaranteeBalance}
            totalHeldEscrow={totalHeldEscrow}
            totalReleasedAmount={totalReleasedAmount}
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

        {currentMenu === 'pengaturan' && (
          <PengaturanView
            key={`${currentUser.id || 'guest'}-${settingsLoaded ? 'loaded' : 'loading'}`}
            currentUser={currentUser}
            isDemoAccount={demoAccount}
            isSettingsLoaded={settingsLoaded}
            settings={accountSettings}
            onUpdateProfile={handleUpdateProfile}
            setActionSuccessMsg={setActionSuccessMsg}
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

      {releaseSuccess && (
        <div className="proof-modal-overlay">
          <section
            aria-labelledby="release-success-title"
            aria-modal="true"
            className="proof-modal-card"
            role="alertdialog"
          >
            <header className="proof-modal-header">
              <div>
                <h2 id="release-success-title">Pekerjaan berhasil diselesaikan</h2>
                <small>Dana escrow telah dilepas untuk mitra</small>
              </div>
              <button
                aria-label="Tutup notifikasi"
                className="btn-close-modal"
                onClick={() => setReleaseSuccess(null)}
                type="button"
              >
                ✕
              </button>
            </header>
            <div className="escrow-modal-body">
              <div className="escrow-modal-alert escrow-modal-alert--success">
                <Icon name="check" size={18} />
                <div>
                  <strong>Dana berhasil dilepas</strong>
                  <p>
                    Pekerjaan <strong>{releaseSuccess.taskTitle}</strong> untuk{' '}
                    <strong>{releaseSuccess.workerName}</strong> telah ditandai selesai.
                    Dana escrow sebesar{' '}
                    <strong>Rp{releaseSuccess.amount.toLocaleString('id-ID')}</strong>{' '}
                    sudah dilepas.
                  </p>
                </div>
              </div>
            </div>
            <footer className="escrow-modal-footer">
              <button
                autoFocus
                className="button button--pink"
                onClick={() => setReleaseSuccess(null)}
                type="button"
              >
                Selesai
              </button>
            </footer>
          </section>
        </div>
      )}

      {showEscrowModal && selectedEscrow && (
        <EscrowDetailModal
          handleReleaseEscrow={handleReleaseEscrow}
          isReleasingEscrow={isReleasingEscrow}
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
