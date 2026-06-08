import { Truck, MapPin, Target, Clock, Trash2, ArrowRight, Route, CheckCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const truckStatusLabel: Record<string, string> = {
  idle: '待命',
  collecting: '收运中',
  transporting: '转运中',
  returning: '返程中',
}

const taskStatusConfig: Record<string, { badge: string; label: string }> = {
  pending: { badge: 'badge-warning', label: '待分配' },
  assigned: { badge: 'badge-collecting', label: '已分配' },
  in_progress: { badge: 'badge-warning', label: '进行中' },
  completed: { badge: 'badge-normal', label: '已完成' },
}

function RoutePreview({ path, label }: { path: [number, number, number][]; label: string }) {
  if (path.length < 2) return null

  return (
    <div className="mt-1 p-1.5 rounded bg-[#0a1628]/80 border border-[#1a2a4a]/40">
      <div className="text-[8px] text-[#6b7c93] mb-1 flex items-center gap-0.5">
        <Route className="w-2 h-2" />
        {label}
      </div>
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {path.map((pt, i) => (
          <div key={i} className="flex items-center gap-0.5 flex-shrink-0">
            <span className="text-[8px] font-mono text-[#e0e8f0]">
              ({pt[0].toFixed(0)},{pt[2].toFixed(0)})
            </span>
            {i < path.length - 1 && (
              <ArrowRight className="w-2 h-2 text-[#1a2a4a] flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DriverPanel() {
  const { currentUser, trucks, bins, compressionBoxes, tasks, completeTask } = useStore()

  if (!currentUser || currentUser.role !== 'driver') return null

  const myTruck = currentUser.assignedTruckId
    ? trucks.find(t => t.id === currentUser.assignedTruckId)
    : null

  const myTasks = tasks.filter(t =>
    t.assignedTruckId === currentUser.assignedTruckId &&
    t.status !== 'completed'
  )

  const myCollectionTasks = myTasks.filter(t => t.taskType === 'collection')
  const myTransferTasks = myTasks.filter(t => t.taskType === 'transfer')

  return (
    <div className="w-80 h-full bg-[#0d1a30]/95 border-l border-[#1a2a4a] backdrop-blur-md flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1a2a4a]">
        <span className="text-xs font-medium text-[#e0e8f0]">我的车辆与任务</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {myTruck ? (
          <div className="p-3 rounded border border-[#1a2a4a] bg-[#0a1628]/60 space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#00e5a0]" />
              <span className="text-sm font-medium text-[#e0e8f0]">{myTruck.id}</span>
              <span className={cn(
                'status-badge',
                myTruck.status === 'idle' ? 'badge-idle' :
                myTruck.status === 'collecting' ? 'badge-collecting' :
                myTruck.status === 'transporting' ? 'badge-transporting' : 'badge-idle'
              )}>
                {truckStatusLabel[myTruck.status]}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#6b7c93]">装载量</span>
                <span className="font-mono text-[#e0e8f0]">{myTruck.currentLoad}/{myTruck.maxLoad}</span>
              </div>
              <div className="w-full h-2 bg-[#0a1628] rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    myTruck.currentLoad / myTruck.maxLoad > 0.8 ? 'bg-[#ffc107]' : 'bg-[#00e5a0]'
                  )}
                  style={{ width: `${(myTruck.currentLoad / myTruck.maxLoad) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-[10px] text-[#6b7c93] flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              <span className="font-mono text-[#e0e8f0]">
                ({myTruck.position[0].toFixed(1)}, {myTruck.position[2].toFixed(1)})
              </span>
            </div>

            {myTruck.targetBinId && (
              <div className="text-[10px] text-[#6b7c93] flex items-center gap-1">
                <Target className="w-2.5 h-2.5" />
                <span className="text-[#e0e8f0]">{myTruck.targetBinId}</span>
              </div>
            )}

            <div className="text-[10px] text-[#6b7c93]">
              路线进度：<span className="font-mono text-[#e0e8f0]">{Math.round(myTruck.routeProgress * 100)}%</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded border border-[#1a2a4a] bg-[#0a1628]/60 text-center">
            <div className="text-xs text-[#6b7c93]">暂无分配车辆</div>
          </div>
        )}

        {myCollectionTasks.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-medium text-[#00e5a0] flex items-center gap-1">
              <Trash2 className="w-3 h-3" />
              收运任务
              <span className="ml-1 inline-flex items-center justify-center min-w-[14px] h-3 rounded-full bg-[#00e5a0]/20 text-[#00e5a0] text-[8px] px-0.5">
                {myCollectionTasks.length}
              </span>
            </div>
            {myCollectionTasks.map(task => {
              const targetBin = bins.find(b => b.id === task.targetBinId)
              return (
                <div key={task.id} className="p-2 rounded border border-[#1a2a4a]/60 bg-[#0a1628]/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#6b7c93]">{task.id.slice(0, 16)}</span>
                    <span className={cn('status-badge', taskStatusConfig[task.status]?.badge ?? 'badge-normal')}>
                      {taskStatusConfig[task.status]?.label ?? task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-[#6b7c93] flex items-center gap-0.5">
                      <Target className="w-2.5 h-2.5" />
                      <span className="text-[#e0e8f0]">{task.targetBinId}</span>
                    </span>
                    {targetBin && (
                      <span className="text-[#6b7c93]">
                        <MapPin className="w-2 h-2 inline" />
                        {targetBin.location}
                      </span>
                    )}
                  </div>
                  {targetBin && (
                    <div className="text-[9px] text-[#6b7c93]">
                      满溢度：<span className={cn('font-mono', targetBin.fillLevel >= 95 ? 'text-[#ff3d57]' : targetBin.fillLevel >= 80 ? 'text-[#ffc107]' : 'text-[#00e5a0]')}>
                        {targetBin.fillLevel}%
                      </span>
                    </div>
                  )}
                  <RoutePreview path={task.path} label="收运路线" />
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => completeTask(task.id)}
                      className="w-full flex items-center justify-center gap-1 py-1 rounded text-[10px] bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/20 hover:bg-[#00e5a0]/25 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      确认完成收运
                    </button>
                  )}
                  <div className="text-[9px] text-[#6b7c93] flex items-center gap-0.5">
                    <Clock className="w-2 h-2" />
                    {task.createdAt}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {myTransferTasks.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-medium text-[#42a5f5] flex items-center gap-1">
              <ArrowRight className="w-3 h-3" />
              转运任务
              <span className="ml-1 inline-flex items-center justify-center min-w-[14px] h-3 rounded-full bg-[#42a5f5]/20 text-[#42a5f5] text-[8px] px-0.5">
                {myTransferTasks.length}
              </span>
            </div>
            {myTransferTasks.map(task => {
              const targetBox = compressionBoxes.find(b => b.id === task.targetBinId)
              return (
                <div key={task.id} className="p-2 rounded border border-[#1a2a4a]/60 bg-[#0a1628]/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#6b7c93]">{task.id.slice(0, 16)}</span>
                    <span className={cn('status-badge', taskStatusConfig[task.status]?.badge ?? 'badge-normal')}>
                      {taskStatusConfig[task.status]?.label ?? task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-[#6b7c93]">压缩箱：<span className="text-[#e0e8f0]">{task.targetBinId}</span></span>
                    {task.destination && (
                      <span className="text-[#6b7c93] flex items-center gap-0.5">
                        <ArrowRight className="w-2.5 h-2.5" />
                        <span className="text-[#42a5f5]">{task.destination}</span>
                      </span>
                    )}
                  </div>
                  {targetBox && (
                    <div className="text-[9px] text-[#6b7c93]">
                      液位：<span className={cn('font-mono', targetBox.liquidLevel > 90 ? 'text-[#ff3d57]' : 'text-[#42a5f5]')}>
                        {targetBox.liquidLevel}%
                      </span>
                    </div>
                  )}
                  <RoutePreview path={task.path} label={`转运路线 → ${task.destination ?? '焚烧厂'}`} />
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => completeTask(task.id)}
                      className="w-full flex items-center justify-center gap-1 py-1 rounded text-[10px] bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/20 hover:bg-[#00e5a0]/25 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      确认完成转运
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {myTasks.length === 0 && (
          <div className="py-6 text-xs text-[#6b7c93] text-center">当前无进行中的任务</div>
        )}
      </div>
    </div>
  )
}
