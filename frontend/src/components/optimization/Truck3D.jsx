import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges, Text } from '@react-three/drei';
import PackageBox from './PackageBox.jsx';
import HinoTruck from './HinoTruck.jsx';

function TruckFrame({ truck, scale }) {
  const width = truck.width * scale;
  const height = truck.height * scale;
  const length = truck.length * scale;

  return (
    <group>
      <mesh position={[width / 2, height / 2, length / 2]}>
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial transparent opacity={0.02} depthWrite={false} />
        <Edges color="#111827" />
      </mesh>

      <mesh position={[width / 2, height / 2, -0.015]}>
        <boxGeometry args={[width, height, 0.03]} />
        <meshStandardMaterial color="#1d4ed8" transparent opacity={0.18} />
      </mesh>

      <Text
        position={[width / 2, height + 0.35, -0.35]}
        fontSize={0.22}
        color="#1d4ed8"
        anchorX="center"
      >
        FONDO
      </Text>

      <mesh position={[width / 2, height / 2, length + 0.015]}>
        <boxGeometry args={[width, height, 0.03]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.22} />
      </mesh>

      <Text
        position={[width / 2, height + 0.35, length + 0.35]}
        fontSize={0.22}
        color="#15803d"
        anchorX="center"
      >
        PUERTA / DESCARGA
      </Text>
    </group>
  );
}

function ZoneMarkers({ truck, scale }) {
  const width = truck.width * scale;
  const height = truck.height * scale;
  const length = truck.length * scale;
  const zoneLength = length / 3;

  const zones = [
    {
      label: 'ZONA LEJANA',
      color: '#3b82f6',
      z: zoneLength / 2,
    },
    {
      label: 'ZONA MEDIA',
      color: '#f59e0b',
      z: zoneLength + zoneLength / 2,
    },
    {
      label: 'ZONA CERCANA',
      color: '#22c55e',
      z: zoneLength * 2 + zoneLength / 2,
    },
  ];

  return (
    <group>
      {zones.map((zone) => (
        <group key={zone.label}>
          <mesh position={[width / 2, height / 2, zone.z]}>
            <boxGeometry args={[width, height, zoneLength]} />
            <meshStandardMaterial
              color={zone.color}
              transparent
              opacity={0.05}
              depthWrite={false}
            />
            <Edges color={zone.color} />
          </mesh>

          <Text
            position={[width + 0.35, height + 0.08, zone.z]}
            fontSize={0.16}
            color={zone.color}
            anchorX="left"
          >
            {zone.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

function Truck3D({ truck, packages = [], animate = true }) {
  const scale = 0.01;

  const [visibleCount, setVisibleCount] = useState(
    animate ? 0 : packages.length
  );

  const [autoPlay, setAutoPlay] = useState(animate);
  const [showTruckModel, setShowTruckModel] = useState(true);

  useEffect(() => {
    setVisibleCount(animate ? 0 : packages.length);
    setAutoPlay(animate);
  }, [packages, animate]);

  useEffect(() => {
    if (!autoPlay || !packages.length) return;

    const interval = setInterval(() => {
      setVisibleCount((current) => {
        if (current >= packages.length) {
          clearInterval(interval);
          return current;
        }

        return current + 1;
      });
    }, 350);

    return () => clearInterval(interval);
  }, [autoPlay, packages]);

  const visiblePackages = useMemo(() => {
    return packages.slice(0, visibleCount);
  }, [packages, visibleCount]);

  const handlePrevious = () => {
    setAutoPlay(false);
    setVisibleCount((current) => Math.max(current - 1, 0));
  };

  const handleNext = () => {
    setAutoPlay(false);
    setVisibleCount((current) => Math.min(current + 1, packages.length));
  };

  const handleShowAll = () => {
    setAutoPlay(false);
    setVisibleCount(packages.length);
  };

  const handleReset = () => {
    setAutoPlay(false);
    setVisibleCount(0);
  };

  const handlePlay = () => {
    setVisibleCount(0);
    setAutoPlay(true);
  };

  if (!truck) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border bg-white text-sm text-gray-500">
        No hay datos del camión.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-xl border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-black">
            Carga visible: {visibleCount} / {packages.length}
          </p>
          <p className="text-xs text-gray-500">
            Usa los controles para revisar la carga paso a paso.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={visibleCount === 0}
            className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50"
          >
            Anterior
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={visibleCount >= packages.length}
            className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50"
          >
            Siguiente
          </button>

          <button
            type="button"
            onClick={handlePlay}
            disabled={!packages.length}
            className="rounded-lg border px-3 py-2 text-xs"
          >
            Reproducir
          </button>

          <button
            type="button"
            onClick={handleShowAll}
            disabled={!packages.length}
            className="rounded-lg border px-3 py-2 text-xs"
          >
            Ver completo
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={visibleCount === 0}
            className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50"
          >
            Reiniciar
          </button>

          <button
            type="button"
            onClick={() => setShowTruckModel((current) => !current)}
            className="rounded-lg border px-3 py-2 text-xs"
          >
            {showTruckModel ? 'Ocultar camión' : 'Mostrar camión'}
          </button>
        </div>
      </div>

      <div className="h-[520px] w-full rounded-xl border bg-white">
        <Canvas camera={{ position: [5.2, 3.5, 8.2], fov: 45 }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[4, 8, 4]} intensity={1.1} />

          {showTruckModel && (
            <Suspense fallback={null}>
              <HinoTruck />
            </Suspense>
          )}

          <group position={[0, 1.25, 0.005]}>
            <ZoneMarkers truck={truck} scale={scale} />
            <TruckFrame truck={truck} scale={scale} />

            {visiblePackages.map((pkg) => (
              <PackageBox key={pkg.id} pkg={pkg} scale={scale} />
            ))}
          </group>

          <gridHelper args={[9, 22]} position={[1.5, -0.25, 3.5]} />
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}

export default Truck3D;