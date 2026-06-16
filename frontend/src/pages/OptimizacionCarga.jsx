import React, { useEffect, useState } from 'react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Truck3D from '../components/optimization/Truck3D.jsx';
import OptimizationMetrics from '../components/optimization/OptimizationMetrics.jsx';
import ComparisonTable from '../components/optimization/ComparisonTable.jsx';
import { optimizacionService } from '../services/optimizacion.service.js';

function OptimizacionCarga() {
  const [resultado, setResultado] = useState(null);
  const [comparacion, setComparacion] = useState(null);
  const [escenario, setEscenario] = useState(null);
  const [algorithm, setAlgorithm] = useState('bfd3d');
  const [loading, setLoading] = useState(false);
  const [loadingCompare, setLoadingCompare] = useState(false);

  const reasonLabels = {
    NO_SPACE: 'Sin espacio',
    WEIGHT_LIMIT: 'Exceso de peso',
    DESTINATION_CONSTRAINT: 'Restricción de destino',
    STACKING_CONSTRAINT: 'Restricción de estiba',
    STABILITY_CONSTRAINT: 'Restricción de estabilidad',
    ALGORITHM_LIMIT: 'Límite del algoritmo',
  };

  useEffect(() => {
    const cargarEscenario = async () => {
      try {
        const sample = await optimizacionService.obtenerEscenario();
        setEscenario(sample);
      } catch (error) {
        console.warn('No hay escenario guardado todavía:', error.message);
      }
    };

    cargarEscenario();
  }, []);

  const handleOptimize = async () => {
    try {
      setLoading(true);

      const { sample, result } =
        await optimizacionService.optimizarCarga(algorithm);

      setEscenario(sample);
      setResultado(result);
      setComparacion(null);
    } catch (error) {
      console.error('Error al optimizar carga:', error);
      alert('Error al optimizar la carga. Revisa si existe un escenario guardado en Swagger.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    try {
      setLoadingCompare(true);

      const { sample, comparison } =
        await optimizacionService.compararAlgoritmos();

      setEscenario(sample);
      setComparacion(comparison);
    } catch (error) {
      console.error('Error al comparar algoritmos:', error);
      alert('Error al comparar algoritmos. Revisa si existe un escenario guardado en Swagger.');
    } finally {
      setLoadingCompare(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Optimización de carga</h2>
          <p className="page-subtitle">
            Simulación 3D con Worst Fit, BFD3D y Backtracking Logístico.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="worst_fit">Worst Fit Clásico</option>
            <option value="bfd3d">BFD3D Logístico</option>
            <option value="backtracking">Backtracking Logístico</option>
          </select>

          <Button onClick={handleOptimize} disabled={loading}>
            {loading ? 'Optimizando...' : 'Optimizar carga'}
          </Button>

          <Button onClick={handleCompare} disabled={loadingCompare}>
            {loadingCompare ? 'Comparando...' : 'Comparar algoritmos'}
          </Button>
        </div>
      </div>

      {escenario && (
        <Card>
          <h3 className="font-semibold text-brand-black">
            Paquetes del escenario guardado
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Ruta: {escenario.route} | Origen:{' '}
            {escenario.origin_agency || 'TRUJILLO'} | Camión:{' '}
            {escenario.truck?.width} × {escenario.truck?.height} ×{' '}
            {escenario.truck?.length}
          </p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-white">
                  <th className="border px-3 py-2">ID</th>
                  <th className="border px-3 py-2">Destino</th>
                  <th className="border px-3 py-2">Fragilidad</th>
                  <th className="border px-3 py-2">Peso</th>
                  <th className="border px-3 py-2">Dimensiones</th>
                  <th className="border px-3 py-2">Contenido</th>
                </tr>
              </thead>

              <tbody>
                {escenario.packages?.map((pkg) => (
                  <tr key={pkg.id} className="bg-white">
                    <td className="border px-3 py-2">{pkg.id}</td>
                    <td className="border px-3 py-2">{pkg.destination}</td>
                    <td className="border px-3 py-2">{pkg.fragility}</td>
                    <td className="border px-3 py-2">{pkg.weight} kg</td>
                    <td className="border px-3 py-2">
                      {pkg.width} × {pkg.height} × {pkg.length}
                    </td>
                    <td className="border px-3 py-2">{pkg.content_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {comparacion && (
        <Card>
          <h3 className="font-semibold text-brand-black">
            Comparación de algoritmos
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Ruta evaluada: {comparacion.route}
          </p>

          <div className="mt-4">
            <ComparisonTable data={comparacion.comparison_table} />
          </div>
        </Card>
      )}

      {resultado && (
        <>
          <Card className="border-green-200 bg-green-50">
            <p className="text-sm text-green-700">
              Resultado de optimización
            </p>

            <div className="mt-4">
              <OptimizationMetrics result={resultado} />
            </div>

            {resultado.controlled_rotation_applied && (
              <div className="mt-4 rounded-lg border border-green-200 bg-white p-3 text-sm text-gray-600">
                <p className="font-medium text-brand-black">
                  Estrategia logística aplicada
                </p>
                <p className="mt-1">
                  El algoritmo organiza la carga por destino, aprovecha el espacio
                  disponible y aplica rotaciones controladas según fragilidad y
                  tipo de contenido, respetando peso, estiba y estabilidad.
                </p>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-3">
              <h3 className="font-semibold text-brand-black">
                Visualización 3D de carga
              </h3>

              <p className="text-sm text-gray-500">
                Colores: rojo = alta fragilidad, amarillo = media, verde = baja.
                ↺ indica rotación permitida por el algoritmo.
              </p>
            </div>

            <Truck3D
              truck={escenario?.truck}
              packages={resultado.placed_packages || []}
              animate
            />
          </Card>

          <Card>
            <h3 className="font-semibold text-brand-black">
              Paquetes colocados
            </h3>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-white">
                    <th className="border px-3 py-2">Orden carga</th>
                    <th className="border px-3 py-2">ID</th>
                    <th className="border px-3 py-2">Destino</th>
                    <th className="border px-3 py-2">Fragilidad</th>
                    <th className="border px-3 py-2">X</th>
                    <th className="border px-3 py-2">Y</th>
                    <th className="border px-3 py-2">Z</th>
                    <th className="border px-3 py-2">Dimensiones</th>
                    <th className="border px-3 py-2">Rotación</th>
                    <th className="border px-3 py-2">Política rotación</th>
                    <th className="border px-3 py-2">Soporte</th>
                  </tr>
                </thead>

                <tbody>
                  {resultado.placed_packages?.map((pkg, index) => (
                    <tr key={pkg.id} className="bg-white">
                      <td className="border px-3 py-2 text-center font-medium">
                        {index + 1}
                      </td>

                      <td className="border px-3 py-2">{pkg.id}</td>
                      <td className="border px-3 py-2">{pkg.destination}</td>
                      <td className="border px-3 py-2">{pkg.fragility}</td>
                      <td className="border px-3 py-2">{pkg.x}</td>
                      <td className="border px-3 py-2">{pkg.y}</td>
                      <td className="border px-3 py-2">{pkg.z}</td>

                      <td className="border px-3 py-2">
                        {pkg.width} × {pkg.height} × {pkg.length}
                      </td>

                      <td className="border px-3 py-2">
                        {pkg.rotated
                          ? `↺ ${pkg.original_width}×${pkg.original_height}×${pkg.original_length} → ${pkg.width}×${pkg.height}×${pkg.length}`
                          : 'Sin rotación'}
                      </td>

                      <td className="border px-3 py-2">
                        {pkg.rotation_policy || 'N/A'}
                      </td>

                      <td className="border px-3 py-2">
                        {pkg.support_ratio !== undefined
                          ? `${Math.round(pkg.support_ratio * 100)}%`
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {resultado.unplaced_packages?.length > 0 && (
            <Card>
              <h3 className="font-semibold text-brand-black">
                Paquetes no colocados
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Lista de paquetes que no pudieron cargarse y el motivo
                reportado por el algoritmo.
              </p>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-white">
                      <th className="border px-3 py-2">ID</th>
                      <th className="border px-3 py-2">Tipo de rechazo</th>
                      <th className="border px-3 py-2">Motivo</th>
                    </tr>
                  </thead>

                  <tbody>
                    {resultado.unplaced_packages.map((pkg) => (
                      <tr key={pkg.id} className="bg-white">
                        <td className="border px-3 py-2 font-medium">
                          {pkg.id}
                        </td>

                        <td className="border px-3 py-2">
                          {reasonLabels[pkg.reason_code] ||
                            pkg.reason_code ||
                            'Desconocido'}
                        </td>

                        <td className="border px-3 py-2">
                          {pkg.reason || 'No se especificó el motivo'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default OptimizacionCarga;