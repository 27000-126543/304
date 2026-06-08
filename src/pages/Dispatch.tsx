import TopBar from '@/components/ui/TopBar'
import TaskPanel from '@/components/ui/TaskPanel'
import VehiclePanel from '@/components/ui/VehiclePanel'
import DevicePanel from '@/components/ui/DevicePanel'
import PredictionPanel from '@/components/ui/PredictionPanel'
import ApprovalPanel from '@/components/ui/ApprovalPanel'

export default function Dispatch() {
  return (
    <div className="flex h-screen flex-col bg-cyber-bg overflow-hidden">
      <TopBar />

      <div className="flex-1 grid grid-cols-[280px_1fr_320px] gap-3 p-3 overflow-hidden">
        <div className="flex flex-col gap-3 overflow-hidden">
          <div className="panel-bg rounded-lg flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-cyber-border">
              <h3 className="text-sm font-medium text-cyber-accent">收运任务</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <TaskPanel />
            </div>
          </div>

          <div className="panel-bg rounded-lg flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-cyber-border">
              <h3 className="text-sm font-medium text-cyber-accent">车辆调度</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <VehiclePanel />
            </div>
          </div>
        </div>

        <div className="panel-bg rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-cyber-border">
            <h3 className="text-sm font-medium text-cyber-accent">设备监控</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <DevicePanel />
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-hidden">
          <div className="panel-bg rounded-lg flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-cyber-border">
              <h3 className="text-sm font-medium text-cyber-accent">AI预测调度</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <PredictionPanel />
            </div>
          </div>

          <div className="panel-bg rounded-lg flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-cyber-border">
              <h3 className="text-sm font-medium text-cyber-accent">审批流程</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <ApprovalPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
