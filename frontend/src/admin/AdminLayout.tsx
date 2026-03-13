import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Building2, LayoutGrid, LogOut, Sun, Moon } from 'lucide-react'
import { logout } from '../lib/auth'
import { getTheme, toggleTheme } from '../lib/theme'

const navItems = [
  { to: '/admin/organizations', label: 'LinkedIn Accounts', icon: Building2 },
  { to: '/admin/widgets', label: 'Widgets', icon: LayoutGrid },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [theme, setThemeState] = useState(getTheme)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleToggleTheme() {
    const next = toggleTheme()
    setThemeState(next)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <img src="/logo.svg" alt="Feeder" className="w-8 h-8" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">Feeder</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <button
            onClick={handleToggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors w-full"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
