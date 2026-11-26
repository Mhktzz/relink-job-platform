import relinkLogo from '../../assets/main-relink-2.svg'
import relinkLogoDark from '../../assets/main-relink-dark.svg'
import { appPath } from '../../lib/routes.js'

function Logo({ href, dark = false }) {
  return (
    <a aria-label="Relink, kembali ke beranda" className="brand" href={href ?? appPath('/')}>
      <img alt="" className="brand__logo" src={dark ? relinkLogoDark : relinkLogo} />
    </a>
  )
}

export default Logo
