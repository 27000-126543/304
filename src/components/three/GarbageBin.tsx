import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { GarbageBin as GarbageBinType } from '@/types'
import { useStore } from '@/store/useStore'

function getBinColor(bin: GarbageBinType): string {
  if (bin.status === 'fault') return '#607d8b'
  if (bin.fillLevel > 95) return '#ff3d57'
  if (bin.fillLevel >= 80) return '#ffc107'
  return '#00e676'
}

export default function GarbageBin({ data }: { data: GarbageBinType }) {
  const meshRef = useRef<THREE.Group>(null)
  const setSelectedBinId = useStore((s) => s.setSelectedBinId)
  const color = getBinColor(data)
  const isCritical = data.status === 'critical'

  useFrame((state) => {
    if (!meshRef.current || !isCritical) return
    const t = state.clock.elapsedTime
    meshRef.current.children.forEach((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = 0.3 + Math.sin(t * 4) * 0.3
      }
    })
  })

  return (
    <group
      ref={meshRef}
      position={[data.position[0], 0.4, data.position[2]]}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedBinId(data.id)
      }}
    >
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.7, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isCritical ? 0.5 : 0.1}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.27, 0.25, 0.15, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isCritical ? 0.5 : 0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      <Html position={[0, 1.2, 0]} center distanceFactor={15}>
        <div style={{
          background: 'rgba(5,13,26,0.9)',
          border: `1px solid ${color}`,
          borderRadius: 4,
          padding: '2px 6px',
          color: '#e0e0e0',
          fontSize: 9,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          pointerEvents: 'auto',
        }}>
          <div style={{ color, fontWeight: 'bold' }}>{data.id}</div>
          <div style={{ width: 40, height: 3, background: '#1a2a4a', marginTop: 2 }}>
            <div style={{
              width: `${data.fillLevel}%`,
              height: '100%',
              background: color,
            }} />
          </div>
          <div style={{ fontSize: 8, marginTop: 1 }}>{data.countdown}s</div>
        </div>
      </Html>
    </group>
  )
}
