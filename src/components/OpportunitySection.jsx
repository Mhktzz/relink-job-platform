import Icon from './Icon.jsx'

const opportunities = [
  {
    category: 'OPERASIONAL TOKO',
    title: 'Bantuan packing produk',
    description: 'Bantu siapkan pesanan untuk pengiriman sore ini.',
    initials: 'PK',
    company: 'Kios Pangan Kita',
    location: 'Antapani, Bandung',
    distance: '2,4 km',
    pay: 'Rp120.000',
    label: 'Pemula boleh',
    style: 'coral',
  },
  {
    category: 'TEKNISI & PERBAIKAN',
    title: 'Perbaikan mesin kasir',
    description: 'Cek koneksi printer kasir dan pastikan siap digunakan.',
    initials: 'TB',
    company: 'Toko Berkah Jaya',
    location: 'Sukajadi, Bandung',
    distance: '3,1 km',
    pay: 'Rp180.000',
    label: 'Skill terverifikasi',
    style: 'blue',
  },
  {
    category: 'EVENT & PROMOSI',
    title: 'Kru untuk booth akhir pekan',
    description: 'Bantu menata booth dan melayani pengunjung.',
    initials: 'LO',
    company: 'Lokal Market',
    location: 'Dago, Bandung',
    distance: '4,2 km',
    pay: 'Rp150.000',
    label: 'Tugas harian',
    style: 'yellow',
  },
]

function OpportunitySection() {
  return (
    <section aria-labelledby="opportunity-title" className="opportunity-section section-wrap" id="peluang">
      <div className="section-heading section-heading--center">
        <h2 id="opportunity-title">Peluang nyata, <span className="text-highlight">di sekitar kamu.</span></h2>
        <p>Tugas singkat, kerja harian, dan bantuan teknis—semuanya lebih mudah ditemukan dari satu tempat.</p>
      </div>
      <div className="opportunity-meta">
        <div className="opportunity-meta__location"><span className="location-indicator"><Icon name="pin" size={17} /></span><span><strong>Menjelajahi area</strong><small>Bandung dan sekitarnya</small></span></div>
        <a className="text-link" href="#cara-kerja">Lihat cara kerja <Icon name="arrow" size={16} /></a>
      </div>
      <div className="opportunity-grid">
        {opportunities.map((job) => (
          <article className={`opportunity-card opportunity-card--${job.style}`} key={job.title}>
            <div className="opportunity-card__top">
              <span className={`company-avatar company-avatar--${job.style}`}>{job.initials}</span>
              <span className="job-distance"><Icon name="pin" size={13} /> {job.distance}</span>
            </div>
            <p className="opportunity-card__category">{job.category}</p>
            <h3>{job.title}</h3>
            <p className="opportunity-card__description">{job.description}</p>
            <div className="opportunity-card__company">{job.company}</div>
            <div className="opportunity-card__location"><Icon name="pin" size={14} /> {job.location}</div>
            <div className="opportunity-card__bottom">
              <span className="opportunity-card__label"><i /> {job.label}</span>
              <strong>{job.pay}<small> / tugas</small></strong>
            </div>
          </article>
        ))}
      </div>
      <p className="example-note">Contoh tugas untuk ilustrasi. Peluang di Relink menyesuaikan lokasi dan kebutuhan.</p>
    </section>
  )
}

export default OpportunitySection
