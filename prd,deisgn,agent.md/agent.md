# agent.md — Aturan Kerja Agent untuk Proyek Relink

Dokumen ini adalah aturan wajib bagi AI agent (atau kontributor) yang mengubah kode pada proyek **Relink**. Baca seluruh dokumen sebelum melakukan perubahan apa pun.

---

## 1. Aturan Utama: Ubah Hanya yang Diperintahkan

> **Kerjakan hanya perubahan yang diminta. Jangan mengubah hal lain.**

1. **Ruang lingkup sempit.** Jika perintah menyebut satu komponen, satu halaman, atau satu fungsi, ubah hanya itu.
2. **Dilarang refactor tanpa diminta.** Jangan mengganti nama variabel, memindahkan file, merapikan kode, atau mengubah struktur folder yang tidak disebut dalam perintah.
3. **Dilarang menambah atau menghapus dependensi** (`package.json`) kecuali diminta secara eksplisit.
4. **Dilarang mengubah konfigurasi** (`vite.config.js`, `index.html`, dan sejenisnya) kecuali perintah menyebutkannya.
5. **Jangan menyentuh file yang tidak berkaitan**, termasuk file CSS global, aset SVG, dan komponen lain yang tidak disebut.
6. **Jangan menghapus kode lama** yang tampak tidak terpakai. Jika menemukan masalah di luar perintah, laporkan di ringkasan akhir dan jangan diperbaiki sendiri.
7. **Jika perintah ambigu**, ajukan satu pertanyaan klarifikasi sebelum bertindak. Jangan menebak lalu mengubah banyak file.
8. **Jika perubahan yang diminta ternyata berdampak ke bagian lain**, berhenti dan beri tahu pengguna dampaknya sebelum melanjutkan.

### Checklist sebelum selesai

- [ ] Hanya file yang relevan dengan perintah yang berubah.
- [ ] Tidak ada perubahan format, spasi, atau urutan impor pada baris yang tidak terkait.
- [ ] Tampilan elemen lain tidak berubah.
- [ ] Aplikasi tetap berjalan (`npm run dev`) tanpa error baru.
- [ ] Perubahan langsung di-commit dan di-push ke GitHub dengan pesan commit Bahasa Indonesia bertema `"perubahan fitur..."`.
- [ ] Ringkasan perubahan menyebutkan daftar file yang diubah dan alasannya.

---

## 2. Tech Stack

### 2.1 Bahasa Utama

**JavaScript (ES6+ / JSX).** Semua logika komponen antarmuka memakai JavaScript modern dengan sintaks JSX untuk React (misalnya `App.jsx`, `main.jsx`, dan komponen di dalam folder `src/components/`).

### 2.2 Bahasa Pendukung Web (Styling & Markup)

| Teknologi | Fungsi | File terkait |
|---|---|---|
| **CSS3** | Styling dan animasi interaktif | `App.css`, `index.css`, `AuthPage.css` |
| **HTML5** | Kerangka dasar aplikasi | `index.html` |
| **SVG** | Format vektor XML untuk semua ikon dan grafis radar | `src/assets/` |

### 2.3 Lingkungan & Tooling

| Komponen | Detail |
|---|---|
| Runtime | Node.js |
| Package manager | npm |
| Build tool | Vite (konfigurasi JavaScript di `vite.config.js`) |

### 2.4 Database & Backend

| Komponen | Detail |
|---|---|
| Database | **Supabase** (PostgreSQL) |
| Klien | `@supabase/supabase-js`, diinisialisasi satu kali di satu file (misalnya `src/lib/supabaseClient.js`) |
| Autentikasi | Supabase Auth |
| Penyimpanan file | Supabase Storage (foto, video portofolio, bukti kerja) |
| Real-time | Supabase Realtime (status transaksi dan lokasi Mitra) |

**Aturan penggunaan Supabase**
1. Semua akses database lewat satu klien Supabase yang sama. Jangan membuat klien baru di tiap komponen.
2. URL dan *anon key* disimpan di file `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Jangan menulisnya langsung di kode dan jangan di-*commit*.
3. **Jangan pernah memakai atau menaruh `service_role` key di kode frontend.**
4. **Wajib Persetujuan Pengguna untuk Perubahan Database:** Setiap perubahan pada database (skema tabel, penambahan/penghapusan kolom, tipe data, relasi, kebijakan RLS, fungsi/trigger, atau *storage bucket*) **wajib mendapatkan persetujuan eksplisit dari pengguna terlebih dahulu**. Jangan mengubah struktur database secara sepihak. Perubahan skema yang disetujui harus ditulis sebagai file migrasi SQL, bukan diubah langsung di dasbor tanpa catatan.
5. Row Level Security (RLS) wajib aktif di semua tabel. Jangan mematikannya untuk "mempermudah" pengujian.
6. Nama tabel dan kolom memakai `snake_case`.
7. Setiap pemanggilan Supabase menangani error (`const { data, error } = ...`) dan menampilkan pesan yang sesuai ke pengguna.

**Larangan teknologi:** jangan memperkenalkan bahasa, framework, atau pustaka baru (misalnya TypeScript, Tailwind, SCSS, atau pustaka UI lain) tanpa perintah eksplisit. Satu-satunya tambahan yang sudah disetujui adalah Supabase beserta `@supabase/supabase-js`.

---

## 3. Struktur Proyek (Acuan)

```
relink/
├── index.html
├── vite.config.js
├── package.json
├── .env               # kunci Supabase (jangan di-commit)
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── assets/        # semua ikon dan grafis radar dalam SVG
    ├── components/    # komponen UI (termasuk AuthPage dan AuthPage.css)
    └── lib/           # supabaseClient.js dan helper akses data
```

Letakkan komponen baru di `src/components/`. Jangan membuat folder tingkat atas baru tanpa perintah.

---

## 4. Konsistensi Desain (Wajib)

> **Desain harus konsisten. Jangan mengubah-ubah gaya yang sudah ada.**

1. **Ikuti pola yang sudah ada.** Sebelum membuat elemen baru, lihat komponen serupa dan tiru warna, tipografi, jarak, radius sudut, bayangan, dan perilaku animasinya.
2. **Gunakan token yang sudah ada.** Pakai variabel CSS (`:root` di `index.css`) dan kelas yang sudah didefinisikan. Jangan menulis nilai warna atau ukuran baru jika sudah ada padanannya.
3. **Jangan mengubah token global** (warna utama, font, spacing, breakpoint) kecuali perintah menyebutnya.
4. **Ikon biasa / SVG (Dilarang Emoticon/Emoji):** Tidak boleh menggunakan emoticon atau emoji (seperti 📋, 🎯, ✍️, ⭐, 📍, dll.) pada antarmuka. Sebagai gantinya, gunakan icon biasa berbasis SVG yang seragam dari `src/assets/` atau komponen icon (`Icon.jsx`) dengan ukuran, ketebalan garis, dan warna yang konsisten.
5. **Styling per komponen** ditulis di file CSS yang sudah dipakai komponen itu. Jangan memakai *inline style* kecuali untuk nilai dinamis.
6. **Warna tier harus tetap.** Kode warna Tier 1, 2, dan 3 (di peta radar, lencana, dan progress tracker) wajib memakai nilai yang sama di seluruh aplikasi.
7. **Responsif dan mobile-first.** Pengguna utama memakai ponsel. Elemen baru harus nyaman dipakai di layar kecil.
8. **Bahasa antarmuka.** Teks UI memakai Bahasa Indonesia yang sederhana, dengan istilah yang konsisten (lihat bagian 5).
9. **Animasi.** Gunakan durasi dan *easing* yang sama dengan animasi yang sudah ada. Jangan menambah animasi baru yang mencolok tanpa diminta.

### Tabel token desain (isi sesuai proyek dan jangan diubah setelahnya)

| Token | Nilai | Catatan |
|---|---|---|
| Warna utama | _isi dari `index.css`_ | |
| Warna Tier 1 | _isi_ | Basic / Pemula |
| Warna Tier 2 | _isi_ | Verified |
| Warna Tier 3 | _isi_ | Pro |
| Font utama | _isi_ | |
| Radius sudut | _isi_ | |
| Spasi dasar | _isi_ | |

---

## 5. Glosarium Istilah (Pakai Konsisten)

| Istilah | Arti |
|---|---|
| **Klien** | UMKM atau pemilik usaha yang memposting tugas dan membayar |
| **Mitra** | Pekerja lokal yang mengerjakan tugas |
| **Tier 1 / 2 / 3** | Basic (Pemula), Verified (Terverifikasi), Pro (Ahli) |
| **Escrow** | Dana klien yang ditahan platform sampai pekerjaan dikonfirmasi |
| **Tandem** | Paket tim: 1 Lead Tier 3 + anggota Tier 1 |
| **Rising Star** | Slot sorotan untuk Mitra Tier 1 berpotensi tinggi |
| **Proof-of-Work** | Foto hasil akhir dan tanda tangan digital klien |

---

## 6. Konvensi Kode

1. Gunakan **komponen fungsional** dan *hooks* React.
2. Nama komponen dan file komponen memakai **PascalCase** (`TaskCard.jsx`). Variabel dan fungsi memakai **camelCase**.
3. Satu komponen per file, dengan ekspor default.
4. Ikuti gaya penulisan (indentasi, tanda kutip, titik koma) yang sudah dipakai di file yang sedang diedit.
5. Jangan menaruh data sensitif (kunci API, token) langsung di kode.
6. Jangan menambahkan komentar berlebihan. Komentar hanya untuk logika yang tidak jelas.

---

## 7. Format Laporan Setelah Perubahan

Setiap selesai bekerja, agent menjawab dengan format ini:

```
Perubahan:
- <file>: <apa yang diubah dan kenapa>

Tidak diubah:
- Seluruh file dan komponen lain di luar perintah.

Catatan (opsional):
- <temuan di luar ruang lingkup yang perlu diputuskan pengguna>
```

---

## 8. Alur Kerja Git & GitHub (Wajib)

Setiap ada perubahan kode atau fitur yang selesai dikerjakan:
1. **Langsung lakukan commit dan push ke GitHub:**
   - Tambahkan perubahan file yang relevan (`git add ...`).
   - Buat pesan commit (*commit message*) wajib dalam Bahasa Indonesia dengan awalan dan format:
     `"perubahan fitur <nama/detail fitur yang diubah>"`
     (contoh: `"perubahan fitur pusat bantuan"`, `"perubahan fitur responsive navbar bawah"`, atau `"perubahan fitur pembesaran logo brand"`).
   - Langsung lakukan `git push` ke repositori GitHub aktif (`origin main`).
2. **Verifikasi status git:** Pastikan perintah push berhasil dan riwayat git tercatat rapi sebelum menyelesaikan tugas.

---

## 9. Hal yang Tidak Boleh Dilakukan (Ringkasan)

- Mengubah file atau tampilan di luar perintah.
- Mengubah struktur atau skema database tanpa persetujuan eksplisit dari pengguna.
- Menggunakan emoticon/emoji pada UI (gunakan icon biasa/SVG).
- Mengganti desain, warna, font, atau ikon yang sudah ada.
- Menambah dependensi, framework, atau bahasa baru.
- Refactor, rename, atau memindahkan file tanpa diminta.
- Menghapus kode lama atas inisiatif sendiri.
- Menebak maksud perintah yang ambigu tanpa bertanya.
