const KEY = 'feeder_theme'

export type Theme = 'light' | 'dark'

export function getTheme(): Theme {
  const stored = localStorage.getItem(KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setTheme(theme: Theme) {
  localStorage.setItem(KEY, theme)
  applyTheme(theme)
}

export function toggleTheme(): Theme {
  const next = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

export function applyTheme(theme?: Theme) {
  const t = theme ?? getTheme()
  document.documentElement.classList.toggle('dark', t === 'dark')
}
