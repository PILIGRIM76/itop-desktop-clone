import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { 
  LayoutDashboard, 
  Users, 
  Key, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react'

function Sidebar({ user }) {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">🛡️</div>
        <h2>iTop Admin</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className="nav-item">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/users" className="nav-item">
          <Users size={20} />
          <span>Users</span>
        </NavLink>

        <NavLink to="/licenses" className="nav-item">
          <Key size={20} />
          <span>Licenses</span>
        </NavLink>

        <NavLink to="/settings" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <Shield size={16} />
          <span>{user?.role || 'Admin'}</span>
        </div>
        <div className="user-email">
          {user?.email}
        </div>
        <button onClick={handleSignOut} className="logout-button">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
