import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Home from './routes/Home'
import Login from './routes/Login'
import SignUp from './routes/SignUp'
import ItemDetail from './routes/ItemDetail'
import Cart from './routes/Cart'
import Profile from './routes/Profile'
import AdminItems from './routes/admin/AdminItems'
import AdminOffers from './routes/admin/AdminOffers'
import AdminOrders from './routes/admin/AdminOrders'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="entrar" element={<Login />} />
            <Route path="cadastro" element={<SignUp />} />
            <Route path="pecas/:id" element={<ItemDetail />} />
            <Route
              path="carrinho"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="perfil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/pecas"
              element={
                <AdminRoute>
                  <AdminItems />
                </AdminRoute>
              }
            />
            <Route
              path="admin/ofertas"
              element={
                <AdminRoute>
                  <AdminOffers />
                </AdminRoute>
              }
            />
            <Route
              path="admin/pedidos"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
