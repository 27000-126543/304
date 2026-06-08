import { useRef, useEffect } from 'react'
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export default function AlertList() {
  const { alerts, dismissAlert } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [alerts.length])

  const iconMap = {
    warning: <AlertTriangle className="w-3.5 h-3.5 text-[#ffc107]" />,
    critical: <AlertCircle className="w-3.5 h-3.5 text-[#ff3d57]" />,
    info: <Info className="w-3.5 h-3.5 text-[#42a5f5]" />,
  }

  const borderColorMap = {
    warning: 'border-l-[#ffc107]',
    critical: 'border-l-[#ff3d57]',
    info: 'border-l-[#42a5f5]',
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 max-h-[200px] bg-[#0d1a30]/95 border border-[#1a2a4a] backdrop-blur-md rounded overflow-hidden z-40">
      <div className="px-2.5 py-1.5 border-b border-[#1a2a4a] flex items-center justify-between">
        <span className="text-xs font-medium text-[#e0e8f0]">告警消息</span>
        <span className="text-[10px] font-mono text-[#6b7c93]">{alerts.length} 条</span>
      </div>
      <div ref={scrollRef} className="overflow-y-auto max-h-[164px]">
        {alerts.length === 0 && (
          <div className="px-3 py-4 text-xs text-[#6b7c93] text-center">暂无告警</div>
        )}
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-2 px-2.5 py-1.5 border-l-2 border-b border-b-[#1a2a4a]/50 hover:bg-[#0f1f3d]/60 transition-colors',
              borderColorMap[alert.type]
            )}
          >
            <div className="mt-0.5 shrink-0">{iconMap[alert.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#e0e8f0] leading-tight break-all">{alert.message}</p>
              <span className="text-[9px] font-mono text-[#6b7c93]">{alert.timestamp}</span>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="shrink-0 mt-0.5 text-[#6b7c93] hover:text-[#e0e8f0] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
