import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PaymentConfirmationStep from '../../components/public/PaymentConfirmationStep.jsx';
import ShipmentFormStep from '../../components/public/ShipmentFormStep.jsx';
import StepIndicator from '../../components/public/StepIndicator.jsx';
import { getApiErrorMessage } from '../../services/apiClient.js';
import { getDestinos } from '../../services/destinosService.js';
import { crearPreRegistro } from '../../services/encomiendasService.js';
import { consultarDni } from '../../services/reniecService.js';
import { extractNombreFromReniecResponse } from '../../utils/reniec.js';
import { isShipmentNumericField, sanitizeShipmentField, validateShipmentNumericField } from '../../utils/shipmentValidation.js';
import { DEFAULT_LOCATION_NAMES } from '../../utils/locationHierarchy.js';
import apiClient from '../../services/apiClient.js';
import {
  PUBLIC_QUOTE_STORAGE_KEY,
  PUBLIC_SHIPMENT_STORAGE_KEY,
  PUBLIC_SUCCESS_STORAGE_KEY,
  buildPublicShipmentPayload,
  clearSessionKey,
  emptyPublicShipmentForm,
  isEnvelopeContent,
  mapQuoteToShipmentForm,
  readSessionJSON,
  validatePublicShipmentForm,
  writeSessionJSON,
} from '../../utils/publicShipment.js';

function getInitialForm(routeQuote) {
  let initialForm;

  if (routeQuote) {
    initialForm = { ...emptyPublicShipmentForm, ...mapQuoteToShipmentForm(routeQuote) };
  } else {
    const storedQuote = readSessionJSON(PUBLIC_QUOTE_STORAGE_KEY, null);
    initialForm = { ...emptyPublicShipmentForm, ...mapQuoteToShipmentForm(storedQuote) };
  }

  return {
    ...initialForm,
    fragilidad: normalizeFragilityForForm(initialForm.fragilidad),
  };
}

function normalizeFragilityForForm(value) {
  const fragility = String(value || '').trim().toUpperCase();
  if (fragility === 'ALTA' || fragility === 'FRAGIL') return 'ALTA';
  if (fragility === 'MEDIA') return 'MEDIA';
  return 'BAJA';
}

function RegistrarEnvioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => getInitialForm(location.state?.quote));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('agency');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [locationOptions, setLocationOptions] = useState([]);
  const [reniecStatus, setReniecStatus] = useState({
    remitente: null,
    destinatario: null,
  });
  const [privacyNotice, setPrivacyNotice] = useState(null);
  const [noticeRead, setNoticeRead] = useState(false);
  const [noticeAccepted, setNoticeAccepted] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [privacyFeedback, setPrivacyFeedback] = useState('');
  const [noticeError, setNoticeError] = useState('');
  const [noticeRetry, setNoticeRetry] = useState(0);
  const privacyDialogRef = useRef(null);
  const registrationHeadingRef = useRef(null);
  const privacyTriggerRef = useRef(null);

  const hasPrefilledQuote = useMemo(
    () => Boolean(location.state?.quote || readSessionJSON(PUBLIC_QUOTE_STORAGE_KEY, null)),
    [location.state],
  );

  useEffect(() => {
    let active = true;
    setNoticeError('');
    apiClient.get('/encomiendas/aviso-privacidad')
      .then(({ data }) => { if (active) setPrivacyNotice(data); })
      .catch(() => { if (active) setNoticeError('No se pudo cargar el aviso de privacidad. Reintenta más tarde.'); });
    return () => { active = false; };
  }, [noticeRetry]);

  useEffect(() => {
    if (privacyModalOpen) privacyDialogRef.current?.focus();
  }, [privacyModalOpen]);

  useEffect(() => {
    if (!privacyFeedback) return undefined;
    const timeoutId = window.setTimeout(() => setPrivacyFeedback(''), 7000);
    return () => window.clearTimeout(timeoutId);
  }, [privacyFeedback]);

  const promptPrivacyNotice = (event) => {
    if (noticeAccepted) return;
    const target = event?.target;
    if (target instanceof HTMLElement && !target.matches('input, select, textarea, button[type="submit"]')) return;
    if (target instanceof HTMLElement) privacyTriggerRef.current = target;
    setPrivacyModalOpen(true);
  };

  const closePrivacyNotice = () => {
    setPrivacyModalOpen(false);
    window.requestAnimationFrame(() => registrationHeadingRef.current?.focus());
  };

  const handlePrivacyDialogKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePrivacyNotice();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = privacyDialogRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href], summary');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === privacyDialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === privacyDialogRef.current)) {
      event.preventDefault();
      first.focus();
    }
  };

  useEffect(() => {
    return () => {
      clearSessionKey(PUBLIC_SHIPMENT_STORAGE_KEY);
      clearSessionKey(PUBLIC_QUOTE_STORAGE_KEY);
    };
  }, []);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const destinos = await getDestinos();
        setLocationOptions(destinos.map((destino) => destino.nombre || destino.name).filter(Boolean));
      } catch {
        setLocationOptions(DEFAULT_LOCATION_NAMES);
      }
    }

    loadDestinations();
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: sanitizeShipmentField(name, value, current) };

      if (name.endsWith('_tipo_documento') && value === 'DNI') {
        const prefix = name.replace('_tipo_documento', '');
        const documentField = `${prefix}_numero_documento`;
        next[documentField] = sanitizeShipmentField(documentField, next[documentField], next);
      }

      if (name === 'tipo_contenido' && value === 'DOCUMENTOS') {
        next.largo_cm = '';
        next.ancho_cm = '';
        next.alto_cm = '';
        next.fragilidad = 'BAJA';
        next.orientacion_base = '';
      }

      return next;
    });
    setErrors((current) => {
      const next = { ...current };
      delete next.general;
      // Si es peso/dimension, valida el limite logico EN VIVO al escribir; al pasar a
      // DOCUMENTOS (sobre) limpia los errores de las medidas junto con sus valores.
      if (name === 'tipo_contenido' && value === 'DOCUMENTOS') {
        delete next.largo_cm;
        delete next.ancho_cm;
        delete next.alto_cm;
      }
      if (isShipmentNumericField(name)) {
        const error = validateShipmentNumericField(name, sanitizeShipmentField(name, value, current), {
          isEnvelope: isEnvelopeContent(form.tipo_contenido),
        });
        if (error) next[name] = error; else delete next[name];
      } else {
        delete next[name];
      }
      return next;
    });
    setApiError('');
    setPaymentNotice('');
  };

  const updateNameFromReniec = (role, value) => {
    setForm((current) => ({ ...current, [`${role}_nombre`]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[`${role}_nombre`];
      return next;
    });
  };

  const handleReniecLookup = async (role) => {
    if (!noticeAccepted) return;
    const typeField = `${role}_tipo_documento`;
    const documentField = `${role}_numero_documento`;
    const dni = String(form[documentField] || '').trim();

    if (form[typeField] !== 'DNI' || !/^\d{8}$/.test(dni)) {
      return;
    }

    setReniecStatus((current) => ({
      ...current,
      [role]: { tone: 'info', message: 'Consultando RENIEC...' },
    }));

    try {
      const data = await consultarDni(dni);
      const nombre = extractNombreFromReniecResponse(data);

      if (!nombre) {
        setReniecStatus((current) => ({
          ...current,
          [role]: {
            tone: 'error',
            message: 'No se pudo consultar RENIEC. Ingresa el nombre manualmente.',
          },
        }));
        return;
      }

      updateNameFromReniec(role, nombre);
      setReniecStatus((current) => ({
        ...current,
        [role]: { tone: 'success', message: 'Nombre autocompletado.' },
      }));
    } catch {
      setReniecStatus((current) => ({
        ...current,
        [role]: {
          tone: 'error',
          message: 'No se pudo consultar RENIEC. Ingresa el nombre manualmente.',
        },
      }));
    }
  };

  const handleContinue = (event) => {
    event.preventDefault();
    if (!noticeAccepted) {
      setPrivacyModalOpen(true);
      return;
    }
    const validationErrors = validatePublicShipmentForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors({ ...validationErrors, general: 'Revisa los campos marcados antes de continuar.' });
      return;
    }

    setErrors({});
    setApiError('');
    setPaymentNotice('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreatePreRegistration = async () => {
    if (!noticeAccepted || !privacyNotice) return;
    const validationErrors = validatePublicShipmentForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors({ ...validationErrors, general: 'Revisa los campos marcados antes de continuar.' });
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setApiError('');
      setPaymentNotice('');
      const payload = { ...buildPublicShipmentPayload(form), aviso_privacidad_aceptado: true, version_aviso_privacidad: privacyNotice.version };
      const result = await crearPreRegistro(payload);
      writeSessionJSON(PUBLIC_SUCCESS_STORAGE_KEY, { result, summary: form });
      clearSessionKey(PUBLIC_SHIPMENT_STORAGE_KEY);
      navigate('/pre-registro-exitoso', { state: { result, summary: form } });
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'No se pudo crear el pre-registro.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDigitalPending = (method) => {
    const message =
      method === 'yape'
        ? 'Pago con Yape pendiente de validacion o no aprobado. No se creo registro formal.'
        : 'Pago con tarjeta pendiente de validacion o no aprobado. No se creo registro formal.';
    setPaymentNotice(message);
    setApiError('');
  };

  const handleDigitalError = (method, error) => {
    const methodLabel = method === 'yape' ? 'Yape' : 'tarjeta';
    const message = error?.message || `No se pudo cargar o procesar el pago con ${methodLabel}.`;
    setPaymentNotice('');
    setApiError(message);
  };

  const handleDigitalApproved = async (method, paymentResult) => {
    if (!noticeAccepted || !privacyNotice) return;
    const validationErrors = validatePublicShipmentForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors({ ...validationErrors, general: 'Revisa los campos marcados antes de continuar.' });
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setApiError('');
      setPaymentNotice('');
      const payload = { ...buildPublicShipmentPayload(form), aviso_privacidad_aceptado: true, version_aviso_privacidad: privacyNotice.version };
      const { data: result } = await apiClient.post('/encomiendas/registro-publico', payload);
      writeSessionJSON(PUBLIC_SUCCESS_STORAGE_KEY, {
        result,
        summary: form,
        payment: {
          method,
          status: 'approved',
          response: paymentResult,
        },
      });
      clearSessionKey(PUBLIC_SHIPMENT_STORAGE_KEY);
      navigate('/registro-exitoso', {
        state: {
          result,
          summary: form,
          payment: {
            method,
            status: 'approved',
            response: paymentResult,
          },
        },
      });
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'El pago fue aprobado, pero no se pudo crear el registro formal.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#F8F9FA] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl" aria-hidden={privacyModalOpen || undefined}>
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#E4ECE2] bg-white p-5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_16px_38px_-18px_rgba(33,37,41,0.22)] sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link to="/" className="text-sm font-black text-[#28A745] hover:text-[#3C5940]">
              Volver
            </Link>
            <h1 ref={registrationHeadingRef} tabIndex={-1} className="mt-3 text-3xl font-black text-[#212529] outline-none sm:text-4xl">Registro de envio</h1>
            <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-[#6C757D]">
              Completa tus datos para completar tu encomienda.
            </p>
            {privacyFeedback && (
              <p className="mt-3 rounded-xl border border-[#A3CF84] bg-[#E4ECE2] px-4 py-3 text-sm font-semibold text-[#3C5940]" role="status" aria-live="polite">
                {privacyFeedback}
              </p>
            )}
            {hasPrefilledQuote && (
              <p className="mt-3 rounded-md border border-[#A3CF84]/60 bg-[#E4ECE2] px-3 py-2 text-sm font-semibold text-[#3C5940]">
                Datos de cotizacion precargados desde el cotizador.
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <StepIndicator currentStep={step} />
        </div>

        <div onFocusCapture={promptPrivacyNotice} onPointerDownCapture={promptPrivacyNotice}>
        {step === 1 ? (
          <ShipmentFormStep
            form={form}
            errors={errors}
            reniecStatus={reniecStatus}
            locationOptions={locationOptions}
            onChange={updateField}
            onReniecLookup={handleReniecLookup}
            onSubmit={handleContinue}
            onCancel={() => navigate('/')}
          />
        ) : (
          <PaymentConfirmationStep
            form={form}
            loading={loading}
            error={apiError}
            paymentMethod={paymentMethod}
            paymentNotice={paymentNotice}
            onBack={() => setStep(1)}
            onConfirmAgency={handleCreatePreRegistration}
            onEdit={() => setStep(1)}
            onSelectPayment={(value) => {
              setPaymentMethod(value);
              setPaymentNotice('');
              setApiError('');
            }}
            onDigitalApproved={handleDigitalApproved}
            onDigitalError={handleDigitalError}
            onDigitalPending={handleDigitalPending}
          />
        )}
        </div>
      </div>

      {privacyModalOpen && !noticeAccepted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closePrivacyNotice(); }}>
          <section
            ref={privacyDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-heading"
            aria-describedby="privacy-summary"
            tabIndex={-1}
            onKeyDown={handlePrivacyDialogKeyDown}
            className="max-h-[min(90vh,42rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#A3CF84] bg-white p-5 shadow-2xl outline-none sm:p-6"
          >
            <h2 id="privacy-heading" className="text-xl font-black text-brand-dark">Uso de datos personales</h2>
            <p id="privacy-summary" className="mt-3 text-sm leading-6 text-brand-gray">
              {privacyNotice?.text || 'CARMENCITA EXPRESS CARGO S.A.C. (RUC 20609708850) tratará los datos necesarios para gestionar y entregar este envío.'}
            </p>
            <details className="mt-3 rounded-xl bg-brand-surface p-3 text-sm text-brand-gray">
              <summary className="cursor-pointer font-bold text-brand-dark">Ver más información</summary>
              <p className="mt-2 leading-6">Los datos de remitente y destinatario se guardarán en la base de datos de CARMENCITA EXPRESS CARGO S.A.C. para registrar, gestionar, transportar y entregar la encomienda, y atender consultas relacionadas con el servicio.</p>
              <p className="mt-2 leading-6">La información sobre derechos de acceso, rectificación, cancelación y oposición puede consultarse a través de los canales oficiales de atención de la empresa.</p>
              <a className="mt-2 inline-block font-bold text-brand-green underline" href="https://www.gob.pe/institucion/anpd/normas-legales/2018427-29733-2011" target="_blank" rel="noreferrer">Ley N.° 29733 de Protección de Datos Personales</a>
            </details>
            {noticeError && <div className="mt-3" role="alert"><p className="text-sm font-semibold text-red-600">{noticeError}</p><button type="button" className="mt-1 font-bold text-brand-green underline" onClick={() => setNoticeRetry((value) => value + 1)}>Reintentar</button></div>}
            <label className="mt-4 flex items-start gap-3 text-sm font-medium text-brand-black">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-green-600" checked={noticeRead} onChange={(event) => setNoticeRead(event.target.checked)} disabled={!privacyNotice} />
              He leído este aviso sobre el tratamiento de datos del envío.
            </label>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" className="min-h-10 rounded-xl px-4 text-sm font-bold text-brand-gray hover:bg-brand-surface" onClick={closePrivacyNotice}>Ahora no</button>
              <button type="button" className="min-h-10 rounded-xl bg-brand-green px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!privacyNotice || !noticeRead} onClick={() => {
                setNoticeAccepted(true);
                setPrivacyModalOpen(false);
                setPrivacyFeedback('Aviso leído. Ya puedes completar los datos de tu envío.');
                window.requestAnimationFrame(() => privacyTriggerRef.current?.focus());
              }}>He leído y continuar</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default RegistrarEnvioPage;
