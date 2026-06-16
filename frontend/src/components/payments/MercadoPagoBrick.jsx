import React, { useEffect, useMemo, useRef, useState } from 'react';
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

export default function MercadoPagoBrick({
  amount = 100,
  onApproved,
  onPending,
  onRejected,
  onError,
}) {
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const callbacksRef = useRef({
    onApproved,
    onPending,
    onRejected,
    onError,
  });
  const containerId = useMemo(
    () => `paymentBrick_container_${String(amount).replace(/[^a-zA-Z0-9_-]/g, '_')}`,
    [amount],
  );

  useEffect(() => {
    callbacksRef.current = {
      onApproved,
      onPending,
      onRejected,
      onError,
    };
  }, [onApproved, onError, onPending, onRejected]);

  useEffect(() => {
    let brickController = null;
    let mounted = true;

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

    const updateStatus = (nextStatus, nextMessage) => {
      if (!mounted) return;
      setStatus(nextStatus);
      setMessage(nextMessage);
    };

    const loadBrick = async () => {
      try {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = '';

        await loadMercadoPagoSDK();
        if (!mounted) return;

        const keyResponse = await fetch(`${apiBaseURL}/payments/public-key`);
        const keyData = await readPaymentResponse(keyResponse, 'No se pudo obtener la Public Key.');
        if (!mounted) return;

        const mp = new window.MercadoPago(keyData.publicKey, {
          locale: 'es-PE',
        });

        const bricksBuilder = mp.bricks();

        const controller = await bricksBuilder.create('payment', containerId, {
          initialization: {
            amount: Number(amount),
            payer: {
              email: 'test@test.com',
              firstName: 'APRO',
              lastName: '',
            },
          },
          customization: {
            visual: {
              style: {
                theme: 'default',
              },
            },
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              maxInstallments: 1,
            },
          },
          callbacks: {
            onReady: () => {
              updateStatus('', '');
            },

            onSubmit: async ({ formData }) => {
              try {
                updateStatus('processing', 'Procesando pago con tarjeta...');

                const response = await fetch(`${apiBaseURL}/payments/process-payment`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(formData),
                });

                const data = await readPaymentResponse(response, 'No se pudo procesar el pago con tarjeta.');

                const paymentStatus = data?.response?.status || data?.status || data?.data?.status;

                if (paymentStatus === 'approved') {
                  updateStatus('approved', 'Pago con tarjeta aprobado.');
                  callbacksRef.current.onApproved?.(data);
                } else if (paymentStatus === 'pending') {
                  updateStatus('pending', 'Pago con tarjeta pendiente.');
                  callbacksRef.current.onPending?.(data);
                } else {
                  updateStatus('rejected', 'Pago con tarjeta rechazado.');
                  callbacksRef.current.onRejected?.(data);
                }
              } catch (error) {
                updateStatus('error', error?.message || 'Error inesperado procesando el pago.');
                callbacksRef.current.onError?.(error);
              }
            },

            onError: (error) => {
              updateStatus('error', 'Error cargando el formulario de pago.');
              callbacksRef.current.onError?.(error);
            },
          },
        });

        if (!mounted) {
          controller.unmount();
          if (container) container.innerHTML = '';
          return;
        }

        brickController = controller;
      } catch (error) {
        updateStatus('error', error?.message || 'Error cargando Mercado Pago.');
        callbacksRef.current.onError?.(error);
      }
    };

    loadBrick();

    return () => {
      mounted = false;
      if (brickController) {
        brickController.unmount();
      }

      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [amount, containerId]);

  return (
    <div className="min-h-[328px] rounded-md bg-white">
      <div id={containerId} className="min-h-[250px]" />

      {status && (
        <div
          className={`mt-4 rounded-md p-4 text-center font-semibold ${
            status === 'approved'
              ? 'bg-green-100 text-green-700'
              : status === 'pending' || status === 'processing'
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
