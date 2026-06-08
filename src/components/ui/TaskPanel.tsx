import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Clock, Truck, ArrowRight, Wrench, RefreshCw, CheckCircle, History, MapPin, Route } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { CollectionTask } from '@/types'

const statusConfig: Record<string, { badge: string; label: string }> = {
  pending: { badge: 'badge-warning', label: '待分配' },
  assigned: { badge: 'badge-collecting', label: '已分配' },
  in_progress: { badge: 'badge-warning', label: '进行中' },
  completed: { badge: 'badge-normal', label: '已完成' },
}

function AssignTruckDropdown({ taskId, currentTruckId, taskType }: {
  taskId: string
  currentTruckId: string | null
  taskType: 'collection' | 'transfer'
}) {
  const { trucks, assignTask, reassignTask } = useStore()
  const [open, setOpen] = useState(false)

  const availableTrucks = trucks.filter(t =>
    t.status === 'idle' || (t.status === 'collecting' && t.currentLoad < t.maxLoad * 0.8)
  )

  const label = currentTruckId ? '改派' : '派单'
  const action = currentTruckId ? 'reassign' : 'assign'

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-[#42a5f5]/15 text-[#42a5f5] border border-[#42a5f5]/20 hover:bg-[#42a5f5]/25 transition-colors"
      >
        {currentTruckId ? <RefreshCw className="w-2.5 h-2.5" /> : <Truck className="w-2.5 h-2.5" />}
        {label}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#0f1f3d] border border-[#1a2a4a] rounded shadow-lg z-20 min-w-[120px] max-h-28 overflow-y-auto">
          {availableTrucks.length === 0 && (
            <div className="px-2 py-1.5 text-[9px] text-[#6b7c93]">无可用车辆</div>
          )}
          {availableTrucks.map(truck => (
            <button
              key={truck.id}
              onClick={(e) => {
                e.stopPropagation()
                if (action === 'reassign') {
                  reassignTask(taskId, truck.id)
                } else {
                  assignTask(taskId, truck.id)
                }
                setOpen(false)
              }}
              className={cn(
                'w-full text-left px-2 py-1.5 text-[10px] hover:bg-[#1a2a4a]/60 transition-colors flex items-center justify-between',
                truck.id === currentTruckId && 'text-[#00e5a0]'
              )}
            >
              <span className="text-[#e0e8f0]">{truck.id}</span>
              <span className={cn(
                'text-[8px]',
                truck.status === 'idle' ? 'text-[#00e5a0]' : 'text-[#ffc107]'
              )}>
                {truck.status === 'idle' ? '空闲' : '可调度'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewTaskDetail({ task, onClose }: { task: CollectionTask; onClose: () => void }) {
  const { trucks, bins, compressionBoxes } = useStore()
  const [expanded, setExpanded] = useState(false)

  const assignedTruck = trucks.find(t => t.id === task.assignedTruckId)
  const targetBin = bins.find(b => b.id === task.targetBinId)
  const targetBox = compressionBoxes.find(b => b.id === task.targetBinId)

  return (
    <div className="p-2 border border-[#1a2a4a] rounded bg-[#0a1628]/80 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#6b7c93]">{task.id}</span>
        <button onClick={onClose} className="text-[9px] text-[#6b7c93] hover:text-[#e0e8f0]">收起</button>
      </div>

      <div className="flex items-center gap-2 text-[10px]">
        <span className={cn('status-badge', statusConfig[task.status]?.badge)}>{statusConfig[task.status]?.label}</span>
        <span className="text-[#6b7c93]">{task.taskType === 'collection' ? '收运' : '转运'}</span>
      </div>

      <div className="space-y-0.5 text-[9px]">
        <div className="flex items-center gap-1 text-[#6b7c93]">
          <MapPin className="w-2.5 h-2.5" />
          <span>目标:</span>
          <span className="text-[#e0e8f0]">{task.targetBinId}</span>
          {targetBin && <span className="text-[#6b7c93]">({targetBin.location})</span>}
          {targetBox && <span className="text-[#6b7c93]">({targetBox.stationName})</span>}
        </div>
        {assignedTruck && (
          <div className="flex items-center gap-1 text-[#6b7c93]">
            <Truck className="w-2.5 h-2.5" />
            <span>车辆:</span>
            <span className="text-[#e0e8f0]">{assignedTruck.id}</span>
          </div>
        )}
        {task.destination && (
          <div className="flex items-center gap-1 text-[#6b7c93]">
            <ArrowRight className="w-2.5 h-2.5" />
            <span>目的地:</span>
            <span className="text-[#42a5f5]">{task.destination}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-[#6b7c93]">
          <Clock className="w-2.5 h-2.5" />
          <span>创建:</span>
          <span className="font-mono">{task.createdAt}</span>
        </div>
        {task.completedAt && (
          <div className="flex items-center gap-1 text-[#6b7c93]">
            <CheckCircle className="w-2.5 h-2.5 text-[#00e5a0]" />
            <span>完成:</span>
            <span className="font-mono text-[#00e5a0]">{task.completedAt}</span>
          </div>
        )}
      </div>

      {task.reassignHistory.length > 0 && (
        <div className="space-y-0.5">
          <div className="text-[9px] text-[#6b7c93] flex items-center gap-1">
            <History className="w-2.5 h-2.5" />
            改派记录 ({task.reassignHistory.length})
          </div>
          {task.reassignHistory.map((r, i) => (
            <div key={i} className="ml-3 text-[8px] text-[#6b7c93]">
              <span className="text-[#ff3d57]">{r.fromTruckId ?? '未分配'}</span>
              <span className="mx-0.5">→</span>
              <span className="text-[#00e5a0]">{r.toTruckId}</span>
              <span className="ml-1">{r.operator}</span>
              <span className="ml-1 font-mono">{r.timestamp}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[9px] text-[#42a5f5] hover:text-[#42a5f5]/80"
      >
        <Route className="w-2.5 h-2.5" />
        路线详情
        {expanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
      </button>
      {expanded && (
        <div className="flex flex-wrap gap-0.5 text-[8px]">
          {task.path.map((pt, i) => (
            <span key={i} className="font-mono text-[#e0e8f0] bg-[#1a2a4a]/30 px-0.5 rounded">
              {pt[0].toFixed(0)},{pt[2].toFixed(0)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TaskPanel() {
  const { tasks, bins, compressionBoxes, maintenanceOrders, createTask, createTransferTask, completeTask, currentUser } = useStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState<'collection' | 'transfer' | 'maintenance' | 'review'>('collection')
  const [reviewFilter, setReviewFilter] = useState<'all' | 'collection' | 'transfer'>('all')
  const [reviewStatus, setReviewStatus] = useState<'all' | 'completed' | 'incomplete'>('all')
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null)

  const isDispatcher = currentUser?.role === 'dispatcher' || currentUser?.role === 'station_manager'
  const isDriver = currentUser?.role === 'driver'

  const binsNeedingTask = bins.filter(b => b.fillLevel >= 80 && b.status !== 'fault')
  const boxesNeedingTransfer = compressionBoxes.filter(b => b.liquidLevel > 85 && b.status !== 'fault')

  const collectionTasks = tasks.filter(t => t.taskType === 'collection')
  const transferTasks = tasks.filter(t => t.taskType === 'transfer')

  const reviewTasks = tasks.filter(t => {
    if (reviewFilter === 'collection' && t.taskType !== 'collection') return false
    if (reviewFilter === 'transfer' && t.taskType !== 'transfer') return false
    if (reviewStatus === 'completed' && t.status !== 'completed') return false
    if (reviewStatus === 'incomplete' && t.status === 'completed') return false
    return true
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        {(['collection', 'transfer', 'maintenance', 'review'] as const).map(tab => {
          const labels = { collection: '收运', transfer: '转运', maintenance: '工单', review: '复盘' }
          const counts = {
            collection: collectionTasks.filter(t => t.status !== 'completed').length,
            transfer: transferTasks.filter(t => t.status !== 'completed').length,
            maintenance: maintenanceOrders.filter(o => o.status === 'pending').length,
            review: tasks.length,
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
          {isDispatcher && (
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
          )}
          <div className="max-h-48 overflow-y-auto">
            {collectionTasks.length === 0 && (
              <div className="py-3 text-[10px] text-[#6b7c93] text-center">暂无收运任务</div>
            )}
            {collectionTasks.slice(0, 20).map(task => (
              <div key={task.id} className="px-2 py-1.5 border-b border-[#1a2a4a]/50 hover:bg-[#0f1f3d]/60 transition-colors">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-mono text-[#6b7c93]">{task.id.slice(0, 16)}</span>
                  <div className="flex items-center gap-1">
                    <span className={cn('status-badge', statusConfig[task.status]?.badge ?? 'badge-normal')}>
                      {statusConfig[task.status]?.label ?? task.status}
                    </span>
                    {isDispatcher && (task.status === 'pending' || task.status === 'assigned') && (
                      <AssignTruckDropdown
                        taskId={task.id}
                        currentTruckId={task.assignedTruckId}
                        taskType="collection"
                      />
                    )}
                    {(isDispatcher || isDriver) && task.status === 'in_progress' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); completeTask(task.id) }}
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/20 hover:bg-[#00e5a0]/25 transition-colors"
                      >
                        <CheckCircle className="w-2.5 h-2.5" />
                        确认完成
                      </button>
                    )}
                  </div>
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
          {isDispatcher && (
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
          )}
          <div className="max-h-48 overflow-y-auto">
            {transferTasks.length === 0 && (
              <div className="py-3 text-[10px] text-[#6b7c93] text-center">暂无转运任务</div>
            )}
            {transferTasks.slice(0, 20).map(task => (
              <div key={task.id} className="px-2 py-1.5 border-b border-[#1a2a4a]/50 hover:bg-[#0f1f3d]/60 transition-colors">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-mono text-[#6b7c93]">{task.id.slice(0, 16)}</span>
                  <div className="flex items-center gap-1">
                    <span className={cn('status-badge', statusConfig[task.status]?.badge ?? 'badge-normal')}>
                      {statusConfig[task.status]?.label ?? task.status}
                    </span>
                    {isDispatcher && (task.status === 'pending' || task.status === 'assigned') && (
                      <AssignTruckDropdown
                        taskId={task.id}
                        currentTruckId={task.assignedTruckId}
                        taskType="transfer"
                      />
                    )}
                    {(isDispatcher || isDriver) && task.status === 'in_progress' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); completeTask(task.id) }}
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/20 hover:bg-[#00e5a0]/25 transition-colors"
                      >
                        <CheckCircle className="w-2.5 h-2.5" />
                        确认完成
                      </button>
                    )}
                  </div>
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

      {activeTab === 'review' && (
        <>
          <div className="flex items-center gap-1.5 mb-1">
            <select
              value={reviewFilter}
              onChange={e => setReviewFilter(e.target.value as 'all' | 'collection' | 'transfer')}
              className="px-1.5 py-0.5 rounded text-[9px] bg-[#0f1f3d] border border-[#1a2a4a] text-[#e0e8f0] outline-none"
            >
              <option value="all">全部类型</option>
              <option value="collection">收运任务</option>
              <option value="transfer">转运任务</option>
            </select>
            <select
              value={reviewStatus}
              onChange={e => setReviewStatus(e.target.value as 'all' | 'completed' | 'incomplete')}
              className="px-1.5 py-0.5 rounded text-[9px] bg-[#0f1f3d] border border-[#1a2a4a] text-[#e0e8f0] outline-none"
            >
              <option value="all">全部状态</option>
              <option value="completed">已完成</option>
              <option value="incomplete">未完成</option>
            </select>
            <span className="text-[9px] text-[#6b7c93] ml-auto">{reviewTasks.length} 条</span>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {reviewTasks.length === 0 && (
              <div className="py-3 text-[10px] text-[#6b7c93] text-center">暂无任务记录</div>
            )}
            {reviewTasks.slice(0, 30).map(task => (
              <div key={task.id}>
                <div
                  onClick={() => setExpandedReviewId(expandedReviewId === task.id ? null : task.id)}
                  className="px-2 py-1.5 border border-[#1a2a4a]/50 rounded hover:bg-[#0f1f3d]/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-mono text-[#6b7c93]">{task.id.slice(0, 16)}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-[#6b7c93]">{task.taskType === 'collection' ? '收运' : '转运'}</span>
                      <span className={cn('status-badge', statusConfig[task.status]?.badge)}>
                        {statusConfig[task.status]?.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px]">
                    <span className="text-[#6b7c93]">目标: <span className="text-[#e0e8f0]">{task.targetBinId}</span></span>
                    {task.assignedTruckId && (
                      <span className="text-[#6b7c93]">车辆: <span className="text-[#e0e8f0]">{task.assignedTruckId}</span></span>
                    )}
                    {task.reassignHistory.length > 0 && (
                      <span className="text-[#ffc107]">改派×{task.reassignHistory.length}</span>
                    )}
                    <span className="text-[#6b7c93] font-mono ml-auto">{task.createdAt}</span>
                  </div>
                </div>
                {expandedReviewId === task.id && (
                  <ReviewTaskDetail task={task} onClose={() => setExpandedReviewId(null)} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
