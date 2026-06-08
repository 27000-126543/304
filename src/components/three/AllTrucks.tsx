import { useStore } from '@/store/useStore'
import GarbageTruck from './GarbageTruck'
import RouteLine from './RouteLine'

export default function AllTrucks() {
  const trucks = useStore((s) => s.trucks)

  return (
    <group>
      {trucks.map((truck) => (
        <group key={truck.id}>
          <GarbageTruck data={truck} />
          {truck.route.length >= 2 && <RouteLine points={truck.route} />}
        </group>
      ))}
    </group>
  )
}
