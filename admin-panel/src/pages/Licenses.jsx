import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Key, Plus, Copy, Check, Trash2 } from 'lucide-react'

function Licenses() {
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyType, setKeyType] = useState('pro')
  const [duration, setDuration] = useState(365)
  const [count, setCount] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    loadLicenses()
  }, [])

  async function loadLicenses() {
    try {
      const { data, error } = await supabase
        .from('license_keys')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLicenses(data || [])
    } catch (error) {
      console.error('Error loading licenses:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generateKeys() {
    setGenerating(true)
    try {
      // Генерация через SQL функцию
      const { data, error } = await supabase.rpc('generate_license_keys_batch', {
        count,
        key_type: keyType,
        days: duration
      })

      if (error) throw error

      // Логирование
      await supabase.rpc('log_admin_action', {
        p_action: 'LICENSE_KEYS_GENERATED',
        p_target_type: 'license_keys',
        p_details: { count, type: keyType, duration }
      })

      loadLicenses()
      alert(`Generated ${count} license key(s)!`)
    } catch (error) {
      console.error('Error generating keys:', error)
      alert('Error: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  async function copyToClipboard(text, id) {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function deactivateKey(keyId) {
    if (!confirm('Deactivate this license key?')) return

    try {
      const { error } = await supabase
        .from('license_keys')
        .update({ is_used: false, used_by: null, activated_at: null })
        .eq('id', keyId)

      if (error) throw error

      await supabase.rpc('log_admin_action', {
        p_action: 'LICENSE_KEY_DEACTIVATED',
        p_target_type: 'license_keys',
        p_target_id: keyId
      })

      loadLicenses()
    } catch (error) {
      console.error('Error deactivating key:', error)
      alert('Error: ' + error.message)
    }
  }

  async function deleteKey(keyId) {
    if (!confirm('Delete this license key permanently?')) return

    try {
      const { error } = await supabase
        .from('license_keys')
        .delete()
        .eq('id', keyId)

      if (error) throw error

      await supabase.rpc('log_admin_action', {
        p_action: 'LICENSE_KEY_DELETED',
        p_target_type: 'license_keys',
        p_target_id: keyId
      })

      loadLicenses()
    } catch (error) {
      console.error('Error deleting key:', error)
      alert('Error: ' + error.message)
    }
  }

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading licenses...</p></div>
  }

  return (
    <div className="licenses-page">
      <div className="page-header">
        <h1>License Management</h1>
        <p>Generate and manage license keys</p>
      </div>

      {/* Generator */}
      <div className="generator-card">
        <h2>🔑 Generate License Keys</h2>
        
        <div className="generator-form">
          <div className="form-group">
            <label>Type</label>
            <select value={keyType} onChange={(e) => setKeyType(e.target.value)}>
              <option value="pro">Pro (365 days)</option>
              <option value="trial">Trial (14 days)</option>
              <option value="enterprise">Enterprise (730 days)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Duration (days)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              min="1"
              max="3650"
            />
          </div>

          <div className="form-group">
            <label>Count</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              min="1"
              max="100"
            />
          </div>

          <button 
            className="generate-btn" 
            onClick={generateKeys}
            disabled={generating}
          >
            <Plus size={20} />
            {generating ? 'Generating...' : 'Generate Keys'}
          </button>
        </div>
      </div>

      {/* Keys List */}
      <div className="licenses-list">
        <h2>📋 License Keys ({licenses.length})</h2>

        <div className="licenses-table">
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Used By</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map(license => (
                <tr key={license.id}>
                  <td>
                    <code className="license-key">
                      {license.key}
                    </code>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(license.key, license.id)}
                    >
                      {copiedId === license.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </td>
                  <td>
                    <span className={`badge ${license.type}`}>
                      {license.type.toUpperCase()}
                    </span>
                  </td>
                  <td>{license.duration_days} days</td>
                  <td>
                    {license.is_used ? (
                      <span className="status used">✅ Used</span>
                    ) : (
                      <span className="status available">🟢 Available</span>
                    )}
                  </td>
                  <td>{license.used_by ? license.used_by.substring(0, 8) + '...' : '-'}</td>
                  <td>{new Date(license.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="actions">
                      {license.is_used && (
                        <button 
                          className="action-btn"
                          onClick={() => deactivateKey(license.id)}
                          title="Deactivate"
                        >
                          <Key size={16} />
                        </button>
                      )}
                      <button 
                        className="action-btn danger"
                        onClick={() => deleteKey(license.id)}
                        title="Delete"
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
      </div>
    </div>
  )
}

export default Licenses
