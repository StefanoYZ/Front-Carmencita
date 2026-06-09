import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box, Edges, Html, OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';

const SCALE = 0.012;
const destinationColors = ['#2f855a', '#3182ce', '#dd6b20', '#805ad5', '#d69e2e', '#319795', '#718096', '#e53e3e'];

function colorForDestination(destination, destinations) {
  const index = destinations.indexOf(destination);
  return destinationColors[index % destinationColors.length];
}

function PackageBox({ placement, destinations, loaded, expected }) {
  const width = placement.width * SCALE;
  const height = placement.height * SCALE;
  const depth = placement.depth * SCALE;
  const position = [
    (placement.x + placement.width / 2) * SCALE,
    (placement.y + placement.height / 2) * SCALE,
    (placement.z + placement.depth / 2) * SCALE,
  ];
  const color = loaded ? '#28A745' : expected ? '#A3CF84' : colorForDestination(placement.destination, destinations);

  return (
    <group position={position}>
      <Box args={[width, height, depth]}>
        <meshStandardMaterial color={color} transparent opacity={loaded ? 0.95 : 0.82} roughness={0.45} metalness={0.08} />
        <Edges color={expected ? '#212529' : '#ffffff'} />
      </Box>
      <Text position={[0, height / 2 + 0.035, 0]} fontSize={0.08} color="#212529" anchorX="center" anchorY="middle">
        {placement.codigo}
      </Text>
    </group>
  );
}

function TruckWireframe({ truck }) {
  const width = truck.ancho_cm * SCALE;
  const height = truck.alto_cm * SCALE;
  const depth = truck.largo_cm * SCALE;
  return (
    <group position={[width / 2, height / 2, depth / 2]}>
      <Box args={[width, height, depth]}>
        <meshBasicMaterial color="#3C5940" transparent opacity={0.06} />
        <Edges color="#3C5940" />
      </Box>
      <Html position={[-width / 2, -height / 2 - 0.15, -depth / 2]} center>
        <span className="rounded bg-white/90 px-2 py-1 text-xs font-bold text-[#3C5940]">Puerta Z=0</span>
      </Html>
    </group>
  );
}

export default function PackingScene3D({ truck, placements = [], loadedCodes = [], expectedCode }) {
  const destinations = useMemo(() => [...new Set(placements.map((item) => item.destination))], [placements]);

  if (!truck) {
    return <div className="flex h-full items-center justify-center text-sm font-semibold text-[#6C757D]">Selecciona un camion.</div>;
  }

  return (
    <div className="h-[520px] overflow-hidden rounded-lg border border-[#d9e7d4] bg-gradient-to-b from-white to-[#F8F9FA]">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[4.6, 3.8, 6.4]} fov={46} />
          <ambientLight intensity={0.75} />
          <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
          <gridHelper args={[9, 18, '#cbd5cf', '#edf2ef']} position={[1.45, 0, 3.6]} />
          <TruckWireframe truck={truck} />
          {placements.map((placement) => (
            <PackageBox
              key={placement.codigo}
              placement={placement}
              destinations={destinations}
              loaded={loadedCodes.includes(placement.codigo)}
              expected={expectedCode === placement.codigo}
            />
          ))}
          <OrbitControls enablePan enableZoom enableRotate />
        </Suspense>
      </Canvas>
    </div>
  );
}
