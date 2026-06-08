export default function Ground() {
  return (
    <group>
      <gridHelper args={[60, 30, '#0a2040', '#0d1830']} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#050d1a" transparent opacity={0.85} />
      </mesh>
    </group>
  )
}
