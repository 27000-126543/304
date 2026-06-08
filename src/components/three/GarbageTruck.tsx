import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { GarbageTruck as GarbageTruckType } from '@/types'
import { useStore } from '@/store/useStore'

export default function GarbageTruck({ data }: { data: GarbageTruckType }) {
  const groupRef = useRef<THREE.Group>(null)
  const cabRef = useRef<THREE.Mesh>(null)
  const setSelectedTruckId = useStore((s) => s.setSelectedTruckId)
  const loadPercent = (data.currentLoad / data.maxLoad) * 100
  const isCollecting = data.status === 'collecting'

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.position.set(data.position[0], 0.35, data.position[2])

    if (isCollecting && cabRef.current) {
      cabRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedTruckId(data.id)
      }}
    >
      <mesh ref={cabRef} position={[0, 0, -0.35]}>
        <boxGeometry args={[0.6, 0.5, 0.5]} />
        <meshStandardMaterial color="#1565c0" emissive="#00e5a0" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0.05, 0.35]}>
        <boxGeometry args={[0.7, 0.6, 1]} />
        <meshStandardMaterial color="#0d47a1" emissive="#00e5a0" emissiveIntensity={0.1} />
      </mesh>
      {isCollecting && (
        <mesh position={[0, 0.45, 0.35]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.3]} />
          <meshStandardMaterial color="#ffab00" emissive="#ffab00" emissiveIntensity={0.5} />
        </mesh>
      )}
      <Html position={[0, 1.4, 0]} center distanceFactor={15}>
        <div style={{
          background: 'rgba(5,13,26,0.9)',
          border: '1px solid #1565c0',
          borderRadius: 4,
          padding: '2px 6px',
          color: '#e0e0e0',
          fontSize: 9,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          pointerEvents: 'auto',
        }}>
          <div style={{ color: '#64b5f6', fontWeight: 'bold' }}>{data.id}</div>
          <div style={{ width: 40, height: 3, background: '#1a2a4a', marginTop: 2 }}>
            <div style={{
              width: `${Math.min(loadPercent, 100)}%`,
              height: '100%',
              background: loadPercent > 80 ? '#ff3d57' : loadPercent > 50 ? '#ffc107' : '#00e676',
            }} />
          </div>
          <div style={{ fontSize: 8, marginTop: 1 }}>{data.status}</div>
        </div>
      </Html>
    </group>
  )
}
