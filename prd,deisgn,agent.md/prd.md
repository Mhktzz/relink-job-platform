# PRD — Relink
**Reliable Local Link: Menghubungkan Keahlian Lokal dengan Peluang Nyata**

| | |
|---|---|
| Tema SDGs | SDG 8 (Decent Work and Economic Growth) |
| Kategori | Two-Sided Micro-Job & Local Skill Marketplace |
| Platform | Web app responsif, mobile-first (React + Vite) |
| Status | Draft v1.0 (konsep lomba, MVP) |

---

## 1. Ringkasan Produk

Relink adalah marketplace jasa harian yang mempertemukan **UMKM (Klien)** yang butuh tenaga bantuan sesaat dengan **pekerja lokal (Mitra)** yang terampil tetapi tidak memiliki ijazah atau sertifikat formal. Kepercayaan dibangun lewat verifikasi keterampilan non-formal, sistem tier, dan pembayaran escrow, bukan lewat kredensial kertas.

**Bukan** portal lowongan kerja tetap. Relink melayani kerja lepas per tugas, dari hitungan jam sampai beberapa hari.

## 2. Latar Belakang & Masalah

| # | Masalah | Dampak |
|---|---|---|
| 1 | Pekerja informal dan lulusan SMA/SMK tersingkir dari platform digital karena tidak punya ijazah atau sertifikat | Keahlian nyata tidak terpakai, pendapatan rendah |
| 2 | UMKM butuh tenaga mendadak (packing, perbaikan alat kasir, tenaga event) tapi sulit menemukan pekerja terdekat dengan tarif transparan dan aman | Operasional terganggu, risiko penipuan |
| 3 | *Cold-start*: pekerja baru sulit mendapat order pertama karena klien memilih pekerja dengan ulasan terbanyak | Pekerja baru terjebak, tidak bisa naik level |

## 3. Tujuan & Metrik Keberhasilan

### 3.1 Tujuan produk
1. Memberi pekerja non-formal jalur masuk ke pekerjaan digital berbasis bukti kemampuan.
2. Memberi UMKM cara cepat, aman, dan transparan mendapatkan tenaga harian.
3. Memecahkan masalah *cold-start* agar pekerja baru mendapat order pertama.
4. Menyediakan jalur kenaikan tier yang berarti kenaikan penghasilan.

### 3.2 KPI

| Kategori | Metrik | Target pilot (3 bulan) |
|---|---|---|
| Pekerja | Mitra terverifikasi | 50 |
| UMKM | Klien aktif | 30 |
| Aktivasi | % Mitra Tier 1 yang mendapat order pertama dalam 14 hari | ≥ 60% |
| Pendapatan | Kenaikan rata-rata penghasilan bulanan Mitra | Dipantau sejak bulan 1 |
| Progres | % Mitra yang naik ke Tier 2 | ≥ 25% |
| Kualitas | Tingkat sengketa | ≤ 5% dari transaksi |
| Retensi | *Repeat hire rate* klien | ≥ 30% |
| Inklusi | Jumlah Mitra tanpa ijazah formal yang terbantu | Dilaporkan |

*Angka target bersifat ilustrasi dan perlu disesuaikan dengan riset lapangan.*

## 4. Pengguna (Persona)

**Klien: Bu Rina, pemilik toko kue.** Pesanan melonjak menjelang hari raya dan ia butuh 2 orang membantu packing selama 4 jam. Ia ingin tarif jelas, pekerja dekat, dan uang aman jika hasil tidak sesuai.

**Mitra: Dimas, lulusan SMK.** Bisa memperbaiki mesin kasir dari pengalaman magang, tapi tidak punya sertifikat. Ia ingin order pertama dan jalur untuk naik level.

**Admin Relink.** Memantau verifikasi, menengahi sengketa, dan mengelola dana garansi.

## 5. Ruang Lingkup

### 5.1 Termasuk MVP
- Registrasi dan verifikasi Mitra (KTP, micro-assessment, portofolio visual).
- Posting tugas oleh Klien dengan auto-leveling.
- Pencocokan dan peta radar Mitra terdekat.
- Sistem Tier 1 sampai 3 dengan tracker progres.
- Escrow, status stepper, dan Proof-of-Work.
- Rating dan ulasan dua arah.
- Mekanisme anti-bias *cold-start* (insentif harga, garansi, task leveling, tandem, Rising Star).
- Sengketa dasar dan auto-release escrow.

### 5.2 Di luar MVP (fase berikutnya)
- Langganan Relink Plus untuk UMKM.
- Asuransi mikro terintegrasi.
- Aplikasi native iOS/Android.
- Dukungan bahasa daerah dan panduan suara penuh.
- Dasbor B2B/CSR untuk pemda dan sponsor.

## 6. Sistem Kepercayaan Bertingkat

| Tier | Nama | Syarat naik | Hak akses |
|---|---|---|---|
| 1 | Basic / Pemula | Verifikasi KTP + lulus micro-assessment | Tugas berisiko rendah dan operasional dasar |
| 2 | Verified | Min. 5 tugas Tier 1, rata-rata rating ≥ 4.7, bukti kerja sah (1 ulasan terendah boleh dikecualikan sekali) | Tugas umum, ikut Tandem sebagai anggota |
| 3 | Pro / Ahli | Min. 15 tugas kumulatif tanpa sengketa yang dimenangkan klien, sebagian di kategori yang sama | Tugas teknis bernilai tinggi, peran Team Lead |

**Aturan tambahan**
- Tier **dapat ditinjau turun** jika rating jatuh di bawah ambang atau sengketa menumpuk.
- "Komplain" didefinisikan sebagai sengketa yang dimenangkan klien. Ulasan bintang rendah tanpa bukti bukan komplain otomatis.
- Tugas berisiko tinggi (listrik, ketinggian, alat berat) hanya untuk Tier 3 dan wajib checklist K3.

## 7. Persyaratan Fungsional

Prioritas: **P0** wajib MVP, **P1** penting, **P2** nanti.

### 7.1 Modul Onboarding & Verifikasi Mitra

| ID | Persyaratan | Prioritas |
|---|---|---|
| FR-101 | Mitra mendaftar dengan nomor HP dan OTP | P0 |
| FR-102 | Unggah KTP dengan liveness check dan pencocokan wajah | P0 |
| FR-103 | Pilih kategori keahlian | P0 |
| FR-104 | In-App Micro-Assessment: kuis studi kasus dan SOP/Safety, bank soal acak, timer, selfie acak | P0 |
| FR-105 | Verified Visual Portfolio: rekam video 15–30 detik dan foto before-after lewat kamera aplikasi, dengan GPS dan timestamp otomatis, tanpa unggah dari galeri | P0 |
| FR-106 | Community Vouching: kode verifikasi ke mantan pelanggan, nomor pemberi divalidasi dan jumlah/bobot vouching dibatasi | P1 |
| FR-107 | Lolos verifikasi mengaktifkan Mitra sebagai Tier 1 | P0 |

### 7.2 Modul Klien (Demand Side)

| ID | Persyaratan | Prioritas |
|---|---|---|
| FR-201 | **Smart Task Posting**: formulir tugas dengan Auto-Leveling Tag dan kartu perbandingan tarif antar tier | P0 |
| FR-202 | Klien dan Mitra menyepakati **checklist hasil (acceptance criteria)** sebelum pekerjaan dimulai | P0 |
| FR-203 | **Tandem Package Toggle** muncul otomatis jika butuh ≥ 2 pekerja | P1 |
| FR-204 | **Geofencing Radar Map**: peta real-time, pin berkode warna tier, indikator berdenyut untuk Tier 1 berstatus "Siap Kerja Instan" | P0 |
| FR-205 | **Discovery Feed & Rising Star Carousel** | P0 |
| FR-206 | **Risk-Free Checkout** dengan lencana "100% Garansi Kepuasan Tier 1" dan detail portofolio Mitra | P0 |
| FR-207 | Verifikasi klien (nomor HP, foto usaha, NIB bila ada) | P1 |
| FR-208 | Pesan ulang Mitra favorit (Pekerja Langganan) | P2 |

### 7.3 Modul Mitra (Supply Side)

| ID | Persyaratan | Prioritas |
|---|---|---|
| FR-301 | **Gamified Tier Tracker**: bilah progres Tier 1 → 2 → 3 dengan rincian target tugas dan rating | P0 |
| FR-302 | **Skill Verification Hub**: tes skenario, kamera portofolio ber-watermark, permintaan vouching | P0 |
| FR-303 | **Segmented Job Board**: tab "Khusus Pemula (Tier 1)", "Tugas Umum", "Undangan Tim Tandem" | P0 |
| FR-304 | Kartu tugas menampilkan estimasi penghasilan bersih setelah komisi | P1 |
| FR-305 | Dompet Mitra dan penarikan dana (e-wallet, transfer bank) | P0 |
| FR-306 | Tombol SOS dan berbagi lokasi ke kontak darurat | P1 |
| FR-307 | Check-in dan check-out di lokasi kerja | P1 |

### 7.4 Modul Transaksi (Core)

| ID | Persyaratan | Prioritas |
|---|---|---|
| FR-401 | **Escrow**: dana klien ditahan lewat payment gateway berlisensi | P0 |
| FR-402 | **Live Status Stepper** (lihat bagian 8) | P0 |
| FR-403 | **Digital Proof-of-Work Handover**: wajib foto hasil akhir dan tanda tangan digital klien sebelum dana diteruskan | P0 |
| FR-404 | **Auto-release escrow**: jika klien tidak merespons 24–48 jam setelah bukti diunggah, dana otomatis cair | P0 |
| FR-405 | Chat dalam aplikasi, kontak langsung disembunyikan sampai pesanan dikonfirmasi | P1 |
| FR-406 | Ulasan dua arah setelah dana cair | P0 |
| FR-407 | Progres tier diperbarui otomatis setelah transaksi selesai | P0 |

### 7.5 Mekanisme Anti-Bias & Cold-Start

| ID | Persyaratan | Prioritas |
|---|---|---|
| FR-501 | **Incentive-Based Pricing**: tarif Tier 1 dibuat lebih efisien untuk tugas ringan, dengan batas bawah tarif (price floor) berbasis upah layak setempat | P0 |
| FR-502 | **Tier 1 Satisfaction Guarantee**: refund (penuh atau parsial) atau pekerja pengganti Tier 3, hanya terhadap checklist yang disepakati | P0 |
| FR-503 | **Task Leveling**: tugas sederhana dikunci untuk Tier 1 dan 2 | P0 |
| FR-504 | **Skema Tandem**: 1 Lead Tier 3 + anggota Tier 1, tarif paket per peran, Lead menerima fee supervisi dan ikut bertanggung jawab pada QC | P1 |
| FR-505 | **Rising Star Boost**: slot sorotan untuk Tier 1 dengan skor tes sempurna, profil lengkap, dan respons cepat | P0 |

### 7.6 Sengketa & Admin

| ID | Persyaratan | Prioritas |
|---|---|---|
| FR-601 | Alur sengketa 3 langkah: chat terstruktur dengan bukti foto, mediasi tim Relink maks. 48 jam, keputusan (refund penuh/parsial/dana cair) | P0 |
| FR-602 | Client Trust Score: klaim yang sering ditolak membatasi akses garansi | P2 |
| FR-603 | Panel admin: tinjau verifikasi, kelola sengketa, pantau Dana Garansi | P1 |

## 8. Alur Sistem

### 8.1 Alur utama (end-to-end)

```
1. ONBOARDING MITRA
   Daftar → Unggah KTP → Pilih keahlian → Micro-Assessment
   → Rekam video/foto portofolio → Aktif sebagai Tier 1

2. PEMBUATAN TUGAS (KLIEN)
   Posting kebutuhan → Sistem mendeteksi level tugas
   → Tampil rekomendasi Mitra (termasuk Rising Star dan opsi Tandem)

3. KESEPAKATAN & ESCROW
   Klien memilih Mitra → Sepakati checklist hasil
   → Bayar ke escrow → Mitra menerima notifikasi

4. EKSEKUSI & SERAH TERIMA
   Mitra menuju lokasi (check-in) → Mengerjakan
   → Unggah foto hasil akhir → Klien tanda tangan digital

5. PENCAIRAN & EVALUASI
   Dana escrow cair ke saldo Mitra (dipotong komisi)
   → Ulasan dua arah → Progres tier diperbarui otomatis
```

### 8.2 Status transaksi (Live Status Stepper)

```
Dana Ditahan Escrow
   → Pekerja Menuju Lokasi
   → Pengerjaan Berlangsung
   → Menunggu Konfirmasi
   → Dana Cair
```

Cabang khusus:
- **Menunggu Konfirmasi → Auto-release** setelah 24–48 jam tanpa respons klien.
- **Menunggu Konfirmasi → Sengketa** jika klien menolak hasil, lalu mediasi, lalu keputusan.
- **Dana Ditahan → Dibatalkan** jika Mitra tidak datang, dengan refund otomatis dan pencarian pengganti.

### 8.3 Alur sengketa

```
Klien menolak hasil → Chat terstruktur + bukti foto
→ Mediasi tim Relink (maks. 48 jam)
→ Keputusan: refund penuh | refund parsial | dana cair ke Mitra
→ Jika garansi Tier 1 berlaku: kirim Tier 3 pengganti (dari Dana Garansi)
```

## 9. Aturan Bisnis

1. **Komisi bertingkat dari Mitra:** Tier 1 sekitar 8%, Tier 2 sekitar 10%, Tier 3 sekitar 12% (ilustrasi).
2. **Biaya layanan klien** kecil dan tetap, sebagai pembayaran layanan escrow dan garansi.
3. **Dana Garansi:** 2–3% dari tiap transaksi disisihkan ke pool khusus untuk refund dan pekerja pengganti.
4. **Price floor:** tarif minimum per kategori dihitung dari UMK setempat, sehingga tidak ada upah di bawah batas layak.
5. **Penghematan Tier 1** dihitung terhadap tarif Tier 3 dan tidak diperoleh dengan menekan upah di bawah price floor.
6. **Komisi turun** untuk pesanan berulang dengan Mitra yang sama (mengurangi kebocoran transaksi).
7. **Perlindungan hanya berlaku in-app:** escrow, garansi, dan penyelesaian sengketa.
8. **Sumber pendapatan lain:** margin paket Tandem, langganan Relink Plus (fase lanjut), dan kemitraan B2B/CSR.

## 10. Persyaratan Non-Fungsional

| Area | Persyaratan |
|---|---|
| Performa | Halaman utama termuat < 3 detik pada jaringan 3G/4G lambat |
| Lite mode | Kompresi foto/video otomatis, *resume upload*, sebagian fitur offline |
| Responsif | Mobile-first, nyaman di layar kecil dan HP kelas bawah |
| Aksesibilitas | Ikon besar, bahasa sederhana, panduan visual pendek |
| Keamanan | Enkripsi data KTP dan video, HTTPS, pembatasan akses berbasis peran lewat Row Level Security (RLS) di semua tabel, bucket Storage privat untuk KTP, kunci `service_role` tidak pernah dipakai di frontend |
| Privasi | Kepatuhan UU Perlindungan Data Pribadi: persetujuan eksplisit, minimisasi data, kebijakan retensi |
| Pembayaran | QRIS, e-wallet, transfer bank lewat payment gateway berlisensi |
| Anti-fraud | Deteksi mock location, live capture kamera, validasi nomor vouching |
| Ketersediaan | Target uptime 99% pada fase pilot |

## 11. Prinsip UI/UX

1. Desain konsisten di seluruh aplikasi (warna, tipografi, ikon SVG, animasi), sesuai `agent.md`.
2. Warna tiap tier tetap dan sama di peta radar, lencana, dan tracker.
3. Teks antarmuka sederhana dalam Bahasa Indonesia.
4. Informasi penting (tarif, status, garansi) selalu terlihat tanpa perlu banyak langkah.
5. Mitra melihat kemajuan tier secara visual dan memotivasi (gamifikasi).

## 12. Stack Teknis

| Komponen | Pilihan |
|---|---|
| Bahasa | JavaScript (ES6+ / JSX) |
| Framework UI | React |
| Styling | CSS3 |
| Markup | HTML5 |
| Ikon & grafis | SVG di `src/assets/` |
| Runtime & paket | Node.js, npm |
| Build tool | Vite |
| Database | Supabase (PostgreSQL) |
| Autentikasi | Supabase Auth (OTP nomor HP) |
| Penyimpanan file | Supabase Storage |
| Real-time | Supabase Realtime |
| Logika server | Supabase Edge Functions (untuk escrow, auto-release, dan webhook pembayaran) |

### 12.1 Pemetaan Supabase ke Fitur

| Kebutuhan | Layanan Supabase |
|---|---|
| Registrasi dan login Mitra/Klien (FR-101) | Auth |
| Unggah KTP, video, dan foto portofolio (FR-102, FR-105) | Storage (bucket privat untuk KTP) |
| Status transaksi dan stepper langsung (FR-402) | Realtime |
| Posisi Mitra di peta radar (FR-204) | Database (PostGIS) + Realtime |
| Auto-release escrow 24–48 jam (FR-404) | Edge Functions + penjadwal (`pg_cron`) |
| Webhook payment gateway untuk escrow (FR-401) | Edge Functions |
| Hak akses per peran (Klien, Mitra, Admin) | Row Level Security |

### 12.2 Entitas Data Utama

| Tabel | Isi utama |
|---|---|
| `profiles` | Data pengguna, peran (klien/mitra/admin), tier, status verifikasi |
| `skills` | Kategori keahlian dan klasifikasi risiko |
| `mitra_skills` | Keahlian per Mitra beserta skor assessment |
| `assessments` | Hasil micro-assessment |
| `portfolios` | Video/foto, koordinat GPS, timestamp |
| `vouchings` | Pemberi vouching, status verifikasi kode |
| `tasks` | Tugas, level, tarif, lokasi, checklist hasil |
| `bookings` | Pemesanan, tipe (individu/tandem), status transaksi |
| `booking_members` | Anggota tim dan peran (Lead/anggota) |
| `transactions` | Escrow, komisi, kontribusi Dana Garansi, status pencairan |
| `proofs_of_work` | Foto hasil akhir dan tanda tangan digital |
| `reviews` | Rating dan ulasan dua arah |
| `disputes` | Sengketa, bukti, keputusan |
| `wallets` | Saldo dan riwayat penarikan Mitra |
| `guarantee_fund` | Pemasukan dan pengeluaran Dana Garansi |

*Daftar ini sebagai acuan awal. Skema final disusun saat perancangan database dan dikelola lewat file migrasi SQL.*

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Kuis dicontek atau diwakilkan | Bank soal acak, timer, selfie acak, soal skenario |
| KTP palsu atau pinjam identitas | Liveness check dan pencocokan wajah (eKYC) |
| Fake GPS | Deteksi mock location, live capture, cross-check jaringan |
| Vouching direkayasa | Batasi jumlah dan bobot, validasi nomor, tolak pertukaran vouching |
| Penyalahgunaan garansi | Checklist hasil di awal, mediasi, refund parsial, Client Trust Score |
| Upah terlalu rendah | Price floor berbasis UMK |
| Kebocoran transaksi | Perlindungan hanya in-app, komisi turun untuk pesanan berulang, chat in-app |
| Keselamatan Mitra | SOS, check-in/out, verifikasi klien, klasifikasi risiko tugas, asuransi mikro |
| Chicken-and-egg | Pilot terbatas, onboarding via SMK/BLK, voucher order pertama |
| Hambatan teknis & literasi digital | Lite mode, antarmuka inklusif |

## 14. Rencana Rilis

| Fase | Fokus | Isi |
|---|---|---|
| **Fase 0: Pilot** | Satu kecamatan atau kawasan pasar, 2–3 kategori (packing, perangkat kasir, tenaga event) | Onboarding via SMK/BLK/karang taruna, UMKM dari paguyuban pasar, voucher order pertama |
| **Fase 1: MVP** | Fitur P0 | Verifikasi, posting tugas, peta radar, tier, escrow, Proof-of-Work, rating, sengketa dasar |
| **Fase 2: Penguatan** | Fitur P1 | Tandem, vouching, SOS, chat in-app, panel admin |
| **Fase 3: Skala** | Fitur P2 | Relink Plus, asuransi mikro, kemitraan B2B/CSR, ekspansi wilayah |

## 15. Asumsi & Pertanyaan Terbuka

1. Penyedia payment gateway dan eKYC yang akan dipakai.
2. Besaran pasti komisi, biaya layanan, dan Dana Garansi (perlu simulasi unit economics).
3. Daftar kategori tugas dan klasifikasi risikonya untuk pilot.
4. Acuan UMK dan tarif minimum per wilayah pilot.
5. Pembagian tarif Lead dan anggota pada paket Tandem.
6. Batas waktu auto-release final (24 atau 48 jam).
7. Mitra asuransi mikro dan kerangka kerja sama dengan BPJS Ketenagakerjaan.
8. Pemilihan region proyek Supabase (data pengguna Indonesia) dan paket yang dipakai saat pilot.
9. Penyedia SMS/OTP untuk Supabase Auth nomor HP.
10. Strategi *backup* dan retensi data KTP serta video sesuai UU PDP.

## 16. Lampiran: Glosarium

| Istilah | Arti |
|---|---|
| Klien | UMKM atau pemilik usaha yang memposting tugas dan membayar |
| Mitra | Pekerja lokal yang mengerjakan tugas |
| Escrow | Dana klien yang ditahan platform sampai pekerjaan dikonfirmasi |
| Cold-start | Sulitnya pekerja baru mendapat order pertama |
| Tandem | Paket tim: 1 Lead Tier 3 + anggota Tier 1 |
| Rising Star | Slot sorotan untuk Mitra Tier 1 berpotensi tinggi |
| Price floor | Batas tarif minimum berbasis upah layak |
| Proof-of-Work | Foto hasil akhir dan tanda tangan digital klien |
