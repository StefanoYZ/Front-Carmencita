import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Edges, OrbitControls } from '@react-three/drei';

const BASES = {
  LARGO_ANCHO: {
    label: 'Largo x Ancho',
    vertical: 'Alto',
    color: '#28A745',
  },
  LARGO_ALTO: {
    label: 'Largo x Alto',
    vertical: 'Ancho',
    color: '#E45745',
  },
  ANCHO_ALTO: {
    label: 'Ancho x Alto',
    vertical: 'Largo',
    color: '#E59B22',
  },
};

function SelectableFace({ orientation, selected, hovered, onSelect, onHover, dimensions }) {
  const [length, width, height] = dimensions;
  const offset = 0.012;
  const configurations = {
    LARGO_ANCHO: {
      args: [length, width],
      position: [0, height / 2 + offset, 0],
      rotation: [-Math.PI / 2, 0, 0],
    },
    LARGO_ALTO: {
      args: [length, height],
      position: [0, 0, width / 2 + offset],
      rotation: [0, 0, 0],
    },
    ANCHO_ALTO: {
      args: [width, height],
      position: [length / 2 + offset, 0, 0],
      rotation: [0, Math.PI / 2, 0],
    },
  };
  const config = configurations[orientation];

  return (
    <mesh
      position={config.position}
      rotation={config.rotation}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(orientation);
      }}
      onPointerEnter={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
        onHover(orientation);
      }}
      onPointerLeave={() => {
        document.body.style.cursor = '';
        onHover('');
      }}
    >
      <planeGeometry args={config.args} />
      <meshBasicMaterial
        color={selected ? '#FACC15' : BASES[orientation].color}
        transparent
        opacity={selected ? 0.82 : hovered ? 0.38 : 0.16}
        depthWrite={false}
      />
    </mesh>
  );
}

function PackagePrism({ length, width, height, selectedBase, onSelect }) {
  const [hoveredBase, setHoveredBase] = useState('');
  const displayDimensions = useMemo(() => {
    const safeDimensions = [
      Math.max(Number(length) || 1, 1),
      Math.max(Number(width) || 1, 1),
      Math.max(Number(height) || 1, 1),
    ];
    const scale = 2.8 / Math.max(...safeDimensions);
    return safeDimensions.map((dimension) => Math.max(dimension * scale, 0.35));
  }, [height, length, width]);

  return (
    <group rotation={[0, -0.55, 0]}>
      <mesh>
        <boxGeometry args={[displayDimensions[0], displayDimensions[2], displayDimensions[1]]} />
        <meshStandardMaterial color="#E4ECE2" roughness={0.68} metalness={0.04} />
        <Edges color="#212529" threshold={12} />
      </mesh>
      {Object.keys(BASES).map((orientation) => (
        <SelectableFace
          key={orientation}
          orientation={orientation}
          selected={selectedBase === orientation}
          hovered={hoveredBase === orientation}
          onSelect={onSelect}
          onHover={setHoveredBase}
          dimensions={displayDimensions}
        />
      ))}
    </group>
  );
}

function PackageBaseSelector({
  length,
  width,
  height,
  value,
  onChange,
  error = '',
}) {
  const selected = BASES[value];
  const hasDimensions = [length, width, height].every((dimension) => Number(dimension) > 0);

  return (
    <section className="mt-5 border-t border-[#A3CF84]/60 pt-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-base font-black text-[#212529]">Geometria del paquete</h4>
          <p className="mt-1 text-sm font-semibold text-[#6C757D]">
            Haz clic en la cara que ira apoyada hacia abajo.
          </p>
        </div>
        {selected && (
          <p className="text-sm font-black text-[#3C5940]">
            Base: {selected.label} · {selected.vertical} vertical
          </p>
        )}
      </div>

      <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_210px]">
        <div className="relative h-64 min-w-0 overflow-hidden rounded-lg border border-[#A3CF84] bg-white shadow-inner">
          <Canvas
            frameloop="demand"
            camera={{ position: [4.8, 3.7, 5.2], fov: 38 }}
            dpr={[1, 1.5]}
          >
            <color attach="background" args={['#F8F9FA']} />
            <ambientLight intensity={1.55} />
            <directionalLight position={[4, 6, 5]} intensity={1.8} />
            <Suspense fallback={null}>
              <PackagePrism
                length={length}
                width={width}
                height={height}
                selectedBase={value}
                onSelect={onChange}
              />
            </Suspense>
            <OrbitControls
              enablePan={false}
              minDistance={4}
              maxDistance={9}
              minPolarAngle={0.45}
              maxPolarAngle={Math.PI / 2.05}
            />
          </Canvas>
          {!hasDimensions && (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-md bg-white/95 px-3 py-2 text-center text-xs font-bold text-[#6C757D] shadow-sm">
              Ingresa largo, ancho y alto para formar el prisma a escala.
            </div>
          )}
        </div>

        <div className="grid content-start gap-3">
          <div className="rounded-lg bg-white p-4 ring-1 ring-[#A3CF84]/55">
            <p className="text-xs font-black uppercase text-[#6C757D]">Dimensiones</p>
            <dl className="mt-3 grid gap-2 text-sm font-bold">
              <div className="flex items-center justify-between gap-3 text-[#E59B22]">
                <dt>Largo</dt>
                <dd>{Number(length) > 0 ? `${length} cm` : '--'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-[#E45745]">
                <dt>Ancho</dt>
                <dd>{Number(width) > 0 ? `${width} cm` : '--'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-[#28A745]">
                <dt>Alto</dt>
                <dd>{Number(height) > 0 ? `${height} cm` : '--'}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg bg-[#3C5940] p-4 text-white">
            <p className="text-xs font-black uppercase text-[#E4ECE2]">Rotaciones permitidas</p>
            <p className="mt-2 text-sm font-semibold leading-5">
              {selected
                ? `El algoritmo probara dos giros horizontales manteniendo ${selected.label} como base.`
                : 'Selecciona una cara para definir como se apoyara el paquete.'}
            </p>
          </div>
        </div>
      </div>

      <p
        className={`mt-2 min-h-5 text-sm font-semibold ${error ? 'text-red-600' : 'text-transparent'}`}
        aria-live={error ? 'polite' : undefined}
      >
        {error || ''}
      </p>
    </section>
  );
}

export default PackageBaseSelector;
