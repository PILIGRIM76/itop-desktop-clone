import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Search, Edit, Trash2, Shield, UserCheck } from 'lucide-react'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateUserRole(userId, newRole) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      
      // Логирование действия
      await supabase.rpc('log_admin_action', {
        p_action: 'USER_ROLE_UPDATED',
        p_target_type: 'profile',
        p_target_id: userId,
        p_details: { new_role: newRole }
      })

      loadUsers() // Обновить список
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error updating role: ' + error.message)
    }
  }

  async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      // Soft delete - можно реализовать через поле deleted_at
      const { error } = await supabase
        .from('profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error

      await supabase.rpc('log_admin_action', {
        p_action: 'USER_DELETED',
        p_target_type: 'profile',
        p_target_id: userId
      })

      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error: ' + error.message)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    
    return matchesSearch && matchesRole && !user.deleted_at
  })

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading users...</p></div>
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Users Management</h1>
        <p>Manage all registered users</p>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Account Type</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.full_name || '-'}</td>
                <td>
                  <span className={`badge ${user.account_type}`}>
                    {user.account_type === 'pro' ? '🌟 Pro' : 'Free'}
                  </span>
                </td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="actions">
                    <button 
                      className="action-btn"
                      onClick={() => deleteUser(user.id)}
                      title="Delete user"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p>Total: {filteredUsers.length} users</p>
      </div>
    </div>
  )
}

export default Users
