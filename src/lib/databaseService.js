import { supabase } from './supabaseClient.js'
import technicianPhoto from '../assets/technician.jpg'
import cashierPhoto from '../assets/cashier.jpg'
import {
  initialTaskBoard,
  initialEscrowTransactions,
  initialNearbyWorkers,
} from '../components/dashboard-perusahaan/mockData.js'

/**
 * Service Database Relink (Supabase PostgreSQL Integration)
 * Dilengkapi graceful fallback ke data mock lokal jika tabel di Supabase belum dibuat.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Helper: Ambil daftar ID tugas yang telah dihapus permanen oleh pengguna (tombstone)
export function getDeletedTaskIds() {
  try {
    const saved = localStorage.getItem('relink_deleted_task_ids')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Helper: Tandai ID tugas sebagai terhapus permanen
export function markTaskAsDeleted(identifiers) {
  try {
    const current = new Set(getDeletedTaskIds().map((v) => String(v).toLowerCase()))
    const list = Array.isArray(identifiers) ? identifiers : [identifiers]
    list.forEach((item) => {
      if (!item) return
      if (typeof item === 'object') {
        if (item.id) {
          current.add(String(item.id).toLowerCase())
          current.add(String(item.id).replace(/^#/, '').toLowerCase())
        }
        if (item.db_id) current.add(String(item.db_id).toLowerCase())
        if (item.task_code) {
          current.add(String(item.task_code).toLowerCase())
          current.add(String(item.task_code).replace(/^#/, '').toLowerCase())
        }
        if (item.code) {
          current.add(String(item.code).toLowerCase())
          current.add(String(item.code).replace(/^#/, '').toLowerCase())
        }
      } else {
        const str = String(item).toLowerCase()
        current.add(str)
        current.add(str.replace(/^#/, ''))
      }
    })
    localStorage.setItem('relink_deleted_task_ids', JSON.stringify(Array.from(current)))
  } catch (e) {
    console.warn('[Relink] Gagal markTaskAsDeleted:', e)
  }
}

// Helper: Hapus penandaan tugas terhapus jika pengguna membuat tugas baru
export function unmarkDeletedTask(identifiers) {
  try {
    const list = (Array.isArray(identifiers) ? identifiers : [identifiers]).map((v) =>
      String(v).toLowerCase()
    )
    const current = getDeletedTaskIds().filter(
      (id) => !list.includes(String(id).toLowerCase()) && !list.includes(String(id).replace(/^#/, '').toLowerCase())
    )
    localStorage.setItem('relink_deleted_task_ids', JSON.stringify(current))
  } catch (e) {
    console.warn('[Relink] Gagal unmarkDeletedTask:', e)
  }
}

// Helper: Periksa apakah tugas aktif (belum dihapus oleh pengguna)
export function isTaskActive(task, deletedIds = null) {
  if (!task) return false
  const blacklist = deletedIds || getDeletedTaskIds()
  if (!Array.isArray(blacklist) || blacklist.length === 0) return true

  const candidates = [
    task.id,
    task.db_id,
    task.task_code,
    task.code,
    typeof task.code === 'string' ? task.code.replace(/^#/, '') : null,
    typeof task.id === 'string' ? task.id.replace(/^#/, '') : null,
  ]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase())

  return !candidates.some((c) => blacklist.includes(c))
}

// 1. Mengambil Daftar Tugas
export async function fetchTasksFromDb({ clientId = null, includeMockData = true } = {}) {
  const deletedIds = getDeletedTaskIds()

  function getLocalTasks() {
    try {
      const saved = localStorage.getItem('relink_tasks')
      if (saved === null) return []
      const parsed = JSON.parse(saved)
      if (!Array.isArray(parsed)) return []
      return parsed.filter(
        (task) =>
          isTaskActive(task, deletedIds) &&
          (includeMockData
            ? true
            : clientId
              ? String(task.client_id) === String(clientId)
              : Boolean(task.client_id))
      )
    } catch {
      return []
    }
  }

  try {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    else if (!includeMockData) query = query.not('client_id', 'is', null)
    const { data, error } = await query

    if (error) {
      console.warn('[Relink DB] Gagal mengambil tugas dari Supabase:', error.message)
      const localTasks = getLocalTasks()
      return localTasks.length || !includeMockData
        ? localTasks
        : initialTaskBoard.filter((t) => isTaskActive(t, deletedIds))
    }

    if (!data) return []

    // Jika Supabase mengembalikan 0 baris (misal semua tugas telah dihapus oleh pengguna)
    if (data.length === 0) {
      return getLocalTasks()
    }

    // Mapping kolom Supabase ke state TaskBoard
    const mapped = data.map((t) => ({
      id: t.task_code || t.id,
      db_id: t.id,
      client_id: t.client_id,
      task_code: t.task_code,
      code: t.task_code ? `#${t.task_code}` : `#${t.id.slice(0, 6)}`,
      status: t.status,
      statusBadge:
        t.status === 'review'
          ? 'Proof Review'
          : t.status === 'in_progress'
            ? 'In Progress'
            : t.status === 'completed'
              ? 'Completed'
              : 'Open',
      title: t.title,
      category: t.category,
      description: Array.isArray(t.checklist) ? t.checklist.join(', ') : '',
      priority: t.workers_needed > 1 ? 'High' : 'Normal',
      tier: t.tier_requirement,
      column:
        t.status === 'completed'
          ? 'overdue'
          : t.status === 'review'
            ? 'due_week'
            : 'current',
      workerName: t.worker_name || 'Menunggu Mitra',
      workerId: t.worker_id,
      budget: Number(t.budget),
      dueDate: t.due_date || 'Hari ini, 17:00 WIB',
      hasProof: Boolean(t.has_proof),
      location: t.location_address || 'Lokasi UMKM',
      checklist: Array.isArray(t.checklist) ? t.checklist : [],
      acceptanceChecklist: Array.isArray(t.checklist)
        ? t.checklist.map((item, idx) => ({
            id: `c-db-${idx}`,
            text: typeof item === 'string' ? item : item.text,
            done: t.status === 'completed' || t.status === 'review',
          }))
        : [],
    }))

    // Filter seluruh tugas yang pernah dihapus pengguna
    return mapped.filter((t) => isTaskActive(t, deletedIds))
  } catch (err) {
    console.warn('[Relink DB] Gagal mengambil tugas dari Supabase, beralih ke mock data:', err)
    const localTasks = getLocalTasks()
    return localTasks.length || !includeMockData
      ? localTasks
      : initialTaskBoard.filter((t) => isTaskActive(t, deletedIds))
  }
}

// 2. Menambah Tugas Baru ke Database
export async function insertTaskToDb(newTask) {
  try {
    const taskCode = newTask.taskCode || newTask.task_code || `TSK-${Math.floor(100 + Math.random() * 900)}`
    unmarkDeletedTask(taskCode)

    // Normalisasi kategori agar selalu sesuai dengan constraint tabel tasks di Supabase
    const categoryMapping = {
      operasional: 'operasional',
      display: 'display',
      kasir: 'kasir',
      inventaris: 'inventaris',
      logistik: 'logistik',
      teknis: 'kasir', // Pemeliharaan Mesin Kasir & POS
      administrasi: 'inventaris', // Input Stok & Pembukuan
    }
    const safeCategory = categoryMapping[newTask.category] || 'operasional'

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          task_code: taskCode,
          title: newTask.title,
          category: safeCategory,
          tier_requirement: newTask.tier || 'Tier 1',
          budget: newTask.budget || 85000,
          workers_needed: newTask.workersNeeded || 1,
          is_tandem: Boolean(newTask.isTandem),
          checklist: newTask.checklist || [],
          status: 'in_progress',
          location_address: 'Toko Kue Bu Rina, Tebet',
          due_date: 'Hari ini, 18:00 WIB',
          client_id: newTask.clientId || null,
        },
      ])
      .select()

    if (error) {
      console.warn('[Relink DB] Insert task gagal, disimpan di memory:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true, data: data?.[0] }
  } catch (err) {
    console.warn('[Relink DB] Error insert task:', err)
    return { success: false, error: err.message }
  }
}

// 2b. Memperbarui Tugas di Database (Edit)
export async function updateTaskInDb(taskIdOrCode, updatedFields) {
  try {
    const payload = { updated_at: new Date().toISOString() }
    if (updatedFields.title !== undefined) payload.title = updatedFields.title
    if (updatedFields.category !== undefined) {
      const categoryMapping = {
        operasional: 'operasional',
        display: 'display',
        kasir: 'kasir',
        inventaris: 'inventaris',
        logistik: 'logistik',
        teknis: 'kasir',
        administrasi: 'inventaris',
      }
      payload.category = categoryMapping[updatedFields.category] || updatedFields.category
    }
    if (updatedFields.tier !== undefined) payload.tier_requirement = updatedFields.tier
    if (updatedFields.budget !== undefined) payload.budget = Number(updatedFields.budget)
    if (updatedFields.workersNeeded !== undefined) payload.workers_needed = Number(updatedFields.workersNeeded)
    if (updatedFields.checklist !== undefined) payload.checklist = updatedFields.checklist
    if (updatedFields.dueDate !== undefined) payload.due_date = updatedFields.dueDate
    if (updatedFields.status !== undefined) {
      const statusMapping = {
        'In Progress': 'in_progress',
        'Proof Review': 'review',
        'Completed': 'completed',
        'in_progress': 'in_progress',
        'review': 'review',
        'completed': 'completed',
        'open': 'open',
      }
      payload.status = statusMapping[updatedFields.status] || 'in_progress'
    }
    if (updatedFields.workerId !== undefined) payload.worker_id = updatedFields.workerId
    if (updatedFields.workerName !== undefined) payload.worker_name = updatedFields.workerName

    let query = supabase.from('tasks').update(payload)
    if (typeof taskIdOrCode === 'string' && UUID_REGEX.test(taskIdOrCode)) {
      query = query.eq('id', taskIdOrCode)
    } else {
      const codeClean = String(taskIdOrCode).replace(/^#/, '')
      query = query.eq('task_code', codeClean)
    }

    const { data, error } = await query.select()
    if (error) {
      console.warn('[Relink DB] Update task gagal:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true, data: data?.[0] }
  } catch (err) {
    console.warn('[Relink DB] Error update task:', err)
    return { success: false, error: err.message }
  }
}

// 2c. Menghapus Tugas dari Database (Delete)
export async function deleteTaskFromDb(taskOrId) {
  try {
    const isObj = typeof taskOrId === 'object' && taskOrId !== null
    const idVal = isObj ? (taskOrId.id || taskOrId.task_code || taskOrId.db_id) : taskOrId
    const dbId = isObj ? taskOrId.db_id : null
    const codeVal = isObj ? (taskOrId.task_code || taskOrId.code) : null

    // 1. Catat ke daftar ID yang terhapus permanen (tombstone)
    const identifiersToBlock = [idVal, dbId, codeVal, taskOrId].filter(Boolean)
    markTaskAsDeleted(identifiersToBlock)

    // 2. Simpan perubahan ke localStorage secara instan
    try {
      const saved = localStorage.getItem('relink_tasks')
      if (saved) {
        const parsed = JSON.parse(saved)
        const deletedIds = getDeletedTaskIds()
        const filtered = parsed.filter((t) => isTaskActive(t, deletedIds))
        localStorage.setItem('relink_tasks', JSON.stringify(filtered))
      }
    } catch (e) {
      console.warn('[Relink] Gagal update localStorage saat delete:', e)
    }

    // 3. Eksekusi delete di Supabase Database
    const targetUuid =
      dbId && UUID_REGEX.test(dbId)
        ? dbId
        : typeof idVal === 'string' && UUID_REGEX.test(idVal)
          ? idVal
          : null

    if (targetUuid) {
      const { error: errUuid } = await supabase.from('tasks').delete().eq('id', targetUuid)
      if (errUuid) {
        console.warn('[Relink DB] Delete task by id warning:', errUuid.message)
      }
    }

    const targetCode =
      typeof idVal === 'string' && !UUID_REGEX.test(idVal)
        ? idVal.replace(/^#/, '')
        : typeof codeVal === 'string'
          ? codeVal.replace(/^#/, '')
          : null

    if (targetCode) {
      const { error: errCode } = await supabase.from('tasks').delete().eq('task_code', targetCode)
      if (errCode) {
        console.warn('[Relink DB] Delete task by task_code warning:', errCode.message)
      }
    }

    return { success: true }
  } catch (err) {
    console.warn('[Relink DB] Error delete task:', err)
    return { success: true }
  }
}

// 3. Mengambil Transaksi Escrow
export async function fetchEscrowFromDb({ clientId = null, includeMockData = true } = {}) {
  if (!includeMockData && !clientId) return []

  try {
    let query = supabase
      .from('escrow_transactions')
      .select('*')
      .order('created_at', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    const { data, error } = await query

    if (error || !data || data.length === 0) {
      return includeMockData ? initialEscrowTransactions : []
    }

    return data.map((e, index) => {
      const isReview = e.status === 'review' || e.status === 'under_review'
      const isHeld = e.status === 'held'
      const isReleased = e.status === 'released'
      const statusNormalized = isReview ? 'review' : e.status

      return {
        id: e.transaction_code || `ESC-90${80 + index}`,
        taskId: e.task_id || `TSK-10${index + 1}`,
        taskTitle: e.task_title || 'Tugas Operasional Toko',
        workerName: e.worker_name || 'Mitra Relink',
        mitraName: e.worker_name || 'Mitra Relink',
        workerPhoto: index % 2 === 0 ? technicianPhoto : cashierPhoto,
        tier: e.worker_tier || 'Tier 1 (Basic)',
        amount: Number(e.task_amount || 0),
        platformFee: Number(e.platform_fee || 4000),
        guaranteeFee: Number(e.guarantee_fund_fee || 1500),
        guaranteeFund: Number(e.guarantee_fund_fee || 1500),
        status: statusNormalized,
        statusLabel: isReview
          ? 'Menunggu Review Bukti'
          : isHeld
          ? 'Dana Tertahan (Mitra Bekerja)'
          : isReleased
          ? 'Selesai & Dicairkan'
          : 'Dalam Mediasi Tim Relink',
        statusBadgeColor: isReview
          ? 'mint'
          : isHeld
          ? 'amber'
          : isReleased
          ? 'blue'
          : 'pink',
        createdAt: e.created_at
          ? new Date(e.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '18 Nov 2026, 10:00',
        timestamp: e.created_at
          ? new Date(e.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '18 Nov 2026, 10:00',
        autoReleaseHoursLeft: isReview ? 24 : null,
        autoReleaseHours: isReview ? 24 : null,
        checklistSummary: 'Kriteria tuntas sesuai SOP',
        paymentGatewayRef: `PGW-BCA-${778100 + index}`,
      }
    })
  } catch (err) {
    console.warn('[Relink DB] Escrow fallback to mock:', err)
    return includeMockData ? initialEscrowTransactions : []
  }
}

// 4. Memperbarui Status Escrow (Pencairan / Sanggahan)
export async function updateEscrowStatusInDb(transactionCode, newStatus) {
  try {
    const { error } = await supabase
      .from('escrow_transactions')
      .update({
        status: newStatus,
        released_at: newStatus === 'released' ? new Date().toISOString() : null,
      })
      .eq('transaction_code', transactionCode)

    return { success: !error }
  } catch (err) {
    console.warn('[Relink DB] Update escrow error:', err)
    return { success: false }
  }
}

// 5. Mengambil Data Radar Mitra
export async function fetchNearbyWorkersFromDb() {
  try {
    const { data, error } = await supabase
      .from('nearby_workers')
      .select('*')
      .order('distance_km', { ascending: true })

    if (error || !data || data.length === 0) {
      return initialNearbyWorkers
    }

    return data.map((w) => ({
      id: w.id,
      name: w.name,
      role: w.role_title,
      tier: w.tier,
      tierName: w.tier === 'Tier 1' ? 'Basic' : w.tier === 'Tier 2' ? 'Terverifikasi' : 'Pro (Lead)',
      distance: `${w.distance_km} km`,
      rating: Number(w.rating),
      completedJobs: w.completed_tasks,
      ratePerTask: w.tier === 'Tier 3' ? 60000 : w.tier === 'Tier 2' ? 45000 : 35000,
      status: w.is_instant_ready ? 'Siap Kerja Instan' : 'Tersedia',
      isRisingStar: Boolean(w.is_rising_star),
      skills: w.skills || [],
      verifiedBadges: ['KTP Terverifikasi', 'Lolos Kuis Skenario SOP'],
    }))
  } catch (err) {
    console.warn('[Relink DB] Workers fallback to mock:', err)
    return initialNearbyWorkers
  }
}

// 6. Menyimpan Tiket Bantuan / Pengaduan
export async function insertSupportTicketToDb(ticket) {
  try {
    const ticketCode = `TK-${Math.floor(1000 + Math.random() * 9000)}`
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([
        {
          ticket_code: ticketCode,
          task_name: ticket.task,
          category: ticket.category || 'kualitas',
          priority: ticket.priority === 'Mendesak' ? 'urgent' : 'normal',
          subject: ticket.subject,
          details: ticket.details || ticket.subject,
          status: 'investigating',
        },
      ])
      .select()

    return { success: !error, ticketCode, data: data?.[0] }
  } catch (err) {
    console.warn('[Relink DB] Insert support ticket error:', err)
    return { success: false }
  }
}
