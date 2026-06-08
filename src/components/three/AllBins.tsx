import { useStore } from '@/store/useStore'
import GarbageBin from './GarbageBin'

export default function AllBins() {
  const bins = useStore((s) => s.bins)

  return (
    <group>
      {bins.map((bin) => (
        <GarbageBin key={bin.id} data={bin} />
      ))}
    </group>
  )
}
