import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Users, Star, Key, Box, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#fbbf24', '#ef4444']

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [licenseStats, setLicenseStats] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [])

  async function loadAllData() {
    try {
      // Основная статистика
      const { data: statsData } = await supabase
        .from('admin_stats_overview')
        .select('*')
        .single()
      setStats(statsData)

      // Статистика по лицензиям
      const { data: licenseData } = await supabase
        .from('active_license_keys')
        .select('type, status')
      
      // Группировка по типам и статусам
      const grouped = licenseData?.reduce((acc, item) => {
        const key = `${item.type}-${item.status}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {}) || {}

      setLicenseStats(grouped)

      // Регистрации по дням (последние 7 дней)
      const { data: regData } = await supabase.rpc('get_registrations_last_7_days')
      setRegistrations(regData || [])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  // Данные для графика лицензий по типам
  const licenseTypeData = [
    { name: 'Pro', value: stats?.total_licenses - (licenseStats?.['trial-available'] || 0) - (licenseStats?.['trial-active'] || 0) || 0 },
    { name: 'Trial', value: (licenseStats?.['trial-available'] || 0) + (licenseStats?.['trial-active'] || 0) || 0 },
    { name: 'Enterprise', value: 0 }
  ].filter(item => item.value > 0)

  // Данные для графика статуса
  const statusData = [
    { name: 'Available', value: stats?.available_licenses || 0, color: '#10b981' },
    { name: 'Active', value: (stats?.used_licenses || 0) - (stats?.available_licenses || 0), color: '#3b82f6' },
    { name: 'Expired', value: 0, color: '#ef4444' }
  ].filter(item => item.value > 0)

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview of your iTop Easy Desktop system</p>
      </div>

      {/* Basic Stats */}
      <div className="stats-grid">
        <StatCard
          icon={<Users size={24} />}
          title="Total Users"
          value={stats?.total_users || 0}
          color="#3b82f6"
          subtitle={`${stats?.pro_users || 0} Pro • ${stats?.free_users || 0} Free`}
        />

        <StatCard
          icon={<Star size={24} />}
          title="Pro Users"
          value={stats?.pro_users || 0}
          color="#fbbf24"
          subtitle="Premium subscribers"
        />

        <StatCard
          icon={<Key size={24} />}
          title="Licenses"
          value={stats?.total_licenses || 0}
          color="#10b981"
          subtitle={`${stats?.used_licenses || 0} used • ${stats?.available_licenses || 0} available`}
        />

        <StatCard
          icon={<Box size={24} />}
          title="Private Boxes"
          value={stats?.total_private_boxes || 0}
          color="#8b5cf6"
          subtitle="Created by users"
        />

        <StatCard
          icon={<TrendingUp size={24} />}
          title="Snapshots"
          value={stats?.total_snapshots || 0}
          color="#ec4899"
          subtitle="Cloud backups"
        />

        <StatCard
          icon={<CheckCircle size={24} />}
          title="Active Licenses"
          value={stats?.used_licenses || 0}
          color="#06b6d4"
          subtitle="Currently in use"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* License Types Pie Chart */}
        <div className="chart-card">
          <h3>📊 License Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={licenseTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {licenseTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* License Status Pie Chart */}
        <div className="chart-card">
          <h3>📈 License Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#82ca9d"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Registrations Line Chart */}
        <div className="chart-card full-width">
          <h3>📉 User Registrations (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={registrations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="registrations" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="New Users"
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="info-card">
          <h3>📊 Real-time Statistics</h3>
          <p>Data is automatically refreshed from Supabase</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  )
}

export default Dashboard
