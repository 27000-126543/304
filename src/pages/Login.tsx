import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Scan, LogIn, Shield } from 'lucide-react'
import { useStore } from '@/store/useStore'

const roleLabels: Record<string, string> = {
  driver: '驾驶员',
  dispatcher: '调度员',
  bureau_leader: '局领导',
}

const roleColors: Record<string, string> = {
  driver: 'text-cyber-accent',
  dispatcher: 'text-blue-400',
  bureau_leader: 'text-purple-400',
}

export default function Login() {
  const navigate = useNavigate()
  const users = useStore(s => s.users)
  const login = useStore(s => s.login)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [loginLog, setLoginLog] = useState<string[]>([
    '[系统] 人脸识别模块已就绪',
    '[系统] 等待用户认证...',
  ])
  const [scanning, setScanning] = useState(false)

  const handleLogin = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    setSelectedUser(userId)
    setScanning(true)
    setLoginLog(prev => [
      `[${new Date().toLocaleTimeString()}] 检测到用户: ${user.name}`,
      `[${new Date().toLocaleTimeString()}] 角色验证: ${roleLabels[user.role]}`,
      `[${new Date().toLocaleTimeString()}] 人脸特征匹配中...`,
      ...prev,
    ])

    setTimeout(() => {
      setLoginLog(prev => [
        `[${new Date().toLocaleTimeString()}] ✓ 认证通过`,
        `[${new Date().toLocaleTimeString()}] 正在进入系统...`,
        ...prev,
      ])
      login(userId)
      navigate('/dashboard')
    }, 1500)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0a1628' }}>
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0,229,160,0.08) 0%, transparent 60%)',
        }}
      />

      <div
        className="relative z-10 w-[480px] rounded-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(13,26,48,0.95), rgba(15,31,61,0.9))',
          border: '1px solid rgba(0,229,160,0.2)',
          boxShadow: '0 0 40px rgba(0,229,160,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl border border-cyber-border bg-cyber-secondary">
            <Shield className="h-8 w-8 text-cyber-accent" />
          </div>
          <h1 className="text-2xl font-bold text-cyber-accent glow-text">
            智慧城市垃圾收运平台
          </h1>
          <p className="mt-2 text-sm text-cyber-text-dim">
            Smart City Garbage Collection Platform
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-xs text-cyber-text-dim">
            <Camera className="h-3.5 w-3.5" />
            <span>人脸识别终端</span>
            <span className="ml-auto flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyber-accent animate-pulse" />
              在线
            </span>
          </div>
          <div
            className="relative h-48 rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #060d1a, #0a1628)',
              border: '1px solid rgba(0,229,160,0.15)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {scanning ? (
                <Scan className="h-12 w-12 text-cyber-accent animate-pulse-glow" />
              ) : (
                <Camera className="h-12 w-12 text-cyber-text-dim opacity-30" />
              )}
            </div>

            <div className="scanner-line" />

            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-cyber-accent opacity-60" />
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-cyber-accent opacity-60" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-cyber-accent opacity-60" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-cyber-accent opacity-60" />

            {scanning && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-cyber-accent font-mono animate-pulse-glow">
                识别中...
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-3 text-xs text-cyber-text-dim">快速登录（模拟人脸识别）</p>
          <div className="grid grid-cols-2 gap-2">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                disabled={scanning}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-cyber-accent/40"
                style={{
                  background: 'rgba(15,31,61,0.6)',
                  border: '1px solid var(--color-border)',
                }}
                onMouseEnter={e => {
                  if (!scanning) e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    background: 'rgba(0,229,160,0.15)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {user.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-cyber-text">{user.name}</div>
                  <div className={`text-xs ${roleColors[user.role]}`}>
                    {roleLabels[user.role]}
                  </div>
                </div>
                <LogIn className="ml-auto h-4 w-4 text-cyber-text-dim" />
              </button>
            ))}
          </div>
        </div>

        <div
          className="rounded-lg p-3 font-mono text-[10px] leading-relaxed"
          style={{
            background: 'rgba(6,13,26,0.8)',
            border: '1px solid var(--color-border)',
            maxHeight: '80px',
            overflowY: 'auto',
          }}
        >
          {loginLog.map((log, i) => (
            <div
              key={i}
              className={log.includes('✓') ? 'text-cyber-accent' : 'text-cyber-text-dim'}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
