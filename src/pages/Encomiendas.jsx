import React from 'react';
import { useState } from 'react';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import { encomiendasMock } from '../data/mockData.js';

const initialForm = {
  remitente: '',
  destinatario: '',
  descripcion: '',
  peso: '',
  largo: '',
  ancho: '',
  alto: '',
  fragilidad: 'Media',
  destino: '',
};

const columns = [
  { header: 'Codigo', accessor: 'id' },
  { header: 'Remitente', accessor: 'remitente' },
  { header: 'Destinatario', accessor: 'destinatario' },
  { header: 'Destino', accessor: 'destino' },
  { header: 'Peso', accessor: 'peso', cell: (row) => `${row.peso} kg` },
  { header: 'Estado', accessor: 'estado', cell: (row) => <Badge tone="amber">{row.estado}</Badge> },
];

function Encomiendas() {
  const [form, setForm] = useState(initialForm);
  const [rows, setRows] = useState(encomiendasMock);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setRows((current) => [
      {
        id: `ENC-${String(current.length + 1).padStart(3, '0')}`,
        remitente: form.remitente,
        destinatario: form.destinatario,
        destino: form.destino,
        peso: form.peso,
        estado: 'Registrada',
      },
      ...current,
    ]);
    setForm(initialForm);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Encomiendas</h2>
        <p className="page-subtitle">Registro simulado listo para migrar a FastAPI.</p>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleSubmit}>
          <Input label="Remitente" name="remitente" value={form.remitente} onChange={updateField} required />
          <Input label="Destinatario" name="destinatario" value={form.destinatario} onChange={updateField} required />
          <Input label="Descripcion" name="descripcion" value={form.descripcion} onChange={updateField} required />
          <Input label="Peso (kg)" name="peso" type="number" min="0" step="0.1" value={form.peso} onChange={updateField} required />
          <Input label="Largo (cm)" name="largo" type="number" min="0" value={form.largo} onChange={updateField} />
          <Input label="Ancho (cm)" name="ancho" type="number" min="0" value={form.ancho} onChange={updateField} />
          <Input label="Alto (cm)" name="alto" type="number" min="0" value={form.alto} onChange={updateField} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Fragilidad</span>
            <select
              name="fragilidad"
              value={form.fragilidad}
              onChange={updateField}
              className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-green-100"
            >
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
            </select>
          </label>
          <Input label="Destino" name="destino" value={form.destino} onChange={updateField} required />
          <div className="md:col-span-2 xl:col-span-3">
            <Button type="submit">Registrar encomienda</Button>
          </div>
        </form>
      </Card>

      <DataTable columns={columns} data={rows} />
    </div>
  );
}

export default Encomiendas;
