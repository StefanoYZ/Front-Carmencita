import React, { useState } from 'react';
import { apiBaseURL } from '../../services/apiClient.js';

const SCENARIOS = [
  ['APRO', 'Pago aprobado'],
  ['OTHE', 'Rechazado por error general'],
  ['CONT', 'Pendiente de pago'],
  ['CALL', 'Requiere autorizacion'],
  ['FUND', 'Importe insuficiente'],
  ['SECU', 'Codigo de seguridad invalido'],
  ['EXPI', 'Fecha de vencimiento invalida'],
  ['FORM', 'Error de formulario'],
  ['CARD', 'Numero de tarjeta invalido'],
  ['INST', 'Cuotas invalidas'],
];

const TEST_CARDS = [
  { id: 'master', label: 'Mastercard credito', number: '5031 7557 3453 0604', cvv: '123', expiry: '11/30', method: 'master' },
  { id: 'visa', label: 'Visa credito', number: '4009 1753 3280 6176', cvv: '123', expiry: '11/30', method: 'visa' },
  { id: 'amex', label: 'American Express', number: '3711 803032 57522', cvv: '1234', expiry: '11/30', method: 'amex' },
  { id: 'debmaster', label: 'Mastercard debito', number: '5178 7816 2220 2455', cvv: '123', expiry: '11/30', method: 'master' },
];

export default function SimulatedPaymentForm({
  method,
  amount,
  email,
  usuario,
  encomiendaId,
  onApproved,
  onPending,
  onRejected,
  onError,
}) {
  const [scenario, setScenario] = useState('APRO');
  const [cardId, setCardId] = useState('master');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const card = TEST_CARDS.find((item) => item.id === cardId) || TEST_CARDS[0];
  const isCard = method === 'card';

  const submit = async () => {
    try {
      setLoading(true);
      setResult(null);
      const payload = isCard
        ? {
            transaction_amount: Number(amount),
            payment_method_id: card.method,
            simulation_scenario: scenario,
            payer: { email, identification: { type: 'DNI', number: '123456789' } },
          }
        : { amount: Number(amount), email, simulation_scenario: scenario };
      if (usuario) payload.usuario = usuario;
      if (encomiendaId) payload.encomienda_id = Number(encomiendaId);

      const response = await fetch(`${apiBaseURL}/${isCard ? 'payments' : 'yape'}/process-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail || 'No se pudo ejecutar la simulacion.');

      const status = data.payment_status || data.status || data.response?.status || data.data?.status;
      const detail = data.status_detail || data.response?.status_detail || data.data?.status_detail;
      setResult({ status, detail });
      if (status === 'approved') onApproved?.(data);
      else if (status === 'pending') onPending?.(data);
      else onRejected?.(data);
    } catch (error) {
      setResult({ status: 'error', detail: error.message });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[328px] rounded-md border border-amber-300 bg-amber-50/50 p-4">
      <div className="rounded-md bg-amber-100 px-3 py-2 text-xs font-black uppercase tracking-wide text-amber-900">
        Simulador local: no se enviaran datos a Mercado Pago
      </div>

      {isCard && (
        <>
          <label className="mt-4 block text-sm font-bold text-brand-black">Tarjeta de prueba</label>
          <select value={cardId} onChange={(event) => setCardId(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold">
            {TEST_CARDS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-md border border-gray-200 bg-white p-3 text-xs text-brand-gray">
            <span className="col-span-2 font-mono font-bold text-brand-black">{card.number}</span>
            <span>CVV: <b>{card.cvv}</b></span>
            <span>Vence: <b>{card.expiry}</b></span>
          </div>
        </>
      )}

      <label className="mt-4 block text-sm font-bold text-brand-black">Resultado de prueba</label>
      <select value={scenario} onChange={(event) => setScenario(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold">
        {SCENARIOS.map(([code, label]) => <option key={code} value={code}>{code} - {label}</option>)}
      </select>
      <p className="mt-2 text-xs font-semibold text-brand-gray">
        Titular: <b>{scenario}</b>{isCard ? ' · Documento: 123456789' : ' · Yape simulado'}
      </p>

      <button type="button" onClick={submit} disabled={loading} className="mt-4 min-h-11 w-full rounded-md bg-brand-green px-4 text-sm font-black text-white transition hover:bg-brand-dark disabled:opacity-60">
        {loading ? 'Simulando...' : `Simular pago con ${isCard ? 'tarjeta' : 'Yape'}`}
      </button>

      {result && (
        <div className={`mt-4 rounded-md p-3 text-center text-sm font-bold ${result.status === 'approved' ? 'bg-green-100 text-green-700' : result.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'}`}>
          {result.status === 'approved' ? 'Pago aprobado' : result.status === 'pending' ? 'Pago pendiente' : 'Pago rechazado'}
          {result.detail ? `: ${result.detail}` : ''}
        </div>
      )}
    </div>
  );
}
