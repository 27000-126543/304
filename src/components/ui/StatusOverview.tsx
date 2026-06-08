import { Trash2, AlertTriangle, Truck, ClipboardList, Bell } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  color?: string
}

function StatCard({ icon, label, value, color = 'text-[#e0e8f0]' }: StatCardProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a1628]/80 rounded border border-[#1a2a4a]">
      <div className="shrink-0">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[9px] text-[#6b7c93] leading-tight">{label}</span>
        <span className={cn('text-xs font-mono font-bold leading-tight', color)}>{value}</span>
      </div>
    </div>
  )
}

export default function StatusOverview() {
  const { bins, trucks, tasks, alerts } = useStore()

  const totalBins = bins.length
  const criticalBins = bins.filter(b => b.status === 'critical' || b.status === 'warning').length
  const activeTrucks = trucks.filter(t => t.status !== 'idle').length
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length
  const activeAlerts = alerts.filter(a => a.type === 'critical' || a.type === 'warning').length

  return (
    <div className="flex items-center gap-3 w-full px-4 py-2">
      <StatCard
        icon={<Trash2 className="w-3.5 h-3.5 text-[#00e5a0]" />}
        label="垃圾桶总数"
        value={totalBins}
      />
      <StatCard
        icon={<AlertTriangle className="w-3.5 h-3.5 text-[#ff3d57]" />}
        label="预警桶数"
        value={criticalBins}
        color={criticalBins > 0 ? 'text-[#ff3d57]' : 'text-[#e0e8f0]'}
      />
      <StatCard
        icon={<Truck className="w-3.5 h-3.5 text-[#42a5f5]" />}
        label="作业车辆"
        value={activeTrucks}
      />
      <StatCard
        icon={<ClipboardList className="w-3.5 h-3.5 text-[#ffc107]" />}
        label="待处理任务"
        value={pendingTasks}
        color={pendingTasks > 0 ? 'text-[#ffc107]' : 'text-[#e0e8f0]'}
      />
      <StatCard
        icon={<Bell className="w-3.5 h-3.5 text-[#ff3d57]" />}
        label="活跃告警"
        value={activeAlerts}
        color={activeAlerts > 0 ? 'text-[#ff3d57]' : 'text-[#e0e8f0]'}
      />
    </div>
  )
}
