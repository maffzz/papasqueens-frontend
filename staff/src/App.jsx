import { Routes, Route } from 'react-router-dom'
import StaffHeader from './components/StaffHeader'
import { AuthProvider, RequireRole } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Login from './pages/Login'
import Kitchen from './pages/Kitchen'
import Delivery from './pages/Delivery'
import AdminMenu from './pages/AdminMenu'
import AdminStaff from './pages/AdminStaff'
import AdminAnalytics from './pages/AdminAnalytics'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <StaffHeader />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/kitchen" element={<RequireRole roles={["staff","admin"]}><Kitchen /></RequireRole>} />
          <Route path="/delivery" element={<RequireRole roles={["staff","delivery","admin"]}><Delivery /></RequireRole>} />
          <Route path="/admin/menu" element={<RequireRole role="admin"><AdminMenu /></RequireRole>} />
          <Route path="/admin/staff" element={<RequireRole role="admin"><AdminStaff /></RequireRole>} />
          <Route path="/admin/analytics" element={<RequireRole role="admin"><AdminAnalytics /></RequireRole>} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
