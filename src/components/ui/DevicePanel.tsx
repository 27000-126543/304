import { Droplets, Thermometer, ShowerHead, AlertTriangle, Box } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { CompressionBox } from '@/types'

const statusBadge: Record<string, string> = {
  normal: 'badge-normal',
  high_level: 'badge-warning',
  temp_alarm: 'badge-critical',
  fault: 'badge-fault',
}

const statusLabel: Record<string, string> = {
  normal: '正常',
  high_level: '高液位',
  temp_alarm: '温度异常',
  fault: '故障',
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function DevicePanel() {
  const { compressionBoxes, setSelectedCompressionBoxId, setFaultStatus, currentUser } = useStore()
  const canOperate = currentUser?.role === 'dispatcher'

  return (
    <div className="bg-[#0d1a30]/95 border border-[#1a2a4a] backdrop-blur-md rounded overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1a2a4a]">
        <span className="text-xs font-medium text-[#e0e8f0]">设备状态</span>
      </div>
      <div className="p-2 space-y-2">
        {compressionBoxes.map((box: CompressionBox) => (
          <div
            key={box.id}
            onClick={() => setSelectedCompressionBoxId(box.id)}
            className="p-2 rounded border border-[#1a2a4a] bg-[#0a1628]/60 hover:border-[#00e5a0]/40 cursor-pointer transition-colors space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Box className="w-3 h-3 text-[#00e5a0]" />
                <span className="text-xs font-medium text-[#e0e8f0]">{box.id}</span>
              </div>
              <span className={cn('status-badge', statusBadge[box.status])}>
                {statusLabel[box.status]}
              </span>
            </div>

            <div className="text-[10px] text-[#6b7c93]">{box.stationName}</div>

            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#6b7c93] flex items-center gap-1"><Droplets className="w-2.5 h-2.5" />液位</span>
                <span className={cn('font-mono', box.liquidLevel > 90 ? 'text-[#ff3d57]' : 'text-[#e0e8f0]')}>
                  {box.liquidLevel}%
                </span>
              </div>
              <MiniBar value={box.liquidLevel} max={100} color={box.liquidLevel > 90 ? 'bg-[#ff3d57]' : 'bg-[#42a5f5]'} />
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#6b7c93] flex items-center gap-1"><Thermometer className="w-2.5 h-2.5" />温度</span>
              <span className={cn('font-mono', box.temperature > 55 ? 'text-[#ff3d57]' : 'text-[#e0e8f0]')}>
                {box.temperature}°C
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#6b7c93] flex items-center gap-1"><ShowerHead className="w-2.5 h-2.5" />喷淋</span>
              <span className={box.sprinklerActive ? 'text-[#00e5a0]' : 'text-[#6b7c93]'}>
                {box.sprinklerActive ? '启动' : '关闭'}
              </span>
            </div>

            {canOperate && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setFaultStatus(box.id, 'compression_box', box.status !== 'fault')
                }}
                className={cn(
                  'w-full flex items-center justify-center gap-1 py-0.5 rounded text-[10px] border transition-colors',
                  box.status === 'fault'
                    ? 'bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/20 hover:bg-[#00e5a0]/20'
                    : 'bg-[#ff3d57]/10 text-[#ff3d57] border-[#ff3d57]/20 hover:bg-[#ff3d57]/20'
                )}
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                {box.status === 'fault' ? '恢复' : '故障'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
