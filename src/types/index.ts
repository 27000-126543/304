export interface GarbageBin {
  id: string
  position: [number, number, number]
  location: string
  type: 'residential' | 'roadside'
  fillLevel: number
  countdown: number
  status: 'normal' | 'warning' | 'critical' | 'fault'
}

export interface GarbageTruck {
  id: string
  position: [number, number, number]
  currentLoad: number
  maxLoad: number
  route: [number, number, number][]
  status: 'idle' | 'collecting' | 'transporting' | 'returning'
  speed: number
  routeProgress: number
  targetBinId: string | null
}

export interface CompressionBox {
  id: string
  stationName: string
  position: [number, number, number]
  liquidLevel: number
  temperature: number
  sprinklerActive: boolean
  status: 'normal' | 'high_level' | 'temp_alarm' | 'fault'
}

export interface Personnel {
  id: string
  name: string
  jobType: string
  position: [number, number, number]
  currentZone: string
  isAlarm: boolean
}

export interface ReassignRecord {
  fromTruckId: string | null
  toTruckId: string
  timestamp: string
  operator: string
}

export interface CollectionTask {
  id: string
  taskType: 'collection' | 'transfer'
  targetBinId: string
  assignedTruckId: string | null
  path: [number, number, number][]
  status: 'pending' | 'assigned' | 'in_progress' | 'completed'
  createdAt: string
  completedAt: string | null
  destination?: string
  targetBoxId?: string
  reassignHistory: ReassignRecord[]
}

export interface MaintenanceOrder {
  id: string
  deviceId: string
  deviceType: 'bin' | 'compression_box' | 'truck'
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: string
}

export interface ApprovalRecord {
  id: string
  scheduleId: string
  level: 'dispatcher' | 'station_manager' | 'bureau'
  approver: string
  result: 'pending' | 'approved' | 'rejected' | null
  comment: string
  timestamp: string | null
}

export interface ScheduleProposal {
  id: string
  title: string
  predictedVolume: number
  vehicleCount: number
  routeOptimization: string
  status: 'draft' | 'dispatcher_approved' | 'station_approved' | 'bureau_approved' | 'rejected'
  approvals: ApprovalRecord[]
  createdAt: string
}

export interface User {
  id: string
  name: string
  role: 'driver' | 'dispatcher' | 'station_manager' | 'bureau_leader'
  avatar: string
  lastLogin: string
  assignedTruckId?: string
}

export interface DailyReport {
  date: string
  area: string
  collectionVolume: number
  vehicleUtilization: number
  equipmentFailures: number
  complaints: number
}

export type UserRole = 'driver' | 'dispatcher' | 'station_manager' | 'bureau_leader'
