import React, { useState } from 'react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import { cotizacionService } from '../services/cotizacion.service.js';
import MercadoPagoBrick from '../components/payments/MercadoPagoBrick.jsx';
import YapePayment from '../components/payments/YapePayment.jsx';

function Cotizacion() {
  const [form, setForm] = useState({
    peso: '',
    largo: '',
    ancho: '',
    alto: '',
    destino: '',
  });

  const [result, setResult] = useState(null);
  const [metodoPago, setMetodoPago] = useState('tarjeta');

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

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

      <Card className="overflow-hidden">
        <div className="mb-5 border-b border-gray-100 pb-4">
          <h3 className="text-lg font-black text-brand-black">Datos del paquete</h3>
          <p className="mt-1 text-sm text-brand-gray">Ingresa medidas y destino para calcular la tarifa.</p>
        </div>
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
        <>
          <Card className="border-brand-lime bg-brand-lime/20">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-dark">Tarifa estimada</p>
            <strong className="mt-2 block text-4xl font-black text-brand-black">{result.montoFormateado}</strong>
            <p className="mt-1 text-sm text-brand-gray">Peso facturable: {result.pesoFacturable} kg</p>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-black text-brand-black">Realizar pago</h3>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setMetodoPago('tarjeta')}
                className={`rounded-lg border p-4 text-left transition ${
                  metodoPago === 'tarjeta'
                    ? 'border-brand-green bg-brand-lime/20 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-brand-lime hover:bg-brand-lime/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-lime/30 text-sm font-black text-brand-dark">TC</span>
                  <div>
                    <p className="font-semibold text-brand-black">Tarjeta</p>
                    <p className="text-sm text-brand-gray">Credito o debito</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago('yape')}
                className={`rounded-lg border p-4 text-left transition ${
                  metodoPago === 'yape'
                    ? 'border-brand-green bg-brand-lime/20 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-brand-lime hover:bg-brand-lime/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-lime/30 text-sm font-black text-brand-dark">YP</span>
                  <div>
                    <p className="font-semibold text-brand-dark">Yape</p>
                    <p className="text-sm text-brand-gray">Celular y codigo de aprobacion</p>
                  </div>
                </div>
              </button>
            </div>

            {metodoPago === 'tarjeta' && (
              <div>
                <h4 className="mb-3 font-medium">Pago con tarjeta</h4>
                <MercadoPagoBrick key={`mp-${metodoPago}-${result.monto}`} amount={Number(result.monto)} />
              </div>
            )}

            {metodoPago === 'yape' && (
              <div>
                <h4 className="mb-3 font-medium text-brand-dark">Pago con Yape</h4>
                <YapePayment amount={Number(result.monto)} />
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

export default Cotizacion;
