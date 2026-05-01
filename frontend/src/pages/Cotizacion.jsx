import React from 'react';
import { useState } from 'react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import { cotizacionService } from '../services/cotizacion.service.js';

function Cotizacion() {
  const [form, setForm] = useState({ peso: '', largo: '', ancho: '', alto: '', destino: '' });
  const [result, setResult] = useState(null);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(await cotizacionService.calcular(form));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Cotizacion</h2>
        <p className="page-subtitle">Calculo referencial de tarifa en soles.</p>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={handleSubmit}>
          <Input label="Peso (kg)" name="peso" type="number" min="0" step="0.1" value={form.peso} onChange={updateField} required />
          <Input label="Largo (cm)" name="largo" type="number" min="0" value={form.largo} onChange={updateField} required />
          <Input label="Ancho (cm)" name="ancho" type="number" min="0" value={form.ancho} onChange={updateField} required />
          <Input label="Alto (cm)" name="alto" type="number" min="0" value={form.alto} onChange={updateField} required />
          <Input label="Destino" name="destino" value={form.destino} onChange={updateField} required />
          <div className="md:col-span-2 xl:col-span-5">
            <Button type="submit">Calcular tarifa</Button>
          </div>
        </form>
      </Card>

      {result && (
        <Card className="border-green-200 bg-green-50">
          <p className="text-sm text-green-700">Tarifa simulada</p>
          <strong className="mt-2 block text-3xl text-brand-black">{result.montoFormateado}</strong>
          <p className="mt-1 text-sm text-gray-600">Peso facturable: {result.pesoFacturable} kg</p>
        </Card>
      )}
    </div>
  );
}

export default Cotizacion;
