import { Truck, MapPin, Target } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const statusBadge: Record<string, string> = {
  idle: 'badge-idle',
  collecting: 'badge-collecting',
  transporting: 'badge-transporting',
  returning: 'badge-idle',
}

const statusLabel: Record<string, string> = {
  idle: '待命',
  collecting: '收运中',
  transporting: '转运中',
  returning: '返程中',
}

export default function VehiclePanel() {
  const { trucks, setSelectedTruckId } = useStore()

  return (
    <div className="bg-[#0d1a30]/95 border border-[#1a2a4a] backdrop-blur-md rounded overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1a2a4a]">
        <span className="text-xs font-medium text-[#e0e8f0]">车辆监控</span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-2">
        {trucks.map(truck => {
          const loadPct = (truck.currentLoad / truck.maxLoad) * 100
          return (
            <div
              key={truck.id}
              onClick={() => setSelectedTruckId(truck.id)}
              className="p-2 rounded border border-[#1a2a4a] bg-[#0a1628]/60 hover:border-[#00e5a0]/40 cursor-pointer transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3 h-3 text-[#00e5a0]" />
                  <span className="text-xs font-medium text-[#e0e8f0]">{truck.id}</span>
                </div>
                <span className={cn('status-badge', statusBadge[truck.status])}>
                  {statusLabel[truck.status]}
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#6b7c93]">装载</span>
                  <span className="font-mono text-[#e0e8f0]">{truck.currentLoad}/{truck.maxLoad}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      loadPct > 80 ? 'bg-[#ffc107]' : 'bg-[#00e5a0]'
                    )}
                    style={{ width: `${loadPct}%` }}
                  />
                </div>
              </div>

              <div className="text-[10px] text-[#6b7c93] flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                <span className="font-mono text-[#e0e8f0]">
                  ({truck.position[0].toFixed(1)}, {truck.position[2].toFixed(1)})
                </span>
              </div>

              {truck.targetBinId && (
                <div className="text-[10px] text-[#6b7c93] flex items-center gap-1">
                  <Target className="w-2.5 h-2.5" />
                  <span className="text-[#e0e8f0]">{truck.targetBinId}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
