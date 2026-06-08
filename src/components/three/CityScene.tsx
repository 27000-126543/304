import { useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useStore } from '@/store/useStore'
import Ground from './Ground'
import Buildings from './Buildings'
import Roads from './Roads'
import AllBins from './AllBins'
import AllTrucks from './AllTrucks'
import TransferStation from './TransferStation'
import AllPersonnel from './AllPersonnel'

function SimulationTick() {
  const tick = useStore((s) => s.tick)
  const simulationRunning = useStore((s) => s.simulationRunning)
  const elapsedRef = useRef(0)

  useFrame((_, delta) => {
    if (!simulationRunning) return
    elapsedRef.current += delta
    if (elapsedRef.current >= 0.5) {
      tick()
      elapsedRef.current = 0
    }
  })

  return null
}

function SceneContent() {
  return (
    <>
      <ambientLight color="#1a2a4a" intensity={0.6} />
      <directionalLight
        color="#00e5a0"
        intensity={0.5}
        position={[10, 20, 5]}
      />
      <hemisphereLight
        color="#1a3a5c"
        groundColor="#050d1a"
        intensity={0.4}
      />

      <SimulationTick />
      <Ground />
      <Roads />
      <Buildings />
      <AllBins />
      <AllTrucks />
      <TransferStation />
      <AllPersonnel />

      <OrbitControls
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={80}
      />

      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>
    </>
  )
}

export default function CityScene() {
  return (
    <Canvas
      camera={{ position: [30, 25, 30], fov: 50, near: 0.1, far: 500 }}
      style={{ background: '#050d1a' }}
      gl={{ antialias: true, alpha: false }}
    >
      <SceneContent />
    </Canvas>
  )
}
