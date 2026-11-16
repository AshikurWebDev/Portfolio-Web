import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group } from 'three'

/*
  3D version of the tenant stack: four slabs (Interface, API, Business logic,
  Data), each cut into three organizations. Organization A glows through all
  four layers. It turns slowly and leans toward the pointer.
*/
const LAYERS = 4
const TENANTS = 3

function Stack() {
  const group = useRef<Group>(null)
  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    g.rotation.y += dt * 0.18
    g.rotation.x += (state.pointer.y * 0.18 + 0.42 - g.rotation.x) * 0.06
  })

  return (
    <group ref={group} rotation={[0.42, -0.6, 0]}>
      {Array.from({ length: LAYERS }, (_, layer) =>
        Array.from({ length: TENANTS }, (_, t) => {
          const lit = t === 0
          return (
            <mesh key={`${layer}-${t}`} position={[(t - 1) * 1.08, (LAYERS - 1 - layer) * 0.62 - 0.93, 0]}>
              <boxGeometry args={[1, 0.18, 2.2]} />
              <meshStandardMaterial
                color={lit ? '#0ea85f' : '#4b5450'}
                emissive={lit ? '#0ea85f' : '#000000'}
                emissiveIntensity={lit ? 0.35 : 0}
                roughness={0.55}
                metalness={0.1}
              />
            </mesh>
          )
        }),
      )}
    </group>
  )
}

export default function TenantStack3D({ onReady }: { onReady: () => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  // Render only while on screen, so a long post does not keep the GPU busy.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '120px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} aria-hidden="true">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 6.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={onReady}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} />
        <directionalLight position={[-4, -2, -3]} intensity={0.35} color="#7fe0ae" />
        <Stack />
      </Canvas>
    </div>
  )
}
