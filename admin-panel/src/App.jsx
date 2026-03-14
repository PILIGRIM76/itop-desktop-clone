import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, isAdmin, getCurrentUser } from './supabaseClient'

// Pages
import Login from './pages/Login'
import Dashboard from './components/Dashboard'
import Users from './pages/Users'
import Licenses from './pages/Licenses'
import Settings from './pages/Settings'

// Layout
import Sidebar from './components/Sidebar'

// Styles
import './styles/index.css'

// Protected Route Component
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [isAdminUser, setIsAdminUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      await checkAuth()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsAuthenticated(false)
        setLoading(false)
        return
      }

      const adminCheck = await isAdmin()
      setIsAuthenticated(true)
      setIsAdminUser(adminCheck)
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdminUser) {
    return (
      <div className="access-denied">
        <h1>🚫 Access Denied</h1>
        <p>You don't have admin privileges.</p>
        <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </div>
    )
  }

  return children
}

// Main App Component
function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    const user = await getCurrentUser()
    setCurrentUser(user)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AdminLayout user={currentUser} />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

// Admin Layout Component
function AdminLayout({ user }) {
  return (
    <div className="admin-layout">
      <Sidebar user={user} />
      <main className="admin-content">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="licenses" element={<Licenses />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
