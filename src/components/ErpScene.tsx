import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  MathUtils,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  PMREMGenerator,
  SphereGeometry,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { dashboardTexture, fontsReady, moduleTexture, tagTexture } from './erpTextures'
import { isIntroDone } from '../lib/preloader'

/*
  Hero model: the three layers of every system Ashikur builds.
    PostgreSQL / SQL Server  (database discs, bottom)
    ASP.NET Core API         (dark slab, middle)
    React dashboard          (screen, top) with module cards around it
  Data particles flow upward from the database to the screen.
  On load the system assembles bottom-up; on scroll the layers separate;
  the pointer tilts the whole model.
*/

type Textures = {
  dashboard: CanvasTexture
  modules: CanvasTexture[]
  tags: { tex: CanvasTexture; aspect: number }[]
}

const MODULES: [string, string, string][] = [
  ['Fees', 'Dues and receipts', '৳'],
  ['Attendance', 'ZKTeco device sync', '✓'],
  ['Exams', 'Marks and results', 'A+'],
  ['Roles', 'Role-based access', '#'],
  ['Audit trail', 'Who changed what', '≡'],
  ['Reports', 'Export and print', '↗'],
]

// Card placement around the stack: [x, y, z, rotY]
const CARD_SLOTS: [number, number, number, number][] = [
  [-4.3, 2.6, 0.6, 0.35],
  [4.15, 2.3, 0.4, -0.35],
  [-4.6, 0.2, 1.0, 0.3],
  [4.3, 0.0, 0.9, -0.3],
  [-3.9, -2.2, 1.2, 0.25],
  [3.6, -2.0, 1.1, -0.25],
]

const LAYER_Y = { db: -2.75, api: -0.85, ui: 1.55 }

const easeOut = (t: number) => 1 - Math.pow(1 - MathUtils.clamp(t, 0, 1), 3)
const easeBack = (t: number) => {
  const x = MathUtils.clamp(t, 0, 1)
  const c = 1.6
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2)
}

function Environment() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

function DataFlow({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const geo = useMemo(() => new SphereGeometry(0.07, 12, 12), [])
  const mat = useMemo(() => new MeshBasicMaterial({ color: '#3fe08f', toneMapped: false }), [])
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: [-1.5, -0.5, 0.5, 1.5][i % 4] + (Math.random() - 0.5) * 0.2,
        z: [-0.7, 0.7][i % 2] + (Math.random() - 0.5) * 0.2,
        phase: Math.random(),
        speed: 0.22 + Math.random() * 0.12,
      })),
    [count],
  )

  // Guide lines the particles travel on
  const lines = useMemo(() => {
    const g = new BufferGeometry()
    const pts: number[] = []
    ;[-1.5, -0.5, 0.5, 1.5].forEach((x) =>
      [-0.7, 0.7].forEach((z) => pts.push(x, LAYER_Y.db + 0.6, z, x, LAYER_Y.ui - 0.2, z)),
    )
    g.setAttribute('position', new Float32BufferAttribute(pts, 3))
    return g
  }, [])

  useEffect(
    () => () => {
      geo.dispose()
      mat.dispose()
      lines.dispose()
    },
    [geo, mat, lines],
  )

  useFrame((state) => {
    const m = mesh.current
    if (!m) return
    const t = state.clock.elapsedTime
    const y0 = LAYER_Y.db + 0.6
    const y1 = LAYER_Y.ui - 0.2
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      const p = (s.phase + t * s.speed) % 1
      dummy.position.set(s.x, MathUtils.lerp(y0, y1, p), s.z)
      // Grow in at the source, shrink out at the screen
      dummy.scale.setScalar(Math.sin(p * Math.PI))
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#0ea85f" transparent opacity={0.22} />
      </lineSegments>
      <instancedMesh ref={mesh} args={[geo, mat, count]} frustumCulled={false} />
    </group>
  )
}

function System({ textures, onReady }: { textures: Textures; onReady: () => void }) {
  const root = useRef<Group>(null)
  const db = useRef<Group>(null)
  const api = useRef<Group>(null)
  const ui = useRef<Group>(null)
  const cards = useRef<(Group | null)[]>([])
  const pointer = useRef({ x: 0, y: 0 })
  const start = useRef<number | null>(null)
  const viewport = useThree((s) => s.viewport)

  const geo = useMemo(
    () => ({
      disc: new CylinderGeometry(1.75, 1.75, 0.5, 64, 1),
      slab: new RoundedBoxGeometry(5.6, 0.42, 3.8, 6, 0.18),
      screenBody: new RoundedBoxGeometry(6.4, 4.0, 0.22, 6, 0.12),
    }),
    [],
  )
  const mat = useMemo(
    () => ({
      disc: new MeshPhysicalMaterial({ color: '#0ea85f', roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12 }),
      discTop: new MeshPhysicalMaterial({ color: '#13c06f', roughness: 0.2, clearcoat: 1 }),
      slab: new MeshPhysicalMaterial({ color: '#1b211e', roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }),
      body: new MeshPhysicalMaterial({ color: '#e7e9e5', roughness: 0.45, clearcoat: 0.6 }),
      glow: new MeshBasicMaterial({ color: '#3fe08f', toneMapped: false }),
    }),
    [],
  )

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    onReady()
    return () => {
      window.removeEventListener('pointermove', onMove)
      Object.values(geo).forEach((g) => g.dispose())
      Object.values(mat).forEach((m) => m.dispose())
    }
  }, [geo, mat, onReady])

  useFrame((state, delta) => {
    const r = root.current
    if (!r) return
    // Hold the "before assembly" pose while the first-visit intro covers the page,
    // so the visitor sees the system assemble instead of a finished model.
    if (start.current === null && isIntroDone()) start.current = state.clock.elapsedTime
    const t = start.current === null ? 0 : state.clock.elapsedTime - start.current

    // Layout: model sits right of centre on wide stages (the photo is left)
    const wide = viewport.width / viewport.height > 1.25
    const targetX = wide ? viewport.width * 0.17 : 0
    const fit = wide ? MathUtils.clamp(viewport.height / 11, 0.7, 1) : MathUtils.clamp(viewport.width / 13, 0.45, 0.8)
    r.position.x = targetX
    r.position.y = wide ? 0 : viewport.height * 0.2
    r.scale.setScalar(fit)

    // Pointer tilt, eased
    const k = 1 - Math.exp(-delta * 3)
    r.rotation.y = MathUtils.lerp(r.rotation.y, -0.55 + pointer.current.x * 0.22, k)
    r.rotation.x = MathUtils.lerp(r.rotation.x, 0.32 + pointer.current.y * 0.1, k)

    // Scroll separates the layers a little
    const sp = MathUtils.clamp(window.scrollY / (window.innerHeight * 0.9), 0, 1)
    const gap = sp * 0.9

    // Assemble bottom-up: database, then API, then screen, then cards
    const pDb = easeOut((t - 0.1) / 0.9)
    const pApi = easeOut((t - 0.45) / 0.9)
    const pUi = easeOut((t - 0.8) / 1.0)
    const float = Math.sin(t * 0.8) * 0.08

    if (db.current) {
      db.current.position.y = LAYER_Y.db - (1 - pDb) * 2.5 - gap
      db.current.scale.setScalar(Math.max(0.001, pDb))
    }
    if (api.current) {
      api.current.position.y = LAYER_Y.api - (1 - pApi) * 2.5 + float * 0.5
      api.current.scale.setScalar(Math.max(0.001, pApi))
    }
    if (ui.current) {
      ui.current.position.y = LAYER_Y.ui + (1 - pUi) * 2.5 + float + gap
      ui.current.scale.setScalar(Math.max(0.001, pUi))
    }
    cards.current.forEach((c, i) => {
      if (!c) return
      const p = easeBack((t - 1.4 - i * 0.12) / 0.7)
      const slot = CARD_SLOTS[i]
      c.position.set(
        slot[0] * (1 + gap * 0.15),
        slot[1] + Math.sin(t * 0.9 + i * 1.3) * 0.12,
        slot[2],
      )
      c.scale.setScalar(Math.max(0.001, p))
    })
  })

  return (
    <group ref={root}>
      {/* Database: three discs with glowing seams */}
      <group ref={db}>
        {[-0.62, 0, 0.62].map((y, i) => (
          <mesh key={y} geometry={geo.disc} material={i === 2 ? mat.discTop : mat.disc} position={[0, y, 0]} />
        ))}
        {[-0.31, 0.31].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={mat.glow}>
            <cylinderGeometry args={[1.62, 1.62, 0.06, 64, 1, true]} />
          </mesh>
        ))}
        <Tag tag={textures.tags[0]} position={[0, -1.25, 1.9]} />
      </group>

      {/* API layer */}
      <group ref={api}>
        <mesh geometry={geo.slab} material={mat.slab} />
        {[-1.8, -0.6, 0.6, 1.8].map((x) => (
          <mesh key={x} position={[x, 0, 1.91]} material={mat.glow}>
            <boxGeometry args={[0.5, 0.08, 0.02]} />
          </mesh>
        ))}
        <Tag tag={textures.tags[1]} position={[-2.3, -0.5, 2.1]} />
      </group>

      {/* React dashboard screen */}
      <group ref={ui} rotation={[-0.18, 0, 0]}>
        <mesh geometry={geo.screenBody} material={mat.body} />
        <mesh position={[0, 0, 0.12]}>
          <planeGeometry args={[6.1, 3.8]} />
          <meshBasicMaterial map={textures.dashboard} transparent toneMapped={false} />
        </mesh>
        <Tag tag={textures.tags[2]} position={[0, 2.4, 0.3]} />
      </group>

      {/* Module cards orbiting the stack */}
      {textures.modules.map((tex, i) => (
        <group
          key={i}
          ref={(el) => {
            cards.current[i] = el
          }}
          rotation={[0, CARD_SLOTS[i][3], 0]}
        >
          <mesh>
            <planeGeometry args={[2.5, 1.16]} />
            <meshBasicMaterial map={tex} transparent toneMapped={false} />
          </mesh>
        </group>
      ))}

      <DataFlow count={40} />
    </group>
  )
}

function Tag({ tag, position }: { tag: { tex: CanvasTexture; aspect: number }; position: [number, number, number] }) {
  const h = 0.42
  return (
    <mesh position={position} renderOrder={10}>
      <planeGeometry args={[h * tag.aspect, h]} />
      <meshBasicMaterial map={tag.tex} transparent toneMapped={false} depthWrite={false} depthTest={false} />
    </mesh>
  )
}

export default function ErpScene({ onReady }: { onReady: () => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [textures, setTextures] = useState<Textures | null>(null)

  // Textures need the web fonts first
  useEffect(() => {
    let alive = true
    let made: Textures | null = null
    fontsReady().then(() => {
      if (!alive) return
      made = {
        dashboard: dashboardTexture(),
        modules: MODULES.map(([t, s, g]) => moduleTexture(t, s, g)),
        tags: [tagTexture('PostgreSQL · SQL Server'), tagTexture('ASP.NET Core API'), tagTexture('React + TypeScript')],
      }
      setTextures(made)
    })
    return () => {
      alive = false
      if (made) {
        made.dashboard.dispose()
        made.modules.forEach((t) => t.dispose())
        made.tags.forEach((t) => t.tex.dispose())
      }
    }
  }, [])

  // Stop rendering when the stage is off-screen
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="hero__canvas" aria-hidden="true">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        // At least 1.5x: on 1x and 1.25x screens the scene renders a bit larger and the
        // browser scales it down, which keeps the card text and edges crisp.
        dpr={[1.5, 2]}
        camera={{ position: [0, 0, 17], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Environment />
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 9, 10]} intensity={1.5} />
        <directionalLight position={[-8, -3, 5]} intensity={0.45} color="#a8f0cb" />
        {textures && <System textures={textures} onReady={onReady} />}
      </Canvas>
    </div>
  )
}
