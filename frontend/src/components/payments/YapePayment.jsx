import React, { useState } from 'react';
import { apiBaseURL } from '../../services/apiClient.js';

function getPaymentErrorMessage(data, fallback) {
  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg || JSON.stringify(item)).join(' ');
  }
  return data?.detail || data?.message || data?.mensaje || fallback;
}

async function readPaymentResponse(response, fallback) {
  const text = await response.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return { message: text };
        }
      })()
    : {};

  if (!response.ok) {
    throw new Error(getPaymentErrorMessage(data, fallback));
  }

  return data;
}

export default function YapePayment({
  amount = 100,
  email = 'test@test.com',
  onApproved,
  onPending,
  onRejected,
  onError,
}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [message, setMessage] = useState('');

  const loadMercadoPagoSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.MercadoPago) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
      if (existingScript) {
        existingScript.onload = resolve;
        existingScript.onerror = reject;
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  const handleYapePayment = async () => {
    try {
      setLoading(true);
      setResultado(null);
      setMessage('');

      await loadMercadoPagoSDK();

      const keyResponse = await fetch(`${apiBaseURL}/payments/public-key`);
      const keyData = await readPaymentResponse(keyResponse, 'No se pudo obtener la Public Key.');

      const mp = new window.MercadoPago(keyData.publicKey, {
        locale: 'es-PE',
      });

      const yape = mp.yape({
        otp,
        phoneNumber,
      });

      const yapeToken = await yape.create();

      const response = await fetch(`${apiBaseURL}/yape/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: yapeToken.id,
          amount: Number(amount),
          email,
        }),
      });

      const data = await readPaymentResponse(response, 'No se pudo procesar el pago con Yape.');

      const status = data?.status || data?.data?.status || data?.response?.status;

      if (status === 'approved') {
        setResultado('approved');
        setMessage('Pago con Yape aprobado.');
        onApproved?.(data);
      } else if (status === 'pending') {
        setResultado('pending');
        setMessage('Pago con Yape pendiente de validacion.');
        onPending?.(data);
      } else {
        setResultado('rejected');
        setMessage('Pago con Yape rechazado.');
        onRejected?.(data);
      }
    } catch (error) {
      setResultado('error');
      setMessage(error?.message || 'Error procesando el pago con Yape.');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[328px] rounded-md bg-white">
      <h2 className="mb-4 text-xl font-black text-purple-700">Pagar con Yape</h2>

      <label className="mb-2 block text-sm font-bold text-gray-700">Celular asociado a Yape</label>
      <input
        type="text"
        value={phoneNumber}
        onChange={(event) => setPhoneNumber(event.target.value)}
        placeholder="Ej: Ingresa tu numero Yape"
        className="mb-4 min-h-11 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
      />

      <label className="mb-2 block text-sm font-bold text-gray-700">Codigo de aprobacion</label>
      <input
        type="text"
        value={otp}
        onChange={(event) => setOtp(event.target.value)}
        placeholder="Ej: 123456"
        className="mb-4 min-h-11 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
      />

      <p className="mb-4 text-sm leading-6 text-gray-600">
        Abre tu app Yape, genera tu codigo de aprobacion e ingresalo aqui.
      </p>

      <button
        type="button"
        onClick={handleYapePayment}
        disabled={loading || !phoneNumber || !otp}
        className="min-h-11 w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-black text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Procesando...' : 'Pagar con Yape'}
      </button>

      {resultado && (
        <div
          className={`mt-4 rounded-md p-4 text-center font-semibold ${
            resultado === 'approved'
              ? 'bg-green-100 text-green-700'
              : resultado === 'pending'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
