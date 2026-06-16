import React, { useMemo } from 'react';

function TruckWheel({ x, y, z, radius, width }) {
  const lugPositions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 6;
        return [Math.cos(angle) * radius * 0.28, Math.sin(angle) * radius * 0.28];
      }),
    [radius],
  );

  return (
    <group position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, width, 72]} />
        <meshStandardMaterial color="#121416" roughness={0.88} metalness={0.05} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 0.82, radius * 0.82, width + 0.014, 64]} />
        <meshStandardMaterial color="#1C2024" roughness={0.82} metalness={0.05} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[0, side * (width / 2 + 0.01), 0]}>
          <mesh>
            <cylinderGeometry args={[radius * 0.62, radius * 0.62, 0.028, 56]} />
            <meshStandardMaterial color="#9AA0A6" roughness={0.32} metalness={0.7} />
          </mesh>
          <mesh position={[0, side * 0.015, 0]}>
            <cylinderGeometry args={[radius * 0.32, radius * 0.32, 0.024, 40]} />
            <meshStandardMaterial color="#454B50" roughness={0.38} metalness={0.72} />
          </mesh>
          {lugPositions.map(([lugX, lugZ]) => (
            <mesh key={`${side}-${lugX}-${lugZ}`} position={[lugX, side * 0.034, lugZ]}>
              <cylinderGeometry args={[radius * 0.06, radius * 0.06, 0.012, 12]} />
              <meshStandardMaterial color="#E5E7E1" roughness={0.26} metalness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export default TruckWheel;
