const baseUrl = import.meta.env.BASE_URL
const basePath = baseUrl === '/' ? '' : baseUrl.replace(/\/+$/, '')

export function appPath(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${basePath}${normalizedPath}` || '/'
}

export function getAppPathname(pathname = window.location.pathname) {
  const normalizedPath =
    basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
      ? pathname.slice(basePath.length) || '/'
      : pathname

  return normalizedPath.replace(/\/+$/, '') || '/'
}
