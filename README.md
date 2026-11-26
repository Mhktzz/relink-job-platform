<p align="center">
  <img src="./Relink_logo.png" alt="Relink Logo" width="600">
</p>

# Relink — Platform Kerja Lokal

Relink adalah aplikasi React untuk menghubungkan UMKM dengan pekerja lokal. Project ini dibuat menggunakan **React**, **Vite**, dan **Supabase** untuk autentikasi serta penyimpanan data.

Panduan ini menjelaskan persiapan, instalasi, konfigurasi database, dan cara menjalankan aplikasi setelah repository di-clone.

## Persyaratan

Pastikan perangkat Anda sudah memiliki:

- **Node.js versi LTS** dan **npm**
- **Git**
- Akun **Supabase** untuk menyiapkan backend aplikasi

## Panduan Instalasi

### 1. Clone repository

Buka terminal, lalu jalankan:

```bash
git clone https://github.com/Mhktzz/relink-job-platform.git
cd relink-job-platform
```

### 2. Instal dependency

Di dalam folder project, jalankan:

```bash
npm ci
```

Perintah ini memasang dependency sesuai versi yang tercatat di `package-lock.json`.

### 3. Siapkan project Supabase

1. Buat project baru di [Supabase](https://supabase.com/) atau pilih project yang Anda miliki.
2. Buka **SQL Editor** pada dashboard Supabase.
3. Untuk project database baru, buka file `supabase/schema.sql`, salin seluruh isinya, lalu jalankan di SQL Editor.
4. Jalankan isi file migrasi berikut di SQL Editor **secara berurutan**:

   1. `supabase/migrations/20261125135219_worker_verifications.sql`
   2. `supabase/migrations/20261125142712_user_settings.sql`
   3. `supabase/migrations/20261125155000_task_permissions.sql`
   4. `supabase/migrations/20261125160000_profiles_permissions.sql`
   5. `supabase/migrations/20261125161000_profiles_auth_trigger.sql`

Skema utama juga membuat data contoh untuk tampilan aplikasi. Pastikan seluruh migrasi berhasil dijalankan sebelum mencoba mendaftar atau masuk; migrasi terakhir menyiapkan trigger untuk membuat profil saat pengguna baru mendaftar.

### 4. Konfigurasi environment

Salin file contoh `.env.example` menjadi `.env` di folder utama project.

PowerShell (Windows):

```powershell
Copy-Item .env.example .env
```

macOS / Linux:

```bash
cp .env.example .env
```

Buka `.env`, lalu isi nilai dari dashboard Supabase:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

Nilai tersebut tersedia di pengaturan API project Supabase. Gunakan **anon/public key** atau **publishable key** yang memang diperuntukkan bagi aplikasi browser. Jangan pernah memasukkan `service_role` key atau password database ke variabel `VITE_` karena nilainya dapat ikut dikirim ke browser. File `.env` bersifat lokal dan tidak di-commit.

### 5. Jalankan aplikasi React

Jalankan server pengembangan:

```bash
npm run dev
```

Buka alamat yang ditampilkan di terminal, biasanya [http://localhost:5173](http://localhost:5173). Server Vite mendukung *hot reload*, sehingga perubahan kode akan terlihat di browser saat disimpan.

## Perintah yang tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan Vite |
| `npm run lint` | Memeriksa kode dengan ESLint |
| `npm run build` | Membuat build production ke folder `dist` |
| `npm run preview` | Menjalankan preview lokal dari hasil build |
| `npm run db:setup` | Menjalankan `supabase/schema.sql` langsung ke database Supabase |
| `npm run deploy` | Build dan deploy folder `dist` ke branch `gh-pages` |

`npm run db:setup` adalah opsi tambahan untuk menjalankan skema utama melalui koneksi PostgreSQL langsung. Untuk memakainya, tambahkan `SUPABASE_DB_PASSWORD` di `.env` dan gunakan password database dari Supabase. Setelahnya, jalankan migrasi-migrasi di atas melalui SQL Editor. Untuk pemakaian biasa, menjalankan SQL lewat dashboard Supabase adalah cara yang disarankan; jangan membagikan atau meng-commit password database.

## Build dan deploy (opsional)

Untuk memastikan aplikasi dapat di-build:

```bash
npm run build
```

Untuk melihat hasil build secara lokal:

```bash
npm run preview
```

Project ini memiliki script deploy ke **GitHub Pages**. Setelah repository dan pengaturan GitHub Pages siap, jalankan:

```bash
npm run deploy
```

Script tersebut akan membuat build lalu mengirim folder `dist` ke branch `gh-pages`. Pastikan konfigurasi GitHub Pages repository menggunakan branch tersebut.

## Jika mengalami kendala

- **Aplikasi memperingatkan kredensial Supabase belum dikonfigurasi:** pastikan nama variabel di `.env` benar dan server Vite sudah dijalankan ulang setelah perubahan.
- **Gagal mendaftar atau profil tidak tersedia:** pastikan `schema.sql` dan semua file migrasi sudah berhasil dijalankan di Supabase.
- **Dependency bermasalah:** dari folder project, jalankan kembali `npm ci`.
