import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { User, Mail, Save } from 'lucide-react'

function Settings() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveProfile() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          email: profile.email
        })
        .eq('id', profile.id)

      if (error) throw error

      await supabase.rpc('log_admin_action', {
        p_action: 'PROFILE_UPDATED',
        p_target_type: 'profile',
        p_target_id: profile.id
      })

      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading settings...</p></div>
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account settings</p>
      </div>

      <div className="settings-card">
        <h2>👤 Profile Information</h2>

        <div className="form-group">
          <label><Mail size={16} /> Email</label>
          <input
            type="email"
            value={profile?.email || ''}
            onChange={(e) => setProfile({...profile, email: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label><User size={16} /> Full Name</label>
          <input
            type="text"
            value={profile?.full_name || ''}
            onChange={(e) => setProfile({...profile, full_name: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <input
            type="text"
            value={profile?.role?.toUpperCase() || 'USER'}
            disabled
            className="disabled-input"
          />
          <small>Role is managed by superadmin</small>
        </div>

        <div className="form-group">
          <label>Account Type</label>
          <input
            type="text"
            value={profile?.account_type?.toUpperCase() || 'FREE'}
            disabled
            className="disabled-input"
          />
        </div>

        <button 
          className="save-btn" 
          onClick={saveProfile}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="settings-card">
        <h2>🔐 Security</h2>
        
        <div className="security-info">
          <p>Password changes are managed through Supabase Auth.</p>
          <button 
            className="secondary-btn"
            onClick={() => supabase.auth.resetPasswordForEmail(profile?.email)}
          >
            Reset Password
          </button>
        </div>
      </div>

      <div className="settings-card">
        <h2>📊 System Information</h2>
        
        <div className="system-info">
          <div className="info-row">
            <span>Admin Panel Version:</span>
            <strong>1.0.0</strong>
          </div>
          <div className="info-row">
            <span>Supabase Project:</span>
            <strong>wwqhsmckvmfquezfsyds</strong>
          </div>
          <div className="info-row">
            <span>Last Login:</span>
            <strong>{new Date().toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
