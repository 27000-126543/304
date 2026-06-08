import { useMemo } from 'react'
import * as THREE from 'three'

const MAIN_ROADS = [
  { start: [-28, 0, 0] as const, end: [28, 0, 0] as const, width: 2.5 },
  { start: [0, 0, -28] as const, end: [0, 0, 28] as const, width: 2.5 },
]

const SECONDARY_ROADS = [
  { start: [-20, 0, -10] as const, end: [-20, 0, 10] as const, width: 1.5 },
  { start: [20, 0, -10] as const, end: [20, 0, 10] as const, width: 1.5 },
  { start: [-10, 0, -15] as const, end: [10, 0, -15] as const, width: 1.5 },
  { start: [-10, 0, 10] as const, end: [10, 0, 10] as const, width: 1.5 },
]

function RoadSegment({ start, end, width }: {
  start: readonly [number, number, number]
  end: readonly [number, number, number]
  width: number
}) {
  const dx = end[0] - start[0]
  const dz = end[2] - start[2]
  const length = Math.sqrt(dx * dx + dz * dz)
  const angle = Math.atan2(dx, dz)
  const cx = (start[0] + end[0]) / 2
  const cz = (start[2] + end[2]) / 2

  return (
    <group position={[cx, 0.01, cz]} rotation={[0, angle, 0]}>
      <mesh>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#0a1830" transparent opacity={0.9} />
      </mesh>
      <line>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, length)]} />
        <lineBasicMaterial color="#0d2848" />
      </line>
    </group>
  )
}

function LaneMarkings() {
  const dashedLines = useMemo(() => {
    const lines: { start: [number, number, number]; end: [number, number, number] }[] = []
    const segments = 12

    for (const road of MAIN_ROADS) {
      const dx = road.end[0] - road.start[0]
      const dz = road.end[2] - road.start[2]
      for (let i = 0; i < segments; i++) {
        if (i % 2 === 0) continue
        const t1 = i / segments
        const t2 = (i + 0.5) / segments
        lines.push({
          start: [road.start[0] + dx * t1, 0.02, road.start[2] + dz * t1],
          end: [road.start[0] + dx * t2, 0.02, road.start[2] + dz * t2],
        })
      }
    }

    return lines
  }, [])

  return (
    <group>
      {dashedLines.map((line, i) => (
        <mesh key={i} position={[
          (line.start[0] + line.end[0]) / 2,
          0.02,
          (line.start[2] + line.end[2]) / 2,
        ]}>
          <planeGeometry args={[0.08, Math.abs(line.end[0] - line.start[0]) || Math.abs(line.end[2] - line.start[2]) || 1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export default function Roads() {
  return (
    <group>
      {MAIN_ROADS.map((road, i) => (
        <RoadSegment key={`m${i}`} start={road.start} end={road.end} width={road.width} />
      ))}
      {SECONDARY_ROADS.map((road, i) => (
        <RoadSegment key={`s${i}`} start={road.start} end={road.end} width={road.width} />
      ))}
      <LaneMarkings />
    </group>
  )
}
