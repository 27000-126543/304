import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { CompressionBox as CompressionBoxType } from '@/types'
import { useStore } from '@/store/useStore'

function SprinklerParticles({ position }: { position: [number, number, number] }) {
  const particlesRef = useRef<THREE.InstancedMesh>(null)
  const count = 20
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    if (!particlesRef.current) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const seed = i * 0.7
      const x = position[0] + Math.sin(seed) * 0.8
      const yOffset = ((t * 2 + seed) % 2) * 1.5
      const y = position[1] + 2 - yOffset
      const z = position[2] + Math.cos(seed) * 0.8
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(0.04)
      dummy.updateMatrix()
      particlesRef.current.setMatrixAt(i, dummy.matrix)
    }
    particlesRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#4fc3f7" transparent opacity={0.6} />
    </instancedMesh>
  )
}

export default function CompressionBox({ data }: { data: CompressionBoxType }) {
  const groupRef = useRef<THREE.Group>(null)
  const liquidRef = useRef<THREE.Mesh>(null)
  const setSelectedCompressionBoxId = useStore((s) => s.setSelectedCompressionBoxId)
  const isHighLevel = data.liquidLevel > 90
  const isTempAlarm = data.status === 'temp_alarm'
  const isFault = data.status === 'fault'
  const mainColor = isFault ? '#607d8b' : isHighLevel ? '#ff3d57' : '#1565c0'

  useFrame((state) => {
    if (!liquidRef.current) return
    const levelY = (data.liquidLevel / 100) * 1.4 - 0.7
    liquidRef.current.position.y = levelY

    if (groupRef.current && (isHighLevel || isTempAlarm)) {
      const t = state.clock.elapsedTime
      const pulse = 0.2 + Math.sin(t * 3) * 0.2
      groupRef.current.children.forEach((child) => {
        if ((child as THREE.Mesh).isMesh && child !== liquidRef.current) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
          if (mat.emissive) {
            mat.emissiveIntensity = pulse
          }
        }
      })
    }
  })

  const tempColor = data.temperature > 55 ? '#ff3d57' : data.temperature > 40 ? '#ffc107' : '#00e676'

  return (
    <group
      ref={groupRef}
      position={[data.position[0], 0.8, data.position[2]]}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedCompressionBoxId(data.id)
      }}
    >
      <mesh>
        <boxGeometry args={[1.5, 1.6, 1.5]} />
        <meshStandardMaterial
          color={mainColor}
          emissive={mainColor}
          emissiveIntensity={0.1}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh ref={liquidRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.3, 1.4, 1.3]} />
        <meshStandardMaterial
          color={isHighLevel ? '#ff3d57' : '#0288d1'}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh position={[0.76, 0, 0]}>
        <boxGeometry args={[0.05, 1.6, 0.15]} />
        <meshStandardMaterial color={tempColor} emissive={tempColor} emissiveIntensity={0.5} />
      </mesh>
      {isFault && (
        <Html position={[0, 1.2, 0]} center>
          <div style={{ fontSize: 16, color: '#ff3d57' }}>🔒</div>
        </Html>
      )}
      {data.sprinklerActive && <SprinklerParticles position={[data.position[0], 0.8, data.position[2]]} />}
      <Html position={[0, 1.8, 0]} center distanceFactor={15}>
        <div style={{
          background: 'rgba(5,13,26,0.9)',
          border: `1px solid ${mainColor}`,
          borderRadius: 4,
          padding: '2px 6px',
          color: '#e0e0e0',
          fontSize: 9,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          pointerEvents: 'auto',
        }}>
          <div style={{ color: '#90caf9', fontWeight: 'bold' }}>{data.id}</div>
          <div>液位: {data.liquidLevel}% | 温度: {data.temperature}°C</div>
        </div>
      </Html>
    </group>
  )
}
