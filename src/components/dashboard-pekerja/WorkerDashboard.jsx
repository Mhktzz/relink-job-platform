import { useState, useEffect, useRef } from 'react'
import relinkIcon from '../../assets/main-relink-1.svg'
import Icon from '../common/Icon.jsx'
import { supabase } from '../../lib/supabaseClient.js'
import {
  fetchTasksFromDb,
  updateTaskInDb,
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
import OnboardingScreen from '../common/OnboardingScreen.jsx'
import WorkerVerificationView, { WorkerVerificationBanner } from './WorkerVerification.jsx'
import {
  completeOnboarding,
  getStoredUser,
  hasPendingOnboarding,
  isDemoUser,
} from '../../lib/userSession.js'

import '../dashboard-perusahaan/ClientDashboard.css'
import './WorkerDashboard.css'

function WorkerDashboard() {
  const storedUser = getStoredUser()
  const demoAccount = isDemoUser(storedUser)
  const isEmptyDemoWorker = storedUser?.id === 'w-1'
  const useDemoData = demoAccount && !isEmptyDemoWorker
  const walletStorageKey = `relink_worker_wallet_${storedUser?.id || 'guest'}`
  const activeTaskStorageKey = `relink_worker_active_task_${storedUser?.id || 'guest'}`
  const notifStorageKey = `relink_worker_notifications_${storedUser?.id || 'guest'}`
  const [showOnboarding, setShowOnboarding] = useState(() => hasPendingOnboarding(storedUser))
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [verificationLoaded, setVerificationLoaded] = useState(isEmptyDemoWorker)
  const [verificationLookupError, setVerificationLookupError] = useState('')
  const [isVerificationSubmitting, setIsVerificationSubmitting] = useState(false)
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
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionSuccessMsg, setActionSuccessMsg] = useState('')
  const notifRef = useRef(null)

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
      if (storedUser) {
        return {
          ...initialWorkerProfile,
          id: storedUser.id || initialWorkerProfile.id,
          name: storedUser.full_name || storedUser.name || initialWorkerProfile.name,
          email: storedUser.email || initialWorkerProfile.email,
          tier: storedUser.tier || initialWorkerProfile.tier,
          rating: useDemoData ? initialWorkerProfile.rating : null,
          completedTasksCount: useDemoData ? initialWorkerProfile.completedTasksCount : 0,
          trustScore: useDemoData ? initialWorkerProfile.trustScore : 0,
          tierLabel: useDemoData ? initialWorkerProfile.tierLabel : 'Tier 1 — Basic',
          isRisingStar: useDemoData && initialWorkerProfile.isRisingStar,
          verifiedStatus: useDemoData
            ? initialWorkerProfile.verifiedStatus
            : { ktp: false, assessment: false, portfolioVideo: false, vouchingCount: 0 },
          isDemoAccount: useDemoData,
        }
      }
      return useDemoData ? initialWorkerProfile : { ...initialWorkerProfile, isDemoAccount: false }
    } catch {
      return initialWorkerProfile
    }
  })

  // State Tugas Aktif & Peluang Tugas
  const [activeTask, setActiveTask] = useState(() => {
    try {
      const savedTask = localStorage.getItem(activeTaskStorageKey)
      if (savedTask) {
        const parsedTask = JSON.parse(savedTask)
        if (parsedTask && typeof parsedTask === 'object' && (parsedTask.id || parsedTask.code)) {
          return parsedTask
        }
      }
    } catch (error) {
      console.warn('Gagal memuat tugas aktif mitra:', error)
    }

    return useDemoData ? initialActiveTask : null
  })
  const [availableJobs, setAvailableJobs] = useState(useDemoData ? initialAvailableJobs : [])
  const [walletData, setWalletData] = useState(() => {
    const emptyWallet = {
      availableBalance: 0,
      heldEscrowBalance: 0,
      monthlyTotalEarnings: 0,
      totalWithdrawn: 0,
      transactions: [],
    }

    try {
      const savedWallet = localStorage.getItem(walletStorageKey)
      if (savedWallet) {
        const parsedWallet = JSON.parse(savedWallet)
        if (parsedWallet && Array.isArray(parsedWallet.transactions)) {
          return { ...emptyWallet, ...parsedWallet }
        }
      }
    } catch (error) {
      console.warn('Gagal memuat data dompet mitra:', error)
    }

    return useDemoData ? initialWalletData : emptyWallet
  })
  const processedIncomeRef = useRef(
    new Set(
      walletData.transactions
        .filter((transaction) => transaction.type === 'income')
        .map((transaction) => transaction.id)
    )
  )
  const actionItems = useDemoData ? initialActionItems : []
  const upcomingSchedule = useDemoData ? initialUpcomingSchedule : []
  const [isAvailableNow, setIsAvailableNow] = useState(true)
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(notifStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (error) {
      console.warn('Gagal memuat notifikasi mitra:', error)
    }

    if (Array.isArray(walletData.transactions) && walletData.transactions.length > 0) {
      return walletData.transactions.slice(0, 8).map((tx, idx) => ({
        id: `seed-${tx.id || idx}`,
        type: tx.type === 'payout' ? 'payout' : 'income',
        title:
          tx.type === 'payout'
            ? 'Saldo Berhasil Dicairkan'
            : 'Saldo Masuk ke Dompet Mitra',
        message:
          tx.type === 'payout'
            ? `${tx.title} sebesar Rp${Number(tx.netAmount || 0).toLocaleString('id-ID')} telah berhasil diproses.`
            : `${tx.title} telah di-ACC. Dana Rp${Number(tx.netAmount || 0).toLocaleString('id-ID')} masuk ke saldo siap dicairkan.`,
        amount: Number(tx.netAmount || 0),
        createdAt: tx.date || 'Hari ini',
        timestamp: Date.now() - idx * 60000,
        read: true,
        targetMenu: 'dompet',
      }))
    }

    return []
  })

  useEffect(() => {
    try {
      localStorage.setItem(notifStorageKey, JSON.stringify(notifications))
    } catch (error) {
      console.warn('Gagal menyimpan notifikasi mitra:', error)
    }
  }, [notifications, notifStorageKey])

  useEffect(() => {
    function handleOutsideClick(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowNotifDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function pushNotification({ id, type, title, message, amount = null, targetMenu = 'dompet' }) {
    const now = new Date()
    const timeLabel = `Hari ini, ${now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })} WIB`
    const notifId = id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    setNotifications((prev) => {
      if (prev.some((item) => item.id === notifId)) return prev
      return [
        {
          id: notifId,
          type,
          title,
          message,
          amount,
          createdAt: timeLabel,
          timestamp: now.getTime(),
          read: false,
          targetMenu,
        },
        ...prev,
      ].slice(0, 30)
    })
  }

  function handleNotificationClick(notif) {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notif.id ? { ...item, read: true } : item))
    )
    setShowNotifDropdown(false)
    if (notif.targetMenu) {
      navigateToMenu(notif.targetMenu)
    }
  }

  function handleMarkAllNotificationsRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const unreadNotifCount = notifications.filter((item) => !item.read).length

  useEffect(() => {
    try {
      localStorage.setItem(walletStorageKey, JSON.stringify(walletData))
    } catch (error) {
      console.warn('Gagal menyimpan data dompet mitra:', error)
    }
  }, [walletData, walletStorageKey])

  useEffect(() => {
    try {
      if (activeTask && activeTask.status !== 'completed') {
        try {
          localStorage.setItem(activeTaskStorageKey, JSON.stringify(activeTask))
        } catch {
          // Fallback jika photoUrl terlalu besar untuk localStorage: simpan status tanpa data URL foto
          const slimTask = {
            ...activeTask,
            proofData: activeTask.proofData
              ? { ...activeTask.proofData, photoUrl: '' }
              : activeTask.proofData,
          }
          localStorage.setItem(activeTaskStorageKey, JSON.stringify(slimTask))
        }
      } else {
        localStorage.removeItem(activeTaskStorageKey)
      }
    } catch (error) {
      console.warn('Gagal menyimpan tugas aktif mitra:', error)
    }
  }, [activeTask, activeTaskStorageKey])

  // State Modals
  const [taskToAccept, setTaskToAccept] = useState(null)
  const [showProofModal, setShowProofModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    let isMounted = true

    if (isEmptyDemoWorker) {
      return () => {
        isMounted = false
      }
    }

    async function loadVerificationStatus() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        const user = sessionData.session?.user
        if (!user || user.id !== storedUser?.id) {
          if (isMounted) {
            setVerificationLookupError('Sesi login tidak tersedia. Silakan masuk kembali untuk mengirim data verifikasi.')
          }
          return
        }

        const { data, error } = await supabase
          .from('worker_verifications')
          .select('user_id, full_name')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) throw error
        if (isMounted) {
          setVerificationComplete(Boolean(data))
          if (data?.full_name) {
            setWorkerProfile((prev) => ({ ...prev, name: data.full_name }))
          }
        }
      } catch (error) {
        console.error('Gagal memuat status verifikasi mitra:', error)
        if (isMounted) {
          setVerificationLookupError('Status verifikasi belum dapat dimuat. Coba muat ulang halaman.')
        }
      } finally {
        if (isMounted) setVerificationLoaded(true)
      }
    }

    loadVerificationStatus()
    return () => {
      isMounted = false
    }
  }, [isEmptyDemoWorker, storedUser?.id])

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
    const requiredTier = task.tier_requirement || task.tierRequirement || task.tier || 'Tier 1'
    const locked = requiredTier === 'Tier 2' || requiredTier === 'Tier 3'

    return {
      id: rawId,
      db_id: task.db_id || null,
      task_code: task.task_code || String(rawId).replace(/^#/, ''),
      code: code,
      title: task.title || 'Tugas Baru UMKM Sekitar',
      category: task.category || 'Operasional Toko',
      tag: locked ? `Buka di ${requiredTier}` : `Instan (${requiredTier})`,
      locked,
      clientName: task.business_name || task.clientName || 'Toko UMKM Terdaftar',
      distance: task.distance || '0.9 km',
      duration: task.duration || 'Sekitar 2–3 jam',
      grossHonor: budget,
      netHonor: netHonor,
      tierRequired: requiredTier,
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

    if (isEmptyDemoWorker) {
      return () => {
        isMounted = false
      }
    }

    async function loadTasks() {
      try {
        const deletedIds = getDeletedTaskIds()
        const dbTasks = await fetchTasksFromDb({ includeMockData: useDemoData })

        let localTasks = []
        try {
          const saved = localStorage.getItem('relink_tasks')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed)) {
              localTasks = parsed.filter(
                (task) =>
                  isTaskActive(task, deletedIds) &&
                  (useDemoData || Boolean(task.client_id))
              )
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
        if (useDemoData) {
          initialAvailableJobs.forEach((job) => {
            if (!combinedMap.has(job.id) && job.id !== activeTask?.id) {
              combinedMap.set(job.id, job)
            }
          })
        }

        if (isMounted) {
          setAvailableJobs(Array.from(combinedMap.values()))
        }

        const allTasks = [...dbTasks, ...localTasks]
        const activeTaskIdentifiers = activeTask
          ? [activeTask.id, activeTask.db_id, activeTask.task_code, activeTask.code]
              .filter(Boolean)
              .map((value) => String(value).replace(/^#/, ''))
          : []

        // Sinkronisasi status tugas aktif (review / in_progress) dari Supabase agar tidak ter-reset saat pindah akun
        const matchedActiveFromDb = dbTasks.find((task) => {
          if (!task || task.status === 'completed' || task.column === 'overdue') return false
          const taskIds = [task.id, task.db_id, task.task_code, task.code]
            .filter(Boolean)
            .map((value) => String(value).replace(/^#/, ''))
          if (activeTaskIdentifiers.length > 0) {
            return taskIds.some((id) => activeTaskIdentifiers.includes(id))
          }
          return (
            Boolean(workerProfile.id) &&
            String(task.workerId || task.worker_id || '') === String(workerProfile.id) &&
            (task.status === 'in_progress' || task.status === 'review')
          )
        })

        if (matchedActiveFromDb && isMounted) {
          const isDbReview =
            matchedActiveFromDb.status === 'review' ||
            matchedActiveFromDb.statusBadge === 'Proof Review' ||
            Boolean(matchedActiveFromDb.hasProof)

          if (activeTask) {
            if (isDbReview && (activeTask.currentStepIndex < 3 || activeTask.status !== 'review')) {
              setActiveTask((prev) =>
                prev
                  ? {
                      ...prev,
                      db_id: prev.db_id || matchedActiveFromDb.db_id,
                      task_code: prev.task_code || matchedActiveFromDb.task_code,
                      currentStepIndex: 3,
                      status: 'review',
                      statusBadge: 'Proof Review',
                      proofSubmitted: true,
                    }
                  : prev
              )
            }
          } else {
            const mappedJob = mapTaskToAvailableJob(matchedActiveFromDb)
            setActiveTask({
              id: mappedJob.id,
              db_id: matchedActiveFromDb.db_id || null,
              task_code: matchedActiveFromDb.task_code || String(mappedJob.code || '').replace(/^#/, ''),
              code: String(mappedJob.code || mappedJob.id || '').replace(/^#/, ''),
              title: mappedJob.title,
              category: mappedJob.category,
              clientName: mappedJob.clientName,
              clientPhone: '0812-9876-5432',
              location: `${mappedJob.clientName}, Area Terdekat (${mappedJob.distance})`,
              distance: mappedJob.distance,
              grossHonor: mappedJob.grossHonor,
              commissionRate: 0.08,
              netHonor: mappedJob.netHonor,
              status: isDbReview ? 'review' : 'in_progress',
              statusBadge: isDbReview ? 'Proof Review' : 'In Progress',
              currentStepIndex: isDbReview ? 3 : 2,
              isEnRouteChecked: true,
              isInProgressChecked: true,
              proofSubmitted: isDbReview,
              escrowRef: `PGW-${String(matchedActiveFromDb.db_id || '884100').slice(0, 6).toUpperCase()}`,
              deadline: matchedActiveFromDb.dueDate || 'Hari ini, maks. 3 jam',
              checklist: (mappedJob.checklist || []).map((c, i) => ({
                id: `c-acc-${i}`,
                text: typeof c === 'string' ? c : c.text,
                done: isDbReview,
              })),
              instructions: mappedJob.description,
            })
          }
        }
        const completedTasks = allTasks.filter((task) => {
          if (!task) return false

          const taskIdentifiers = [task.id, task.db_id, task.task_code, task.code]
            .filter(Boolean)
            .map((value) => String(value).replace(/^#/, ''))
          const belongsToWorker =
            String(task.workerId || task.worker_id || '') === String(workerProfile.id) ||
            taskIdentifiers.some((identifier) => activeTaskIdentifiers.includes(identifier))
          const isCompleted =
            task.status === 'completed' ||
            task.column === 'overdue' ||
            task.statusBadge === 'Completed'

          return belongsToWorker && isCompleted
        })

        completedTasks.forEach((task) => {
          const taskReference = task.task_code || task.id || task.code
          if (!taskReference) return

          const incomeId = `income-${String(taskReference).replace(/^#/, '')}`
          if (processedIncomeRef.current.has(incomeId)) return

          processedIncomeRef.current.add(incomeId)
          const isActiveTask = activeTaskIdentifiers.some((identifier) =>
            [task.id, task.db_id, task.task_code, task.code]
              .filter(Boolean)
              .map((value) => String(value).replace(/^#/, ''))
              .includes(identifier)
          )
          const gross =
            Number(task.budget || task.grossHonor) ||
            Number(isActiveTask ? activeTask?.grossHonor : 0) ||
            0
          const earnedNet =
            Number(task.netHonor) ||
            Number(isActiveTask ? activeTask?.netHonor : 0) ||
            Math.round(gross * 0.92)
          const fee = Math.max(0, gross - earnedNet)
          const title = task.title || activeTask?.title || 'Pekerjaan selesai'
          const client = task.clientName || task.business_name || activeTask?.clientName || 'UMKM'

          setWalletData((prev) => {
            if (prev.transactions.some((transaction) => transaction.id === incomeId)) {
              return prev
            }

            return {
              ...prev,
              availableBalance: prev.availableBalance + earnedNet,
              heldEscrowBalance: Math.max(0, prev.heldEscrowBalance - earnedNet),
              monthlyTotalEarnings: prev.monthlyTotalEarnings + earnedNet,
              transactions: [
                {
                  id: incomeId,
                  date: new Date().toLocaleDateString('id-ID'),
                  title: `Honor Tugas ${task.code || taskReference} — ${title}`,
                  client,
                  grossAmount: gross,
                  fee,
                  netAmount: earnedNet,
                  type: 'income',
                  status: 'Selesai & Masuk Saldo',
                },
                ...prev.transactions,
              ],
            }
          })

          setWorkerProfile((prev) => ({
            ...prev,
            completedTasksCount: prev.completedTasksCount + 1,
          }))
          pushNotification({
            id: `notif-${incomeId}`,
            type: 'income',
            title: 'Saldo Masuk ke Dompet Mitra',
            message: `Pekerjaan "${title}" telah di-ACC oleh ${client}. Dana Rp${earnedNet.toLocaleString('id-ID')} masuk ke saldo siap dicairkan.`,
            amount: earnedNet,
            targetMenu: 'dompet',
          })
          showToast(`Pekerjaan selesai! Dana Rp${earnedNet.toLocaleString('id-ID')} sudah masuk ke saldo siap dicairkan.`)

          if (isActiveTask) setActiveTask(null)
        })
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
  }, [activeTask, isEmptyDemoWorker, useDemoData, workerProfile.id])

  // Handler Toast Notifikasi
  function showToast(msg) {
    setActionSuccessMsg(msg)
    setTimeout(() => setActionSuccessMsg(''), 5000)
  }

  function navigateToMenu(menu) {
    if (menu === 'peluang' && verificationLoaded && !verificationComplete) {
      setCurrentMenu('verifikasi')
      return
    }
    setCurrentMenu(menu)
  }

  async function handleWorkerVerificationSubmit(form) {
    setIsVerificationSubmitting(true)
    try {
      if (isEmptyDemoWorker) {
        setVerificationComplete(true)
        setCurrentMenu('peluang')
        return
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const user = sessionData.session?.user
      if (!user || user.id !== storedUser?.id) {
        throw new Error('Sesi login tidak tersedia. Silakan masuk kembali sebelum mengirim data.')
      }

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          user_id: user.id,
          full_name: form.fullName,
          role: 'mitra',
          tier: 'Tier 1',
          is_verified: false,
        },
        { onConflict: 'id' }
      )
      if (profileError) throw profileError

      const { error } = await supabase.from('worker_verifications').upsert(
        {
          user_id: user.id,
          full_name: form.fullName,
          domicile: form.domicile,
          marital_status: form.maritalStatus,
          nik: form.nik,
          mother_name: form.motherName,
          verification_status: 'submitted',
        },
        { onConflict: 'user_id' }
      )

      if (error) {
        console.error('Gagal menyimpan data verifikasi mitra:', error)
        throw new Error(`Data belum berhasil dikirim: ${error.message}`)
      }

      setWorkerProfile((prev) => ({ ...prev, name: form.fullName }))
      setVerificationComplete(true)
      showToast('Data diri berhasil dikirim. Peluang tugas Tier 1 sudah bisa dicari.')
      setCurrentMenu('peluang')
    } finally {
      setIsVerificationSubmitting(false)
    }
  }

  function handleOpenAcceptModal(job) {
    if (!verificationComplete) {
      setCurrentMenu('verifikasi')
      return
    }
    setTaskToAccept(job)
  }

  // Handler: Ambil Tugas Baru
  async function handleConfirmAcceptTask(task) {
    setIsProcessing(true)
    if (!useDemoData) {
      let sessionData
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        sessionData = data
      } catch (error) {
        setIsProcessing(false)
        showToast(`Sesi Supabase gagal diperiksa: ${error.message}`)
        return
      }

      if (sessionData.session?.user.id !== workerProfile.id) {
        setIsProcessing(false)
        showToast('Sesi login tidak aktif. Silakan masuk kembali sebelum mengambil tugas.')
        return
      }

      const result = await updateTaskInDb(task.id, {
        status: 'in_progress',
        workerId: workerProfile.id,
        workerName: workerProfile.name,
      })
      if (!result.success) {
        setIsProcessing(false)
        showToast(`Tugas belum berhasil diambil: ${result.error || 'gagal menyimpan penugasan.'}`)
        return
      }
    }

    setTimeout(() => {
      setAvailableJobs((prev) => prev.filter((j) => j.id !== task.id))

      const normalizedCode = String(task.code || task.task_code || task.id || '').replace(/^#/, '')
      const newTask = {
        id: task.id,
        db_id: task.db_id || null,
        task_code: task.task_code || normalizedCode,
        code: normalizedCode,
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
                worker_id: workerProfile.id,
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

  // Handler: Serah Terima Digital & Pengajuan Pencairan Bukti (Ajukan ke Review)
  async function handleSubmitProof(completedChecklist, workNotes, proofData) {
    if (!activeTask) return
    setIsProcessing(true)

    const updatedProof = {
      fileName: proofData?.fileName || 'bukti-kerja.jpg',
      fileSize: proofData?.fileSize || 0,
      photoUrl: proofData?.photoUrl || '',
      note: proofData?.note || workNotes || 'Pekerjaan selesai rapi dan sudah diperiksa bersama UMKM.',
      timestamp:
        proofData?.timestamp ||
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      gpsLocation: proofData?.gpsLocation || '-6.1754, 106.8272 (Verified)',
    }

    const cleanCode = String(activeTask.task_code || activeTask.code || activeTask.id || '').replace(/^#/, '')
    const taskIdentifier = activeTask.db_id || cleanCode

    if (!isEmptyDemoWorker && taskIdentifier) {
      const result = await updateTaskInDb(taskIdentifier, {
        status: 'review',
        hasProof: true,
        workerId: workerProfile.id,
        workerName: workerProfile.name || 'Mitra',
        checklist: (completedChecklist || []).map((item) =>
          typeof item === 'string' ? item : item.text
        ),
      })

      if (!result.success) {
        setIsProcessing(false)
        showToast(`Bukti belum berhasil dikirim ke server: ${result.error || 'periksa koneksi Supabase.'}`)
        return
      }
    }

    const nextActiveTask = {
      ...activeTask,
      currentStepIndex: 3, // Tahap 4: Review Bukti (Menunggu Review Klien)
      status: 'review',
      statusBadge: 'Proof Review',
      proofSubmitted: true,
      proofData: updatedProof,
      checklist: completedChecklist,
    }

    setActiveTask(nextActiveTask)

    // Perbarui status tugas di relink_tasks agar otomatis pindah ke kolom Tunggu Review pada dashboard perusahaan
    try {
      const saved = localStorage.getItem('relink_tasks')
      if (saved) {
        const parsed = JSON.parse(saved)
        const updated = parsed.map((item) => {
          const itemIds = [item.id, item.db_id, item.task_code, item.code]
            .filter(Boolean)
            .map((v) => String(v).replace(/^#/, ''))
          const activeIds = [activeTask.id, activeTask.db_id, activeTask.task_code, activeTask.code]
            .filter(Boolean)
            .map((v) => String(v).replace(/^#/, ''))

          if (itemIds.some((id) => activeIds.includes(id))) {
            return {
              ...item,
              status: 'review',
              statusBadge: 'Proof Review',
              column: 'due_week',
              hasProof: true,
              proofSubmitted: true,
              proofData: updatedProof,
            }
          }
          return item
        })
        try {
          localStorage.setItem('relink_tasks', JSON.stringify(updated))
        } catch {
          const slimUpdated = updated.map((item) =>
            item.proofData ? { ...item, proofData: { ...item.proofData, photoUrl: '' } } : item
          )
          localStorage.setItem('relink_tasks', JSON.stringify(slimUpdated))
        }
        window.dispatchEvent(new CustomEvent('relink_tasks_updated', { detail: updated }))
      }
    } catch (e) {
      console.warn('Gagal sinkron pengajuan review:', e)
    }

    setIsProcessing(false)
    setShowProofModal(false)
    pushNotification({
      id: `notif-proof-${cleanCode}-${Date.now()}`,
      type: 'proof_submitted',
      title: 'Bukti Pekerjaan Terkirim',
      message: `Bukti kerja tugas #${cleanCode} telah dikirim dan sedang menunggu persetujuan (ACC) perusahaan.`,
      targetMenu: 'pekerjaan',
    })
    showToast(`Bukti kerja tugas #${cleanCode} berhasil dikirim! Tugas telah diajukan ke review klien.`)
  }

  // Handler: Tarik Dana Dompet
  function handleWithdrawConfirm({ method, accountNumber, accountHolder, amount }) {
    setIsProcessing(true)
    setTimeout(() => {
      const wdId = `WD-${Math.floor(100 + Math.random() * 900)}`
      setWalletData((prev) => ({
        ...prev,
        availableBalance: prev.availableBalance - amount,
        totalWithdrawn: prev.totalWithdrawn + amount,
        transactions: [
          {
            id: wdId,
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

      pushNotification({
        id: `notif-payout-${wdId}-${Date.now()}`,
        type: 'payout',
        title: 'Saldo Berhasil Dicairkan',
        message: `Penarikan sebesar Rp${amount.toLocaleString('id-ID')} ke ${method.toUpperCase()} (${accountNumber}) a.n. ${accountHolder} berhasil diproses.`,
        amount,
        targetMenu: 'dompet',
      })

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
      {showOnboarding && (
        <OnboardingScreen
          onFinish={async () => {
            try {
              await completeOnboarding(storedUser)
              setShowOnboarding(false)
            } catch (error) {
              console.error('Gagal menyimpan penyelesaian onboarding mitra:', error)
              showToast(error.message || 'Status onboarding gagal disimpan.')
            }
          }}
          role="pekerja"
        />
      )}
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
              onClick={() => navigateToMenu('peluang')}
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
              title="Reputasi & Verifikasi"
              type="button"
            >
              <Icon name="star" size={18} />
              {isSidebarExpanded && <span>Reputasi</span>}
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
              {isSidebarExpanded && useDemoData && <span className="nav-counter-pill">2</span>}
            </button>

            <button
              className={`sidebar-nav-item${currentMenu === 'keamanan' ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => setCurrentMenu('keamanan')}
              title="Pusat Keamanan & SOP"
              type="button"
            >
              <Icon name="shield" size={18} />
              {isSidebarExpanded && <span>Keamanan &amp; SOP</span>}
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

            <div className="topbar-notif-wrapper" ref={notifRef}>
              <button
                aria-expanded={showNotifDropdown}
                aria-label="Notifikasi"
                className={`topbar-action-icon${showNotifDropdown ? ' topbar-action-icon--active' : ''}`}
                onClick={() => {
                  setShowUserDropdown(false)
                  setShowNotifDropdown((prev) => !prev)
                }}
                title="Notifikasi"
                type="button"
              >
                <Icon name="bell" size={18} />
                {unreadNotifCount > 0 && (
                  <span className="topbar-notif-badge">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="topbar-notif-dropdown" role="region" aria-label="Daftar Notifikasi">
                  <div className="notif-dropdown-header">
                    <div className="notif-dropdown-title-wrap">
                      <strong>Notifikasi</strong>
                      {unreadNotifCount > 0 && (
                        <span className="notif-unread-pill">{unreadNotifCount} baru</span>
                      )}
                    </div>
                    {unreadNotifCount > 0 && (
                      <button
                        className="notif-mark-all-btn"
                        onClick={handleMarkAllNotificationsRead}
                        type="button"
                      >
                        Tandai dibaca
                      </button>
                    )}
                  </div>

                  <div className="notif-dropdown-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty-state">
                        <div className="notif-empty-icon">
                          <Icon name="bell" size={20} />
                        </div>
                        <strong>Belum ada notifikasi</strong>
                        <p>
                          Notifikasi pencairan saldo dan honor masuk setelah pekerjaan di-ACC perusahaan akan muncul di sini.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          className={`notif-item ${!notif.read ? 'notif-item--unread' : ''}`}
                          onClick={() => handleNotificationClick(notif)}
                          type="button"
                        >
                          <div
                            className={`notif-item-icon notif-item-icon--${notif.type || 'info'}`}
                          >
                            <Icon
                              name={
                                notif.type === 'income'
                                  ? 'check-circle'
                                  : notif.type === 'payout'
                                    ? 'wallet'
                                    : 'clock'
                              }
                              size={16}
                            />
                          </div>
                          <div className="notif-item-content">
                            <div className="notif-item-top">
                              <strong>{notif.title}</strong>
                              {!notif.read && <span className="notif-item-unread-dot" />}
                            </div>
                            <p>{notif.message}</p>
                            <div className="notif-item-meta">
                              <small>{notif.createdAt}</small>
                              {typeof notif.amount === 'number' && notif.amount > 0 && (
                                <span
                                  className={`notif-amount-tag notif-amount-tag--${notif.type}`}
                                >
                                  {notif.type === 'income' ? '+' : '-'}Rp
                                  {notif.amount.toLocaleString('id-ID')}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="notif-dropdown-footer">
                    <button
                      className="notif-footer-link"
                      onClick={() => {
                        setShowNotifDropdown(false)
                        navigateToMenu('dompet')
                      }}
                      type="button"
                    >
                      Lihat Dompet &amp; Riwayat Saldo &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

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
                onClick={() => {
                  setShowNotifDropdown(false)
                  setShowUserDropdown(!showUserDropdown)
                }}
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
                      setCurrentMenu('verifikasi')
                    }}
                    type="button"
                  >
                    <Icon name="shield" size={16} />
                    <span>Data Diri &amp; Verifikasi</span>
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
            onOpenAcceptModal={handleOpenAcceptModal}
            onOpenProofModal={() => setShowProofModal(true)}
            onOpenQuizModal={() => setShowQuizModal(true)}
            onOpenWithdrawModal={() => setShowWithdrawModal(true)}
            setCurrentMenu={navigateToMenu}
            setIsAvailableNow={setIsAvailableNow}
            upcomingSchedule={upcomingSchedule}
            walletData={walletData}
            workerProfile={workerProfile}
            verificationComplete={verificationComplete}
            verificationLoaded={verificationLoaded}
            onCompleteProfile={() => setCurrentMenu('verifikasi')}
          />
        )}

        {currentMenu === 'pekerjaan-saya' && (
          <PekerjaanSayaView
            activeTask={activeTask}
            onCheckInArrived={handleCheckInArrived}
            onOpenProofModal={() => setShowProofModal(true)}
            setCurrentMenu={navigateToMenu}
            upcomingSchedule={upcomingSchedule}
            walletData={walletData}
            workerProfile={workerProfile}
          />
        )}

        {currentMenu === 'peluang' && (
          !verificationLoaded ? (
            <main className="clean-dash-wrapper">
              <p role="status">Memeriksa status data verifikasi...</p>
            </main>
          ) : !verificationComplete ? (
            <WorkerVerificationView
              isDemoAccount={isEmptyDemoWorker}
              isSubmitting={isVerificationSubmitting}
              lookupError={verificationLookupError}
              onBack={() => setCurrentMenu('beranda')}
              onSubmit={handleWorkerVerificationSubmit}
              workerName={workerProfile.name}
            />
          ) : (
            <PeluangTugasView
              availableJobs={availableJobs}
              initialTab="tier1"
              onOpenAcceptModal={handleOpenAcceptModal}
              searchQueryGlobal={searchQuery}
              verificationComplete={verificationComplete}
              onVerificationAction={() => navigateToMenu('peluang')}
            />
          )
        )}

        {currentMenu === 'verifikasi' && (
          verificationComplete ? (
            <main className="clean-dash-wrapper">
              <WorkerVerificationBanner
                isComplete
                onAction={() => navigateToMenu('peluang')}
              />
            </main>
          ) : (
            <WorkerVerificationView
              isDemoAccount={isEmptyDemoWorker}
              isSubmitting={isVerificationSubmitting}
              lookupError={verificationLookupError}
              onBack={() => setCurrentMenu('beranda')}
              onSubmit={handleWorkerVerificationSubmit}
              workerName={workerProfile.name}
            />
          )
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
          <KeamananSopView />
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
            navigateToMenu('peluang')
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
          <span>Reputasi</span>
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
