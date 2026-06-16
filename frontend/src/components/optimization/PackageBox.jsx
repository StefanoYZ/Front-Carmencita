import React, { useMemo, useState } from 'react';
import { Edges, Html, Text } from '@react-three/drei';

function getColorByFragility(fragility) {
  const value = fragility?.toUpperCase();

  if (value === 'ALTA') return '#ef4444';
  if (value === 'MEDIA') return '#f59e0b';
  return '#22c55e';
}

function PackageBox({ pkg, scale }) {
  const [hovered, setHovered] = useState(false);

  const position = useMemo(() => {
    return [
      (pkg.x + pkg.width / 2) * scale,
      (pkg.y + pkg.height / 2) * scale,
      (pkg.z + pkg.length / 2) * scale,
    ];
  }, [pkg, scale]);

  const size = [
    pkg.width * scale,
    pkg.height * scale,
    pkg.length * scale,
  ];

  const color = getColorByFragility(pkg.fragility);

  const originalDimensions = `${pkg.original_width} × ${pkg.original_height} × ${pkg.original_length}`;
  const finalDimensions = `${pkg.width} × ${pkg.height} × ${pkg.length}`;
  const baseSupport = `${pkg.width} × ${pkg.length}`;
  const finalHeight = pkg.height;

  return (
    <group>
      <mesh
        position={position}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered ? 1 : 0.95}
        />

        <Edges color={pkg.rotated ? '#000000' : '#ffffff'} />
      </mesh>

      {pkg.rotated && (
        <Text
          position={[
            position[0],
            position[1] + size[1] / 2 + 0.1,
            position[2],
          ]}
          fontSize={0.16}
          color="#000000"
          anchorX="center"
          anchorY="middle"
        >
          ↺
        </Text>
      )}

      {hovered && (
        <Html
          position={[
            position[0],
            position[1] + size[1] / 2 + 0.25,
            position[2],
          ]}
        >
          <div className="w-64 rounded-lg border bg-white p-3 text-xs shadow-lg">
            <p className="font-bold text-gray-900">{pkg.id}</p>

            <p>
              <b>Destino:</b> {pkg.destination}
            </p>
            <p>
              <b>Fragilidad:</b> {pkg.fragility}
            </p>
            <p>
              <b>Peso:</b> {pkg.weight} kg
            </p>

            <div className="mt-2 border-t pt-2">
              <p className="font-semibold text-gray-900">
                {pkg.rotated ? '↺ Rotado' : 'Sin rotación'}
              </p>

              <p>
                <b>Original:</b> {originalDimensions}
              </p>
              <p>
                <b>Final:</b> {finalDimensions}
              </p>

              <p className="mt-1">
                <b>Apoyar en base:</b> {baseSupport}
              </p>
              <p>
                <b>Altura:</b> {finalHeight}
              </p>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default PackageBox;