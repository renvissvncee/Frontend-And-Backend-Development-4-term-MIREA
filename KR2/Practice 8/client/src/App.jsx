import './App.css'
import LoginPage from './pages/LoginPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductListPage from './pages/ProductListPage'
import RegisterPage from './pages/RegisterPage'
import { Routes, Route } from "react-router-dom"
import UsersListPage from './pages/UsersListPage'
import UserDetailPage from './pages/UserDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/admin-panel/users" element={<UsersListPage />} />
      <Route path="/admin-panel/users/:id" element={<UserDetailPage />} />
    </Routes>
  )
}

export default App
