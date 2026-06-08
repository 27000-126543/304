import { useState } from 'react'
import { Plus, ChevronDown, Clock, Truck, ArrowRight, Wrench } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { badge: string; label: string }> = {
  pending: { badge: 'badge-warning', label: '待分配' },
  assigned: { badge: 'badge-collecting', label: '已分配' },
  in_progress: { badge: 'badge-warning', label: '进行中' },
  completed: { badge: 'badge-normal', label: '已完成' },
}

export default function TaskPanel() {
  const { tasks, bins, compressionBoxes, maintenanceOrders, createTask, createTransferTask } = useStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState<'collection' | 'transfer' | 'maintenance'>('collection')

  const binsNeedingTask = bins.filter(b => b.fillLevel >= 80 && b.status !== 'fault')
  const boxesNeedingTransfer = compressionBoxes.filter(b => b.liquidLevel > 85 && b.status !== 'fault')

  const collectionTasks = tasks.filter(t => t.taskType === 'collection')
  const transferTasks = tasks.filter(t => t.taskType === 'transfer')

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        {(['collection', 'transfer', 'maintenance'] as const).map(tab => {
          const labels = { collection: '收运', transfer: '转运', maintenance: '工单' }
          const counts = {
            collection: collectionTasks.filter(t => t.status !== 'completed').length,
            transfer: transferTasks.filter(t => t.status !== 'completed').length,
            maintenance: maintenanceOrders.filter(o => o.status === 'pending').length,
          }
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded transition-colors flex items-center gap-1',
                activeTab === tab
                  ? 'bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/30'
                  : 'text-[#6b7c93] hover:text-[#e0e8f0] border border-transparent'
              )}
            >
              {labels[tab]}
              {counts[tab] > 0 && (
                <span className="inline-flex items-center justify-center min-w-[12px] h-3 rounded-full bg-[#ff3d57]/30 text-[#ff3d57] text-[8px] px-0.5">
                  {counts[tab]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeTab === 'collection' && (
        <>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/30 hover:bg-[#00e5a0]/25 transition-colors"
            >
              <Plus className="w-3 h-3" />
              新建收运任务
              <ChevronDown className="w-3 h-3" />
            </button>
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#0f1f3d] border border-[#1a2a4a] rounded shadow-lg z-10 max-h-32 overflow-y-auto">
                {binsNeedingTask.length === 0 && (
                  <div className="px-2 py-1.5 text-[10px] text-[#6b7c93]">暂无需要收运的垃圾桶</div>
                )}
                {binsNeedingTask.map(bin => (
                  <button
                    key={bin.id}
                    onClick={() => {
                      createTask(bin.id)
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-[#1a2a4a]/60 transition-colors flex items-center justify-between"
                  >
                    <span className="text-[#e0e8f0]">{bin.id} - {bin.location}</span>
                    <span className="font-mono text-[#ffc107]">{bin.fillLevel}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto">
            {collectionTasks.length === 0 && (
              <div className="py-3 text-[10px] text-[#6b7c93] text-center">暂无收运任务</div>
            )}
            {collectionTasks.slice(0, 20).map(task => (
              <div key={task.id} className="px-2 py-1.5 border-b border-[#1a2a4a]/50 hover:bg-[#0f1f3d]/60 transition-colors">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-mono text-[#6b7c93]">{task.id.slice(0, 16)}</span>
                  <span className={cn('status-badge', statusConfig[task.status]?.badge ?? 'badge-normal')}>
                    {statusConfig[task.status]?.label ?? task.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-[#6b7c93]">目标: <span className="text-[#e0e8f0]">{task.targetBinId}</span></span>
                  {task.assignedTruckId && (
                    <span className="text-[#6b7c93] flex items-center gap-0.5">
                      <Truck className="w-2.5 h-2.5" />
                      <span className="text-[#e0e8f0]">{task.assignedTruckId}</span>
                    </span>
                  )}
                  <span className="text-[#6b7c93] flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span className="font-mono">{task.createdAt}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'transfer' && (
        <>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] bg-[#42a5f5]/15 text-[#42a5f5] border border-[#42a5f5]/30 hover:bg-[#42a5f5]/25 transition-colors"
            >
              <Plus className="w-3 h-3" />
              新建转运任务
              <ChevronDown className="w-3 h-3" />
            </button>
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#0f1f3d] border border-[#1a2a4a] rounded shadow-lg z-10 max-h-32 overflow-y-auto">
                {boxesNeedingTransfer.length === 0 && (
                  <div className="px-2 py-1.5 text-[10px] text-[#6b7c93]">暂无需要转运的压缩箱</div>
                )}
                {boxesNeedingTransfer.map(box => (
                  <button
                    key={box.id}
                    onClick={() => {
                      createTransferTask(box.id)
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-[#1a2a4a]/60 transition-colors flex items-center justify-between"
                  >
                    <span className="text-[#e0e8f0]">{box.id} - {box.stationName}</span>
                    <span className="font-mono text-[#ff3d57]">{box.liquidLevel}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto">
            {transferTasks.length === 0 && (
              <div className="py-3 text-[10px] text-[#6b7c93] text-center">暂无转运任务</div>
            )}
            {transferTasks.slice(0, 20).map(task => (
              <div key={task.id} className="px-2 py-1.5 border-b border-[#1a2a4a]/50 hover:bg-[#0f1f3d]/60 transition-colors">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-mono text-[#6b7c93]">{task.id.slice(0, 16)}</span>
                  <span className={cn('status-badge', statusConfig[task.status]?.badge ?? 'badge-normal')}>
                    {statusConfig[task.status]?.label ?? task.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-[#6b7c93]">压缩箱: <span className="text-[#e0e8f0]">{task.targetBinId}</span></span>
                  {task.assignedTruckId && (
                    <span className="text-[#6b7c93] flex items-center gap-0.5">
                      <Truck className="w-2.5 h-2.5" />
                      <span className="text-[#e0e8f0]">{task.assignedTruckId}</span>
                    </span>
                  )}
                  {task.destination && (
                    <span className="text-[#6b7c93] flex items-center gap-0.5">
                      <ArrowRight className="w-2.5 h-2.5" />
                      <span className="text-[#42a5f5]">{task.destination}</span>
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-[#6b7c93] mt-0.5">
                  <Clock className="w-2 h-2 inline" /> {task.createdAt}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'maintenance' && (
        <div className="max-h-64 overflow-y-auto">
          {maintenanceOrders.length === 0 && (
            <div className="py-3 text-[10px] text-[#6b7c93] text-center">暂无维修工单</div>
          )}
          {maintenanceOrders.slice(0, 20).map(order => (
            <div key={order.id} className="px-2 py-1.5 border-b border-[#1a2a4a]/50 hover:bg-[#0f1f3d]/60 transition-colors">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-mono text-[#6b7c93]">{order.id}</span>
                <span className={cn(
                  'status-badge',
                  order.status === 'pending' ? 'badge-critical' : order.status === 'in_progress' ? 'badge-warning' : 'badge-normal'
                )}>
                  {order.status === 'pending' ? '待处理' : order.status === 'in_progress' ? '处理中' : '已完成'}
                </span>
              </div>
              <div className="text-[10px] text-[#e0e8f0]">{order.description}</div>
              <div className="flex items-center gap-2 text-[9px] text-[#6b7c93] mt-0.5">
                <span className="flex items-center gap-0.5"><Wrench className="w-2 h-2" />{order.deviceId}</span>
                <span>{order.deviceType === 'bin' ? '垃圾桶' : '压缩箱'}</span>
                <span>{order.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
