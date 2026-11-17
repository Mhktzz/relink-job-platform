import relinkLogo from '../assets/main-relink-2.svg'
import relinkLogoDark from '../assets/main-relink-dark.svg'

function Logo({ href = '/', dark = false }) {
  return (
    <a aria-label="Relink, kembali ke beranda" className="brand" href={href}>
      <img alt="" className="brand__logo" src={dark ? relinkLogoDark : relinkLogo} />
    </a>
  )
}

export default Logo
