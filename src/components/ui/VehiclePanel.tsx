import { useState } from 'react'
import { Truck, MapPin, Target, ChevronDown, ChevronUp, Route, Clock, Navigation } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { GarbageTruck, CollectionTask } from '@/types'

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

function RouteDetail({ truck, task }: { truck: GarbageTruck; task: CollectionTask | undefined }) {
  const [open, setOpen] = useState(false)

  if (!task || truck.status === 'idle') {
    return <div className="text-[9px] text-[#6b7c93] mt-0.5">无任务路线</div>
  }

  const eta = Math.max(0, Math.round((1 - truck.routeProgress) * 100))
  const pathPoints = task.path
  const startPt = pathPoints[0]
  const targetPt = task.taskType === 'transfer' ? pathPoints[1] : pathPoints[pathPoints.length - 1]
  const destPt = task.taskType === 'transfer' ? pathPoints[pathPoints.length - 1] : null

  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[9px] text-[#42a5f5] hover:text-[#42a5f5]/80 transition-colors w-full"
      >
        <Route className="w-2.5 h-2.5" />
        <span>路线详情</span>
        <span className="text-[#6b7c93] ml-1">进度 {Math.round(truck.routeProgress * 100)}%</span>
        <span className="text-[#6b7c93] ml-1">ETA ~{eta}s</span>
        {open ? <ChevronUp className="w-2.5 h-2.5 ml-auto" /> : <ChevronDown className="w-2.5 h-2.5 ml-auto" />}
      </button>

      {open && (
        <div className="mt-1 p-1.5 rounded bg-[#0a1628]/80 border border-[#1a2a4a]/40 space-y-1 text-[8px]">
          <div className="flex items-center gap-1">
            <Navigation className="w-2 h-2 text-[#00e5a0]" />
            <span className="text-[#6b7c93]">起点:</span>
            <span className="font-mono text-[#e0e8f0]">({startPt?.[0].toFixed(0)}, {startPt?.[2].toFixed(0)})</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-2 h-2 text-[#ffc107]" />
            <span className="text-[#6b7c93]">目标:</span>
            <span className="text-[#e0e8f0]">{task.targetBinId}</span>
            <span className="font-mono text-[#6b7c93]">({targetPt?.[0].toFixed(0)}, {targetPt?.[2].toFixed(0)})</span>
          </div>
          {destPt && (
            <div className="flex items-center gap-1">
              <MapPin className="w-2 h-2 text-[#ff3d57]" />
              <span className="text-[#6b7c93]">目的地:</span>
              <span className="text-[#42a5f5]">{task.destination ?? '焚烧厂'}</span>
              <span className="font-mono text-[#6b7c93]">({destPt[0].toFixed(0)}, {destPt[2].toFixed(0)})</span>
            </div>
          )}
          <div className="pt-0.5 border-t border-[#1a2a4a]/40">
            <span className="text-[#6b7c93]">路线点:</span>
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {pathPoints.map((pt, i) => (
                <span key={i} className="font-mono text-[#e0e8f0] bg-[#1a2a4a]/30 px-0.5 rounded">
                  {pt[0].toFixed(0)},{pt[2].toFixed(0)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-2 h-2 text-[#6b7c93]" />
            <span className="text-[#6b7c93]">预计到达:</span>
            <span className="font-mono text-[#e0e8f0]">~{eta}s</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function VehiclePanel() {
  const { trucks, tasks, setSelectedTruckId } = useStore()

  return (
    <div className="bg-[#0d1a30]/95 border border-[#1a2a4a] backdrop-blur-md rounded overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1a2a4a]">
        <span className="text-xs font-medium text-[#e0e8f0]">车辆调度</span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-2">
        {trucks.map(truck => {
          const loadPct = (truck.currentLoad / truck.maxLoad) * 100
          const activeTask = tasks.find(t => t.assignedTruckId === truck.id && t.status !== 'completed')
          return (
            <div
              key={truck.id}
              onClick={() => setSelectedTruckId(truck.id)}
              className="p-2 rounded border border-[#1a2a4a] bg-[#0a1628]/60 hover:border-[#00e5a0]/40 cursor-pointer transition-colors space-y-1"
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

              <RouteDetail truck={truck} task={activeTask} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
