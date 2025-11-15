import { Routes, Route } from 'react-router-dom'
import CustomerHeader from './components/CustomerHeader'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Track from './pages/Track'
import Login from './pages/Login'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <CustomerHeader />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/track" element={<Track />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}
