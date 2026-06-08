import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Personnel as PersonnelType } from '@/types'

export default function Personnel({ data }: { data: PersonnelType }) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.position.set(data.position[0], 0, data.position[2])

    if (data.isAlarm && bodyRef.current) {
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial
      const pulse = Math.sin(state.clock.elapsedTime * 6) > 0
      mat.emissiveIntensity = pulse ? 0.8 : 0.1
      mat.emissive.setHex(pulse ? 0xff3d57 : 0x000000)
    }
  })

  const bodyColor = data.isAlarm ? '#ef5350' : '#00e5a0'

  return (
    <group ref={groupRef}>
      <mesh ref={bodyRef} position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.12, 0.4, 4, 8]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={data.isAlarm ? '#ff3d57' : '#00e5a0'}
          emissiveIntensity={0.1}
        />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      <Html position={[0, 1.3, 0]} center distanceFactor={15}>
        <div style={{
          background: 'rgba(5,13,26,0.9)',
          border: `1px solid ${data.isAlarm ? '#ff3d57' : '#00e5a0'}`,
          borderRadius: 4,
          padding: '2px 6px',
          color: '#e0e0e0',
          fontSize: 9,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ color: data.isAlarm ? '#ff8a80' : '#a5d6a7', fontWeight: 'bold' }}>
            {data.name}
          </div>
          <div style={{ fontSize: 8, color: '#9e9e9e' }}>{data.jobType}</div>
        </div>
      </Html>
    </group>
  )
}
