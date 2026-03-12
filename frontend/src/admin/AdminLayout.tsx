import { NavLink, Outlet } from 'react-router-dom'
import { Building2, LayoutGrid, Rss } from 'lucide-react'

const navItems = [
  { to: '/admin/organizations', label: 'Organizations', icon: Building2 },
  { to: '/admin/widgets', label: 'Widgets', icon: LayoutGrid },
]

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
          <Rss size={24} className="text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Feeder</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
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
