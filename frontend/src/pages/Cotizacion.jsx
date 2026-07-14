import React, { useState } from 'react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import { cotizacionService } from '../services/cotizacion.service.js';
import MercadoPagoBrick from '../components/payments/MercadoPagoBrick.jsx';
import YapePayment from '../components/payments/YapePayment.jsx';
import { sanitizeDecimal, validateDimension, validateShipmentNumericField, validateWeight } from '../utils/shipmentValidation.js';

const NUMERIC_FIELDS = ['peso', 'largo', 'ancho', 'alto'];

function Cotizacion() {
  const [form, setForm] = useState({
    peso: '',
    largo: '',
    ancho: '',
    alto: '',
    destino: '',
  });

  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [metodoPago, setMetodoPago] = useState('tarjeta');

  const updateField = (event) => {
    const { name, value } = event.target;
    // Misma sanitizacion que el resto de vistas: solo digitos y un punto decimal.
    const nextValue = NUMERIC_FIELDS.includes(name) ? sanitizeDecimal(value) : value;
    setForm((current) => ({ ...current, [name]: nextValue }));
    // Valida el limite logico EN VIVO: el error de peso/dimension aparece al escribir.
    setErrors((current) => ({ ...current, [name]: validateShipmentNumericField(name, nextValue) || undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    const weightError = validateWeight(form.peso);
    if (weightError) nextErrors.peso = weightError;
    ['largo', 'ancho', 'alto'].forEach((field) => {
      const dimensionError = validateDimension(form[field]);
      if (dimensionError) nextErrors[field] = dimensionError;
    });
    if (!String(form.destino || '').trim()) nextErrors.destino = 'El destino es obligatorio.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setResult(null);
      return;
    }
    setErrors({});
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
          <Input label="Peso (kg)" name="peso" inputMode="decimal" value={form.peso} onChange={updateField} error={errors.peso} required />
          <Input label="Largo (cm)" name="largo" inputMode="decimal" value={form.largo} onChange={updateField} error={errors.largo} required />
          <Input label="Ancho (cm)" name="ancho" inputMode="decimal" value={form.ancho} onChange={updateField} error={errors.ancho} required />
          <Input label="Alto (cm)" name="alto" inputMode="decimal" value={form.alto} onChange={updateField} error={errors.alto} required />
          <Input label="Destino" name="destino" value={form.destino} onChange={updateField} error={errors.destino} required />

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
