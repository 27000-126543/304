import { useState } from 'react'
import { X, MapPin, Trash2, Truck, Box, Droplets, Thermometer, ShowerHead, AlertTriangle, Plus, Wrench } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

function FillBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-2 bg-[#0a1628] rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full transition-all duration-300', color)} style={{ width: `${value}%` }} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    normal: 'badge-normal', warning: 'badge-warning', critical: 'badge-critical', fault: 'badge-fault',
    idle: 'badge-idle', collecting: 'badge-collecting', transporting: 'badge-transporting', returning: 'badge-idle',
    high_level: 'badge-warning', temp_alarm: 'badge-critical',
  }
  const label: Record<string, string> = {
    normal: '正常', warning: '预警', critical: '危急', fault: '故障',
    idle: '待命', collecting: '收运中', transporting: '转运中', returning: '返程中',
    high_level: '高液位', temp_alarm: '温度异常',
  }
  return <span className={cn('status-badge', map[status] ?? 'badge-normal')}>{label[status] ?? status}</span>
}

export default function SidePanel() {
  const [activeTab, setActiveTab] = useState<'detail' | 'stats'>('detail')
  const selectedIds = useStore(s => s.selectedIds)
  const bins = useStore(s => s.bins)
  const trucks = useStore(s => s.trucks)
  const compressionBoxes = useStore(s => s.compressionBoxes)
  const maintenanceOrders = useStore(s => s.maintenanceOrders)
  const setSelectedBinId = useStore(s => s.setSelectedBinId)
  const setSelectedTruckId = useStore(s => s.setSelectedTruckId)
  const setSelectedCompressionBoxId = useStore(s => s.setSelectedCompressionBoxId)
  const createTask = useStore(s => s.createTask)
  const setFaultStatus = useStore(s => s.setFaultStatus)

  const selectedBin = selectedIds.selectedBinId ? bins.find(b => b.id === selectedIds.selectedBinId) ?? null : null
  const selectedTruck = selectedIds.selectedTruckId ? trucks.find(t => t.id === selectedIds.selectedTruckId) ?? null : null
  const selectedCompressionBox = selectedIds.selectedCompressionBoxId ? compressionBoxes.find(b => b.id === selectedIds.selectedCompressionBoxId) ?? null : null
  const hasSelection = !!(selectedBin || selectedTruck || selectedCompressionBox)

  function close() {
    setSelectedBinId(null)
    setSelectedTruckId(null)
    setSelectedCompressionBoxId(null)
  }

  if (!hasSelection) return null

  const relatedOrders = selectedBin
    ? maintenanceOrders.filter(o => o.deviceId === selectedBin.id)
    : selectedCompressionBox
      ? maintenanceOrders.filter(o => o.deviceId === selectedCompressionBox.id)
      : []

  return (
    <div className="w-80 h-full bg-[#0d1a30]/95 border-l border-[#1a2a4a] backdrop-blur-md flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a2a4a]">
        <div className="flex gap-2">
          {(['detail', 'stats'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'text-xs px-2.5 py-1 rounded transition-colors',
                activeTab === tab
                  ? 'bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/30'
                  : 'text-[#6b7c93] hover:text-[#e0e8f0]'
              )}
            >
              {tab === 'detail' ? '详情' : '工单'}
            </button>
          ))}
        </div>
        <button onClick={close} className="text-[#6b7c93] hover:text-[#e0e8f0] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'detail' && (
          <>
            {selectedBin && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-[#00e5a0]" />
                  <span className="text-sm font-medium">{selectedBin.id}</span>
                  <StatusBadge status={selectedBin.status} />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-[#6b7c93]">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedBin.location}</span>
                  </div>
                  <div className="text-[#6b7c93]">类型：{selectedBin.type === 'residential' ? '小区' : '路边'}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6b7c93]">满溢度</span>
                    <span className="font-mono text-[#e0e8f0]">{selectedBin.fillLevel}%</span>
                  </div>
                  <FillBar
                    value={selectedBin.fillLevel}
                    color={selectedBin.fillLevel >= 95 ? 'bg-[#ff3d57]' : selectedBin.fillLevel >= 80 ? 'bg-[#ffc107]' : 'bg-[#00e5a0]'}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6b7c93]">收运倒计时</span>
                  <span className="font-mono text-[#e0e8f0]">{selectedBin.countdown} min</span>
                </div>
                {selectedBin.status !== 'fault' && (
                  <button
                    onClick={() => createTask(selectedBin.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/30 hover:bg-[#00e5a0]/25 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    创建收运任务
                  </button>
                )}
                <button
                  onClick={() => setFaultStatus(selectedBin.id, 'bin', selectedBin.status !== 'fault')}
                  className={cn(
                    'w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs border transition-colors',
                    selectedBin.status === 'fault'
                      ? 'bg-[#00e5a0]/15 text-[#00e5a0] border-[#00e5a0]/30 hover:bg-[#00e5a0]/25'
                      : 'bg-[#ff3d57]/15 text-[#ff3d57] border-[#ff3d57]/30 hover:bg-[#ff3d57]/25'
                  )}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {selectedBin.status === 'fault' ? '恢复正常' : '模拟故障'}
                </button>
              </div>
            )}

            {selectedTruck && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#00e5a0]" />
                  <span className="text-sm font-medium">{selectedTruck.id}</span>
                  <StatusBadge status={selectedTruck.status} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6b7c93]">装载量</span>
                    <span className="font-mono text-[#e0e8f0]">{selectedTruck.currentLoad}/{selectedTruck.maxLoad}</span>
                  </div>
                  <FillBar
                    value={(selectedTruck.currentLoad / selectedTruck.maxLoad) * 100}
                    color={selectedTruck.currentLoad / selectedTruck.maxLoad > 0.8 ? 'bg-[#ffc107]' : 'bg-[#00e5a0]'}
                  />
                </div>
                <div className="text-xs text-[#6b7c93]">
                  路线进度：<span className="font-mono text-[#e0e8f0]">{Math.round(selectedTruck.routeProgress * 100)}%</span>
                </div>
                {selectedTruck.targetBinId && (
                  <div className="text-xs text-[#6b7c93]">
                    目标：<span className="text-[#e0e8f0]">{selectedTruck.targetBinId}</span>
                  </div>
                )}
                <div className="text-xs text-[#6b7c93]">
                  坐标：<span className="font-mono text-[#e0e8f0]">({selectedTruck.position[0].toFixed(1)}, {selectedTruck.position[2].toFixed(1)})</span>
                </div>
              </div>
            )}

            {selectedCompressionBox && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#00e5a0]" />
                  <span className="text-sm font-medium">{selectedCompressionBox.id}</span>
                  <StatusBadge status={selectedCompressionBox.status} />
                </div>
                <div className="text-xs text-[#6b7c93]">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {selectedCompressionBox.stationName}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6b7c93] flex items-center gap-1"><Droplets className="w-3 h-3" />液位</span>
                    <span className="font-mono text-[#e0e8f0]">{selectedCompressionBox.liquidLevel}%</span>
                  </div>
                  <FillBar
                    value={selectedCompressionBox.liquidLevel}
                    color={selectedCompressionBox.liquidLevel > 90 ? 'bg-[#ff3d57]' : 'bg-[#42a5f5]'}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6b7c93] flex items-center gap-1"><Thermometer className="w-3 h-3" />温度</span>
                    <span className={cn('font-mono', selectedCompressionBox.temperature > 55 ? 'text-[#ff3d57]' : 'text-[#e0e8f0]')}>
                      {selectedCompressionBox.temperature}°C
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6b7c93] flex items-center gap-1"><ShowerHead className="w-3 h-3" />喷淋</span>
                  <span className={selectedCompressionBox.sprinklerActive ? 'text-[#00e5a0]' : 'text-[#6b7c93]'}>
                    {selectedCompressionBox.sprinklerActive ? '已启动' : '未启动'}
                  </span>
                </div>
                <button
                  onClick={() => setFaultStatus(selectedCompressionBox.id, 'compression_box', selectedCompressionBox.status !== 'fault')}
                  className={cn(
                    'w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs border transition-colors',
                    selectedCompressionBox.status === 'fault'
                      ? 'bg-[#00e5a0]/15 text-[#00e5a0] border-[#00e5a0]/30 hover:bg-[#00e5a0]/25'
                      : 'bg-[#ff3d57]/15 text-[#ff3d57] border-[#ff3d57]/30 hover:bg-[#ff3d57]/25'
                  )}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {selectedCompressionBox.status === 'fault' ? '恢复正常' : '模拟故障'}
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#e0e8f0] mb-2">
              <Wrench className="w-3 h-3 text-[#ffc107]" />
              维修工单
            </div>
            {relatedOrders.length === 0 && (
              <div className="text-xs text-[#6b7c93] text-center py-4">暂无维修工单</div>
            )}
            {relatedOrders.map(order => (
              <div key={order.id} className="p-2 rounded border border-[#1a2a4a] bg-[#0a1628]/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#6b7c93]">{order.id}</span>
                  <span className={cn(
                    'status-badge',
                    order.status === 'pending' ? 'badge-critical' : order.status === 'in_progress' ? 'badge-warning' : 'badge-normal'
                  )}>
                    {order.status === 'pending' ? '待处理' : order.status === 'in_progress' ? '处理中' : '已完成'}
                  </span>
                </div>
                <div className="text-[10px] text-[#e0e8f0]">{order.description}</div>
                <div className="text-[10px] text-[#6b7c93]">创建时间：{order.createdAt}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
