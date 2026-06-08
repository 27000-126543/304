import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Radio, FileBarChart } from 'lucide-react'
import { useStore } from '@/store/useStore'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Dispatch from '@/pages/Dispatch'
import Report from '@/pages/Report'

const roleRouteAccess: Record<string, string[]> = {
  driver: ['/dashboard'],
  dispatcher: ['/dashboard', '/dispatch'],
  bureau_leader: ['/dashboard', '/dispatch', '/report'],
}

function getDefaultPath(role: string): string {
  if (role === 'driver') return '/dashboard'
  if (role === 'dispatcher') return '/dispatch'
  return '/report'
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const currentUser = useStore(s => s.currentUser)
  if (!currentUser) return <Navigate to="/" replace />
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getDefaultPath(currentUser.role)} replace />
  }
  return <>{children}</>
}

function BottomNav() {
  const currentUser = useStore(s => s.currentUser)
  const location = useLocation()
  const navigate = useNavigate()

  if (!currentUser) return null

  const allNavItems = [
    { path: '/dashboard', label: '城市总览', icon: LayoutDashboard, roles: ['driver', 'dispatcher', 'bureau_leader'] },
    { path: '/dispatch', label: '调度中心', icon: Radio, roles: ['dispatcher', 'bureau_leader'] },
    { path: '/report', label: '数据报表', icon: FileBarChart, roles: ['bureau_leader'] },
  ]

  const navItems = allNavItems.filter(item => item.roles.includes(currentUser.role))

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-cyber-border"
      style={{
        background: 'linear-gradient(180deg, rgba(13,26,48,0.98), rgba(10,22,40,0.99))',
        backdropFilter: 'blur(12px)',
        height: '56px',
      }}
    >
      {navItems.map(item => {
        const isActive = location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors relative"
          >
            <item.icon
              className={`h-5 w-5 transition-colors ${
                isActive ? 'text-cyber-accent' : 'text-cyber-text-dim'
              }`}
            />
            <span
              className={`text-[10px] transition-colors ${
                isActive ? 'text-cyber-accent' : 'text-cyber-text-dim'
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <div className="absolute top-0 h-0.5 w-8 rounded-b bg-cyber-accent" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default function App() {
  const currentUser = useStore(s => s.currentUser)
  const defaultPath = currentUser ? getDefaultPath(currentUser.role) : '/'

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['driver', 'dispatcher', 'bureau_leader']}><Dashboard /></ProtectedRoute>} />
        <Route path="/dispatch" element={<ProtectedRoute allowedRoles={['dispatcher', 'bureau_leader']}><Dispatch /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute allowedRoles={['bureau_leader']}><Report /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Routes>
      <BottomNav />
    </Router>
  )
}
