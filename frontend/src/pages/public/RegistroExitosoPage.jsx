import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Printer } from 'lucide-react';
import PaymentConfirmationStep from '../../components/public/PaymentConfirmationStep.jsx';
import PackageBaseSelector from '../../components/common/PackageBaseSelector.jsx';
import TrackingProgress from '../../components/public/TrackingProgress.jsx';
import { getApiErrorMessage } from '../../services/apiClient.js';
import { validatePackageBaseOrientation } from '../../utils/shipmentValidation.js';
import { confirmarPreRegistro, getEtiquetaPdf } from '../../services/encomiendasService.js';
import { generarPdfBetaDesdeEncomienda } from '../../services/sunatService.js';
import { iniciarLogBoleta, finalizarLogBoleta } from '../../services/measurementLogsService.js';
import { formatShipmentCode } from '../../utils/formatShipmentCode.js';
import {
  PUBLIC_SUCCESS_STORAGE_KEY,
  clearSessionKey,
  readSessionJSON,
  writeSessionJSON,
} from '../../utils/publicShipment.js';
import checkIcon from '../../assets/icons/flecha-correcta.svg';

export function RegistroExitosoContent({
  result,
  summary,
  payment,
  homePath = '/',
  homeLabel = 'Volver al inicio',
  clearOnUnmount = false,
  onHome = null,
  autoPayOnline = false,
}) {
  const [currentResult, setCurrentResult] = useState(result);
  const [currentPayment, setCurrentPayment] = useState(payment);
  const [payingOnline, setPayingOnline] = useState(
    Boolean(autoPayOnline) && (result?.estado || 'PRE_REGISTRADA') === 'PRE_REGISTRADA' && Boolean(summary),
  );
  const [paymentMethod, setPaymentMethod] = useState('yape');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  // Cara/base del paquete: algunos pre-registros (p. ej. los de CarmiBot) llegan
  // sin elegirla; el cliente debe seleccionarla antes de pagar en línea.
  const [baseOrientation, setBaseOrientation] = useState(
    summary?.orientacion_base || result?.orientacion_base || '',
  );
  const [printing, setPrinting] = useState('');
  const [printError, setPrintError] = useState('');
  const code = formatShipmentCode(currentResult?.codigo_encomienda);
  const estado = currentResult?.estado || 'PRE_REGISTRADA';
  const isPreRegistration = estado === 'PRE_REGISTRADA';
  const canPrintLabel = !isPreRegistration && Boolean(currentResult?.id);
  const paymentLabel =
    currentPayment?.method === 'yape'
      ? 'Yape aprobado'
      : currentPayment?.method === 'card'
        ? 'Tarjeta aprobada'
        : currentPayment?.method === 'qr'
          ? 'QR aprobado'
          : currentPayment?.method === 'pos'
            ? 'POS aprobado'
            : 'Pendiente en agencia';

  useEffect(() => {
    if (!clearOnUnmount) return undefined;
    return () => {
      clearSessionKey(PUBLIC_SUCCESS_STORAGE_KEY);
    };
  }, [clearOnUnmount]);

  useEffect(() => {
    setCurrentResult(result);
    setCurrentPayment(payment);
  }, [payment, result]);

  const openPdfForPrint = async ({ type, loadingText, getPdf }) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setPrintError('El navegador bloqueo la ventana de impresion. Habilita las ventanas emergentes e intenta nuevamente.');
      return;
    }

    printWindow.document.write(
      `<!doctype html><html><head><title>${loadingText}</title></head><body style="font-family:Arial,sans-serif;padding:24px">${loadingText}...</body></html>`,
    );

    try {
      setPrinting(type);
      setPrintError('');
      const pdfBlob = await getPdf();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      printWindow.location.replace(pdfUrl);
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 120000);
    } catch (error) {
      printWindow.close();
      setPrintError(
        getApiErrorMessage(
          error,
          `No se pudo generar ${type === 'label' ? 'la etiqueta' : 'la boleta'} de la encomienda.`,
        ),
      );
    } finally {
      setPrinting('');
    }
  };

  const handlePrintLabel = () => openPdfForPrint({
    type: 'label',
    loadingText: 'Preparando etiqueta con QR',
    getPdf: () => getEtiquetaPdf(currentResult.id),
  });

  const handlePrintReceipt = () => openPdfForPrint({
    type: 'receipt',
    loadingText: 'Generando boleta electronica',
    getPdf: async () => {
      const log = await iniciarLogBoleta({
        encomienda_id: currentResult.id,
        actor_origen: 'cliente_externo',
        canal: 'externo',
      }).catch(() => null);

      const blob = await generarPdfBetaDesdeEncomienda({
        encomienda_id: currentResult.id,
        confirmar_pago: true,
      });

      if (log?.id) {
        finalizarLogBoleta(log.id).catch(() => {});
      }

      return blob;
    },
  });

  const handleOnlineApproved = async (method, paymentResult) => {
    if (!currentResult?.id) return;
    try {
      setPaymentLoading(true);
      setPaymentError('');
      setPaymentNotice('');
      const confirmed = await confirmarPreRegistro(currentResult.id, baseOrientation || null);
      const nextPayment = {
        method,
        status: 'approved',
        response: paymentResult,
      };
      setCurrentResult(confirmed);
      setCurrentPayment(nextPayment);
      setPayingOnline(false);
      writeSessionJSON(PUBLIC_SUCCESS_STORAGE_KEY, {
        result: confirmed,
        summary,
        payment: nextPayment,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setPaymentError(
        getApiErrorMessage(
          error,
          'El pago fue aprobado, pero no se pudo formalizar el pre-registro.',
        ),
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  if (isPreRegistration && payingOnline && summary) {
    const isEnvelope = String(summary.tipo_contenido || '').trim().toUpperCase() === 'DOCUMENTOS';
    const needsBase = !isEnvelope && !baseOrientation;
    const baseOrientationError = isEnvelope || !baseOrientation
      ? ''
      : validatePackageBaseOrientation({
        contentType: summary.tipo_contenido,
        description: summary.descripcion,
        fragility: summary.fragilidad,
        baseOrientation,
        lengthCm: summary.largo_cm,
        widthCm: summary.ancho_cm,
        heightCm: summary.alto_cm,
      });
    return (
      <section className="bg-[#F8F9FA] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 rounded-2xl border border-[#A3CF84]/70 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-[#28A745]">Pago por internet</p>
            <h1 className="mt-1 text-2xl font-black text-[#212529]">Completa el pago de tu pre-registro</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6C757D]">
              Codigo {code || '-'}: si el pago queda aprobado, el envio pasara automaticamente a REGISTRADO.
            </p>
          </div>

          <PaymentConfirmationStep
            form={summary}
            loading={paymentLoading}
            error={paymentError}
            paymentMethod={paymentMethod}
            paymentNotice={paymentNotice}
            allowedPaymentMethods={['yape', 'card']}
            encomiendaId={currentResult.id}
            paymentDisabled={needsBase || Boolean(baseOrientationError)}
            paymentDisabledMessage="Selecciona la cara/base del paquete (en Datos de la encomienda) para habilitar el pago."
            extraSummaryNode={!isEnvelope ? (
              <section className="rounded-lg border border-[#A3CF84]/70 bg-white p-5 shadow-[0_14px_32px_rgba(33,37,41,0.07)]">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-[#212529]">Cara / base del paquete</h3>
                  {needsBase && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-amber-700 ring-1 ring-amber-300">
                      Requerido
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#6C757D]">
                  Indica sobre qué cara viajará apoyado el paquete para asegurar que llegue en buen estado.
                </p>
                <div className="mt-3">
                  <PackageBaseSelector
                    length={summary.largo_cm}
                    width={summary.ancho_cm}
                    height={summary.alto_cm}
                    value={baseOrientation}
                    error={baseOrientationError}
                    onChange={(orientation) => {
                      setBaseOrientation(orientation);
                      setPaymentError('');
                    }}
                  />
                </div>
              </section>
            ) : null}
            onBack={() => {
              setPayingOnline(false);
              setPaymentError('');
              setPaymentNotice('');
            }}
            onEdit={() => {
              setPayingOnline(false);
              setPaymentError('');
              setPaymentNotice('');
            }}
            onSelectPayment={(value) => {
              setPaymentMethod(value);
              setPaymentError('');
              setPaymentNotice('');
            }}
            onDigitalApproved={handleOnlineApproved}
            onDigitalPending={(method) => {
              setPaymentNotice(`Pago con ${method === 'yape' ? 'Yape' : 'tarjeta'} pendiente de validacion.`);
            }}
            onDigitalError={(method, error) => {
              setPaymentError(error?.message || `No se pudo procesar el pago con ${method === 'yape' ? 'Yape' : 'tarjeta'}.`);
            }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F8F9FA]">
              <img src={checkIcon} alt="" className="h-8 w-8" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black uppercase text-[#28A745]">
                {isPreRegistration ? 'Pre-registro generado' : 'Registro generado'}
              </p>
              <h1 className="mt-2 text-3xl font-black text-[#212529]">
                {isPreRegistration ? 'Tu pre-registro fue generado correctamente.' : 'Tu envio fue registrado correctamente.'}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                {isPreRegistration
                  ? 'Puedes completar el pago en agencia o pagarlo por internet para formalizar el envio.'
                  : 'El pago fue confirmado y el registro formal de la encomienda fue creado.'}
              </p>

              {code ? (
                <div className="mt-6 rounded-lg border border-[#28A745]/30 bg-[#F8F9FA] p-5">
                  <p className="text-sm font-bold uppercase text-[#3C5940]">
                    {isPreRegistration ? 'Codigo de pre-registro' : 'Codigo de encomienda'}
                  </p>
                  <p className="mt-2 break-all text-4xl font-black text-[#212529]">{code}</p>
                  <p className="mt-2 text-sm font-semibold text-[#3C5940]">Estado: {estado}</p>
                </div>
              ) : (
                <div className="mt-6 rounded-md border border-[#A3CF84] bg-[#F8F9FA] p-3 text-sm font-semibold text-[#3C5940]">
                  No hay un codigo cargado en esta sesion. Genera el registro desde el formulario publico.
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-gray-100 bg-gray-50 p-5">
            <TrackingProgress estado={estado} />
          </div>

          {summary && (
            <div className="mt-6 grid gap-4 rounded-lg border border-gray-100 bg-gray-50 p-5 sm:grid-cols-2">
              <SummaryItem label="Ruta" value={`${summary.origen || '-'} - ${summary.destino || '-'}`} />
              <SummaryItem label="Destinatario" value={summary.destinatario_nombre} />
              <SummaryItem label="Contenido" value={summary.tipo_contenido} />
              <SummaryItem label="Pago" value={paymentLabel} />
            </div>
          )}

          {canPrintLabel && (
            <div className="mt-6 rounded-lg border border-[#A3CF84]/70 bg-[#E4ECE2] p-5">
              <div>
                <p className="text-sm font-black uppercase text-[#3C5940]">Documentos del envio</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#6C757D]">
                  Imprime la etiqueta con QR para el paquete y la boleta electronica generada por Lycet.
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handlePrintLabel}
                  disabled={Boolean(printing)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#3C5940] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(60,89,64,0.2)] transition hover:-translate-y-0.5 hover:bg-[#28A745] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-65"
                >
                  <Printer size={19} />
                  {printing === 'label' ? 'Generando etiqueta...' : 'Imprimir etiqueta con QR'}
                </button>
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  disabled={Boolean(printing)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#3C5940] bg-white px-5 text-sm font-black text-[#3C5940] transition hover:-translate-y-0.5 hover:bg-[#F8F9FA] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-65"
                >
                  <FileText size={19} />
                  {printing === 'receipt' ? 'Emitiendo boleta...' : 'Emitir e imprimir boleta'}
                </button>
              </div>
            </div>
          )}

          {printError && (
            <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {printError}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {isPreRegistration && summary && currentResult?.id && (
              <button
                type="button"
                onClick={() => {
                  setPayingOnline(true);
                  setPaymentError('');
                  setPaymentNotice('');
                }}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#28A745] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(40,167,69,0.22)] transition hover:-translate-y-0.5 hover:bg-[#3C5940]"
              >
                Pagar ahora por internet
              </button>
            )}
            {onHome ? (
              <button
                type="button"
                onClick={onHome}
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-gray-300 px-5 text-sm font-black text-gray-700 transition hover:bg-gray-50"
              >
                {homeLabel}
              </button>
            ) : (
              <Link
                to={homePath}
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-gray-300 px-5 text-sm font-black text-gray-700 transition hover:bg-gray-50"
              >
                {homeLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function RegistroExitosoPage() {
  const location = useLocation();
  const stored = useMemo(() => readSessionJSON(PUBLIC_SUCCESS_STORAGE_KEY, null), []);
  const result = location.state?.result || stored?.result || null;
  const summary = location.state?.summary || stored?.summary || null;
  const payment = location.state?.payment || stored?.payment || null;
  const autoPay = Boolean(location.state?.autoPay);

  return (
    <RegistroExitosoContent
      result={result}
      summary={summary}
      payment={payment}
      autoPayOnline={autoPay}
      clearOnUnmount
    />
  );
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-black text-[#212529]">{value || '-'}</p>
    </div>
  );
}

export default RegistroExitosoPage;
