import { useEffect, useState, Suspense, lazy } from 'react'
import { useStore } from '@/store/useStore'
import TopBar from '@/components/ui/TopBar'
import SidePanel from '@/components/ui/SidePanel'
import AlertList from '@/components/ui/AlertList'
import StatusOverview from '@/components/ui/StatusOverview'

const CityScene = lazy(() => import('@/components/three/CityScene'))

function Loading3D() {
  return (
    <div className="flex h-full items-center justify-center bg-cyber-bg">
      <div className="text-center">
        <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-cyber-border border-t-cyber-accent" />
        <p className="text-sm text-cyber-text-dim">加载3D城市场景...</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const tick = useStore(s => s.tick)
  const simulationRunning = useStore(s => s.simulationRunning)
  const [sidePanelOpen, setSidePanelOpen] = useState(true)

  useEffect(() => {
    if (!simulationRunning) return
    const interval = setInterval(() => {
      tick()
    }, 500)
    return () => clearInterval(interval)
  }, [tick, simulationRunning])

  return (
    <div className="flex h-screen flex-col bg-cyber-bg overflow-hidden">
      <TopBar />

      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <div className="absolute top-4 left-4 z-10">
            <StatusOverview />
          </div>

          <Suspense fallback={<Loading3D />}>
            <CityScene />
          </Suspense>

          <div className="absolute bottom-4 left-4 z-10">
            <AlertList />
          </div>
        </div>

        <button
          onClick={() => setSidePanelOpen(v => !v)}
          className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-l-md px-1 py-4 text-cyber-text-dim transition-colors hover:text-cyber-accent"
          style={{
            right: sidePanelOpen ? '320px' : '0',
            background: 'rgba(13,26,48,0.9)',
            border: '1px solid var(--color-border)',
            borderRight: 'none',
          }}
        >
          <span className="text-xs">{sidePanelOpen ? '▶' : '◀'}</span>
        </button>

        <div
          className="flex-shrink-0 transition-all duration-300 overflow-hidden"
          style={{ width: sidePanelOpen ? '320px' : '0' }}
        >
          <SidePanel />
        </div>
      </div>
    </div>
  )
}
