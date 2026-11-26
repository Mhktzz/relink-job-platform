import { appPath } from '../../lib/routes.js'

function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="cta-section" id="cta">
      <div className="cta-card">
        <h2 id="cta-title">
          Siap ngerjain
          <br />
          yang lebih penting?
        </h2>
        <p>Gabung gratis sebagai UMKM atau mitra pekerja. Tanpa biaya langganan.</p>
        <div className="cta-card__actions">
          <a className="button button--navy" href={appPath('/daftar?peran=umkm')}>
            Daftar sebagai UMKM
          </a>
          <a className="button button--outline-dark" href={appPath('/daftar?peran=pekerja')}>
            Jadi Mitra Pekerja
          </a>
        </div>
      </div>
    </section>
  )
}

export default FinalCta
