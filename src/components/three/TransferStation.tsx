import { useStore } from '@/store/useStore'
import CompressionBox from './CompressionBox'

const STATIONS = [
  { name: '城东', center: [24, 0, -12] as [number, number, number], size: [8, 8] as const },
  { name: '城西', center: [-22, 0, -6] as [number, number, number], size: [6, 10] as const },
]

function StationFence({ center, size }: {
  center: [number, number, number]
  size: readonly [number, number]
}) {
  const [w, d] = size
  const hx = w / 2
  const hz = d / 2
  const fenceHeight = 1.5
  const postPositions: [number, number, number][] = [
    [center[0] - hx, fenceHeight / 2, center[2] - hz],
    [center[0] + hx, fenceHeight / 2, center[2] - hz],
    [center[0] - hx, fenceHeight / 2, center[2] + hz],
    [center[0] + hx, fenceHeight / 2, center[2] + hz],
  ]

  return (
    <group>
      <mesh position={[center[0], 0.01, center[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#0d1830" transparent opacity={0.6} />
      </mesh>
      {postPositions.map((pos, i) => (
        <mesh key={`p${i}`} position={pos}>
          <boxGeometry args={[0.08, fenceHeight, 0.08]} />
          <meshStandardMaterial color="#00e5a0" emissive="#00e5a0" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {[
        { pos: [center[0], fenceHeight, center[2] - hz] as [number, number, number], scale: [w, 0.04, 0.04] as [number, number, number] },
        { pos: [center[0], fenceHeight, center[2] + hz] as [number, number, number], scale: [w, 0.04, 0.04] as [number, number, number] },
        { pos: [center[0] - hx, fenceHeight, center[2]] as [number, number, number], scale: [0.04, 0.04, d] as [number, number, number] },
        { pos: [center[0] + hx, fenceHeight, center[2]] as [number, number, number], scale: [0.04, 0.04, d] as [number, number, number] },
      ].map((bar, i) => (
        <mesh key={`b${i}`} position={bar.pos}>
          <boxGeometry args={bar.scale} />
          <meshStandardMaterial color="#00e5a0" emissive="#00e5a0" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export default function TransferStation() {
  const compressionBoxes = useStore((s) => s.compressionBoxes)

  return (
    <group>
      {STATIONS.map((station) => {
        const stationBoxes = compressionBoxes.filter(
          (b) => b.stationName === (station.name === '城东' ? '城东中转站' : '城西中转站')
        )
        return (
          <group key={station.name}>
            <StationFence center={station.center} size={station.size} />
            {stationBoxes.map((box) => (
              <CompressionBox key={box.id} data={box} />
            ))}
          </group>
        )
      })}
    </group>
  )
}
