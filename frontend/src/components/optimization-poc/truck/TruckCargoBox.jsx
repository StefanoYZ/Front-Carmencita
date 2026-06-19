import React from 'react';
import { Edges } from '@react-three/drei';

export const CARGO_LIFT = 0.35;

function TruckCargoBox({ width, height, depth }) {
  return (
    // Este grupo desplaza verticalmente toda la bodega.
    <group position={[0, CARGO_LIFT, 0]}>
      {/* Contenedor transparente principal */}
      <group position={[0, height / 2, 0]}>
        <mesh receiveShadow raycast={() => null}>
          <boxGeometry args={[width, height, depth]} />

          <meshStandardMaterial
            color="#CFE8D5"
            transparent
            opacity={0.08}
            roughness={0.4}
            metalness={0}
            depthWrite={false}
          />

          <Edges
            color="#3F6845"
            threshold={12}
          />
        </mesh>
      </group>

      {/* Piso de la bodega */}
      <mesh
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <boxGeometry args={[width, 0.04, depth]} />

        <meshStandardMaterial
          color="#151A1D"
          roughness={0.72}
          metalness={0.18}
        />
      </mesh>

      {/* Estructura superior */}
      <mesh position={[0, height + 0.04, 0]} raycast={() => null}>
        <boxGeometry
          args={[
            width + 0.08,
            0.08,
            depth + 0.08,
          ]}
        />

        <meshStandardMaterial
          color="#D7DDD5"
          transparent
          opacity={0.34}
          roughness={0.42}
          metalness={0.04}
        />
      </mesh>

      {/* Pilar posterior izquierdo */}
      <mesh
        position={[
          -width / 2 - 0.035,
          height / 2,
          depth / 2 + 0.02,
        ]}
        raycast={() => null}
      >
        <boxGeometry args={[0.07, height, 0.08]} />

        <meshStandardMaterial
          color="#3F6845"
          roughness={0.45}
          metalness={0.12}
        />
      </mesh>

      {/* Pilar posterior derecho */}
      <mesh
        position={[
          width / 2 + 0.035,
          height / 2,
          depth / 2 + 0.02,
        ]}
        raycast={() => null}
      >
        <boxGeometry args={[0.07, height, 0.08]} />

        <meshStandardMaterial
          color="#3F6845"
          roughness={0.45}
          metalness={0.12}
        />
      </mesh>

      {/* Barra posterior superior */}
      <mesh
        position={[
          0,
          height + 0.04,
          depth / 2 + 0.025,
        ]}
        raycast={() => null}
      >
        <boxGeometry
          args={[
            width + 0.16,
            0.07,
            0.08,
          ]}
        />

        <meshStandardMaterial
          color="#3F6845"
          roughness={0.45}
          metalness={0.12}
        />
      </mesh>

      {/* Panel frontal transparente de la bodega */}
      <mesh
        position={[
          0,
          height * 0.52,
          -depth / 2 - 0.03,
        ]}
        raycast={() => null}
      >
        <boxGeometry
          args={[
            width + 0.08,
            height * 0.9,
            0.045,
          ]}
        />

        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={0.18}
          roughness={0.4}
          metalness={0.04}
          depthWrite={false}
        />
      </mesh>

      {/* Barra frontal inferior */}
      <mesh
        position={[
          0,
          0.04,
          -depth / 2 - 0.12,
        ]}
        raycast={() => null}
      >
        <boxGeometry
          args={[
            width + 0.18,
            0.08,
            0.12,
          ]}
        />

        <meshStandardMaterial
          color="#28A745"
          roughness={0.48}
          metalness={0.12}
        />
      </mesh>
    </group>
  );
}

export default TruckCargoBox;
