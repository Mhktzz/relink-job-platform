# Panduan Desain & Style Guide (Design System)
## Relink – Hyperlocal Micro-Job Platform

Dokumen ini merupakan panduan spesifikasi desain visual (*design tokens*), gaya antarmuka, dan komponen UI yang digunakan di seluruh aplikasi Relink.

---

## 1. Palet Warna (Color Palette & Tokens)

Relink menggunakan palet warna kontras tinggi dengan kombinasi warna dasar gelap yang profesional (*Navy*) dipadukan dengan aksen cerah berenergi (*Hot Pink* & *Mint*).

### 1.1 Warna Utama (Brand Colors)
| Token CSS | Nilai HEX / RGBA | Peruntukan |
| :--- | :--- | :--- |
| `--navy` | `#0f1b3d` | Latar belakang hero, teks heading gelap, tombol kontras tinggi |
| `--navy-700` | `#1b2b5c` | Latar kartu sekunder gelap, kartu Tier 1 & Tier 2, border kontras |
| `--navy-soft` | `#e8ecf6` | Latar belakang kartu langkah lembut, box pesan informasi, chip |
| `--pink` | `#ff3d8b` | Tombol CTA utama (Primary Action), aksen teks fokus, lencana Tier 3 |
| `--pink-soft` | `#ffe5ef` | Latar icon pink, badge highlight, hover state lembut |
| `--mint` | `#3de0b0` | Status sukses, badge garansi/keamanan, pin radar, aksen glow |
| `--amber` | `#ffc83d` | Aksen peringatan, pin radar alternatif, rating bintang |

### 1.2 Warna Netral & Permukaan (Neutral & Surface)
| Token CSS | Nilai HEX / RGBA | Peruntukan |
| :--- | :--- | :--- |
| `--white` | `#ffffff` | Background halaman terang, teks di atas latar navy |
| `--bg-soft` | `#f2f4f8` | Background tab bar switch, input field background |
| `--ink-muted` | `#5c6c8d` | Teks paragraf sekunder, label formulir, keterangan kecil |
| `--navy-muted` | `rgba(15, 27, 61, 0.75)` | Paragraf di atas kartu berwarna terang |
| `--white-muted` | `rgba(255, 255, 255, 0.75)`| Paragraf deskripsi di atas latar navy gelap |
| `--white-subtle`| `rgba(255, 255, 255, 0.6)` | Sub-teks pada stat counter atau footer |

---

## 2. Tipografi (Typography)

Aplikasi menggunakan dua keluarga huruf Google Fonts untuk hierarki visual yang jelas:

### 2.1 Font Family
* **Display & Heading**: `"Poppins", "Segoe UI", Arial, sans-serif`
  Digunakan untuk judul utama (H1–H3), angka statistik besar, tombol, dan label lencana.
* **Body & Interface**: `"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif`
  Digunakan untuk paragraf, input form, teks navigasi, dan catatan kaki.

### 2.2 Skala Ukuran & Berat Huruf (Type Scale)

| Level | Font Family | Ukuran | Weight | Line Height | Keterangan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title (H1)** | Poppins | `clamp(68px, 5.2vw, 100px)` | 800 (Extra Bold) | 1.02 | Spasi huruf `-0.03em` |
| **Section Title (H2)** | Poppins | `clamp(54px, 3.75vw, 72px)` | 800 (Extra Bold) | 1.05 | Spasi huruf `-0.02em` |
| **Card Title (H3)** | Poppins | `30px` (atau `clamp(22px, 2vw, 30px)`) | 700 (Bold) | 1.12 | Judul kartu langkah & tier |
| **Step Number Big** | Poppins | `clamp(76px, 5.42vw, 104px)`| 800 (Extra Bold) | 1.0 | Nomor langkah `01`, `02`, dst. |
| **Body Large** | Plus Jakarta Sans | `22px` | 400 (Regular) | 1.5 | Deskripsi hero banner |
| **Body Base** | Plus Jakarta Sans | `16px` | 400 / 500 | 1.55 | Paragraf isi kartu dan artikel |
| **Body Small** | Plus Jakarta Sans | `14px` | 500 / 600 | 1.6 | Teks legal, deskripsi form |
| **Caption / Tiny** | Plus Jakarta Sans | `11px – 12px` | 600 / 700 | 1.2 | Badge tier, status instant, tag |

---

## 3. Sudut Membulat (Border Radius)

Relink mengusung gaya modern ramah pengguna dengan sudut yang sangat membulat (*organic & friendly rounded corners*):

| Kelas / Token | Nilai | Implementasi Penggunaan |
| :--- | :--- | :--- |
| **Pill / Fully Rounded** | `999px` | Tombol (`.button`), Navbar kapsul (`.nav-shell`), Badge/Tag, Chip tier |
| **Extra Large (Cards)** | `40px` | Kartu langkah (`.step-card`), Kartu tier (`.tier-card`), Foto hero (`.hero-photo`) |
| **Large** | `32px` | Kartu peluang kerja (`.worker-opportunity-card`) |
| **Medium Large** | `24px` | Kartu overlay floating job (`.job-card--task`), Kotak CTA (`.cta-card`) |  
| **Medium** | `20px` | Floating badge instant (`.job-card--instant`, `.job-card--escrow`) |
| **Small Medium** | `14px – 16px` | Tab filter peran (`.auth-role-switch`), Input field form (`input`) |
| **Small** | `12px` | Tab link aktif, box pesan alert (`.auth-message`) |

---

## 4. Efek Kaca, Bayangan & Kedalaman (Shadows & Glassmorphism)

Relink banyak memanfaatkan efek *glassmorphism* (akrilik blur transparan) untuk elemen floating seperti navbar dan kartu preview radar.

### 4.1 Efek Backdrop Blur (Glassmorphism)
```css
/* Navbar Floating Capsule */
background: linear-gradient(120deg, rgba(73, 101, 160, 0.16), transparent 42%), rgba(15, 27, 61, 0.56);
border: 1px solid rgba(119, 151, 218, 0.2);
backdrop-filter: blur(24px) saturate(160%);

/* Floating Card Light Glass */
background: rgba(255, 255, 255, 0.78);
border: 1px solid rgba(255, 255, 255, 0.55);
backdrop-filter: blur(24px) saturate(160%);

/* Floating Card Dark Glass */
background: rgba(15, 27, 61, 0.72);
border: 1px solid rgba(255, 255, 255, 0.2);
backdrop-filter: blur(24px) saturate(160%);
```

### 4.2 Spesifikasi Box Shadow
* **Navbar Elevation**: `0 12px 40px rgba(4, 10, 28, 0.16)`
* **Floating Job Card**: `0 18px 48px rgba(5, 12, 34, 0.20)`
* **Hero Image Elevation**: `0 30px 80px rgba(5, 12, 34, 0.28)`
* **Input Focus Glow**: `0 0 0 4px rgba(61, 224, 176, 0.16)` (Mint focus ring)
* **Tab Switch Elevation**: `0 5px 14px rgba(15, 27, 61, 0.16)`

---

## 5. Komponen Antarmuka Inti (UI Components)

### 5.1 Tombol (Buttons)
* **Primary Pink (`.button--pink`)**:
  * Latar: `#ff3d8b` (Hover: `#ff6aa5`)
  * Teks: `#0f1b3d` (Navy)
  * Radius: `999px`
  * Efek Hover: `transform: translateY(-2px)`
* **Outline Light (`.button--outline-light`)**:
  * Border: `2px solid #ffffff`
  * Teks: `#ffffff`
  * Hover: Latar `rgba(255, 255, 255, 0.1)`
* **Outline Dark (`.button--outline-dark`)**:
  * Border: `2px solid #0f1b3d`
  * Teks: `#0f1b3d`
  * Hover: Latar `rgba(15, 27, 61, 0.05)`

### 5.2 Input Formulir (Form Inputs)
* Tinggi Minimum: `48px`
* Padding: `0 15px`
* Border: `1px solid #dce2ed`
* Radius: `14px`
* Focus State: Border berubah menjadi `--mint` (`#3de0b0`) dengan glow ring mint `4px`.

### 5.3 Kartu & Varian Tema
* **Navy (`.step-card--navy`)**: Background `#0f1b3d`, teks putih, icon bubble `rgba(255,255,255,0.14)`.
* **Pink (`.step-card--pink`)**: Background `#ff3d8b`, teks navy, icon bubble `rgba(15,27,61,0.1)`.
* **Soft Blue (`.step-card--soft`)**: Background `#e8ecf6`, teks navy, ramah visual.
* **Pro Tier Card (`.tier-card--pro`)**: Menonjol dengan warna penuh `#ff3d8b` sebagai status tertinggi.

---

## 6. Identitas Visual Jenjang Reputasi (Tier System)

Setiap tingkatan mitra kerja dibedakan dengan aksen warna visual yang konsisten:

| Jenjang | Aksen Utama | Lencana / Chip | Visual Karakter |
| :--- | :--- | :--- | :--- |
| **TIER 1 (Basic)** | Mint (`#3de0b0`) | Chip Mint + Teks Navy | Fresh, pemula terpercaya, garansi aman |
| **TIER 2 (Terverifikasi)** | Navy Soft / White | Chip Putih + Teks Navy | Solid, stabil, lencana checklist |
| **TIER 3 (Pro)** | Hot Pink (`#ff3d8b`) | Kartu Full Pink + Teks Navy | Prestisius, ahli, lead team tandem |

---

## 7. Layout & Spasi (Grid & Spacing)

* **Container Maksimal**: `width: min(1680px, calc(100% - 80px))`
* **Section Vertical Padding**: `padding: 140px 0` pada desktop
* **Grid Spacing**:
  * `steps-grid`: 4 kolom, gap `24px` (3 kolom di halaman pekerja)
  * `tier-grid`: 3 kolom, gap `24px`
  * `hero-layout`: 2 kolom (rasio 3fr : 2fr), gap `80px`
* **Mobile Breakpoint**: Di bawah `1024px` dan `768px`, grid bertransformasi menjadi 1 atau 2 kolom secara fleksibel dengan padding tepi `20px`.

---

## 8. Gerakan & Transisi (Motion & Animation)

* **Scroll Reveal Timing**:
  * Transisi kemunculan: `opacity 650ms ease`, `translate 780ms cubic-bezier(0.22, 1, 0.36, 1)`
  * Jarak geser vertikal: `-36px` $\rightarrow$ `0`
* **Hover Micro-interaction**:
  * Button / Card hover: `160ms ease` untuk pergantian warna dan `translateY(-2px)`.
* **Reduced Motion**: Mendukung media query `@media (prefers-reduced-motion: reduce)` untuk mematikan animasi bagi pengguna yang sensitif terhadap gerakan.
