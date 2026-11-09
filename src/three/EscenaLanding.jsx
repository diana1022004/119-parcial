import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { useRef, useState } from 'react'

// Escena 3D de la landing: un camión de bomberos hecho con geometrías básicas.
// - useFrame: las ruedas giran, el camión "rebota" suave y las balizas parpadean.
// - Mouse: al pasar por encima el camión se agranda un poco y cambia el cursor;
//   con clic se enciende / apaga la sirena (balizas y luz roja de la escena).

const ROJO = '#c81e1e'

// Rueda: gira sola con useFrame; la velocidad depende de si la sirena está encendida
function Rueda({ position, sirena }) {
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * (sirena ? 9 : 2)
  })
  return (
    <mesh ref={ref} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.28, 0.28, 0.22, 24]} />
      <meshStandardMaterial color="#1f2937" roughness={0.9} />
      {/* rin con rayos para que se note el giro */}
      <mesh position={[0, 0.115, 0]}>
        <boxGeometry args={[0.26, 0.02, 0.05]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.115, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.26, 0.02, 0.05]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
      </mesh>
    </mesh>
  )
}

// Baliza del techo: alterna rojo / azul cuando la sirena está encendida
function Baliza({ position, fase, sirena }) {
  const mat = useRef()
  useFrame(({ clock }) => {
    const encendida = sirena && Math.sin(clock.elapsedTime * 10 + fase) > 0
    mat.current.emissiveIntensity = encendida ? 3 : 0.15
  })
  const color = fase === 0 ? '#ef4444' : '#3b82f6'
  return (
    <mesh position={position}>
      <boxGeometry args={[0.22, 0.12, 0.22]} />
      <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0.15} />
    </mesh>
  )
}

function CamionBomberos({ sirena, onAlternarSirena }) {
  const grupo = useRef()
  const luzSirena = useRef()
  const [encima, setEncima] = useState(false)

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    // Rebote suave como si el motor estuviera encendido
    grupo.current.position.y = Math.sin(t * (sirena ? 14 : 3)) * (sirena ? 0.02 : 0.01)
    // Escala hacia 1.08 cuando el mouse está encima
    const objetivo = encima ? 1.08 : 1
    const s = grupo.current.scale.x + (objetivo - grupo.current.scale.x) * Math.min(1, delta * 8)
    grupo.current.scale.setScalar(s)
    // Luz roja que barre la escena
    if (luzSirena.current) {
      luzSirena.current.intensity = sirena ? (Math.sin(t * 10) > 0 ? 6 : 0) : 0
    }
  })

  return (
    <group
      ref={grupo}
      onClick={(e) => { e.stopPropagation(); onAlternarSirena() }}
      onPointerOver={(e) => { e.stopPropagation(); setEncima(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setEncima(false); document.body.style.cursor = 'auto' }}
    >
      {/* Chasis */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[2.6, 0.16, 0.95]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      {/* Cuerpo trasero (tanque y gabinetes) */}
      <mesh position={[-0.35, 0.78, 0]}>
        <boxGeometry args={[1.8, 0.8, 1]} />
        <meshStandardMaterial color={ROJO} roughness={0.4} />
      </mesh>
      {/* Franja reflectiva */}
      <mesh position={[-0.35, 0.62, 0]}>
        <boxGeometry args={[1.82, 0.08, 1.02]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.25} />
      </mesh>
      {/* Cabina */}
      <mesh position={[0.9, 0.72, 0]}>
        <boxGeometry args={[0.75, 0.7, 1]} />
        <meshStandardMaterial color={ROJO} roughness={0.4} />
      </mesh>
      {/* Parabrisas */}
      <mesh position={[1.28, 0.82, 0]}>
        <boxGeometry args={[0.02, 0.32, 0.82]} />
        <meshStandardMaterial color="#93c5fd" metalness={0.3} roughness={0.1} />
      </mesh>
      {/* Escalera sobre el techo */}
      <group position={[-0.35, 1.25, 0]}>
        {[-0.25, 0.25].map((z) => (
          <mesh key={z} position={[0, 0, z]}>
            <boxGeometry args={[1.9, 0.05, 0.05]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {[-0.8, -0.48, -0.16, 0.16, 0.48, 0.8].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.5]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {/* Balizas en el techo de la cabina */}
      <Baliza position={[0.9, 1.13, -0.25]} fase={0} sirena={sirena} />
      <Baliza position={[0.9, 1.13, 0.25]} fase={Math.PI} sirena={sirena} />
      <pointLight ref={luzSirena} position={[0.9, 1.5, 0]} color="#ef4444" distance={6} intensity={0} />
      {/* Ruedas */}
      {[[-0.9, 0.5], [-0.9, -0.5], [0.85, 0.5], [0.85, -0.5]].map(([x, z]) => (
        <Rueda key={`${x}${z}`} position={[x, 0.28, z]} sirena={sirena} />
      ))}
    </group>
  )
}

export default function EscenaLanding() {
  const [sirena, setSirena] = useState(true)

  return (
    <div className="escena3d">
      <Canvas camera={{ position: [3.2, 2, 3.6], fov: 40 }} dpr={[1, 2]}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 3]} intensity={1.4} />
        <group position={[0, -0.6, 0]}>
          <CamionBomberos sirena={sirena} onAlternarSirena={() => setSirena((s) => !s)} />
          {/* Piso */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <circleGeometry args={[3, 48]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={6} blur={2.2} far={2} />
        </group>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8}
          minPolarAngle={0.6} maxPolarAngle={1.45} />
      </Canvas>
      <p className="escena3d__pista">
        {sirena ? 'Sirena encendida' : 'Sirena apagada'} · haz clic en el camión
      </p>
    </div>
  )
}
