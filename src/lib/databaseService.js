import { supabase } from './supabaseClient.js'
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
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          task_code: taskCode,
          title: newTask.title,
          category: newTask.category || 'operasional',
          tier_requirement: newTask.tier || 'Tier 1',
          budget: newTask.budget || 85000,
          workers_needed: newTask.workersNeeded || 1,
          is_tandem: Boolean(newTask.isTandem),
          checklist: newTask.checklist || [],
          status: 'open',
          location_address: 'Toko Kue Bu Rina, Tebet',
          due_date: 'Hari ini, 18:00 WIB',
        },
      ])
      .select()

    if (error) {
      console.warn('[Relink DB] Insert task gagal, disimpan di memory:', error.message)
    }
    return { success: !error, data: data?.[0] }
  } catch (err) {
    console.warn('[Relink DB] Error insert task:', err)
    return { success: false }
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

    return data.map((e) => ({
      id: e.transaction_code || e.id,
      taskTitle: e.task_title,
      mitraName: e.worker_name,
      mitraTier: e.worker_tier || 'Tier 1',
      amount: Number(e.task_amount),
      status: e.status,
      timestamp: new Date(e.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      autoReleaseHours: e.auto_release_at ? 28 : null,
      platformFee: Number(e.platform_fee || 4000),
      guaranteeFund: Number(e.guarantee_fund_fee || 1000),
    }))
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
