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

// 1. Mengambil Daftar Tugas
export async function fetchTasksFromDb() {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return initialTaskBoard
    }

    // Mapping kolom Supabase ke state TaskBoard
    return data.map((t) => ({
      id: t.task_code || t.id,
      code: `#${t.id.slice(0, 6)}`,
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
          ? 'due_week'
          : t.status === 'disputed'
            ? 'overdue'
            : 'current',
      workerName: t.worker_name || 'Menunggu Mitra',
      budget: Number(t.budget),
      dueDate: t.due_date || 'Hari ini, 17:00 WIB',
      hasProof: Boolean(t.has_proof),
      location: t.location_address || 'Lokasi UMKM',
      checklist: Array.isArray(t.checklist) ? t.checklist : [],
    }))
  } catch (err) {
    console.warn('[Relink DB] Gagal mengambil tugas dari Supabase, beralih ke mock data:', err)
    return initialTaskBoard
  }
}

// 2. Menambah Tugas Baru ke Database
export async function insertTaskToDb(newTask) {
  try {
    const taskCode = `TSK-${Math.floor(100 + Math.random() * 900)}`

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

    let query = supabase.from('tasks').update(payload)
    if (typeof taskIdOrCode === 'string' && taskIdOrCode.startsWith('TSK-')) {
      query = query.eq('task_code', taskIdOrCode)
    } else {
      query = query.eq('id', taskIdOrCode)
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
export async function deleteTaskFromDb(taskIdOrCode) {
  try {
    let query = supabase.from('tasks').delete()
    if (typeof taskIdOrCode === 'string' && taskIdOrCode.startsWith('TSK-')) {
      query = query.eq('task_code', taskIdOrCode)
    } else {
      query = query.eq('id', taskIdOrCode)
    }

    const { error } = await query
    if (error) {
      console.warn('[Relink DB] Delete task gagal:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    console.warn('[Relink DB] Error delete task:', err)
    return { success: false, error: err.message }
  }
}

// 3. Mengambil Transaksi Escrow
export async function fetchEscrowFromDb() {
  try {
    const { data, error } = await supabase
      .from('escrow_transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return initialEscrowTransactions
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
    return initialEscrowTransactions
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
