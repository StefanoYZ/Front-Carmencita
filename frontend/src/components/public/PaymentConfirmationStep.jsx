import React from 'react';
import MercadoPagoBrick from '../payments/MercadoPagoBrick.jsx';
import YapePayment from '../payments/YapePayment.jsx';
import ShipmentSummaryCard from './ShipmentSummaryCard.jsx';
import PaymentMethodCard from './PaymentMethodCard.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { quoteEstimateFromForm } from '../../utils/publicShipment.js';
import agencyIcon from '../../assets/icons/agencia.svg';
import cardIcon from '../../assets/icons/tarjeta-de-debito.svg';
import phoneIcon from '../../assets/icons/telefono.svg';

const paymentMethods = [
  {
    value: 'agency',
    label: 'Pago en agencia',
    description: 'Paga al acercarte a la agencia.',
    icon: agencyIcon,
  },
  {
    value: 'yape',
    label: 'Yape',
    description: 'Paga desde tu app Yape.',
    icon: phoneIcon,
  },
  {
    value: 'card',
    label: 'Tarjeta debito/credito',
    description: 'Credito o debito.',
    icon: cardIcon,
  },
];

function PaymentConfirmationStep({
  form,
  loading,
  error,
  paymentMethod,
  paymentNotice,
  onBack,
  onConfirmAgency,
  onDigitalApproved,
  onEdit,
  onSelectPayment,
  onDigitalPending,
  onDigitalError,
}) {
  const quote = quoteEstimateFromForm(form);

  const senderItems = [
    { label: 'Documento', value: `${form.remitente_tipo_documento} ${form.remitente_numero_documento}` },
    { label: 'Nombre', value: form.remitente_nombre },
    { label: 'Telefono', value: form.remitente_telefono },
    { label: 'Correo', value: form.remitente_correo || '-' },
  ];

  const recipientItems = [
    { label: 'Documento', value: `${form.destinatario_tipo_documento} ${form.destinatario_numero_documento}` },
    { label: 'Nombre', value: form.destinatario_nombre },
    { label: 'Telefono', value: form.destinatario_telefono },
    { label: 'Correo', value: form.destinatario_correo || '-' },
  ];

  const shipmentItems = [
    { label: 'Origen', value: form.origen },
    { label: 'Destino', value: form.destino },
    { label: 'Descripcion', value: form.descripcion },
    { label: 'Fragilidad', value: formatFragility(form.fragilidad) },
    { label: 'Peso', value: `${form.peso_kg} kg` },
    { label: 'Dimensiones', value: `${form.largo_cm} x ${form.ancho_cm} x ${form.alto_cm} cm` },
    { label: 'Contenido', value: form.tipo_contenido },
  ];

  return (
    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,380px)]">
      <div className="grid min-w-0 auto-rows-max items-start gap-5 lg:grid-cols-2">
        <ShipmentSummaryCard title="Datos del remitente" items={senderItems} onEdit={onEdit} />
        <ShipmentSummaryCard title="Datos del destinatario" items={recipientItems} onEdit={onEdit} />
        <div className="lg:col-span-2">
          <ShipmentSummaryCard title="Datos de la encomienda" items={shipmentItems} onEdit={onEdit} />
        </div>
      </div>

      <aside className="min-w-0 space-y-5 2xl:sticky 2xl:top-28 2xl:self-start">
        <section className="rounded-lg border border-[#E4ECE2] bg-white p-5 shadow-[0_14px_32px_rgba(33,37,41,0.07)]">
          <h3 className="text-lg font-black text-[#212529]">Detalle de pago</h3>
          <div className="mt-4 space-y-3 text-sm">
            <PaymentLine label="Tarifa" value={formatCurrency(quote.subtotal - quote.fragilitySurcharge)} />
            <PaymentLine label="Fragilidad" value={formatCurrency(quote.fragilitySurcharge)} />
            <PaymentLine label="IGV" value={formatCurrency(quote.igv)} />
          </div>
          <div className="mt-5 rounded-md bg-[#3C5940] p-4 text-white shadow-[0_12px_24px_rgba(60,89,64,0.16)]">
            <p className="text-sm font-bold text-[#F8F9FA]">Total a pagar</p>
            <p className="mt-1 break-words text-3xl font-black">{formatCurrency(quote.total)}</p>
          </div>
        </section>

        <section className="rounded-lg border border-[#E4ECE2] bg-white p-5 shadow-[0_14px_32px_rgba(33,37,41,0.07)]">
          <h3 className="text-lg font-black text-[#212529]">Metodo de pago</h3>
          <div className="mt-4 grid gap-3">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.value}
                active={paymentMethod === method.value}
                description={method.description}
                icon={method.icon}
                label={method.label}
                value={method.value}
                onSelect={onSelectPayment}
              />
            ))}
          </div>
        </section>

        <section className="min-h-[360px] rounded-lg border border-[#E4ECE2] bg-white p-4 shadow-[0_14px_32px_rgba(33,37,41,0.07)]">
          {paymentMethod === 'agency' && (
            <div className="flex min-h-[328px] flex-col justify-between rounded-md border border-[#A3CF84]/50 bg-[#E4ECE2] p-4">
              <div>
                <h4 className="text-base font-black text-[#212529]">Pago en agencia</h4>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#6C757D]">
                  Generaremos un codigo para que completes el pago y la atencion en agencia.
                </p>
              </div>
              <p className="rounded-md bg-white p-3 text-sm font-bold text-[#3C5940] shadow-sm">
                El envio quedara como pre-registro hasta que sea formalizado.
              </p>
            </div>
          )}

          {paymentMethod === 'yape' && (
            <YapePayment
              amount={quote.total}
              email={form.remitente_correo || 'test@test.com'}
              onApproved={(paymentResult) => onDigitalApproved?.('yape', paymentResult)}
              onPending={(paymentResult) => onDigitalPending?.('yape', paymentResult)}
              onRejected={(paymentResult) => onDigitalPending?.('yape', paymentResult)}
              onError={(paymentError) => onDigitalError?.('yape', paymentError)}
            />
          )}

          {paymentMethod === 'card' && (
            <MercadoPagoBrick
              amount={quote.total}
              payerEmail={form.remitente_correo || 'test@test.com'}
              payerName={form.remitente_nombre || 'Cliente'}
              onApproved={(paymentResult) => onDigitalApproved?.('card', paymentResult)}
              onPending={(paymentResult) => onDigitalPending?.('card', paymentResult)}
              onRejected={(paymentResult) => onDigitalPending?.('card', paymentResult)}
              onError={(paymentError) => onDigitalError?.('card', paymentError)}
            />
          )}
        </section>

        {paymentNotice && <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-800">{paymentNotice}</div>}
        {error && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

        <div className="rounded-lg border border-[#E4ECE2] bg-white p-4 shadow-[0_14px_32px_rgba(33,37,41,0.07)]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-gray-500">Total</span>
            <span className="break-words text-right text-2xl font-black text-[#28A745]">{formatCurrency(quote.total)}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <button
              type="button"
              className="min-h-12 rounded-md border border-[#A3CF84]/70 bg-white px-5 text-sm font-black text-[#3C5940] transition hover:border-[#28A745] hover:bg-[#F8F9FA]"
              onClick={onBack}
              disabled={loading}
            >
              Volver
            </button>
            {paymentMethod === 'agency' ? (
              <button
                type="button"
                className="min-h-12 rounded-md bg-[#28A745] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(40,167,69,0.24)] transition hover:-translate-y-0.5 hover:bg-[#3C5940] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={onConfirmAgency}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Crear pre-registro'}
              </button>
            ) : (
              <div className="rounded-md bg-[#E4ECE2] px-4 py-3 text-center text-sm font-bold text-[#3C5940]">
                Completa el pago en el panel superior.
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function PaymentLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2">
      <span className="font-semibold text-gray-600">{label}</span>
      <span className="font-black text-[#212529]">{value}</span>
    </div>
  );
}

export default PaymentConfirmationStep;

function formatFragility(value) {
  const labels = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta' };
  return labels[String(value || '').trim().toUpperCase()] || '-';
}
