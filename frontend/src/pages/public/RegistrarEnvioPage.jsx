import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PaymentConfirmationStep from '../../components/public/PaymentConfirmationStep.jsx';
import ShipmentFormStep from '../../components/public/ShipmentFormStep.jsx';
import StepIndicator from '../../components/public/StepIndicator.jsx';
import { getApiErrorMessage } from '../../services/apiClient.js';
import { getClienteByDni } from '../../services/clientes.service.js';
import { getDestinos } from '../../services/destinosService.js';
import { crearEncomienda, crearPreRegistro } from '../../services/encomiendasService.js';
import { consultarDni } from '../../services/reniecService.js';
import { extractNombreFromReniecResponse, normalizeLocalClient } from '../../utils/reniec.js';
import { isShipmentNumericField, sanitizeShipmentField, validateShipmentNumericField } from '../../utils/shipmentValidation.js';
import { DEFAULT_LOCATION_NAMES } from '../../utils/locationHierarchy.js';
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
    const storedForm = readSessionJSON(PUBLIC_SHIPMENT_STORAGE_KEY, null);
    if (storedForm) {
      initialForm = { ...emptyPublicShipmentForm, ...storedForm };
    } else {
      const storedQuote = readSessionJSON(PUBLIC_QUOTE_STORAGE_KEY, null);
      initialForm = { ...emptyPublicShipmentForm, ...mapQuoteToShipmentForm(storedQuote) };
    }
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

  const hasPrefilledQuote = useMemo(
    () => Boolean(location.state?.quote || readSessionJSON(PUBLIC_QUOTE_STORAGE_KEY, null)),
    [location.state],
  );

  useEffect(() => {
    writeSessionJSON(PUBLIC_SHIPMENT_STORAGE_KEY, form);
  }, [form]);

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
      } catch (error) {
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

  const updatePersonFromLocalClient = (role, client) => {
    setForm((current) => ({
      ...current,
      [`${role}_nombre`]: client.nombre || current[`${role}_nombre`],
      [`${role}_telefono`]: client.telefono || current[`${role}_telefono`],
      [`${role}_correo`]: client.correo || current[`${role}_correo`],
      [`${role}_direccion`]: client.direccion || current[`${role}_direccion`],
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next[`${role}_nombre`];
      delete next[`${role}_telefono`];
      delete next[`${role}_correo`];
      delete next[`${role}_direccion`];
      return next;
    });
  };

  const handleReniecLookup = async (role) => {
    const typeField = `${role}_tipo_documento`;
    const documentField = `${role}_numero_documento`;
    const dni = String(form[documentField] || '').trim();

    if (form[typeField] !== 'DNI' || !/^\d{8}$/.test(dni)) {
      return;
    }

    setReniecStatus((current) => ({
      ...current,
      [role]: { tone: 'info', message: 'Buscando cliente...' },
    }));

    let localClientUnavailable = false;

    try {
      const localClient = normalizeLocalClient(await getClienteByDni(dni));
      if (localClient.nombre || localClient.telefono || localClient.correo || localClient.direccion) {
        updatePersonFromLocalClient(role, localClient);
        setReniecStatus((current) => ({
          ...current,
          [role]: { tone: 'success', message: 'Datos autocompletados desde clientes.' },
        }));
        return;
      }
    } catch (clientError) {
      localClientUnavailable = clientError?.response?.status !== 404;
    }

    try {
      setReniecStatus((current) => ({
        ...current,
        [role]: { tone: 'info', message: 'Consultando RENIEC...' },
      }));
      const data = await consultarDni(dni);
      const nombre = extractNombreFromReniecResponse(data);

      if (!nombre) {
        setReniecStatus((current) => ({
          ...current,
          [role]: {
            tone: 'error',
            message: localClientUnavailable
              ? 'No se pudo consultar clientes ni RENIEC. Ingrese los datos manualmente.'
              : 'No se pudo consultar RENIEC. Ingrese el nombre manualmente.',
          },
        }));
        return;
      }

      updateNameFromReniec(role, nombre);
      setReniecStatus((current) => ({
        ...current,
        [role]: { tone: 'success', message: 'Nombre autocompletado.' },
      }));
    } catch (error) {
      setReniecStatus((current) => ({
        ...current,
        [role]: {
          tone: 'error',
          message: localClientUnavailable
            ? 'No se pudo consultar clientes ni RENIEC. Ingrese los datos manualmente.'
            : 'No se pudo consultar RENIEC. Ingrese el nombre manualmente.',
        },
      }));
    }
  };

  const handleContinue = (event) => {
    event.preventDefault();
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
      const payload = buildPublicShipmentPayload(form);
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
      const payload = buildPublicShipmentPayload(form);
      const result = await crearEncomienda(payload);
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#E4ECE2] bg-white p-5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_16px_38px_-18px_rgba(33,37,41,0.22)] sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link to="/" className="text-sm font-black text-[#28A745] hover:text-[#3C5940]">
              Volver
            </Link>
            <h1 className="mt-3 text-3xl font-black text-[#212529] sm:text-4xl">Registro de envio</h1>
            <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-[#6C757D]">
              Completa tus datos para completar tu encomienda.
            </p>
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
    </section>
  );
}

export default RegistrarEnvioPage;
