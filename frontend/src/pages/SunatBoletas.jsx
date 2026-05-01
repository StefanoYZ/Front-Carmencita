import React from 'react';
import { useState } from 'react';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import { sunatService } from '../services/sunat.service.js';
import { formatCurrency } from '../utils/formatCurrency.js';

const initialForm = {
  documento: '',
  nombre: '',
  descripcion: '',
  monto: '',
};

function SunatBoletas() {
  const [form, setForm] = useState(initialForm);
  const [boleta, setBoleta] = useState(null);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBoleta(await sunatService.emitirBoleta(form));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">SUNAT / Boletas</h2>
        <p className="page-subtitle">Emision simulada de comprobante electronico.</p>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input label="DNI/RUC cliente" name="documento" value={form.documento} onChange={updateField} required />
          <Input label="Nombre cliente" name="nombre" value={form.nombre} onChange={updateField} required />
          <Input label="Descripcion del servicio" name="descripcion" value={form.descripcion} onChange={updateField} required />
          <Input label="Monto" name="monto" type="number" min="0" step="0.01" value={form.monto} onChange={updateField} required />
          <div className="md:col-span-2">
            <Button type="submit">Emitir boleta</Button>
          </div>
        </form>
      </Card>

      {boleta && (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Serie y numero</p>
              <h3 className="text-xl font-semibold text-brand-black">
                {boleta.serie}-{boleta.numero}
              </h3>
            </div>
            <Badge tone="green">{boleta.estado}</Badge>
          </div>
          <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
            <div>
              <dt className="text-gray-500">Cliente</dt>
              <dd className="font-medium text-brand-black">{boleta.nombre}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Monto</dt>
              <dd className="font-medium text-brand-black">{formatCurrency(boleta.monto)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Fecha</dt>
              <dd className="font-medium text-brand-black">{boleta.fecha}</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}

export default SunatBoletas;
