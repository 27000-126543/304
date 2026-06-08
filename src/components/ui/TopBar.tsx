import { useState, useEffect } from 'react'
import { Activity, Clock, User, Bell, Play, Pause, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export default function TopBar() {
  const [time, setTime] = useState(new Date())
  const { simulationRunning, toggleSimulation, currentUser, alerts, logout } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const criticalCount = alerts.filter(a => a.type === 'critical').length
  const roleLabel = currentUser
    ? currentUser.role === 'driver'
      ? '驾驶员'
      : currentUser.role === 'dispatcher'
        ? '调度员'
        : '局长'
    : '未登录'

  return (
    <div className="h-12 w-full flex items-center justify-between px-4 bg-gradient-to-r from-[#0d1a30]/95 via-[#0f1f3d]/95 to-[#0d1a30]/95 border-b border-[#1a2a4a] backdrop-blur-md z-50">
      <div className="flex items-center gap-3">
        <Activity className="w-4 h-4 text-[#00e5a0]" />
        <span className="text-sm font-bold tracking-wide glow-text">3D智慧城市垃圾分类收运与中转调度平台</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5 text-xs text-[#6b7c93]">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono text-[#e0e8f0]">
            {time.toLocaleTimeString('zh-CN', { hour12: false })}
          </span>
        </div>

        <button
          onClick={toggleSimulation}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors',
            simulationRunning
              ? 'border-[#00e5a0]/40 text-[#00e5a0] bg-[#00e5a0]/10 hover:bg-[#00e5a0]/20'
              : 'border-[#1a2a4a] text-[#6b7c93] bg-[#0d1a30] hover:bg-[#0f1f3d]'
          )}
        >
          {simulationRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {simulationRunning ? '运行中' : '已暂停'}
        </button>

        <div className="flex items-center gap-1.5 text-xs">
          <User className="w-3.5 h-3.5 text-[#6b7c93]" />
          <span className="text-[#e0e8f0]">{currentUser?.name ?? '未登录'}</span>
          <span className="text-[#6b7c93]">({roleLabel})</span>
        </div>

        <div className="relative">
          <Bell className="w-4 h-4 text-[#6b7c93]" />
          {criticalCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-[#ff3d57] text-white text-[9px] font-bold px-0.5">
              {criticalCount}
            </span>
          )}
        </div>

        {currentUser && (
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-1 text-xs text-[#6b7c93] hover:text-[#ff3d57] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
