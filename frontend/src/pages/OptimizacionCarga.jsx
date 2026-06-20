import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Box,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Download,
  Flag,
  Maximize2,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  Truck,
  X,
} from 'lucide-react';
import PackingScene3D from '../components/optimization-poc/PackingScene3D.jsx';
import MetricCard from '../components/optimization-poc/MetricCard.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { optimizationPocService } from '../services/optimizationPocService.js';
import { getOptimizationAlgorithm, OPTIMIZATION_ALGORITHMS } from '../config/optimizationPocAlgorithms.js';

const STATUS_LABELS = {
  IDLE: 'Sin ordenar',
  ORDERING: 'Ordenando',
  ORDERED: 'Listo para cargar',
  LOADING: 'Carga en progreso',
  COMPLETED: 'Finalizado',
  ERROR: 'Error',
};

const VIEW_MODES = [
  { id: 'isometric', label: 'Isometrica' },
  { id: 'top', label: 'Superior' },
  { id: 'front', label: 'Frontal' },
];

const DEFAULT_PACKAGE_LIMIT = 20;
const MAX_PACKAGE_LIMIT = 70;

function formatDimensions(item) {
  const length = item.largo_cm ?? item.depth;
  const width = item.ancho_cm ?? item.width;
  const height = item.alto_cm ?? item.height;
  return `${length} x ${width} x ${height} cm`;
}

export default function OptimizacionCarga() {
  const [scenario, setScenario] = useState(null);
  const defaultAlgorithm = useMemo(() => getOptimizationAlgorithm(), []);
  const [algorithmId, setAlgorithmId] = useState(defaultAlgorithm.id);
  const activeAlgorithm = useMemo(() => getOptimizationAlgorithm(algorithmId), [algorithmId]);
  const [selectedTruckId, setSelectedTruckId] = useState('CAMION_A');
  const [viewMode, setViewMode] = useState('isometric');
  const [status, setStatus] = useState('IDLE');
  const [simulation, setSimulation] = useState(null);
  const [placementCursor, setPlacementCursor] = useState(0);
  const [isSceneExpanded, setIsSceneExpanded] = useState(false);
  const [packageLimitInput, setPackageLimitInput] = useState(String(DEFAULT_PACKAGE_LIMIT));
  const [handoffPrompt, setHandoffPrompt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    optimizationPocService
      .getScenario(MAX_PACKAGE_LIMIT)
      .then((data) => {
        if (mounted) setScenario(data);
      })
      .catch((loadError) => {
        if (!mounted) return;
        setError(getApiErrorMessage(loadError, 'No se pudo cargar el escenario PoC.'));
        setStatus('ERROR');
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSceneExpanded) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsSceneExpanded(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSceneExpanded]);

  const selectedTruck = useMemo(
    () => scenario?.trucks?.find((truck) => truck.id === selectedTruckId) || scenario?.trucks?.[0],
    [scenario, selectedTruckId],
  );

  const orderedPlacements = useMemo(
    () => [...(simulation?.placements || [])].sort((a, b) => a.loading_sequence - b.loading_sequence),
    [simulation],
  );

  const renderedPlacements = useMemo(
    () => orderedPlacements.slice(0, placementCursor),
    [orderedPlacements, placementCursor],
  );

  const loadedCodes = useMemo(
    () => renderedPlacements.map((item) => item.codigo),
    [renderedPlacements],
  );

  const currentPlacement = renderedPlacements.at(-1) || null;
  const pendingCount = Math.max((simulation?.metrics?.placed_count || 0) - placementCursor, 0);
  const canShowHandoffPrompt = Boolean(
    handoffPrompt
      && simulation
      && orderedPlacements.length
      && placementCursor >= orderedPlacements.length
      && status !== 'ORDERING',
  );
  const packageLimit = useMemo(() => {
    if (!/^\d+$/.test(packageLimitInput)) return null;
    const parsed = Number(packageLimitInput);
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_PACKAGE_LIMIT ? parsed : null;
  }, [packageLimitInput]);
  const packageLimitError = useMemo(() => {
    if (packageLimitInput.trim() === '') return 'Ingresa una cantidad de paquetes.';
    if (!/^\d+$/.test(packageLimitInput)) return 'La cantidad debe ser un numero entero.';
    if (!packageLimit) return `La cantidad debe estar entre 1 y ${MAX_PACKAGE_LIMIT}.`;
    return '';
  }, [packageLimit, packageLimitInput]);

  const visiblePackages = useMemo(() => {
    const sourcePackages = simulation ? simulation.ordered_packages : scenario?.packages || [];
    if (!simulation) return packageLimit ? sourcePackages.slice(0, packageLimit) : [];
    const loadedSet = new Set(loadedCodes);
    return sourcePackages.filter((item) => !loadedSet.has(item.codigo));
  }, [loadedCodes, packageLimit, scenario?.packages, simulation]);

  const resetSimulation = () => {
    setSimulation(null);
    setPlacementCursor(0);
    setStatus('IDLE');
    setHandoffPrompt(null);
    setError('');
  };

  const getSecondaryTruck = (fromTruckId) => {
    if (!scenario?.trucks?.length) return null;
    return scenario.trucks.find((truck) => truck.id !== fromTruckId && truck.id === 'CAMION_B')
      || scenario.trucks.find((truck) => truck.id !== fromTruckId)
      || null;
  };

  const showHandoffPromptIfNeeded = (result, fromTruckId) => {
    const unplacedPackages = result?.unplaced_packages || [];
    if (!unplacedPackages.length || fromTruckId === 'CAMION_B') {
      setHandoffPrompt(null);
      return false;
    }

    const targetTruck = getSecondaryTruck(fromTruckId);
    if (!targetTruck) {
      setHandoffPrompt(null);
      return false;
    }

    setHandoffPrompt({
      fromTruckId,
      targetTruckId: targetTruck.id,
      targetTruckName: targetTruck.nombre,
      count: unplacedPackages.length,
      codes: unplacedPackages.map((item) => item.codigo),
    });
    return true;
  };

  const runSimulation = async () => {
    if (!selectedTruckId || status === 'ORDERING') return;
    if (!packageLimit) {
      setError(packageLimitError || 'Cantidad de paquetes invalida.');
      return;
    }
    setStatus('ORDERING');
    setError('');
    setPlacementCursor(0);

    try {
      const payload = { truck_id: selectedTruckId, package_limit: packageLimit, allow_rotation: true };
      const result = await optimizationPocService.runAlgorithm(payload, activeAlgorithm.id);
      if (!result?.placements?.length) {
        setSimulation(result);
        setPlacementCursor(0);
        showHandoffPromptIfNeeded(result, selectedTruckId);
        setError('El algoritmo no devolvio coordenadas para renderizar.');
        setStatus('ERROR');
        return;
      }
      setSimulation(result);
      setPlacementCursor(1);
      setStatus('ORDERED');
      showHandoffPromptIfNeeded(result, selectedTruckId);
    } catch (runError) {
      setError(getApiErrorMessage(runError, 'No se pudo ejecutar la simulacion PoC.'));
      setStatus('ERROR');
    }
  };

  const runHandoffSimulation = async () => {
    if (!handoffPrompt?.codes?.length || status === 'ORDERING') return;
    setStatus('ORDERING');
    setError('');
    setPlacementCursor(0);

    try {
      const payload = {
        truck_id: handoffPrompt.targetTruckId,
        package_limit: handoffPrompt.codes.length,
        package_codes: handoffPrompt.codes,
        allow_rotation: true,
      };
      const result = await optimizationPocService.runAlgorithm(payload, activeAlgorithm.id);
      setSelectedTruckId(handoffPrompt.targetTruckId);
      setSimulation(result);
      setPlacementCursor(result?.placements?.length ? 1 : 0);
      setStatus(result?.placements?.length ? 'ORDERED' : 'ERROR');
      setHandoffPrompt(null);

      if (!result?.placements?.length) {
        setError('El Camion B tampoco devolvio coordenadas para estos paquetes.');
        return;
      }

      showHandoffPromptIfNeeded(result, handoffPrompt.targetTruckId);
    } catch (runError) {
      setError(getApiErrorMessage(runError, 'No se pudo ejecutar la simulacion en Camion B.'));
      setStatus('ERROR');
    }
  };

  const handleAlgorithmChange = (event) => {
    setAlgorithmId(event.target.value);
    resetSimulation();
  };

  const handleTruckChange = (event) => {
    setSelectedTruckId(event.target.value);
    resetSimulation();
  };

  const handlePackageLimitChange = (event) => {
    setPackageLimitInput(event.target.value);
    resetSimulation();
  };

  const goToPreviousPlacement = () => {
    if (!simulation) return;
    setPlacementCursor((current) => Math.max(1, current - 1));
    setStatus('LOADING');
  };

  const goToNextPlacement = () => {
    if (!simulation) return;
    setPlacementCursor((current) => {
      const next = Math.min(orderedPlacements.length, current + 1);
      setStatus(next >= orderedPlacements.length ? 'COMPLETED' : 'LOADING');
      return next;
    });
  };

  const downloadResult = () => {
    if (!simulation) return;
    const blob = new Blob([JSON.stringify(simulation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${simulation.simulation_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen rounded-xl bg-[#F8F9FA] text-[#212529]">
      <header className="rounded-xl bg-gradient-to-r from-[#1f4d2f] via-[#2f6b3e] to-[#3C5940] p-5 text-white shadow-soft">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/20">
              <Truck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-[#A3CF84]">Carmencita Express Cargo</p>
              <h1 className="text-2xl font-black tracking-tight">Simulacion de optimizacion de carga 3D</h1>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <HeaderBadge label="Algoritmo" value={activeAlgorithm.label} />
            <HeaderBadge label="Camiones disponibles" value={scenario?.trucks?.length || 0} />
            <HeaderBadge label="Camion seleccionado" value={selectedTruck?.nombre || '-'} />
            <HeaderBadge label="Estado" value={STATUS_LABELS[status]} />
          </div>
        </div>
      </header>

      <main className="mt-5 grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)_370px]">
        <section className="rounded-xl border border-[#E4ECE2] bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <PackageOpen className="h-5 w-5 text-[#28A745]" />
              Lista de paquetes
            </h2>
            <span className="rounded-full bg-[#E4ECE2] px-3 py-1 text-xs font-black text-[#3C5940]">{selectedTruck?.nombre}</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            <select
              className="min-h-11 rounded-md border border-[#d9e7d4] bg-white px-3 text-sm font-bold"
              value={selectedTruckId}
              onChange={handleTruckChange}
              disabled={status === 'ORDERING'}
            >
              {scenario?.trucks?.map((truck) => (
                <option key={truck.id} value={truck.id}>
                  {truck.nombre}
                </option>
              ))}
            </select>
            <select
              className="min-h-11 rounded-md border border-[#d9e7d4] bg-white px-3 text-sm font-bold"
              value={algorithmId}
              onChange={handleAlgorithmChange}
              disabled={status === 'ORDERING'}
            >
              {Object.values(OPTIMIZATION_ALGORITHMS).map((algorithm) => (
                <option key={algorithm.id} value={algorithm.id}>
                  {algorithm.label}
                </option>
              ))}
            </select>
            <label className="flex flex-col gap-1 text-xs font-black uppercase text-[#3C5940]">
              Cantidad de paquetes
              <input
                type="number"
                min="1"
                max={MAX_PACKAGE_LIMIT}
                step="1"
                className={`min-h-11 rounded-md border bg-white px-3 text-sm font-bold text-[#212529] outline-none transition focus:ring-2 ${
                  packageLimitError
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-[#d9e7d4] focus:border-[#28A745] focus:ring-[#E4ECE2]'
                }`}
                value={packageLimitInput}
                onChange={handlePackageLimitChange}
                disabled={status === 'ORDERING'}
              />
              <span className={packageLimitError ? 'text-red-600' : 'text-[#6C757D]'}>
                {packageLimitError || `Puedes probar entre 1 y ${MAX_PACKAGE_LIMIT}.`}
              </span>
            </label>
          </div>

          <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {visiblePackages.map((item, index) => {
              const placement = orderedPlacements.find((placed) => placed.package_id === item.id);
              const loaded = loadedCodes.includes(item.codigo);
              const expected = currentPlacement?.codigo === item.codigo;
              return (
                <div
                  key={item.codigo}
                  className={`rounded-lg border p-3 text-sm transition ${
                    expected
                      ? 'border-[#28A745] bg-[#E4ECE2]'
                      : loaded
                        ? 'border-[#A3CF84] bg-[#A3CF84]/20'
                        : 'border-gray-100 bg-white hover:border-[#A3CF84]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-[#212529]">#{placement?.loading_sequence || index + 1} {item.codigo}</p>
                      <p className="mt-1 text-xs font-semibold text-[#6C757D]">{item.destino}</p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-[#3C5940]">{item.fragilidad}</span>
                  </div>
                  <p className="mt-2 text-xs text-[#6C757D]">
                    Orden entrega {item.orden_entrega} - {formatDimensions(item)} - {item.peso_kg} kg
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-[#E4ECE2] bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Box className="h-5 w-5 text-[#28A745]" />
              Diagrama de orden y acomodo
            </h2>
            <div className="flex flex-wrap gap-2">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`rounded-md px-3 py-2 text-xs font-black transition ${
                    viewMode === mode.id ? 'bg-[#28A745] text-white' : 'border border-[#d9e7d4] bg-white text-[#3C5940]'
                  }`}
                  onClick={() => setViewMode(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative mt-4">
            {isSceneExpanded ? (
              <div className="flex h-[520px] items-center justify-center rounded-lg border border-[#d9e7d4] bg-[#F8F9FA] text-sm font-bold text-[#6C757D]">
                La escena se muestra en la vista ampliada.
              </div>
            ) : (
              <PackingScene3D
                truck={selectedTruck}
                placements={renderedPlacements}
                loadedCodes={loadedCodes}
                expectedCode={currentPlacement?.codigo}
                viewMode={viewMode}
              />
            )}
            <button
              type="button"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-md border border-[#d9e7d4] bg-white/95 text-[#3C5940] shadow-sm transition hover:border-[#28A745] hover:text-[#28A745]"
              onClick={() => setIsSceneExpanded(true)}
              aria-label="Ampliar render 3D"
              title="Ampliar render 3D"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-3 rounded-lg bg-[#E4ECE2] p-3 text-sm font-semibold text-[#3C5940]">
            Las coordenadas X/Y/Z vienen del backend. Renderizados: {renderedPlacements.length} de {orderedPlacements.length} paquetes con {activeAlgorithm.label}.
          </p>
        </section>

        <aside className="space-y-5">
          <ProgressPanel
            currentPlacement={currentPlacement}
            pendingCount={pendingCount}
            simulation={simulation}
            placementCursor={placementCursor}
            orderedPlacements={orderedPlacements}
            handoffPrompt={handoffPrompt}
            canShowHandoffPrompt={canShowHandoffPrompt}
            onPrevious={goToPreviousPlacement}
            onNext={goToNextPlacement}
            onOpenHandoff={() => setStatus('COMPLETED')}
          />

          <section className="rounded-xl border border-[#E4ECE2] bg-white p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
              <Flag className="h-5 w-5 text-[#28A745]" />
              Metricas
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <MetricCard icon={Clock} label="Ejecucion" value={`${simulation?.metrics?.execution_ms || 0} ms`} />
              <MetricCard icon={Box} label="Uso volumetrico" value={`${simulation?.metrics?.utilization_percent || 0}%`} accent />
              <MetricCard icon={PackageCheck} label="Colocados" value={`${placementCursor} / ${simulation?.metrics?.placed_count || 0}`} />
              <MetricCard icon={AlertTriangle} label="No acomodados" value={simulation?.metrics?.unplaced_count || 0} />
              <MetricCard icon={Truck} label="Peso total" value={`${simulation?.metrics?.total_weight_kg || 0} kg`} />
              <MetricCard icon={CheckCircle2} label="Violaciones" value={(simulation?.metrics?.overlap_violations || 0) + (simulation?.metrics?.boundary_violations || 0)} />
            </div>
            <button
              type="button"
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#A3CF84] px-4 text-sm font-black text-[#3C5940] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={downloadResult}
              disabled={!simulation}
            >
              <Download className="h-4 w-4" />
              Descargar JSON
            </button>
          </section>
        </aside>
      </main>

      {error && <div className="mt-5 rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      {canShowHandoffPrompt && (
        <HandoffPromptModal
          prompt={handoffPrompt}
          status={status}
          onCancel={() => setHandoffPrompt(null)}
          onConfirm={runHandoffSimulation}
        />
      )}

      <footer className="sticky bottom-0 mt-5 rounded-xl border border-[#E4ECE2] bg-white/95 p-4 shadow-soft backdrop-blur">
        <div className="grid gap-3 md:grid-cols-4">
          <ActionButton icon={RefreshCw} label="Restablecer" onClick={resetSimulation} />
          <ActionButton icon={PackageCheck} label={status === 'ORDERING' ? 'Ordenando...' : 'Ordenar'} onClick={runSimulation} primary disabled={status === 'ORDERING'} />
          <ActionButton icon={Clock} label="Simular cierre automatico" onClick={runSimulation} disabled={status === 'ORDERING'} />
          <ActionButton icon={Flag} label="Finalizar" onClick={() => setStatus('COMPLETED')} disabled={!simulation} primary />
        </div>
      </footer>

      {isSceneExpanded && (
        <div className="fixed inset-0 z-50 bg-[#212529]/90 p-4">
          <div className="mx-auto flex h-full max-w-7xl flex-col rounded-xl border border-[#E4ECE2] bg-white p-4 shadow-2xl">
            <div className="flex flex-col gap-3 border-b border-[#E4ECE2] pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-[#28A745]">Vista ampliada</p>
                <h2 className="text-xl font-black text-[#212529]">Diagrama de orden y acomodo</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {VIEW_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={`rounded-md px-3 py-2 text-xs font-black transition ${
                      viewMode === mode.id ? 'bg-[#28A745] text-white' : 'border border-[#d9e7d4] bg-white text-[#3C5940]'
                    }`}
                    onClick={() => setViewMode(mode.id)}
                  >
                    {mode.label}
                  </button>
                ))}
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d9e7d4] bg-white text-[#3C5940] transition hover:border-red-300 hover:text-red-600"
                  onClick={() => setIsSceneExpanded(false)}
                  aria-label="Cerrar vista ampliada"
                  title="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 py-4">
              <PackingScene3D
                truck={selectedTruck}
                placements={renderedPlacements}
                loadedCodes={loadedCodes}
                expectedCode={currentPlacement?.codigo}
                viewMode={viewMode}
                className="h-full min-h-[420px]"
                expanded
              />
            </div>

            <div className="grid gap-3 border-t border-[#E4ECE2] pt-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <StepButton label="Anterior" icon={ChevronLeft} onClick={goToPreviousPlacement} disabled={!simulation || placementCursor <= 1} />
              <div className="rounded-lg bg-[#E4ECE2] px-4 py-3 text-center text-sm font-black text-[#3C5940]">
                {currentPlacement?.codigo || '-'} - {placementCursor} / {orderedPlacements.length || 0}
              </div>
              <StepButton label="Siguiente" icon={ChevronRight} onClick={goToNextPlacement} disabled={!simulation || placementCursor >= orderedPlacements.length} primary />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HandoffPromptModal({ prompt, status, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#212529]/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[#A3CF84] bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E4ECE2] text-[#28A745]">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-[#28A745]">Box lleno</p>
            <h3 className="mt-1 text-lg font-black text-[#212529]">Pasar paquetes restantes a {prompt.targetTruckName}</h3>
            <p className="mt-2 text-sm font-semibold text-[#6C757D]">
              No se acomodaron {prompt.count} paquetes en el camion actual. Puedes ejecutar una nueva simulacion solo con esos paquetes restantes.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-[#F8F9FA] p-3 text-xs font-bold text-[#3C5940]">
          Paquetes restantes: {prompt.codes.join(', ')}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="min-h-11 rounded-md border border-[#A3CF84] bg-white px-4 text-sm font-black text-[#3C5940]"
            onClick={onCancel}
            disabled={status === 'ORDERING'}
          >
            Mantener resultado
          </button>
          <button
            type="button"
            className="min-h-11 rounded-md bg-[#28A745] px-4 text-sm font-black text-white shadow-[0_12px_24px_rgba(40,167,69,0.22)] disabled:opacity-60"
            onClick={onConfirm}
            disabled={status === 'ORDERING'}
          >
            {status === 'ORDERING' ? 'Ordenando...' : 'Pasar a Camion B'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressPanel({
  currentPlacement,
  pendingCount,
  simulation,
  placementCursor,
  orderedPlacements,
  handoffPrompt,
  canShowHandoffPrompt,
  onPrevious,
  onNext,
  onOpenHandoff,
}) {
  return (
    <section className="rounded-xl border border-[#E4ECE2] bg-white p-5 shadow-soft">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
        <PackageCheck className="h-5 w-5 text-[#28A745]" />
        Avance de acomodo
      </h2>
      <div className="rounded-lg border border-[#A3CF84] bg-[#F8F9FA] p-4">
        <p className="text-xs font-black uppercase text-[#6C757D]">Paquete actual</p>
        <p className="mt-2 text-2xl font-black text-[#212529]">{currentPlacement?.codigo || '-'}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-bold text-[#3C5940]">
          <span className="rounded bg-white px-2 py-2">Secuencia: {currentPlacement?.loading_sequence || '-'}</span>
          <span className="rounded bg-white px-2 py-2">Pendientes: {pendingCount}</span>
        </div>
        <p className="mt-3 text-sm font-semibold text-[#6C757D]">{currentPlacement?.destination || 'Ejecuta Ordenar para iniciar el acomodo.'}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StepButton label="Anterior" icon={ChevronLeft} onClick={onPrevious} disabled={!simulation || placementCursor <= 1} />
        <StepButton label="Siguiente" icon={ChevronRight} onClick={onNext} disabled={!simulation || placementCursor >= orderedPlacements.length} primary />
      </div>
      {handoffPrompt && !canShowHandoffPrompt && (
        <div className="mt-4 rounded-lg border border-[#A3CF84] bg-[#E4ECE2] p-3 text-xs font-bold text-[#3C5940]">
          Hay {handoffPrompt.count} paquetes para {handoffPrompt.targetTruckName}. Termina de avanzar el acomodo actual para habilitar el pase.
        </div>
      )}
      {canShowHandoffPrompt && (
        <button
          type="button"
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#28A745] px-4 text-sm font-black text-white shadow-[0_12px_24px_rgba(40,167,69,0.22)]"
          onClick={onOpenHandoff}
        >
          <Truck className="h-4 w-4" />
          Pasar restantes a {handoffPrompt.targetTruckName}
        </button>
      )}
    </section>
  );
}

function HeaderBadge({ label, value }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3">
      <p className="text-xs font-bold text-white/75">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, primary = false, disabled = false }) {
  return (
    <button
      type="button"
      className={`flex min-h-14 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
        primary ? 'bg-[#28A745] text-white shadow-[0_12px_24px_rgba(40,167,69,0.25)]' : 'border border-[#A3CF84] bg-white text-[#3C5940]'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {label}
    </button>
  );
}

function StepButton({ icon: Icon, label, onClick, primary = false, disabled = false }) {
  return (
    <button
      type="button"
      className={`flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50 ${
        primary ? 'bg-[#28A745] text-white' : 'border border-[#A3CF84] bg-white text-[#3C5940]'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}
