import { useStore } from '@/store/useStore'
import Personnel from './Personnel'

export default function AllPersonnel() {
  const personnel = useStore((s) => s.personnel)

  return (
    <group>
      {personnel.map((p) => (
        <Personnel key={p.id} data={p} />
      ))}
    </group>
  )
}
