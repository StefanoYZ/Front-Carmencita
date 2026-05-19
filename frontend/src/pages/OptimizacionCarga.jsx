import React from 'react';
import { useState } from 'react';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import { paquetesMock } from '../data/mockData.js';
import { optimizacionService } from '../services/optimizacion.service.js';

const columns = [
  { header: 'Codigo', accessor: 'id' },
  { header: 'Descripcion', accessor: 'descripcion' },
  { header: 'Peso', accessor: 'peso', cell: (row) => `${row.peso} kg` },
  { header: 'Volumen', accessor: 'volumen' },
  { header: 'Prioridad', accessor: 'prioridad', cell: (row) => <Badge tone={row.prioridad === 'Alta' ? 'amber' : 'gray'}>{row.prioridad}</Badge> },
];

function OptimizacionCarga() {
  const [resultado, setResultado] = useState(null);

  const handleOptimize = async () => {
    setResultado(await optimizacionService.optimizarCarga());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Optimizacion de carga</h2>
          <p className="page-subtitle">Simulacion de aprovechamiento volumetrico.</p>
        </div>
        <Button onClick={handleOptimize}>Optimizar carga</Button>
      </div>

      <DataTable columns={columns} data={paquetesMock} />

      {resultado && (
        <Card className="border-green-200 bg-green-50">
          <p className="text-sm text-green-700">Aprovechamiento volumetrico</p>
          <strong className="mt-2 block text-3xl text-brand-black">{resultado.aprovechamiento}%</strong>
          <p className="mt-2 text-sm text-gray-600">{resultado.recomendacion}</p>
        </Card>
      )}
    </div>
  );
}

export default OptimizacionCarga;
