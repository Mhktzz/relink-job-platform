import { useState } from 'react';
import './DashboardMitra.css';

/* ---------- Ikon (inline, tanpa pustaka baru) ---------- */
const ICONS = {
  home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  briefcase: 'M3 7h18v13H3z M9 7V4h6v3',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  wallet: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M3 7l12-3v3 M17 14h2',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  logout: 'M9 4H5v16h4 M16 8l4 4-4 4 M20 12H9',
  chat: 'M4 5h16v11H9l-5 4z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7 M12 17h.01',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4z M10 21h4',
  pin: 'M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  check: 'M5 12l5 5 9-10',
  alert: 'M12 4l9 16H3z M12 10v4 M12 17h.01',
  calendar: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
  lock: 'M6 11h12v9H6z M8 11V8a4 4 0 0 1 8 0v3',
};

const Icon = ({ n, s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={ICONS[n]} />
  </svg>
);

const rp = (n) => 'Rp' + n.toLocaleString('id-ID');
const Info = ({ t }) => <span className="dm-info" title={t} tabIndex={0}>i</span>;

/* ---------- Data contoh (ganti dengan data Supabase) ---------- */
const MENU = [
  { g: 'MENU UTAMA', items: [['home', 'Beranda'], ['briefcase', 'Peluang Tugas', 4], ['star', 'Jenjang & Reputasi', 'Tier 1']] },
  { g: 'LAYANAN', items: [['briefcase', 'Pekerjaan Saya'], ['wallet', 'Dompet Mitra'], ['chat', 'Chat', 2], ['shield', 'Keamanan & SOP']] },
  { g: 'PENGATURAN', items: [['user', 'Profil & Portofolio'], ['help', 'Bantuan & Sengketa'], ['logout', 'Keluar Akun']] },
];

const STEPS = ['Dana Ditahan', 'Menuju Lokasi', 'Pengerjaan', 'Menunggu Konfirmasi', 'Dana Cair'];
const JAM = [['Sen', 4.5], ['Sel', 3], ['Rab', 6.5], ['Kam', 3.5], ['Jum', 5.5], ['Sab', 7.5], ['Min', 4]];
const BULAN = [['Jun', 412000], ['Jul', 556000], ['Agu', 498000], ['Sep', 640000], ['Okt', 702000], ['Nov', 782000]];
const KOMISI = 0.08;

const TUGAS = [
  { id: 1, judul: 'Bantu packing pesanan', jarak: '0,8 km', durasi: '3 jam', bersih: 120000, label: 'Khusus Pemula' },
  { id: 2, judul: 'Jaga stan bazar', jarak: '2,1 km', durasi: '5 jam', bersih: 165000, label: 'Khusus Pemula' },
  { id: 3, judul: 'Cek printer kasir', jarak: '1,6 km', durasi: '1 jam', bersih: 55000, label: 'Umum' },
  { id: 4, judul: 'Pasang banner toko', jarak: '3,4 km', durasi: '2 jam', bersih: 140000, label: 'Tier 2', terkunci: true },
];

const AKSI = [
  { t: 'Rekam video portofolio kedua', d: 'Naikkan peluang masuk Rising Star', tone: 'warn' },
  { t: 'Beri ulasan untuk Toko Bu Rina', d: 'Selesai kemarin, dana sudah cair', tone: 'info' },
  { t: '1 undangan Tandem menunggu', d: 'Jawab sebelum besok pukul 12.00', tone: 'warn' },
];

const JADWAL = [
  { w: 'Hari ini, 14.00', t: 'Packing pesanan lebaran', k: 'Toko Kue Bu Rina' },
  { w: 'Besok, 09.00', t: 'Jaga stan bazar', k: 'Warung Seblak Mang Ujang' },
];

/* ---------- Komponen ---------- */
function Sidebar({ aktif, setAktif }) {
  return (
    <aside className="dm-side">
      <div className="dm-brand">Relink <span>Mitra</span></div>
      {MENU.map((grup) => (
        <nav key={grup.g}>
          <p className="dm-group">{grup.g}</p>
          {grup.items.map(([ic, nama, badge]) => (
            <button key={nama} className={'dm-nav' + (aktif === nama ? ' on' : '')} onClick={() => setAktif(nama)}>
              <Icon n={ic} />
              <span className="dm-nav-t">{nama}</span>
              {badge && <em className={typeof badge === 'string' ? 'tier' : ''}>{badge}</em>}
            </button>
          ))}
        </nav>
      ))}
    </aside>
  );
}

function Topbar({ siap, setSiap }) {
  return (
    <header className="dm-top">
      <label className="dm-search">
        <Icon n="search" s={18} />
        <input placeholder="Cari tugas, kategori keahlian, atau toko sekitar..." />
      </label>
      <button className={'dm-ready' + (siap ? ' on' : '')} onClick={() => setSiap(!siap)} aria-pressed={siap}>
        <i /> {siap ? 'Siap Kerja Instan' : 'Sedang Offline'}
      </button>
      <button className="dm-ico" aria-label="Notifikasi"><Icon n="bell" /><b /></button>
      <div className="dm-user">
        <span className="dm-av">DI</span>
        <div><strong>Dimas Prasetyo</strong><small>Tier 1 — Basic (Rising Star)</small></div>
      </div>
    </header>
  );
}

function Stat({ judul, info, nilai, badge, tone, children }) {
  return (
    <section className="dm-card dm-stat">
      <p className="dm-lbl">{judul} {info && <Info t={info} />}</p>
      <div className="dm-val"><strong className={tone}>{nilai}</strong><span className="dm-pill">{badge}</span></div>
      <div className="dm-sub">{children}</div>
    </section>
  );
}

function TugasAktif({ step }) {
  return (
    <section className="dm-card dm-aktif">
      <div className="dm-head">
        <h3>Tugas Aktif</h3>
        <span className="dm-pill warn">Escrow PGW-928174</span>
      </div>
      <h4>Packing pesanan lebaran</h4>
      <p className="dm-muted">Toko Kue Bu Rina · <Icon n="pin" s={14} /> 1,2 km · tiba sekitar 6 menit</p>
      <ol className="dm-steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''}>
            <span>{i < step ? <Icon n="check" s={12} /> : i + 1}</span>{s}
          </li>
        ))}
      </ol>
      <div className="dm-row">
        <span className="dm-muted">Pendapatan bersih <strong className="pink">{rp(78200)}</strong></span>
        <div className="dm-btns">
          <button className="btn ghost">Chat</button>
          <button className="btn main"><Icon n="pin" s={16} /> Check-in di Lokasi</button>
        </div>
      </div>
    </section>
  );
}

function Rekomendasi() {
  return (
    <section className="dm-card">
      <div className="dm-head"><h3>Tugas Terdekat Untukmu</h3><a href="#tugas">Lihat semua (4)</a></div>
      <div className="dm-tasks">
        {TUGAS.map((t) => (
          <article key={t.id} className={'dm-task' + (t.terkunci ? ' lock' : '')}>
            <span className="dm-pill">{t.label}</span>
            <h4>{t.judul}</h4>
            <p className="dm-muted"><Icon n="pin" s={13} /> {t.jarak} · <Icon n="clock" s={13} /> {t.durasi}</p>
            <strong className="pink">{rp(t.bersih)}</strong>
            <small className="dm-muted">bersih setelah komisi</small>
            <button className="btn main sm" disabled={t.terkunci}>
              {t.terkunci ? <><Icon n="lock" s={14} /> Buka di Tier 2</> : 'Lihat Tugas'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function PerluTindakan() {
  return (
    <section className="dm-card">
      <div className="dm-head"><h3>Perlu Tindakan</h3><span className="dm-pill warn">{AKSI.length}</span></div>
      <ul className="dm-list">
        {AKSI.map((a) => (
          <li key={a.t}>
            <span className={'dm-dot ' + a.tone}><Icon n="alert" s={14} /></span>
            <div><strong>{a.t}</strong><small>{a.d}</small></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GrafikJam() {
  const total = JAM.reduce((a, [, v]) => a + v, 0);
  const maks = Math.max(...JAM.map(([, v]) => v));
  return (
    <section className="dm-card">
      <div className="dm-head"><h3>Statistik Jam Kerja Mingguan</h3><span className="dm-pill">Minggu Ini</span></div>
      <div className="dm-sum">
        <div><small>Total</small><strong>{total} jam</strong></div>
        <div><small>Rata-rata/hari</small><strong>{(total / 7).toFixed(1)} jam</strong></div>
        <div><small>Vs minggu lalu</small><strong className="ok">+3,5 jam</strong></div>
      </div>
      <div className="dm-bars">
        {JAM.map(([h, v]) => (
          <div key={h} className="dm-bar" title={`${v} jam`}>
            <em>{v}</em>
            <i className={v === maks ? 'top' : ''} style={{ height: `${(v / 8) * 100}%` }} />
            <span>{h}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function GrafikUang() {
  const data = BULAN.map(([b, h]) => ({ b, h, k: Math.round((h * KOMISI) / (1 - KOMISI)) }));
  const maks = Math.max(...data.map((d) => d.h + d.k));
  const n = data[data.length - 1];
  return (
    <section className="dm-card">
      <div className="dm-head">
        <h3>Efisiensi & Pendapatan Bersih <Info t="Komisi platform Tier 1 sebesar 8% dari honor kotor." /></h3>
      </div>
      <div className="dm-sum">
        <div><small>Kotor (Nov)</small><strong>{rp(n.h + n.k)}</strong></div>
        <div><small>Komisi {KOMISI * 100}%</small><strong>{rp(n.k)}</strong></div>
        <div><small>Bersih diterima</small><strong className="pink">{rp(n.h)}</strong></div>
      </div>
      <div className="dm-legend"><span className="p">Honor</span><span className="n">Komisi</span></div>
      <div className="dm-bars">
        {data.map((d) => (
          <div key={d.b} className="dm-bar" title={`${d.b}: ${rp(d.h)}`}>
            <div className="stack" style={{ height: `${((d.h + d.k) / maks) * 100}%` }}>
              <i className="kom" style={{ flex: d.k }} />
              <i className="hon" style={{ flex: d.h }} />
            </div>
            <span>{d.b}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Jadwal() {
  return (
    <section className="dm-card">
      <div className="dm-head"><h3>Jadwal Mendatang</h3></div>
      <ul className="dm-list">
        {JADWAL.map((j) => (
          <li key={j.w}>
            <span className="dm-dot info"><Icon n="calendar" s={14} /></span>
            <div><strong>{j.t}</strong><small>{j.w} · {j.k}</small></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DashboardMitra() {
  const [aktif, setAktif] = useState('Beranda');
  const [siap, setSiap] = useState(true);

  return (
    <div className="dm">
      <Sidebar aktif={aktif} setAktif={setAktif} />
      <div className="dm-main">
        <Topbar siap={siap} setSiap={setSiap} />
        <main className="dm-body">
          <div className="dm-title">
            <div>
              <h1>Beranda Mitra Kerja</h1>
              <p className="dm-muted">Radar lokasimu aktif dalam radius 1–5 km. Selesaikan tugas tepat waktu dan bangun reputasimu.</p>
            </div>
            <button className="btn ghost"><Icon n="wallet" s={16} /> Tarik Saldo Dompet</button>
          </div>

          <div className="dm-grid4">
            <Stat judul="Saldo Siap Cair" nilai={rp(145000)} badge="Siap Tarik">
              <span className="ok">+{rp(98000)} minggu ini</span> · bebas biaya admin ke e-wallet & bank
            </Stat>
            <Stat judul="Dana Tertahan di Escrow" info="Uang Klien yang ditahan Relink dan dicairkan setelah kerjaan selesai." nilai={rp(78200)} badge="1 Tugas Berjalan" tone="pink">
              Packing Bu Rina · cair setelah Klien konfirmasi
            </Stat>
            <Stat judul="Progres Menuju Tier 2" nilai="2 / 5 Tugas" badge="Rating 5.0">
              <div className="dm-progress"><i style={{ width: '40%' }} /></div>
              Rating syarat min. 4.7 <b className="ok">terpenuhi</b>. Selesaikan 3 tugas lagi untuk buka tugas umum & Tandem.
            </Stat>
            <Stat judul="Reputasi & Garansi K3" info="K3: Keselamatan dan Kesehatan Kerja." nilai="100% Bersih" badge="0 Komplain">
              ★ 5.0 · 2 tugas selesai · respons 96% · Rising Star aktif di radar UMKM
            </Stat>
          </div>

          <div className="dm-grid2">
            <TugasAktif step={1} />
            <PerluTindakan />
          </div>

          <Rekomendasi />

          <div className="dm-grid2 eq">
            <GrafikJam />
            <GrafikUang />
          </div>

          <Jadwal />
        </main>
      </div>
    </div>
  );
}
