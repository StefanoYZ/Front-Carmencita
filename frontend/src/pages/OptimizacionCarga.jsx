import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  Clock,
  Download,
  Flag,
  PackageCheck,
  PackageOpen,
  QrCode,
  RefreshCw,
  ScanLine,
  Truck,
} from 'lucide-react';
import PackingScene3D from '../components/optimization-poc/PackingScene3D.jsx';
import MetricCard from '../components/optimization-poc/MetricCard.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { optimizationPocService } from '../services/optimizationPocService.js';

const STATUS_LABELS = {
  IDLE: 'Sin ordenar',
  ORDERING: 'Ordenando',
  ORDERED: 'Listo para cargar',
  LOADING: 'Carga en progreso',
  COMPLETED: 'Finalizado',
  ERROR: 'Error',
};

function formatDimensions(item) {
  const length = item.largo_cm ?? item.depth;
  const width = item.ancho_cm ?? item.width;
  const height = item.alto_cm ?? item.height;
  return `${length} x ${width} x ${height} cm`;
}

function formatAlgorithm(strategy) {
  return strategy === 'MAXIMIN' ? 'Maximin' : 'Minimax';
}

export default function OptimizacionCarga() {
  const [scenario, setScenario] = useState(null);
  const [selectedTruckId, setSelectedTruckId] = useState('CAMION_A');
  const [strategy, setStrategy] = useState('MINIMAX');
  const [status, setStatus] = useState('IDLE');
  const [simulation, setSimulation] = useState(null);
  const [loadedCodes, setLoadedCodes] = useState([]);
  const [error, setError] = useState('');
  const [wrongScan, setWrongScan] = useState(null);

  useEffect(() => {
    let mounted = true;
    optimizationPocService
      .getScenario(50)
      .then((data) => {
        if (mounted) setScenario(data);
      })
      .catch((loadError) => {
        if (mounted) {
          setError(getApiErrorMessage(loadError, 'No se pudo cargar el escenario PoC.'));
          setStatus('ERROR');
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const selectedTruck = useMemo(
    () => scenario?.trucks?.find((truck) => truck.id === selectedTruckId) || scenario?.trucks?.[0],
    [scenario, selectedTruckId],
  );

  const orderedPlacements = useMemo(
    () => [...(simulation?.placements || [])].sort((a, b) => a.loading_sequence - b.loading_sequence),
    [simulation],
  );

  const expectedPackage = orderedPlacements.find((item) => !loadedCodes.includes(item.codigo));
  const pendingCount = Math.max((simulation?.metrics?.placed_count || 0) - loadedCodes.length, 0);

  const runSimulation = async () => {
    if (!selectedTruckId || status === 'ORDERING') return;
    setStatus('ORDERING');
    setError('');
    setLoadedCodes([]);
    setWrongScan(null);
    try {
      const payload = { truck_id: selectedTruckId, package_limit: 50, allow_rotation: true, strategy };
      const result = await optimizationPocService.runMinimaxMaximin(payload);
      setSimulation(result);
      setStatus('ORDERED');
    } catch (runError) {
      setError(getApiErrorMessage(runError, 'No se pudo ejecutar la simulacion PoC.'));
      setStatus('ERROR');
    }
  };

  const resetSimulation = () => {
    setSimulation(null);
    setLoadedCodes([]);
    setWrongScan(null);
    setStatus('IDLE');
    setError('');
  };

  const simulateQrCorrect = () => {
    if (!expectedPackage) return;
    setLoadedCodes((current) => {
      const next = [...current, expectedPackage.codigo];
      setStatus(next.length >= orderedPlacements.length ? 'COMPLETED' : 'LOADING');
      return next;
    });
  };

  const simulateQrIncorrect = () => {
    if (!expectedPackage || orderedPlacements.length < 2) return;
    const scanned = orderedPlacements.find((item) => item.codigo !== expectedPackage.codigo) || orderedPlacements[0];
    setWrongScan({ expected: expectedPackage, scanned });
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

  const visiblePackages = simulation ? simulation.ordered_packages : scenario?.packages || [];

  return (
    <div className="min-h-screen rounded-xl bg-[#F8F9FA] text-[#212529]">
      <header className="rounded-xl bg-gradient-to-r from-[#1f4d2f] via-[#2f6b3e] to-[#3C5940] p-5 text-white shadow-soft">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/20">
              <Truck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#A3CF84]">Carmencita Express Cargo</p>
              <h1 className="text-2xl font-black tracking-tight">Simulacion de optimizacion de carga 3D</h1>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <HeaderBadge label="Algoritmo" value={formatAlgorithm(strategy)} />
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
              onChange={(event) => setSelectedTruckId(event.target.value)}
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
              value={strategy}
              onChange={(event) => setStrategy(event.target.value)}
              disabled={status === 'ORDERING'}
            >
              <option value="MINIMAX">MINIMAX</option>
              <option value="MAXIMIN">MAXIMIN</option>
            </select>
          </div>

          <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {visiblePackages.map((item, index) => {
              const placement = orderedPlacements.find((placed) => placed.package_id === item.id);
              const code = item.codigo;
              const loaded = loadedCodes.includes(code);
              const expected = expectedPackage?.codigo === code;
              return (
                <div
                  key={code}
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
                      <p className="font-black text-[#212529]">
                        #{placement?.loading_sequence || index + 1} {code}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#6C757D]">{item.destino}</p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-[#3C5940]">{item.fragilidad}</span>
                  </div>
                  <p className="mt-2 text-xs text-[#6C757D]">
                    Orden entrega {item.orden_entrega} · {formatDimensions(item)} · {item.peso_kg} kg
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
              <button className="rounded-md bg-[#28A745] px-3 py-2 text-xs font-black text-white">Isometrica</button>
              <button className="rounded-md border border-[#d9e7d4] px-3 py-2 text-xs font-black text-[#3C5940]">Superior</button>
              <button className="rounded-md border border-[#d9e7d4] px-3 py-2 text-xs font-black text-[#3C5940]">Frontal</button>
            </div>
          </div>
          <div className="mt-4">
            <PackingScene3D truck={selectedTruck} placements={orderedPlacements} loadedCodes={loadedCodes} expectedCode={expectedPackage?.codigo} />
          </div>
          <p className="mt-3 rounded-lg bg-[#E4ECE2] p-3 text-sm font-semibold text-[#3C5940]">
            Las coordenadas X/Y/Z vienen del backend. La escena solo representa el resultado calculado por la PoC.
          </p>
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl border border-[#E4ECE2] bg-white p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
              <Flag className="h-5 w-5 text-[#28A745]" />
              Metricas
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <MetricCard icon={Clock} label="Ejecucion" value={`${simulation?.metrics?.execution_ms || 0} ms`} />
              <MetricCard icon={Box} label="Uso volumetrico" value={`${simulation?.metrics?.utilization_percent || 0}%`} accent />
              <MetricCard icon={PackageCheck} label="Colocados" value={`${loadedCodes.length} / ${simulation?.metrics?.placed_count || 0}`} />
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

          <section className="rounded-xl border border-[#E4ECE2] bg-white p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
              <QrCode className="h-5 w-5 text-[#28A745]" />
              Simulacion QR
            </h2>
            <div className="rounded-lg border border-dashed border-[#A3CF84] bg-[#F8F9FA] p-4 text-center">
              <ScanLine className="mx-auto h-12 w-12 text-[#3C5940]" />
              <p className="mt-2 text-sm font-bold">Esperado: {expectedPackage?.codigo || '-'}</p>
              <p className="text-xs text-[#6C757D]">Pendientes: {pendingCount}</p>
            </div>
            <div className="mt-4 grid gap-3">
              <button className="min-h-11 rounded-md bg-[#28A745] px-4 text-sm font-black text-white disabled:opacity-50" onClick={simulateQrCorrect} disabled={!expectedPackage}>
                Simular QR correcto
              </button>
              <button className="min-h-11 rounded-md border border-red-300 bg-red-50 px-4 text-sm font-black text-red-700 disabled:opacity-50" onClick={simulateQrIncorrect} disabled={!expectedPackage}>
                Simular QR incorrecto
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-[#E4ECE2] bg-[#E4ECE2] p-5">
            <p className="text-sm font-black text-[#3C5940]">Cierre del registro: 7:00 p. m.</p>
            <p className="mt-2 text-sm text-[#3C5940]">En esta PoC el cierre automatico ejecuta el mismo flujo del boton Ordenar.</p>
          </section>
        </aside>
      </main>

      {error && <div className="mt-5 rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      <footer className="sticky bottom-0 mt-5 rounded-xl border border-[#E4ECE2] bg-white/95 p-4 shadow-soft backdrop-blur">
        <div className="grid gap-3 md:grid-cols-4">
          <ActionButton icon={RefreshCw} label="Restablecer" onClick={resetSimulation} />
          <ActionButton icon={PackageCheck} label={status === 'ORDERING' ? 'Ordenando...' : 'Ordenar'} onClick={runSimulation} primary disabled={status === 'ORDERING'} />
          <ActionButton icon={Clock} label="Simular cierre automatico" onClick={runSimulation} disabled={status === 'ORDERING'} />
          <ActionButton icon={Flag} label="Finalizar" onClick={() => setStatus('COMPLETED')} disabled={!simulation} primary />
        </div>
      </footer>

      {wrongScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="text-xl font-black text-[#212529]">Paquete fuera de orden</h3>
                <p className="mt-2 text-sm text-[#6C757D]">El paquete escaneado no corresponde al orden calculado por el algoritmo.</p>
              </div>
            </div>
            <div className="mt-5 rounded-lg bg-[#F8F9FA] p-4 text-sm">
              <p>
                <strong>Esperado:</strong> {wrongScan.expected.codigo}
              </p>
              <p>
                <strong>Escaneado:</strong> {wrongScan.scanned.codigo}
              </p>
              <p>
                <strong>Destino:</strong> {wrongScan.expected.destination}
              </p>
            </div>
            <button className="mt-5 min-h-11 w-full rounded-md bg-[#28A745] px-4 text-sm font-black text-white" onClick={() => setWrongScan(null)}>
              Cerrar y continuar
            </button>
          </div>
        </div>
      )}
    </div>
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
