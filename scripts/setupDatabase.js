import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// 1. Baca konfigurasi dari .env secara mandiri
function loadEnv() {
  const envPath = path.join(rootDir, '.env')
  if (!fs.existsSync(envPath)) {
    throw new Error('File .env tidak ditemukan di root proyek.')
  }
  const content = fs.readFileSync(envPath, 'utf-8')
  const env = {}
  content.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      env[key] = val
    }
  })
  return env
}

async function main() {
  console.log('====================================================')
  console.log('🚀 Menjalankan Migrasi Database Otomatis ke Supabase')
  console.log('====================================================')

  const env = loadEnv()
  const supabaseUrl = env.VITE_SUPABASE_URL
  const dbPassword = env.SUPABASE_DB_PASSWORD

  if (!dbPassword || dbPassword === 'your-database-password-here') {
    console.error('\n❌ ERROR: SUPABASE_DB_PASSWORD belum diisi di file .env!')
    console.log('Silakan buka file .env dan isi baris:')
    console.log('SUPABASE_DB_PASSWORD=password_database_supabase_anda\n')
    process.exit(1)
  }

  // Ekstrak project ref dari URL (contoh: https://caahdyntyoplqlayvery.supabase.co -> caahdyntyoplqlayvery)
  let projectRef = ''
  try {
    const urlObj = new URL(supabaseUrl)
    projectRef = urlObj.hostname.split('.')[0]
  } catch (err) {
    console.error('❌ URL Supabase tidak valid di .env:', supabaseUrl)
    process.exit(1)
  }

  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql')
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ File supabase/schema.sql tidak ditemukan.')
    process.exit(1)
  }

  const sqlContent = fs.readFileSync(schemaPath, 'utf-8')

  console.log(`📡 Menghubungkan ke PostgreSQL Supabase: db.${projectRef}.supabase.co:5432 ...`)

  const client = new pg.Client({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: dbPassword,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  })

  try {
    await client.connect()
    console.log('✅ Berhasil terhubung ke database Supabase!')
    console.log('⏳ Mengeksekusi seluruh skema tabel & seed data...')

    await client.query(sqlContent)

    console.log('\n🎉 SUKSES! Seluruh tabel dan data awal berhasil dibuat di Supabase:')
    console.log('  - public.profiles')
    console.log('  - public.tasks')
    console.log('  - public.escrow_transactions')
    console.log('  - public.proofs_of_work')
    console.log('  - public.support_tickets')
    console.log('  - public.nearby_workers')
    console.log('  - Kebijakan RLS (Row Level Security) aktif')
    console.log('====================================================\n')
  } catch (err) {
    console.error('\n❌ Gagal mengeksekusi skema ke Supabase:', err.message)
    if (err.message.includes('password authentication failed')) {
      console.error('👉 Petunjuk: Password database yang dimasukkan salah. Silakan periksa kembali di dashboard Supabase.')
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('ETIMEDOUT')) {
      console.error('👉 Petunjuk: Koneksi timeout atau jaringan memblokir port 5432.')
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
