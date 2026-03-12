import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import AdminLayout from './admin/AdminLayout'
import LoginPage from './admin/LoginPage'
import OrganizationsPage from './admin/OrganizationsPage'
import WidgetsPage from './admin/WidgetsPage'
import WidgetEditorPage from './admin/WidgetEditorPage'
import WidgetEmbed from './widget/WidgetEmbed'
import { isAuthenticated } from './lib/auth'

function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="organizations" replace />} />
          <Route path="organizations" element={<OrganizationsPage />} />
          <Route path="widgets" element={<WidgetsPage />} />
          <Route path="widgets/new" element={<WidgetEditorPage />} />
          <Route path="widgets/:id" element={<WidgetEditorPage />} />
        </Route>
      </Route>
      <Route path="/widget/:id" element={<WidgetEmbed />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

export default App
