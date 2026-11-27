import { Route, Routes } from 'react-router-dom'
import AuthLayout from './components/AuthLayout'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Cart from './pages/Cart'
import Home from './pages/Home'
import Login from './pages/Login'
import Placeholder from './pages/Placeholder'
import Product from './pages/Product'
import Register from './pages/Register'
import Store from './pages/Store'
import Checkout from './pages/Checkout'
import OrderDetail from './pages/OrderDetail'
import Orders from './pages/Orders'

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route element={<ProtectedRoute />}>
		  <Route path="/checkout" element={<Checkout />} />
		  <Route path="/orders" element={<Orders />} />
		  <Route path="/orders/:id" element={<OrderDetail />} />
		</Route>
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Route>
    </Routes>
  )
}