import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './admin/AdminLayout'
import OrganizationsPage from './admin/OrganizationsPage'
import WidgetsPage from './admin/WidgetsPage'
import WidgetEditorPage from './admin/WidgetEditorPage'
import WidgetEmbed from './widget/WidgetEmbed'

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="organizations" replace />} />
        <Route path="organizations" element={<OrganizationsPage />} />
        <Route path="widgets" element={<WidgetsPage />} />
        <Route path="widgets/new" element={<WidgetEditorPage />} />
        <Route path="widgets/:id" element={<WidgetEditorPage />} />
      </Route>
      <Route path="/widget/:id" element={<WidgetEmbed />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

export default App
