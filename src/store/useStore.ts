import { create } from 'zustand'
import type { GarbageBin, GarbageTruck, CompressionBox, Personnel, CollectionTask, MaintenanceOrder, ScheduleProposal, User, UserRole, DailyReport } from '@/types'
import { initialBins, initialTrucks, initialCompressionBoxes, initialPersonnel, initialUsers, generateDailyReports, predictionData } from '@/data/mockData'

const INCINERATOR_POS: [number, number, number] = [35, 0, 0]

interface SelectedIds {
  selectedBinId: string | null
  selectedTruckId: string | null
  selectedCompressionBoxId: string | null
}

interface AppState {
  currentUser: User | null
  users: User[]
  bins: GarbageBin[]
  trucks: GarbageTruck[]
  compressionBoxes: CompressionBox[]
  personnel: Personnel[]
  tasks: CollectionTask[]
  maintenanceOrders: MaintenanceOrder[]
  scheduleProposals: ScheduleProposal[]
  dailyReports: DailyReport[]
  predictionData: typeof predictionData
  selectedIds: SelectedIds
  alerts: { id: string; message: string; type: 'warning' | 'critical' | 'info'; timestamp: string }[]
  simulationRunning: boolean

  login: (userId: string) => void
  logout: () => void
  setSelectedBinId: (id: string | null) => void
  setSelectedTruckId: (id: string | null) => void
  setSelectedCompressionBoxId: (id: string | null) => void
  updateBinFillLevel: (binId: string, level: number) => void
  updateTruckPosition: (truckId: string, position: [number, number, number], progress: number) => void
  updateCompressionBox: (boxId: string, liquidLevel: number, temperature: number) => void
  updatePersonnelPosition: (personnelId: string, position: [number, number, number]) => void
  createTask: (binId: string) => void
  createTransferTask: (boxId: string) => void
  assignTask: (taskId: string, truckId: string) => void
  reassignTask: (taskId: string, newTruckId: string) => void
  completeTask: (taskId: string) => void
  createMaintenanceOrder: (deviceId: string, deviceType: 'bin' | 'compression_box' | 'truck', description: string) => void
  addAlert: (message: string, type: 'warning' | 'critical' | 'info') => void
  dismissAlert: (id: string) => void
  submitSchedule: (proposal: Omit<ScheduleProposal, 'id' | 'status' | 'approvals' | 'createdAt'>) => void
  approveSchedule: (proposalId: string, level: 'dispatcher' | 'station_manager' | 'bureau', approver: string, result: 'approved' | 'rejected', comment: string) => void
  setFaultStatus: (deviceId: string, deviceType: 'bin' | 'compression_box', isFault: boolean) => void
  toggleSimulation: () => void
  tick: () => void
}

const findNearestAvailableTruck = (trucks: GarbageTruck[], targetPos: [number, number, number]): string | null => {
  const available = trucks.filter(t =>
    t.status === 'idle' || (t.status === 'collecting' && t.currentLoad < t.maxLoad * 0.8)
  )
  if (available.length === 0) return null
  let minDist = Infinity
  let nearestId: string | null = null
  for (const truck of available) {
    const dx = truck.position[0] - targetPos[0]
    const dz = truck.position[2] - targetPos[2]
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < minDist) {
      minDist = dist
      nearestId = truck.id
    }
  }
  return nearestId
}

const hasActiveTaskFor = (tasks: CollectionTask[], targetId: string, taskType: 'collection' | 'transfer'): boolean => {
  return tasks.some(t =>
    t.taskType === taskType &&
    t.targetBinId === targetId &&
    (t.status === 'pending' || t.status === 'assigned' || t.status === 'in_progress')
  )
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: initialUsers,
  bins: initialBins,
  trucks: initialTrucks,
  compressionBoxes: initialCompressionBoxes,
  personnel: initialPersonnel,
  tasks: [],
  maintenanceOrders: [],
  scheduleProposals: [],
  dailyReports: generateDailyReports(),
  predictionData,
  selectedIds: { selectedBinId: null, selectedTruckId: null, selectedCompressionBoxId: null },
  alerts: [
    { id: 'a1', message: 'B-003满溢度超95%，已自动生成收运任务', type: 'critical', timestamp: '08:32:15' },
    { id: 'a2', message: 'CB-002液位超90%，已调度转运车辆', type: 'warning', timestamp: '08:28:40' },
    { id: 'a3', message: 'CB-003温度异常(65°C)，喷淋已启动', type: 'critical', timestamp: '08:25:10' },
  ],
  simulationRunning: true,

  login: (userId: string) => {
    const user = get().users.find(u => u.id === userId)
    if (user) {
      set({ currentUser: { ...user, lastLogin: new Date().toLocaleString() } })
    }
  },

  logout: () => set({ currentUser: null }),

  setSelectedBinId: (id) => set(s => ({ selectedIds: { ...s.selectedIds, selectedBinId: id } })),
  setSelectedTruckId: (id) => set(s => ({ selectedIds: { ...s.selectedIds, selectedTruckId: id } })),
  setSelectedCompressionBoxId: (id) => set(s => ({ selectedIds: { ...s.selectedIds, selectedCompressionBoxId: id } })),

  updateBinFillLevel: (binId, level) => set(state => {
    const bins = state.bins.map(b => {
      if (b.id !== binId) return b
      const newStatus: GarbageBin['status'] = level >= 95 ? 'critical' : level >= 80 ? 'warning' : b.status === 'fault' ? 'fault' : 'normal'
      return { ...b, fillLevel: Math.min(100, level), status: newStatus, countdown: Math.max(0, Math.round((100 - level) * 1.5)) }
    })
    return { bins }
  }),

  updateTruckPosition: (truckId, position, progress) => set(state => ({
    trucks: state.trucks.map(t => t.id === truckId ? { ...t, position, routeProgress: progress } : t)
  })),

  updateCompressionBox: (boxId, liquidLevel, temperature) => set(state => ({
    compressionBoxes: state.compressionBoxes.map(b => {
      if (b.id !== boxId) return b
      const sprinklerActive = temperature > 60
      const newStatus: CompressionBox['status'] = liquidLevel > 90 ? 'high_level' : temperature > 55 ? 'temp_alarm' : b.status === 'fault' ? 'fault' : 'normal'
      return { ...b, liquidLevel: Math.min(100, liquidLevel), temperature, sprinklerActive, status: newStatus }
    })
  })),

  updatePersonnelPosition: (personnelId, position) => set(state => ({
    personnel: state.personnel.map(p => p.id === personnelId ? { ...p, position } : p)
  })),

  createTask: (binId) => {
    const state = get()
    if (hasActiveTaskFor(state.tasks, binId, 'collection')) return

    const bin = state.bins.find(b => b.id === binId)
    if (!bin) return

    const truckId = findNearestAvailableTruck(state.trucks, bin.position)
    const task: CollectionTask = {
      id: `TASK-${Date.now()}`,
      taskType: 'collection',
      targetBinId: binId,
      assignedTruckId: truckId,
      path: truckId
        ? [(state.trucks.find(t => t.id === truckId)?.position || [0, 0, 0]) as [number, number, number], bin.position]
        : [bin.position],
      status: truckId ? 'assigned' : 'pending',
      createdAt: new Date().toLocaleTimeString(),
      completedAt: null,
    }
    const trucks = truckId ? state.trucks.map(t => {
      if (t.id !== truckId) return t
      return { ...t, status: 'collecting' as const, targetBinId: binId, route: [...t.route, bin.position], routeProgress: 0 }
    }) : state.trucks

    get().addAlert(`${binId}满溢度超95%，已自动生成收运任务${truckId ? `，分配${truckId}` : ''}`, 'critical')
    set({ tasks: [...state.tasks, task], trucks })
  },

  createTransferTask: (boxId) => {
    const state = get()
    if (hasActiveTaskFor(state.tasks, boxId, 'transfer')) return

    const box = state.compressionBoxes.find(b => b.id === boxId)
    if (!box) return

    const truckId = findNearestAvailableTruck(state.trucks, box.position)
    const task: CollectionTask = {
      id: `TRANSFER-${Date.now()}`,
      taskType: 'transfer',
      targetBinId: boxId,
      targetBoxId: boxId,
      assignedTruckId: truckId,
      path: truckId
        ? [(state.trucks.find(t => t.id === truckId)?.position || [0, 0, 0]) as [number, number, number], box.position, INCINERATOR_POS]
        : [box.position, INCINERATOR_POS],
      status: truckId ? 'assigned' : 'pending',
      createdAt: new Date().toLocaleTimeString(),
      completedAt: null,
      destination: '城东焚烧厂',
    }
    const trucks = truckId ? state.trucks.map(t => {
      if (t.id !== truckId) return t
      return { ...t, status: 'transporting' as const, targetBinId: boxId, route: [...t.route, box.position, INCINERATOR_POS], routeProgress: 0 }
    }) : state.trucks

    get().addAlert(`${boxId}液位超90%，已调度转运车辆${truckId ? truckId : ''}至焚烧厂`, 'warning')
    set({ tasks: [...state.tasks, task], trucks })
  },

  assignTask: (taskId, truckId) => set(state => {
    const truck = state.trucks.find(t => t.id === truckId)
    const task = state.tasks.find(t => t.id === taskId)
    if (!truck || !task) return state
    const targetPos = task.taskType === 'transfer'
      ? state.compressionBoxes.find(b => b.id === task.targetBinId)?.position
      : state.bins.find(b => b.id === task.targetBinId)?.position
    const path: [number, number, number][] = targetPos
      ? [truck.position, targetPos, ...(task.taskType === 'transfer' ? [INCINERATOR_POS] : [])]
      : [truck.position]
    return {
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, assignedTruckId: truckId, status: 'assigned' as const, path } : t),
      trucks: state.trucks.map(t => t.id === truckId ? { ...t, status: task.taskType === 'transfer' ? 'transporting' as const : 'collecting' as const, targetBinId: task.targetBinId, route: [...t.route, ...path.slice(1)], routeProgress: 0 } : t),
    }
  }),

  completeTask: (taskId) => set(state => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return state
    const newTasks = state.tasks.map(t => t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date().toLocaleTimeString() } : t)
    let newBins = state.bins
    let newTrucks = state.trucks
    let newCompressionBoxes = state.compressionBoxes

    if (task.taskType === 'collection') {
      newBins = state.bins.map(b => b.id === task.targetBinId ? { ...b, fillLevel: 0, status: 'normal' as const, countdown: 300 } : b)
    }
    if (task.taskType === 'transfer') {
      newCompressionBoxes = state.compressionBoxes.map(b => b.id === task.targetBinId ? { ...b, liquidLevel: 20, status: 'normal' as const } : b)
    }
    if (task.assignedTruckId) {
      newTrucks = state.trucks.map(t => t.id === task.assignedTruckId ? { ...t, status: 'idle' as const, targetBinId: null } : t)
    }
    return { tasks: newTasks, bins: newBins, trucks: newTrucks, compressionBoxes: newCompressionBoxes }
  }),

  reassignTask: (taskId, newTruckId) => set(state => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return state

    const newTruck = state.trucks.find(t => t.id === newTruckId)
    if (!newTruck) return state

    const targetPos = task.taskType === 'transfer'
      ? state.compressionBoxes.find(b => b.id === task.targetBinId)?.position
      : state.bins.find(b => b.id === task.targetBinId)?.position
    if (!targetPos) return state

    const path: [number, number, number][] = [
      newTruck.position,
      targetPos,
      ...(task.taskType === 'transfer' ? [INCINERATOR_POS] : []),
    ]

    let trucks = state.trucks.map(t => {
      if (t.id === task.assignedTruckId && task.assignedTruckId !== newTruckId) {
        return { ...t, status: 'idle' as const, targetBinId: null }
      }
      return t
    })

    trucks = trucks.map(t => {
      if (t.id !== newTruckId) return t
      return {
        ...t,
        status: task.taskType === 'transfer' ? 'transporting' as const : 'collecting' as const,
        targetBinId: task.targetBinId,
        route: [...t.route, targetPos, ...(task.taskType === 'transfer' ? [INCINERATOR_POS] : [])],
        routeProgress: 0,
      }
    })

    return {
      tasks: state.tasks.map(t => t.id === taskId
        ? { ...t, assignedTruckId: newTruckId, status: 'assigned' as const, path }
        : t
      ),
      trucks,
    }
  }),

  createMaintenanceOrder: (deviceId, deviceType, description) => set(state => ({
    maintenanceOrders: [...state.maintenanceOrders, {
      id: `WO-${Date.now()}`,
      deviceId,
      deviceType,
      description,
      status: 'pending' as const,
      createdAt: new Date().toLocaleTimeString(),
    }]
  })),

  addAlert: (message, type) => set(state => ({
    alerts: [{ id: `alert-${Date.now()}`, message, type, timestamp: new Date().toLocaleTimeString() }, ...state.alerts].slice(0, 50)
  })),

  dismissAlert: (id) => set(state => ({
    alerts: state.alerts.filter(a => a.id !== id)
  })),

  submitSchedule: (proposal) => set(state => ({
    scheduleProposals: [...state.scheduleProposals, {
      ...proposal,
      id: `SP-${Date.now()}`,
      status: 'draft' as const,
      approvals: [],
      createdAt: new Date().toLocaleString(),
    }]
  })),

  approveSchedule: (proposalId, level, approver, result, comment) => set(state => ({
    scheduleProposals: state.scheduleProposals.map(p => {
      if (p.id !== proposalId) return p
      const newApprovals = [...p.approvals, { id: `AP-${Date.now()}`, scheduleId: proposalId, level, approver, result, comment, timestamp: new Date().toLocaleString() }]
      let newStatus = p.status
      if (result === 'rejected') {
        newStatus = 'rejected'
      } else if (level === 'dispatcher' && result === 'approved') {
        newStatus = 'dispatcher_approved'
      } else if (level === 'station_manager' && result === 'approved') {
        newStatus = 'station_approved'
      } else if (level === 'bureau' && result === 'approved') {
        newStatus = 'bureau_approved'
      }
      return { ...p, approvals: newApprovals, status: newStatus }
    })
  })),

  setFaultStatus: (deviceId, deviceType, isFault) => {
    const state = get()
    if (isFault) {
      const description = deviceType === 'bin'
        ? `垃圾桶${deviceId}发生故障，需要维修`
        : `压缩箱${deviceId}发生故障，需要维修`
      get().createMaintenanceOrder(deviceId, deviceType, description)
      get().addAlert(`${deviceId}设备故障，已生成维修工单`, 'critical')
    } else {
      set(state => ({
        maintenanceOrders: state.maintenanceOrders.map(o =>
          o.deviceId === deviceId && o.status === 'pending'
            ? { ...o, status: 'in_progress' as const }
            : o
        )
      }))
    }
    if (deviceType === 'bin') {
      set(state => ({ bins: state.bins.map(b => b.id === deviceId ? { ...b, status: isFault ? 'fault' : 'normal' } : b) }))
    } else {
      set(state => ({ compressionBoxes: state.compressionBoxes.map(b => b.id === deviceId ? { ...b, status: isFault ? 'fault' : 'normal' } : b) }))
    }
  },

  toggleSimulation: () => set(state => ({ simulationRunning: !state.simulationRunning })),

  tick: () => set(state => {
    if (!state.simulationRunning) return state

    const newBins = state.bins.map(b => {
      if (b.status === 'fault') return b
      const increment = Math.random() * 0.5 + 0.1
      const newLevel = Math.min(100, b.fillLevel + increment)
      const newStatus: GarbageBin['status'] = newLevel >= 95 ? 'critical' : newLevel >= 80 ? 'warning' : 'normal'
      const newCountdown = Math.max(0, Math.round((100 - newLevel) * 1.5))
      return { ...b, fillLevel: Math.round(newLevel * 10) / 10, status: newStatus, countdown: newCountdown }
    })

    const autoTasks: CollectionTask[] = []
    const autoAlerts: { id: string; message: string; type: 'warning' | 'critical' | 'info'; timestamp: string }[] = []
    let trucksAfterAuto = state.trucks

    for (const bin of newBins) {
      if (bin.fillLevel >= 95 && bin.status !== 'fault' && !hasActiveTaskFor(state.tasks, bin.id, 'collection')) {
        const truckId = findNearestAvailableTruck(trucksAfterAuto, bin.position)
        const task: CollectionTask = {
          id: `TASK-${Date.now()}-${bin.id}`,
          taskType: 'collection',
          targetBinId: bin.id,
          assignedTruckId: truckId,
          path: truckId
            ? [(trucksAfterAuto.find(t => t.id === truckId)?.position || [0, 0, 0]) as [number, number, number], bin.position]
            : [bin.position],
          status: truckId ? 'assigned' : 'pending',
          createdAt: new Date().toLocaleTimeString(),
          completedAt: null,
        }
        autoTasks.push(task)
        autoAlerts.push({
          id: `alert-auto-${Date.now()}-${bin.id}`,
          message: `${bin.id}满溢度超95%，已自动生成收运任务${truckId ? `，分配${truckId}` : ''}`,
          type: 'critical',
          timestamp: new Date().toLocaleTimeString(),
        })
        if (truckId) {
          trucksAfterAuto = trucksAfterAuto.map(t => {
            if (t.id !== truckId) return t
            return { ...t, status: 'collecting' as const, targetBinId: bin.id, route: [...t.route, bin.position], routeProgress: 0 }
          })
        }
      }
    }

    const newCompressionBoxes = state.compressionBoxes.map(b => {
      if (b.status === 'fault') return b
      const newLiquid = Math.min(100, b.liquidLevel + (Math.random() * 0.3 - 0.1))
      const newTemp = b.temperature + (Math.random() * 2 - 1)
      const sprinklerActive = newTemp > 60
      const newStatus: CompressionBox['status'] = newLiquid > 90 ? 'high_level' : newTemp > 55 ? 'temp_alarm' : 'normal'
      return { ...b, liquidLevel: Math.round(newLiquid * 10) / 10, temperature: Math.round(newTemp * 10) / 10, sprinklerActive, status: newStatus }
    })

    for (const box of newCompressionBoxes) {
      if (box.liquidLevel > 90 && !hasActiveTaskFor([...state.tasks, ...autoTasks], box.id, 'transfer')) {
        const truckId = findNearestAvailableTruck(trucksAfterAuto, box.position)
        const task: CollectionTask = {
          id: `TRANSFER-${Date.now()}-${box.id}`,
          taskType: 'transfer',
          targetBinId: box.id,
          targetBoxId: box.id,
          assignedTruckId: truckId,
          path: truckId
            ? [(trucksAfterAuto.find(t => t.id === truckId)?.position || [0, 0, 0]) as [number, number, number], box.position, INCINERATOR_POS]
            : [box.position, INCINERATOR_POS],
          status: truckId ? 'assigned' : 'pending',
          createdAt: new Date().toLocaleTimeString(),
          completedAt: null,
          destination: '城东焚烧厂',
        }
        autoTasks.push(task)
        autoAlerts.push({
          id: `alert-transfer-${Date.now()}-${box.id}`,
          message: `${box.id}液位超90%，已调度转运车辆${truckId ? truckId : ''}至焚烧厂`,
          type: 'warning',
          timestamp: new Date().toLocaleTimeString(),
        })
        if (truckId) {
          trucksAfterAuto = trucksAfterAuto.map(t => {
            if (t.id !== truckId) return t
            return { ...t, status: 'transporting' as const, targetBinId: box.id, route: [...t.route, box.position, INCINERATOR_POS], routeProgress: 0 }
          })
        }
      }
    }

    const newTrucks = trucksAfterAuto.map(t => {
      if (t.status === 'idle' || t.route.length < 2) return t
      const newProgress = Math.min(1, t.routeProgress + t.speed)
      const routeIndex = Math.floor(newProgress * (t.route.length - 1))
      const segmentProgress = (newProgress * (t.route.length - 1)) - routeIndex
      const currentPoint = t.route[Math.min(routeIndex, t.route.length - 1)]
      const nextPoint = t.route[Math.min(routeIndex + 1, t.route.length - 1)]
      const newPos: [number, number, number] = [
        currentPoint[0] + (nextPoint[0] - currentPoint[0]) * segmentProgress,
        0,
        currentPoint[2] + (nextPoint[2] - currentPoint[2]) * segmentProgress,
      ]
      const newLoad = t.status === 'collecting' ? Math.min(t.maxLoad, t.currentLoad + Math.random() * 5) : t.currentLoad
      return { ...t, position: newPos, routeProgress: newProgress, currentLoad: Math.round(newLoad) }
    })

    const newPersonnel = state.personnel.map(p => {
      const dx = (Math.random() - 0.5) * 0.3
      const dz = (Math.random() - 0.5) * 0.3
      const newPos: [number, number, number] = [p.position[0] + dx, 0, p.position[2] + dz]
      const isAlarm = p.currentZone === 'compression'
      return { ...p, position: newPos, isAlarm }
    })

    const allNewAlerts = [...autoAlerts, ...state.alerts].slice(0, 50)

    return {
      bins: newBins,
      trucks: newTrucks,
      compressionBoxes: newCompressionBoxes,
      personnel: newPersonnel,
      tasks: [...autoTasks, ...state.tasks],
      alerts: allNewAlerts,
    }
  }),
}))
