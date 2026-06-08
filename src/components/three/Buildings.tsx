import { Edges } from '@react-three/drei'

const BUILDINGS: { pos: [number, number, number]; w: number; h: number; d: number }[] = [
  { pos: [-10, 0, -10], w: 2, h: 5, d: 2 },
  { pos: [-14, 0, -6], w: 1.5, h: 3.5, d: 1.5 },
  { pos: [-8, 0, -14], w: 2.5, h: 4, d: 2 },
  { pos: [-16, 0, 2], w: 1.8, h: 6, d: 1.8 },
  { pos: [-12, 0, 6], w: 2, h: 3, d: 2 },
  { pos: [-6, 0, 14], w: 2.2, h: 4.5, d: 2.2 },
  { pos: [6, 0, -12], w: 1.5, h: 5.5, d: 1.5 },
  { pos: [10, 0, -8], w: 2, h: 3.5, d: 2 },
  { pos: [14, 0, -2], w: 1.8, h: 4, d: 1.8 },
  { pos: [16, 0, 4], w: 2.5, h: 5, d: 2.5 },
  { pos: [12, 0, 12], w: 2, h: 6.5, d: 2 },
  { pos: [8, 0, 16], w: 1.5, h: 3, d: 1.5 },
  { pos: [-4, 0, 16], w: 2, h: 4, d: 2 },
  { pos: [18, 0, -8], w: 1.8, h: 3.5, d: 1.8 },
  { pos: [-18, 0, -4], w: 2.2, h: 5.5, d: 2.2 },
  { pos: [-4, 0, -16], w: 1.5, h: 4.5, d: 1.5 },
  { pos: [4, 0, 16], w: 2, h: 3, d: 2 },
  { pos: [-16, 0, -10], w: 1.8, h: 4, d: 1.8 },
  { pos: [18, 0, 10], w: 2, h: 5, d: 2 },
  { pos: [-18, 0, 10], w: 1.5, h: 3.5, d: 1.5 },
]

function Building({ position, width, height, depth, emissiveIntensity }: {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  emissiveIntensity: number
}) {
  return (
    <group position={[position[0], height / 2, position[2]]}>
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color="#0a2040"
          transparent
          opacity={0.15}
          emissive="#00e5a0"
          emissiveIntensity={emissiveIntensity}
        />
        <Edges color="#00e5a0" threshold={15} />
      </mesh>
    </group>
  )
}

function DispatchCenter() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[3, 8, 3]} />
        <meshStandardMaterial
          color="#0a2040"
          transparent
          opacity={0.2}
          emissive="#00e5a0"
          emissiveIntensity={0.6}
        />
        <Edges color="#00e5a0" threshold={15} />
      </mesh>
      <mesh position={[0, 8.5, 0]}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial
          color="#00e5a0"
          emissive="#00e5a0"
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
        <Edges color="#00ffb0" threshold={15} />
      </mesh>
      <pointLight position={[0, 9, 0]} color="#00e5a0" intensity={3} distance={8} />
    </group>
  )
}

export default function Buildings() {
  return (
    <group>
      <DispatchCenter />
      {BUILDINGS.map((b, i) => (
        <Building
          key={i}
          position={b.pos}
          width={b.w}
          height={b.h}
          depth={b.d}
          emissiveIntensity={0.15}
        />
      ))}
    </group>
  )
}
