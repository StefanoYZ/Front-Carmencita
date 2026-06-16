import React from 'react';
import { RoundedBox } from '@react-three/drei';

// ─── Material palette — COLORES ORIGINALES ──────────────────────────────────
const MAT = {
  cabPaint:   { color: '#F3F5F0', roughness: 0.46, metalness: 0.12 },
  darkTrim:   { color: '#1E252A', roughness: 0.48, metalness: 0.22 },
  chrome:     { color: '#C4C9CC', roughness: 0.16, metalness: 0.88 },
  glass: {
    color: '#263B49', roughness: 0.10, metalness: 0.06,
    transparent: true, opacity: 0.80,
  },
  headlight: {
    color: '#F4F2DD', roughness: 0.20, metalness: 0.22,
    emissive: '#FFF2BC', emissiveIntensity: 0.10,
  },
  indicator:  { color: '#F59F00', roughness: 0.30, metalness: 0.12 },
  rubber:     { color: '#252B2F', roughness: 0.75, metalness: 0.08 },
  grille:     { color: '#1A2228', roughness: 0.42, metalness: 0.55 },
  lowerBody:  { color: '#DCE0DC', roughness: 0.52, metalness: 0.14 },
  chrome2:    { color: '#9AA0A4', roughness: 0.30, metalness: 0.70 },
};

// ─── PARABRISAS doble panel (estilo Renault T) ───────────────────────────────
function Windshield({ W, H, D }) {
  const fz = D * 0.5;
  return (
    <group>
      {/* Panel izquierdo */}
      <mesh position={[-W * 0.20, H * 0.685, fz - 0.01]} rotation={[-0.22, 0.04, 0]} castShadow>
        <boxGeometry args={[W * 0.37, H * 0.29, 0.020]} />
        <meshStandardMaterial {...MAT.glass} />
      </mesh>
      {/* Panel derecho */}
      <mesh position={[W * 0.20, H * 0.685, fz - 0.01]} rotation={[-0.22, -0.04, 0]} castShadow>
        <boxGeometry args={[W * 0.37, H * 0.29, 0.020]} />
        <meshStandardMaterial {...MAT.glass} />
      </mesh>
      {/* Pilar central A */}
      <mesh position={[0, H * 0.685, fz + 0.005]}>
        <boxGeometry args={[0.028, H * 0.30, 0.018]} />
        <meshStandardMaterial {...MAT.darkTrim} />
      </mesh>
      {/* Marco superior parabrisas */}
      <mesh position={[0, H * 0.835, fz - 0.005]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[W * 0.80, 0.024, 0.018]} />
        <meshStandardMaterial {...MAT.darkTrim} />
      </mesh>
    </group>
  );
}

// ─── VENTANA LATERAL de puerta ───────────────────────────────────────────────
function DoorWindow({ side, W, H, D }) {
  return (
    <group>
      {/* Ventana principal */}
      <mesh position={[side * (W / 2 + 0.014), H * 0.695, -D * 0.04]} castShadow>
        <boxGeometry args={[0.020, H * 0.21, D * 0.48]} />
        <meshStandardMaterial {...MAT.glass} />
      </mesh>
      {/* Ventanilla triangular delantera */}
      <mesh position={[side * (W / 2 + 0.014), H * 0.695, D * 0.30]}>
        <boxGeometry args={[0.018, H * 0.14, D * 0.10]} />
        <meshStandardMaterial {...MAT.glass} />
      </mesh>
    </group>
  );
}

// ─── ESPEJO LATERAL grande estilo camión pesado ──────────────────────────────
function SideMirror({ side, W, H, D }) {
  return (
    <group>
      {/* Brazo superior */}
      <mesh position={[side * (W / 2 + 0.06), H * 0.82, D * 0.28]} rotation={[0.10, 0, side * 0.15]}>
        <boxGeometry args={[0.022, 0.016, 0.14]} />
        <meshStandardMaterial {...MAT.darkTrim} />
      </mesh>
      {/* Brazo inferior */}
      <mesh position={[side * (W / 2 + 0.06), H * 0.70, D * 0.26]} rotation={[0.08, 0, side * 0.12]}>
        <boxGeometry args={[0.018, 0.012, 0.12]} />
        <meshStandardMaterial {...MAT.darkTrim} />
      </mesh>
      {/* Carcasa espejo grande */}
      <RoundedBox
        args={[0.045, H * 0.16, 0.095]}
        radius={0.012}
        smoothness={4}
        position={[side * (W / 2 + 0.138), H * 0.76, D * 0.34]}
        rotation={[0, side * 0.06, 0]}
        castShadow
      >
        <meshStandardMaterial {...MAT.darkTrim} />
      </RoundedBox>
      {/* Cara reflectante */}
      <mesh position={[side * (W / 2 + 0.162), H * 0.76, D * 0.34]}>
        <boxGeometry args={[0.008, H * 0.13, 0.082]} />
        <meshStandardMaterial {...MAT.chrome} />
      </mesh>
      {/* Espejo convexo inferior (gran angular) */}
      <RoundedBox
        args={[0.038, H * 0.07, 0.065]}
        radius={0.010}
        smoothness={3}
        position={[side * (W / 2 + 0.130), H * 0.62, D * 0.35]}
        castShadow
      >
        <meshStandardMaterial color="#1A1F22" roughness={0.35} metalness={0.55} />
      </RoundedBox>
    </group>
  );
}

// ─── FRENTE: faros angulares + parrilla tipo Renault T ───────────────────────
function FrontFace({ W, H, D }) {
  const fz = D * 0.5;
  return (
    <group>
      {/* Parrilla central grande */}
      <RoundedBox
        args={[W * 0.52, H * 0.30, 0.045]}
        radius={0.022}
        smoothness={6}
        position={[0, H * 0.215, fz + 0.022]}
        castShadow
      >
        <meshStandardMaterial {...MAT.grille} />
      </RoundedBox>
      {/* Slats horizontales de parrilla */}
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, H * (0.215 + i * 0.022), fz + 0.044]}>
          <boxGeometry args={[W * 0.46, 0.009, 0.009]} />
          <meshStandardMaterial {...MAT.chrome2} />
        </mesh>
      ))}

      {/* Franja horizontal cromada divisora */}
      <RoundedBox
        args={[W * 0.94, 0.020, 0.038]}
        radius={0.006}
        smoothness={3}
        position={[0, H * 0.355, fz + 0.025]}
      >
        <meshStandardMaterial {...MAT.chrome} />
      </RoundedBox>

      {/* FAROS angulares esquinas (estilo Renault T) */}
      {[-1, 1].map((s) => (
        <group key={s}>
          {/* Cuerpo faro principal */}
          <RoundedBox
            args={[W * 0.20, H * 0.14, 0.038]}
            radius={0.018}
            smoothness={6}
            position={[s * W * 0.36, H * 0.295, fz + 0.020]}
            rotation={[0, s * -0.15, 0]}
            castShadow
          >
            <meshStandardMaterial {...MAT.headlight} />
          </RoundedBox>
          {/* DRL / LED strip horizontal */}
          <mesh position={[s * W * 0.36, H * 0.370, fz + 0.042]} rotation={[0, s * -0.15, 0]}>
            <boxGeometry args={[W * 0.17, 0.012, 0.010]} />
            <meshStandardMaterial
              color="#F0F0F0" roughness={0.10} metalness={0.30}
              emissive="#FFFFFF" emissiveIntensity={0.18}
            />
          </mesh>
          {/* Indicador lateral */}
          <RoundedBox
            args={[W * 0.055, H * 0.065, 0.030]}
            radius={0.010}
            smoothness={4}
            position={[s * W * 0.464, H * 0.270, fz + 0.016]}
            rotation={[0, s * -0.42, 0]}
          >
            <meshStandardMaterial {...MAT.indicator} />
          </RoundedBox>
          {/* Relleno lateral oscuro entre faro y esquina */}
          <RoundedBox
            args={[W * 0.06, H * 0.19, 0.028]}
            radius={0.012}
            smoothness={4}
            position={[s * W * 0.448, H * 0.265, fz + 0.010]}
            rotation={[0, s * -0.38, 0]}
          >
            <meshStandardMaterial {...MAT.darkTrim} />
          </RoundedBox>
        </group>
      ))}

      {/* Placa de logo central */}
      <RoundedBox
        args={[W * 0.12, H * 0.055, 0.018]}
        radius={0.008}
        smoothness={3}
        position={[0, H * 0.365, fz + 0.040]}
      >
        <meshStandardMaterial {...MAT.chrome} />
      </RoundedBox>
    </group>
  );
}

// ─── PARACHOQUES masivo con entradas de aire ──────────────────────────────────
function FrontBumper({ W, H, D }) {
  const fz = D * 0.5;
  const by = H * 0.045;
  return (
    <group>
      {/* Cuerpo principal del parachoques */}
      <RoundedBox
        args={[W * 0.98, H * 0.22, 0.13]}
        radius={0.028}
        smoothness={7}
        position={[0, by, fz + 0.062]}
        castShadow receiveShadow
      >
        <meshStandardMaterial {...MAT.darkTrim} />
      </RoundedBox>

      {/* Entrada de aire central */}
      <RoundedBox
        args={[W * 0.32, H * 0.10, 0.025]}
        radius={0.012}
        smoothness={4}
        position={[0, by + H * 0.048, fz + 0.118]}
      >
        <meshStandardMaterial {...MAT.grille} />
      </RoundedBox>
      {/* Slats entrada de aire */}
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[0, by + H * (0.048 + i * 0.028), fz + 0.126]}>
          <boxGeometry args={[W * 0.26, 0.008, 0.008]} />
          <meshStandardMaterial {...MAT.chrome2} />
        </mesh>
      ))}

      {/* Antinieblas laterales */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <RoundedBox
            args={[W * 0.13, H * 0.072, 0.030]}
            radius={0.012}
            smoothness={4}
            position={[s * W * 0.34, by + H * 0.032, fz + 0.112]}
          >
            <meshStandardMaterial {...MAT.headlight} />
          </RoundedBox>
          {/* Rejilla lateral bumper */}
          <RoundedBox
            args={[W * 0.09, H * 0.085, 0.025]}
            radius={0.010}
            smoothness={3}
            position={[s * W * 0.44, by + H * 0.040, fz + 0.108]}
          >
            <meshStandardMaterial {...MAT.grille} />
          </RoundedBox>
        </group>
      ))}

      {/* Franja cromada borde inferior bumper */}
      <mesh position={[0, by - H * 0.066, fz + 0.088]}>
        <boxGeometry args={[W * 0.92, 0.014, 0.022]} />
        <meshStandardMaterial {...MAT.chrome} />
      </mesh>

      {/* Placa de matrícula */}
      <RoundedBox
        args={[W * 0.20, H * 0.048, 0.014]}
        radius={0.005}
        smoothness={3}
        position={[0, by - H * 0.018, fz + 0.126]}
      >
        <meshStandardMaterial color="#E8E04A" roughness={0.38} metalness={0.08} />
      </RoundedBox>

      {/* Estribos laterales */}
      {[-1, 1].map((s) => (
        <RoundedBox
          key={s}
          args={[0.055, H * 0.055, 0.095]}
          radius={0.010}
          smoothness={3}
          position={[s * W * 0.52, by - H * 0.055, fz + 0.028]}
          castShadow
        >
          <meshStandardMaterial color="#2A3338" roughness={0.55} metalness={0.40} />
        </RoundedBox>
      ))}
    </group>
  );
}

// ─── GUARDABARRO delantero integrado ─────────────────────────────────────────
function FrontFender({ side, W, H, D, wheelR, wheelZ, cabZ }) {
  const relZ = wheelZ - cabZ;
  return (
    <group position={[side * W * 0.496, 0, relZ]}>
      {/* Panel exterior fender */}
      <RoundedBox
        args={[0.12, wheelR * 1.05, wheelR * 1.68]}
        radius={0.038}
        smoothness={7}
        position={[0, wheelR * 0.78, 0]}
        castShadow receiveShadow
      >
        <meshStandardMaterial color="#E8EBE8" roughness={0.45} metalness={0.16} />
      </RoundedBox>
      {/* Labio inferior goma */}
      <RoundedBox
        args={[0.155, wheelR * 0.09, wheelR * 1.58]}
        radius={0.018}
        smoothness={4}
        position={[0, wheelR * 0.34, 0]}
        castShadow
      >
        <meshStandardMaterial {...MAT.rubber} />
      </RoundedBox>
      {/* Extension delantera fender hacia bumper */}
      <RoundedBox
        args={[0.10, wheelR * 0.55, wheelR * 0.45]}
        radius={0.025}
        smoothness={4}
        position={[0, wheelR * 0.94, wheelR * 0.82]}
        castShadow
      >
        <meshStandardMaterial color="#D8DDD8" roughness={0.48} metalness={0.14} />
      </RoundedBox>
    </group>
  );
}

// ─── ESCALONES de acceso ──────────────────────────────────────────────────────
function CabStep({ side, W, H, D }) {
  const sx = side * (W / 2 + 0.050);
  return (
    <group>
      <RoundedBox
        args={[0.10, 0.028, D * 0.30]}
        radius={0.007}
        smoothness={3}
        position={[sx, H * 0.08, -D * 0.04]}
        castShadow
      >
        <meshStandardMaterial color="#1E2528" roughness={0.62} metalness={0.38} />
      </RoundedBox>
      <RoundedBox
        args={[0.10, 0.022, D * 0.26]}
        radius={0.007}
        smoothness={3}
        position={[sx + side * 0.005, H * -0.035, -D * 0.06]}
        castShadow
      >
        <meshStandardMaterial color="#1E2528" roughness={0.62} metalness={0.38} />
      </RoundedBox>
      {/* Estribo vertical */}
      <mesh position={[sx, H * 0.022, -D * 0.04]}>
        <boxGeometry args={[0.018, H * 0.12, 0.018]} />
        <meshStandardMaterial {...MAT.darkTrim} />
      </mesh>
    </group>
  );
}

// ─── LUCES DE TECHO / ROOF BAR ────────────────────────────────────────────────
function RoofBar({ W, H, D }) {
  return (
    <group position={[0, H * 1.005, -D * 0.05]}>
      {/* Barra base */}
      <RoundedBox
        args={[W * 0.70, 0.030, 0.055]}
        radius={0.010}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial {...MAT.darkTrim} />
      </RoundedBox>
      {/* Luces de posicion */}
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[i * W * 0.085, 0.022, 0.010]}>
          <boxGeometry args={[0.024, 0.018, 0.018]} />
          <meshStandardMaterial
            color="#F4F2DD" roughness={0.18} metalness={0.20}
            emissive="#FFFACC" emissiveIntensity={0.22}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
function TruckCabin({
  width = 1,
  height = 1,
  depth = 1,
  cabZ = 0,
  wheelRadius = 0.18,
  wheelZ = 0,
  wheelX = 0.38,
}) {
  const W = width  * 0.98;
  const H = height * 0.82;
  const D = depth  * 0.32;
  const baseY = 0.16;

  return (
    <group position={[0, baseY, cabZ]}>

      {/* 1. CUERPO INFERIOR */}
      <RoundedBox
        args={[W, H * 0.44, D]}
        radius={0.060}
        smoothness={8}
        position={[0, H * 0.22, 0]}
        castShadow receiveShadow
      >
        <meshStandardMaterial {...MAT.lowerBody} />
      </RoundedBox>

      {/* 2. CUERPO SUPERIOR */}
      <RoundedBox
        args={[W, H * 0.52, D * 0.94]}
        radius={0.095}
        smoothness={10}
        position={[0, H * 0.68, -D * 0.03]}
        castShadow receiveShadow
      >
        <meshStandardMaterial {...MAT.cabPaint} />
      </RoundedBox>

      {/* 3. FRENTE INFERIOR inclinado (nariz / capó) */}
      <mesh
        position={[0, H * 0.33, D * 0.49]}
        rotation={[-0.14, 0, 0]}
        castShadow receiveShadow
      >
        <boxGeometry args={[W * 0.96, H * 0.28, 0.065]} />
        <meshStandardMaterial {...MAT.cabPaint} />
      </mesh>

      {/* 4. TECHO elevado highrise */}
      <RoundedBox
        args={[W * 0.92, H * 0.12, D * 0.80]}
        radius={0.058}
        smoothness={8}
        position={[0, H * 0.96, -D * 0.04]}
        castShadow receiveShadow
      >
        <meshStandardMaterial color="#F8FAF8" roughness={0.36} metalness={0.12} />
      </RoundedBox>

      {/* 5. VISERA solar */}
      <RoundedBox
        args={[W * 0.82, 0.034, D * 0.16]}
        radius={0.012}
        smoothness={4}
        position={[0, H * 0.916, D * 0.42]}
        castShadow
      >
        <meshStandardMaterial {...MAT.darkTrim} />
      </RoundedBox>

      {/* 6. PARABRISAS doble panel */}
      <Windshield W={W} H={H} D={D} />

      {/* 7. VENTANAS LATERALES */}
      <DoorWindow side={-1} W={W} H={H} D={D} />
      <DoorWindow side={1}  W={W} H={H} D={D} />

      {/* 8. PUERTAS */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * (W / 2 + 0.007), H * 0.52, -D * 0.05]}>
            <boxGeometry args={[0.016, H * 0.58, D * 0.72]} />
            <meshStandardMaterial color="#EFF1EE" roughness={0.44} metalness={0.14} />
          </mesh>
          <RoundedBox
            args={[0.020, 0.026, 0.076]}
            radius={0.007}
            smoothness={3}
            position={[s * (W / 2 + 0.032), H * 0.47, D * 0.05]}
          >
            <meshStandardMaterial {...MAT.chrome} />
          </RoundedBox>
          {/* Linea de diseño en puerta */}
          <mesh position={[s * (W / 2 + 0.014), H * 0.415, -D * 0.05]}>
            <boxGeometry args={[0.010, 0.016, D * 0.65]} />
            <meshStandardMaterial color="#D0D4D0" roughness={0.50} metalness={0.20} />
          </mesh>
        </group>
      ))}

      {/* 9. FRENTE: Parrilla + Faros */}
      <FrontFace W={W} H={H} D={D} />

      {/* 10. PARACHOQUES frontal */}
      <FrontBumper W={W} H={H} D={D} />

      {/* 11. ESPEJOS laterales */}
      <SideMirror side={-1} W={W} H={H} D={D} />
      <SideMirror side={1}  W={W} H={H} D={D} />

      {/* 12. PANEL TRASERO */}
      <RoundedBox
        args={[W * 0.86, H * 0.66, 0.055]}
        radius={0.045}
        smoothness={6}
        position={[0, H * 0.56, -D * 0.50 - 0.01]}
        castShadow receiveShadow
      >
        <meshStandardMaterial color="#CDD0CC" roughness={0.52} metalness={0.14} />
      </RoundedBox>

      {/* 13. GUARDABARROS delanteros */}
      <FrontFender side={-1} W={W} H={H} D={D} wheelR={wheelRadius} wheelZ={wheelZ} cabZ={cabZ} />
      <FrontFender side={1}  W={W} H={H} D={D} wheelR={wheelRadius} wheelZ={wheelZ} cabZ={cabZ} />

      {/* 14. ESCALONES */}
      <CabStep side={-1} W={W} H={H} D={D} />
      <CabStep side={1}  W={W} H={H} D={D} />

      {/* 15. BARRA DE LUCES en techo */}
      <RoofBar W={W} H={H} D={D} />

      {/* 16. CAJA HERRAMIENTAS lateral */}
      <RoundedBox
        args={[W * 0.16, H * 0.08, D * 0.24]}
        radius={0.012}
        smoothness={4}
        position={[W * 0.38, H * 0.08, -D * 0.16]}
        castShadow
      >
        <meshStandardMaterial color="#1C2228" roughness={0.60} metalness={0.38} />
      </RoundedBox>
    </group>
  );
}

export default TruckCabin;
