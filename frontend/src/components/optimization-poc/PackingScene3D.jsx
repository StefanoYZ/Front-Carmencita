import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import TruckModel from './truck/TruckModel.jsx';
import { CARGO_LIFT } from './truck/TruckCargoBox.jsx';

const SCALE = 0.012;
const packageColors = [
  '#2f855a',
  '#3182ce',
  '#dd6b20',
  '#805ad5',
  '#d69e2e',
  '#319795',
  '#718096',
  '#c05621',
  '#2b6cb0',
  '#6b46c1',
  '#b7791f',
  '#2c7a7b',
];

function colorForPackage(placement) {
  const index = Math.max((placement.loading_sequence || 1) - 1, 0);
  return packageColors[index % packageColors.length];
}

function PackageBox({ placement, loaded, expected }) {
  const meshRef = useRef(null);
  const width = placement.width * SCALE;
  const height = placement.height * SCALE;
  const depth = placement.depth * SCALE;
  const truckOffset = placement.truckOffset;
  const position = [
    (placement.x + placement.width / 2 - truckOffset.x) * SCALE,
    (placement.y + placement.height / 2) * SCALE + CARGO_LIFT,
    (placement.z + placement.depth / 2 - truckOffset.z) * SCALE,
  ];
  const color = colorForPackage(placement);
  const opacity = expected ? 1 : loaded ? 0.9 : 0.82;

  useFrame((state) => {
    if (!expected || !meshRef.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.012;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <group>
      <mesh ref={meshRef} position={position} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.45} metalness={0.08} emissive={expected ? '#A3CF84' : '#000000'} emissiveIntensity={expected ? 0.18 : 0} />
      </mesh>
      {expected && (
        <Html position={[position[0], position[1] + height / 2 + 0.035, position[2]]} center distanceFactor={8} occlude>
          <span className="pointer-events-none rounded bg-[#E4ECE2] px-1.5 py-0.5 text-[10px] font-black text-[#212529] shadow-sm ring-2 ring-[#212529]">
            {placement.codigo}
          </span>
        </Html>
      )}
    </group>
  );
}

function CameraRig({ scene, viewMode }) {
  const controlsRef = useRef(null);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...scene.cameraPosition);
    camera.up.set(...scene.cameraUp);
    camera.lookAt(...scene.target);
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.set(...scene.target);
      controlsRef.current.update();
    }
  }, [camera, scene, viewMode]);

  return <OrbitControls ref={controlsRef} target={scene.target} enablePan enableZoom enableRotate minDistance={2.5} maxDistance={16} />;
}

export default function PackingScene3D({ truck, placements = [], loadedCodes = [], expectedCode, viewMode = 'isometric', className = 'h-[520px]' }) {
  const scene = useMemo(() => {
    if (!truck) return null;
    const width = truck.ancho_cm * SCALE;
    const height = truck.alto_cm * SCALE;
    const depth = truck.largo_cm * SCALE;
    const visualCabDepth = Math.max(depth * 0.24, 1.55);
    const visualCabGap = 0.34;
    const visualDepth = depth + visualCabDepth + visualCabGap;
    const maxDimension = Math.max(width, height, visualDepth);
    const defaultTarget = [0, height * 0.4, visualCabDepth * 0.42];
    const cameraByMode = {
      isometric: {
        cameraPosition: [maxDimension * 1.42, Math.max(height * 2.05, 4.6), maxDimension * 1.88],
        cameraUp: [0, 1, 0],
        target: defaultTarget,
      },
      top: {
        cameraPosition: [0, Math.max(maxDimension * 1.2, 7), visualCabDepth * 0.16],
        cameraUp: [0, 0, -1],
        target: defaultTarget,
      },
      front: {
        cameraPosition: [
          0,
          Math.max(height * 0.48, 1.55),
          -(depth / 2 + visualCabDepth + Math.max(width * 0.72, 1.8)),
        ],
        cameraUp: [0, 1, 0],
        target: [
          0,
          Math.max(height * 0.38, 1.15),
          -depth / 2,
        ],
      },
    };
    const cameraConfig = cameraByMode[viewMode] || cameraByMode.isometric;

    return {
      width,
      height,
      depth,
      ...cameraConfig,
      truckOffset: {
        x: truck.ancho_cm / 2,
        z: truck.largo_cm / 2,
      },
    };
  }, [truck, viewMode]);

  const renderPlacements = useMemo(() => {
    if (!scene) return [];
    return placements.map((placement) => ({
      ...placement,
      truckOffset: scene.truckOffset,
    }));
  }, [placements, scene]);

  if (!truck) {
    return <div className="flex h-full items-center justify-center text-sm font-semibold text-[#6C757D]">Selecciona un camion.</div>;
  }

  return (
    <div className={`relative overflow-hidden rounded-lg border border-[#d9e7d4] bg-gradient-to-b from-white to-[#F8F9FA] ${className}`}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={scene.cameraPosition} fov={55} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[8, 12, 10]} intensity={1.2} castShadow />
          <directionalLight position={[-6, 5, -4]} intensity={0.35} />
          <gridHelper args={[Math.max(scene.depth, scene.width) * 1.35, 24, '#cbd5cf', '#edf2ef']} position={[0, -0.02, 0]} />
          <TruckModel truck={truck} scale={SCALE} />
          {renderPlacements.map((placement) => (
            <PackageBox
              key={placement.codigo}
              placement={placement}
              loaded={loadedCodes.includes(placement.codigo)}
              expected={expectedCode === placement.codigo}
            />
          ))}
          <CameraRig scene={scene} viewMode={viewMode} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-[#E4ECE2] bg-white/90 px-3 py-2 text-xs font-black text-[#3C5940] shadow-sm">
        Paquetes renderizados: {placements.length}
      </div>
      {!placements.length && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit rounded-lg border border-[#A3CF84] bg-white/95 px-4 py-3 text-sm font-bold text-[#3C5940] shadow-soft">
          Ejecuta Ordenar para cargar las coordenadas First Fit 3D.
        </div>
      )}
    </div>
  );
}
