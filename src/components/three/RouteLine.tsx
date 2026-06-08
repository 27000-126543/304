import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function RouteLine({ points }: { points: [number, number, number][] }) {
  const lineObj = useMemo(() => {
    if (points.length < 2) return null
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(p[0], 0.05, p[2]))
    )
    const pts = curve.getPoints(points.length * 10)
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineDashedMaterial({
      color: '#00e5a0',
      dashSize: 0.5,
      gapSize: 0.3,
      transparent: true,
      opacity: 0.7,
    })
    const line = new THREE.Line(geo, mat)
    line.computeLineDistances()
    return line
  }, [points])

  useFrame((_, delta) => {
    if (!lineObj) return
    const mat = lineObj.material as THREE.LineDashedMaterial & { dashOffset: number }
    mat.dashOffset -= delta * 2
  })

  if (!lineObj) return null

  return <primitive object={lineObj} />
}
